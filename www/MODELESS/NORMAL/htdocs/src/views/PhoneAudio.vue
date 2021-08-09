<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  deepClone,
  checkRangeOfNumber,
  checkFileFormat,
  showErrorInfo,
} from "@/js/common.js";
import { getItemByKey } from "../js/common";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      doorbellFileItems: [],
      alarmRingtoneFileItems: [],
      changedCfgData: {},
      submitCfgData: {},
      apiData: {},
      data: {
        getDataSuccess: false,
      },
    };
  },
  created() {
    getData(this);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      setChangedData(this, event);
      //界面变化
      handlerPageChanged(this);
    },
  },
};

function handlerPageChanged(vm) {
  let alarmRingtoneFileItem = getItemByKey(
    vm.data,
    "alarmRingtoneUpload",
    "Config.HomeSecurity0.CommonValue.AlarmRingTone"
  );
  alarmRingtoneFileItem.delDisabled =
    alarmRingtoneFileItem.value == vm.apiData.data.defaultAlarmRingtone;
}

function setChangedData(vm, event) {
  if (
    event.contentKey == "volumeControl" ||
    (event.contentKey == "alarmRingtoneUpload" &&
      event.itemKey == "Config.HomeSecurity0.CommonValue.AlarmRingTone")
  ) {
    vm.changedCfgData[event.itemKey] = event.newVal;
  }
}

function checkCommitData(vm) {
  return checkVolumeControlData(vm);
}

function checkVolumeControlData(vm) {
  let success = true;
  if (
    !checkRangeOfNumber(
      vm.changedCfgData["Config.Settings.HANDFREE.MicMidValue"],
      1,
      15
    )
  ) {
    getItemByKey(
      vm.data,
      "volumeControl",
      "Config.Settings.HANDFREE.MicMidValue"
    ).isWarn = true;
    success = false;
  }

  if (
    !checkRangeOfNumber(
      vm.changedCfgData["Config.Settings.AUDIO.RingVol"],
      0,
      15
    )
  ) {
    getItemByKey(
      vm.data,
      "volumeControl",
      "Config.Settings.AUDIO.RingVol"
    ).isWarn = true;
    success = false;
  }

  if (
    !checkRangeOfNumber(
      vm.changedCfgData["Config.Settings.HANDFREE.SpkVol"],
      1,
      15
    )
  ) {
    getItemByKey(
      vm.data,
      "volumeControl",
      "Config.Settings.HANDFREE.SpkVol"
    ).isWarn = true;
    success = false;
  }

  if (
    !checkRangeOfNumber(
      vm.changedCfgData["Config.Settings.HANDFREE.SigToneVol"],
      1,
      15
    )
  ) {
    getItemByKey(
      vm.data,
      "volumeControl",
      "Config.Settings.HANDFREE.SigToneVol"
    ).isWarn = true;
    success = false;
  }

  if (
    !checkRangeOfNumber(
      vm.changedCfgData["Config.Settings.AUDIO.MediaVolume"],
      0,
      15
    )
  ) {
    getItemByKey(
      vm.data,
      "volumeControl",
      "Config.Settings.AUDIO.MediaVolume"
    ).isWarn = true;
    success = false;
  }
  return success;
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneAudio",
    action: "set",
    configData: vm.submitCfgData,
  };
  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      showRequestSuccess(vm);
    }
    vm.data.submitLoading = false;
  });
}

function getData(vm) {
  vm.$axios.get("api/phoneAudio/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    createPageData(vm);
    handlerPageChanged(vm);
  });
}

function getCommitData(vm) {
  vm.submitCfgData = {};
  for (var changedKey in vm.changedCfgData) {
    if (vm.apiData.configData[changedKey] != vm.changedCfgData[changedKey]) {
      vm.submitCfgData[changedKey] = vm.changedCfgData[changedKey];
    }
  }
}

