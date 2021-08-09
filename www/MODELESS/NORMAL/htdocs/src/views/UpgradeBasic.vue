<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  deepClone,
  getIndexByKey,
  getItemByKey,
  showErrorInfo,
} from "@/js/common.js";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      changedCfgData: {},
      submitCfgData: {},
      apiData: {},
      data: {
        getDataSuccess: false,
      },
      interObj: Object,
    };
  },
  created() {
    getData(this);
  },
  destroyed(){
    clearInterval(this.interObj);
    vm.$root.processingVisible = false;
  },
  methods: {
    onCommonPageDataChange: function (event) {
      if (event.itemKey != "upgradeFile") {
        this.changedCfgData[event.itemKey] = event.newVal;
      }
    },
  },
};

function getData(vm) {
  vm.$axios.get("api/upgradeBasic/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    createPageData(vm);
  });
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "upgradeBasic",
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

function getCommitData(vm) {
  vm.submitCfgData = {};
  for (var changedKey in vm.changedCfgData) {
    if (vm.apiData.configData[changedKey] != vm.changedCfgData[changedKey]) {
      vm.submitCfgData[changedKey] = vm.changedCfgData[changedKey];
    }
  }
}

function checkCommitData(vm) {
  let success = true;
  return success;
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Upgrade"),
      secondTitle: vm.$t("Basic"),
    },
    showSubmit: false,
    contents: [],
  };
  vm.data.contents.push(createContent(vm));
}

function createContent(vm) {
  let content = {
    key: "basic",
    title: vm.$t("Basic"),
    titleDescription: vm.$t("UpgradeBasiDesc"),
    items: [
      {
        title: vm.$t("FirmwareVersion"),
        type: "label",
        key: "data.Product.FirmwareVersion",
        showDescription: true,
        value: vm.apiData.data.Product.FirmwareVersion,
        textAlign: "left",
        description: vm.$t("FirmwareVersionDesc"),
      },
      {
        title: vm.$t("HardwareVersion"),
        type: "label",
        key: "data.Product.HardwareVersion",
        showDescription: true,
        value: vm.apiData.data.Product.HardwareVersion,
        textAlign: "left",
        description: vm.$t("HardwareVersionDesc"),
      },
      {
        title: vm.$t("Upgrade"),
        type: "file-input",
        key: "upgradeFile",
        acceptFileType: ".ZIP",
        loading: false,
        value: {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        },
        importBtnName: vm.$t("Import"),
        modalConfirmName: vm.$t("Submit"),
        uploadFunction: function () {
          setUpgradeFirmware(vm, "firmware");
        },
        description: vm.$t("UpgradeDesc"),
      },
      {
        title: vm.$t("ResetToFactorySetting"),
        type: "button",
        widthStyle: false,
        key: "resetToFactorySetting",
        onClick: function () {
          if (confirm(vm.$t("ResetFactoryConfirm"))) {
            setResetOrReboot(vm, "ResetFactory");
          }
        },
        isShowPopover: true,
        buttonName: vm.$t("Reset"),
        buttonIcon: "iconreset",
        description: vm.$t("FactoryDefaultDesc"),
      },
      {
        title: vm.$t("ResetAppToFactorySetting"),
        type: "button",
        widthStyle: false,
        key: "resetAppToFactorySetting",
        onClick: function () {
          if (confirm(vm.$t("ResetAppFactoryConfirm"))) {
            setResetOrReboot(vm, "ResetAppFactory");
          }
        },
        isShowPopover: true,
        buttonName: vm.$t("Reset"),
        buttonIcon: "iconreset",
        description: vm.$t("ResetConfigDesc"),
      },
      {
        title: vm.$t("RebootLabel"),
        type: "button",
        widthStyle: false,
        key: "reboot",
        onClick: function () {
          if (confirm(vm.$t("RebootConfirm"))) {
            setResetOrReboot(vm, "Reboot");
          }
        },
        isShowPopover: true,
        buttonName: vm.$t("RebootLabel"),
        buttonIcon: "iconreboot",
        description: vm.$t("RebootDesc"),
      },
    ],
  };
  return content;
}

function setResetOrReboot(vm, type) {
  vm.$root.processingVisible = true;
  let requestData = {
    target: "upgradeBasic",
    action: "set",
    data: {
      type: type,
    },
  };
  vm.interObj = setInterval(() => {
    LongCheckStatus(vm);
  }, 4000);
  vm.$axios.post("api", requestData).then((response) => {
   
  });
}
var NotGetResponse = 0;
var NotGetResponseNum = 0;
var IsAlreadyReboot = 0;

function LongCheckStatus(vm) {
  if (1 == NotGetResponse) {
    {
      statusCheck(vm);
      NotGetResponseNum = 0;
      NotGetResponse = 0;
    }
  } else {
    NotGetResponseNum++;
    if (NotGetResponseNum >= 3) {
      NotGetResponse = 1;
    }
  }
}

function statusCheck(vm) {
  vm.$axios.get("api/upgradeBasic/info").then((response) => {
    resetNotGetResponse(vm);
  });
}

function resetNotGetResponse(vm) {
  clearInterval(vm.interObj);
  vm.interObj = setInterval(() => {
    LongCheckStatus(vm);
  }, 4000);
  NotGetResponse = 0;
  NotGetResponseNum = 0;
}

function setUpgradeFirmware(vm, type) {
  let item = getItemByKey(vm.data, "basic", "upgradeFile");
  let fileName = item.value.fileName;
  if (fileName == "" || fileName == vm.$t("UpgradeFilePath")) {
    showErrorInfo(vm, vm.$t("FileEmptyWarning"));
    return;
  }
  vm.$root.processingVisible = true;
  let requestData = {
    target: "upgradeBasic",
    action: "set",
    data: {
      type: type,
    },
  };
  vm.$axios.post("api", requestData).then((res) => {
    if (res.data.retcode == -1) {
      showErrorInfo(vm, vm.$t("PhoneTalkingNotUpgradeWarning"));
    } else if (res.data.retcode == -2) {
      showErrorInfo(vm, vm.$t("AUTOPConflictWarning"));
    } else if (res.data.retcode == -3) {
      showErrorInfo(vm, vm.$t("PhoneUpgradingWarning"));
    } else if (res.data.retcode == -4) {
      showErrorInfo(vm, vm.$t("PhoneAlarmingWarning"));
    } else if (res.data.retcode == 0) {
      uploadUpgradeFile(vm);
    } else {
      showErrorInfo(vm, vm.$t("UpgradeFinishedNotice"));
    }
  });
}

function uploadUpgradeFile(vm) {
  let item = getItemByKey(vm.data, "basic", "upgradeFile");
  let fileName = item.value.fileName;
  if (fileName == "" || fileName == vm.$t("UpgradeFilePath")) {
    showErrorInfo(vm, vm.$t("FileEmptyWarning"));
    return;
  }
  //上传
  item.loading = true;
  const upData = new FormData();
  upData.append("file", item.value.fileData);
  axios
    .post("api/upgradeBasic/upload", upData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      if (res.data.retcode == -1) {
        showErrorInfo(vm, vm.$t("UpgradeFailedWarning"));
      } else if (res.data.retcode == 0) {
        showRequestSuccess(vm, vm.$t("UpgradeFinishedNotice"));
        vm.$root.processingVisible = false;
        item.value.fileName = vm.$t("UpgradeFilePath");
        item.value.fileData = {};
      }
      item.loading = false;
    });
}
</script>