<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { showRequestSuccess, deepClone,getItemByKey } from "@/js/common.js";

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
        RTSPDSettingEnableValue: "",
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
  if (event.contentKey == "rtspdSetting") {
    vm.changedCfgData[event.itemKey] = event.newVal;
  } 
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let data = {};
 

  let requestData = {
    target: "settingBasic",
    action: "set",
    configData: vm.submitCfgData,
    data: data,
  };
  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      showRequestSuccess(vm);
    }
    vm.data.submitLoading = false;
  });
}

function getData(vm) {
  vm.$axios.get("api/settingBasic/info").then((response) => {
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
      secondTitle: vm.$t("Basic"),
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
  vm.data.contents.push(createRTSPDSettingContent(vm));
}


function createRTSPDSettingContent(vm) {
  let content = {
    key: "rtspdSetting",
    title: vm.$t("RTSPDSetting"),
    titleDescription: vm.$t("RTSPDSettingDesc"),
    items: [
      {
        title: vm.$t("RTSPAudioEnable"),
        type: "select",
        key: "Config.Settings.RTSP.RTSPAudioEnabled",
        value: vm.apiData.configData["Config.Settings.RTSP.RTSPAudioEnabled"],
        selectItems: [
          { key: 0, label: vm.$t("Disabled") },
          { key: 1, label: vm.$t("Enabled") },
        ],
        description: vm.$t("RTSPDSettingDesc"),
      },
      {
        title: vm.$t("RTSPAuthType"),
        type: "select",
        key: "Config.Settings.RTSP.AuthorizationType",
        value: vm.apiData.configData["Config.Settings.RTSP.AuthorizationType"],
        selectItems: [
          { key: 0, label: vm.$t("None") },
          { key: 1, label: vm.$t("Basic") },
          { key: 2, label: vm.$t("Digest") },
        ],
        description: vm.$t("RTSPDSettingDesc"),
      },
      {
        title: vm.$t("RTSPUserName"),
        type: "input",
        key: "Config.Settings.RTSP.UserName",
        value: vm.apiData.configData["Config.Settings.RTSP.UserName"],
        description: vm.$t("RTSPDSettingDesc"),
        maxLength: 32,
      },
      {
        title: vm.$t("RTSPPasswd"),
        type: "input",
        inputType:"password",
        key: "Config.Settings.RTSP.Password",
        value: vm.apiData.configData["Config.Settings.RTSP.Password"],
        description: vm.$t("PasswordDesc"),
        maxLength: 32,
      },
    ],
  };
  return content;
}
</script>