function createSelectItems(vm) {
  //doorbell
  vm.doorbellFileItems = [];
  let doorbellFiles = vm.apiData.data.doorbellFile.split("\n");
  for (let i = 0; i < doorbellFiles.length; i++) {
    if (doorbellFiles[i] != "" && 
      (checkFileFormat(doorbellFiles[i], ".WAV", 4) ||
          checkFileFormat(doorbellFiles[i], ".MP3", 4))) {
      let item = {
        key: doorbellFiles[i],
        label: doorbellFiles[i],
      };
      vm.doorbellFileItems.push(item);
    }
  }
  //alarm ringtone
  vm.alarmRingtoneFileItems = [];
  let item = {
    key: vm.apiData.data.defaultAlarmRingtone,
    label: "default.wav",
  };
  vm.alarmRingtoneFileItems.push(item);
  let alarmRingtoneFiles = vm.apiData.data.alarmRingtoneFile.split("\n");
  for (let i = 0; i < alarmRingtoneFiles.length; i++) {
    if (alarmRingtoneFiles[i] != "" && 
      (checkFileFormat(alarmRingtoneFiles[i], ".WAV", 4) ||
          checkFileFormat(alarmRingtoneFiles[i], ".MP3", 4))) {
      let item = {
        key: vm.apiData.data.alarmRingtonePath + alarmRingtoneFiles[i],
        label: alarmRingtoneFiles[i],
      };
      vm.alarmRingtoneFileItems.push(item);
    }
  }
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Phone"),
      secondTitle: vm.$t("Audio"),
    },
    onSubmit: function () {
      if (!checkCommitData(vm)) {
        return;
      }
      getCommitData(vm);
      submitData(vm);
    },
    onCancel: function () {
      vm.data.cancelLoading = true;
      getData(vm);
    },
    submitLoading: false,
    cancelLoading: false,
    contents: [],
  };

  createSelectItems(vm);

  vm.data.contents.push(createVolumeContent(vm));
  vm.data.contents.push(createDoorbellContent(vm));
  vm.data.contents.push(createAlarmRingtoneContent(vm)); 
}

function createAlarmRingtoneContent(vm) {
  let content = {
    key: "alarmRingtoneUpload",
    title: vm.$t("AlarmRingToneUpload"),
    titleDescription: vm.$t("AlarmRingDesc"),
    items: [
      {
        title: vm.$t("AlarmRingToneUpload"),
        type: "file-input",
        key: "alarmRingtoneUpload",
        acceptFileType: ".wav,.mp3",
        modalTitle: vm.$t("FileLabel") + " (.wav/.mp3)",
        loading: false,
        value: {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        },
        importBtnName: vm.$t("Import"),
        modalConfirmName: vm.$t("Upload"),
        uploadFunction: function () {
          uploadSoundFile(vm, "alarmRingtoneUpload", "alarmRingtoneUpload");
        },
        description: vm.$t("AlarmRingToneUploadDesc"),
      },
      {
        title: vm.$t("AlarmRingTone"),
        type: "select",
        key: "Config.HomeSecurity0.CommonValue.AlarmRingTone",
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.CommonValue.AlarmRingTone"
          ],
        selectItems: vm.alarmRingtoneFileItems,
        showBtn: true,
        onDel: function (value) {
          onDelFile(vm, value, "alarmRingtoneUpload", "alarmRingtoneFile");
        },
        loading: false,
        delDisabled: false,
        description: vm.$t("AlarmRingToneDesc"),
      },
    ],
  };
  return content;
}

function createDoorbellContent(vm) {
  let content = {
    key: "doorbellSoundUpload",
    title: vm.$t("DoorbellSoundUpload"),
    titleDescription: vm.$t("DoorbellDesc"),
    items: [
      {
        title: vm.$t("DoorbellSoundUpload"),
        type: "file-input",
        key: "doorbellUpload",
        acceptFileType: ".wav,.mp3",
        modalTitle: vm.$t("FileLabel") + " (.wav/.mp3)",
        loading: false,
        value: {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        },
        importBtnName: vm.$t("Import"),
        modalConfirmName: vm.$t("Upload"),
        uploadFunction: function () {
          uploadSoundFile(vm, "doorbellSoundUpload", "doorbellUpload");
        },
        description: vm.$t("DoorbellSoundUploadDesc"),
      },
      {
        title: vm.$t("DoorbellSound"),
        type: "select",
        key: "doorbellSoundFile",
        value:
          vm.doorbellFileItems.length == 0 ? "" : vm.doorbellFileItems[0].key,
        selectItems: vm.doorbellFileItems,
        showBtn: true,
        onDel: function (value) {
          onDelFile(vm, value, "doorbellSoundUpload", "doorbellSoundFile");
        },
        loading: false,
        delDisabled: vm.doorbellFileItems.length == 0,
        description: vm.$t("DoorbellSoundDesc"),
      },
    ],
  };
  return content;
}

