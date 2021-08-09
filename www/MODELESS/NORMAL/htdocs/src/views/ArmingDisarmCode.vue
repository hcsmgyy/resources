<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { showRequestSuccess, deepClone } from "@/js/common.js";
import { getItemByKey } from "../js/common";

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
  if (event.contentKey == "disarmSetting") {
    vm.changedCfgData[event.itemKey] = event.newVal;
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let data = {};
  let currentPwd = getItemByKey(vm.data, "disarmCode", "currentPassword");
  let newPwd = getItemByKey(vm.data, "disarmCode", "newPassword");
  let confirmPwd = getItemByKey(vm.data, "disarmCode", "confirmPassword");
  if (currentPwd.value != "" || newPwd.value != "" || confirmPwd.value != "") {
    data = {
      newPwd: newPwd.value,
      currentPwd: currentPwd.value,
    };
  }

  let requestData = {
    target: "armingDisarmCode",
    action: "set",
    configData: vm.submitCfgData,
    data: data,
  };
  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      let retcode = response.data.retcode;
      if (retcode == 0) {
        showRequestSuccess(vm);
      } else if (retcode == -2) {
        getItemByKey(vm.data, "disarmCode", "currentPassword").isWarn = true;
      }
    }
    vm.data.submitLoading = false;
  });
}

function getData(vm) {
  vm.$axios.get("api/armingDisarmCode/info").then((response) => {
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

function checkCommitData(vm) {
  return checkDisarmCode(vm);
}

function checkDisarmCode(vm) {
  let success = true;
  let newPwd = getItemByKey(vm.data, "disarmCode", "newPassword");
  let confirmPwd = getItemByKey(vm.data, "disarmCode", "confirmPassword");
  if (isNaN(newPwd.value)) {
    newPwd.isWarn = true;
    newPwd.warnLabel = vm.$t("NeedDigital");
    success = false;
  }
  if (isNaN(confirmPwd.value)) {
    confirmPwd.isWarn = true;
    confirmPwd.warnLabel = vm.$t("NeedDigital");
    success = false;
  }
  if (newPwd.value != confirmPwd.value) {
    confirmPwd.isWarn = true;
    confirmPwd.warnLabel = vm.$t("ConfirmPasswordWarning");
    success = false;
  }
  return success;
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Arming"),
      secondTitle: vm.$t("DisarmCode"),
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
  vm.data.contents.push(createDisarmCodeContent(vm));
  vm.data.contents.push(createDisarmSettingContent(vm));
}

function createDisarmSettingContent(vm) {
  let content = {
    key: "disarmSetting",
    title: vm.$t("DisarmSetting"),
    titleDescription: vm.$t("DisarmSettingDesc"),
    items: [
      {
        title: vm.$t("DisarmInterval") + " (" + vm.$t("Second") + ")",
        type: "select",
        key: "Config.Settings.ALARM.Interval",
        value: vm.apiData.configData["Config.Settings.ALARM.Interval"],
        selectItems: [
          { key: 0, label: "0 " },
          { key: 30, label: "30 "  },
          { key: 60, label: "60 " },
          { key: 90, label: "90 " },
          { key: 120, label: "120 " },
          { key: -1, label: vm.$t("Never") },
        ],
        description: vm.$t("DisarmIntervalDesc"),
      },
    ],
  };
  return content;
}

function createDisarmCodeContent(vm) {
  let content = {
    key: "disarmCode",
    title: vm.$t("DisarmCode"),
    titleDescription: vm.$t("DisarmCodeDesc"),
    items: [
      {
        title: vm.$t("CurrentPassword"),
        type: "input",
        key: "currentPassword",
        value: "",
        maxLength: 10,
        inputType: "password",
        showEmptyPwd: false,
        isWarn: false,
        warnLabel: vm.$t("PasswordIncorrectWarning"),
        description: vm.$t("CurrentPasswordDesc"),
      },
      {
        title: vm.$t("NewPassword"),
        type: "input",
        key: "newPassword",
        value: "",
        maxLength: 10,
        inputType: "password",
        showEmptyPwd: false,
        placeholder: vm.$t("DisarmNewPwdTips"),
        isWarn: false,
        warnLabel: "",
        description: vm.$t("NewPasswordDesc"),
      },
      {
        title: vm.$t("ConfirmPassword"),
        type: "input",
        key: "confirmPassword",
        value: "",
        maxLength: 10,
        inputType: "password",
        showEmptyPwd: false,
        isWarn: false,
        warnLabel: "",
        description: vm.$t("ConfirmPasswordDesc"),
      },
    ],
  };
  return content;
}
</script>