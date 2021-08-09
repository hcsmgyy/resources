<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { showRequestSuccess, deepClone } from "@/js/common.js";
import { getIndexByKey, getItemByKey } from "../js/common";

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
    };
  },
  created() {
    getData(this);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      setChangedData(this, event);
    },
  },
};

function setChangedData(vm, event) {
  if (event.contentKey == "voiceCommandSetting") {
    vm.changedCfgData[event.itemKey] = event.newVal;
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let data = {};
  if (
    getItemByKey(vm.data, "voiceAssistantSetting", "voiceAssistantEnable")
      .value != vm.apiData.data.voiceAssistantEnable
  ) {
    data = {
      voiceAssistantEnable: getItemByKey(
        vm.data,
        "voiceAssistantSetting",
        "voiceAssistantEnable"
      ).value,
    };
  }

  let requestData = {
    target: "settingVoiceAssistant",
    action: "set",
    configData: vm.submitCfgData,
    data: data,
  };
  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      showRequestSuccess(vm);
      vm.apiData.data.voiceAssistantEnable = getItemByKey(vm.data, "voiceAssistantSetting", "voiceAssistantEnable").value;
    }
    vm.data.submitLoading = false;
  });
}

function getData(vm) {
  vm.$axios.get("api/settingVoiceAssistant/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    createPageData(vm);
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

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Settings"),
      secondTitle: vm.$t("VoiceAssistant"),
    },
    onSubmit: function () {
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
  vm.data.contents.push(createVoicAssistantSettingContent(vm));
  vm.data.contents.push(createVoicCommandSettingContent(vm));
}

function createVoicCommandSettingContent(vm) {
  let typeItems = [];
  typeItems.push({ key: 3, label: vm.$t("RemoteRelayHTTP") });
  if (vm.apiData.data.maxRelaySoftkeyNum == 3) {
    if (vm.apiData.data.supportThreeDtmf == 1) {
      typeItems.push({ key: 2, label: vm.$t("RemoteRelayDTMF") + "1" });
      typeItems.push({ key: 14, label: vm.$t("RemoteRelayDTMF") + "2" });
      typeItems.push({ key: 15, label: vm.$t("RemoteRelayDTMF") + "3" });
    } else {
      typeItems.push({ key: 2, label: vm.$t("RemoteRelayDTMF") });
    }
    if (vm.apiData.data.supportRelayB == 1) {
      typeItems.push({ key: 0, label: vm.$t("LocalRelay") + "1" });
      typeItems.push({ key: 1, label: vm.$t("LocalRelay") + "2" });
    } else {
      typeItems.push({ key: 0, label: vm.$t("LocalRelay") });
    }
  } else {
    typeItems.push({ key: 2, label: vm.$t("RemoteRelayDTMF") });
    typeItems.push({ key: 0, label: vm.$t("LocalRelay") });
  }
  typeItems.push({ key: 4, label: vm.$t("WebRelayActionValue") });
  let content = {
    key: "voiceCommandSetting",
    title: vm.$t("VoiceCommandSetting"),
    titleDescription: vm.$t("VoiceCommandSettingDesc"),
    items: [
      {
        title: vm.$t("UnlockType"),
        type: "select",
        key: "Config.DoorSetting.RELAY.VoiceAssistanceRelayType",
        value:
          vm.apiData.configData[
            "Config.DoorSetting.RELAY.VoiceAssistanceRelayType"
          ],
        selectItems: typeItems,
        showHint: true,
        hintContent: vm.$t("UnlockTypeHint"),
        description: vm.$t("UnlockTypeDesc"),
      },
    ],
  };
  return content;
}

function createVoicAssistantSettingContent(vm) {
  let content = {
    key: "voiceAssistantSetting",
    title: vm.$t("VoiceAssistanceSetting"),
    titleDescription: vm.$t("VoiceAssistantSettingDesc"),
    items: [
      {
        title: vm.$t("VoiceAssistantEnabled"),
        type: "checkbox",
        key: "voiceAssistantEnable",
        value: vm.apiData.data.voiceAssistantEnable,
        description: vm.$t("VoiceAssistantEnableDesc"),
      },
    ],
  };
  return content;
}
</script>