function createVolumeContent(vm) {
  let content = {
    key: "volumeControl",
    title: vm.$t("VolumeControl"),
    titleDescription: vm.$t("VolumeControlDesc"),
    items: [
      {
        title: vm.$t("MicVolume"),
        type: "input",
        key: "Config.Settings.HANDFREE.MicMidValue",
        value: vm.apiData.configData["Config.Settings.HANDFREE.MicMidValue"],
        showHint: true,
        hintContent: "(1~15)",
        isWarn: false,
        warnLabel: vm.$t("MicVolumeRangeError"),
        description: vm.$t("MicVolumeDesc"),
      },
      {
        title: vm.$t("RingVolume"),
        type: "input",
        key: "Config.Settings.AUDIO.RingVol",
        value: vm.apiData.configData["Config.Settings.AUDIO.RingVol"],
        showHint: true,
        hintContent: "(0~15)",
        isWarn: false,
        warnLabel: vm.$t("RingVolumeRangerError"),
        description: vm.$t("RingVolumeDesc"),
      },
      {
        title: vm.$t("TalkVolume"),
        type: "input",
        key: "Config.Settings.HANDFREE.SpkVol",
        value: vm.apiData.configData["Config.Settings.HANDFREE.SpkVol"],
        showHint: true,
        hintContent: "(1~15)",
        isWarn: false,
        warnLabel: vm.$t("TalkVolumeRangeError"),
        description: vm.$t("TalkVolumeDesc"),
      },
      {
        title: vm.$t("ToneVolume"),
        type: "input",
        key: "Config.Settings.HANDFREE.SigToneVol",
        value: vm.apiData.configData["Config.Settings.HANDFREE.SigToneVol"],
        showHint: true,
        hintContent: "(1~15)",
        isWarn: false,
        warnLabel: vm.$t("ToneVolumeRangeError"),
        description: vm.$t("ToneVolumeDesc"),
      },
      {
        title: vm.$t("MediaVolumeLabel"),
        type: "input",
        key: "Config.Settings.AUDIO.MediaVolume",
        value: vm.apiData.configData["Config.Settings.AUDIO.MediaVolume"],
        showHint: true,
        hintContent: "(0~15)",
        isWarn: false,
        warnLabel: vm.$t("MediaVolumeRangeError"),
        description: vm.$t("MediaVolumeDesc"),
      },
    ],
  };
  return content;
}

function uploadSoundFile(vm, contentKey, itemKey) {
  let item = getItemByKey(vm.data, contentKey, itemKey);
  let fileName = item.value.fileName;
  if (fileName == "" || fileName == vm.$t("UpgradeFilePath")) {
    showErrorInfo(vm, vm.$t("FileEmptyWarning"));
    return;
  }
  
  let comfirmLabel;
  if(itemKey == "doorbellUpload"){
    comfirmLabel = vm.$t("ImportDoorbellSoundWarning");
  } else {
    comfirmLabel = vm.$t("ImportAlarmRingToneWarning");
  }

  item.visible = true;
  if (confirm(comfirmLabel)) {
    //上传
    item.loading = true;
    const upData = new FormData();
    upData.append("file", item.value.fileData);
    axios
      .post("api/phoneAudio/upload?type=" + itemKey, upData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data.retcode == -1) {
          showErrorInfo(vm, vm.$t("FileUploadFailedWarning"));
        } else if (res.data.retcode == 0) {
          getData(vm);
          showRequestSuccess(vm, vm.$t("UploadFileFinished"));
          item.visible = false;
          item.value.fileName = vm.$t("UpgradeFilePath");
          item.value.fileData = {};
        }
        item.loading = false;
      });
  }
}

function onDelFile(vm, value, contentKey, itemKey) {
  let realItemKey =
    itemKey == "alarmRingtoneFile"
      ? "Config.HomeSecurity0.CommonValue.AlarmRingTone"
      : itemKey;
  let requestData = {
    target: "phoneAudio",
    action: "del",
    data: {
      fileName: value,
      type: itemKey,
    },
  };
  getItemByKey(vm.data, contentKey, realItemKey).loading = true;
  vm.$axios.post("api", requestData).then((response) => {    
    getItemByKey(vm.data, contentKey, realItemKey).loading = false;
    getData(vm);
    showRequestSuccess(vm);
  });
}
</script>