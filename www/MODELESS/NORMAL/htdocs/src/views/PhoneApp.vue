<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  getIndexByKey,
  getItemByKey,
  checkFileFormat,
  showErrorInfo,
  deepClone,
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
    };
  },
  created() {
    getData(this);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      if (event.itemKey != "apkFile") {
        this.changedCfgData[event.itemKey] = event.newVal;
      }
    },
  },
};

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneApp",
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
  vm.$axios.get("api/phoneApp/info").then((response) => {
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
      firstTitle: vm.$t("Phone"),
      secondTitle: vm.$t("ThirdPartyAPK"),
    },
    onSubmit: function () {
      getCommitData(vm);
      if (!checkCommitData(vm)) {
        return;
      }
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
  vm.data.contents.push(createAppInstallContent(vm));
  vm.data.contents.push(createApkCfgContent(vm));
  vm.data.contents.push(createGeneralContent(vm));
}

function createAppInstallContent(vm) {
  let content = {
    key: "appInstall",
    title: vm.$t("AppInstall"),
    titleDescription: vm.$t("AppInstallDesc"),
    items: [
      {
        title: vm.$t("AppFileFormat"),
        type: "file-input",
        key: "apkFile",
        acceptFileType: ".apk",
        modalTitle: vm.$t("AppFileFormat"),
        loading: false,
        value: {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        },
        importBtnName: vm.$t("Import"),
        modalConfirmName: vm.$t("Install"),
        uploadFunction: function () {
          uploadApp(vm);
        },
        description: vm.$t("AppFileDesc"),
      },
    ],
  };
  return content;
}

function createApkCfgContent(vm) {
  let appSelectItems = [];
  let appItems = vm.apiData.data.apkList.split("&");
  for (let i = 0; i < appItems.length; i++) {
    if (appItems[i].length == 0) {
      continue;
    }
    let arr = appItems[i].split("=");
    if(arr.length != 2 ){
      continue;
    }
    var selectItem = {
      key: arr[1],
      label: arr[0],
    };
    appSelectItems.push(selectItem);
  }

  let content = {
    key: "apkConfig",
    title: vm.$t("ThirdApkCfg"),
    titleDescription: vm.$t("ThirdApkConfDesc"),
    items: [
      {
        title: vm.$t("APPName"),
        type: "select",
        key: "Config.Indoor.THIRDPARTYAPK.PackageName",
        value: vm.apiData.configData["Config.Indoor.THIRDPARTYAPK.PackageName"],
        selectItems: appSelectItems,
        isWarn: false,
        warnLabel: vm.$t("EmptyErr"),
        description: vm.$t("AppNameDesc"),
      },
      {
        title: vm.$t("APKTimeInterval") + " (" + vm.$t("Second") + ")",
        type: "select",
        key: "Config.Indoor.THIRDPARTYAPK.TimeInterval",
        value:
          vm.apiData.configData["Config.Indoor.THIRDPARTYAPK.TimeInterval"],
        selectItems: [
          { key: 10, label: 10 },
          { key: 15, label: 15 },
          { key: 30, label: 30 },
          { key: 60, label: 60 },
        ],
        description: vm.$t("IntervalsOperatDesc"),
      },
      {
        title: vm.$t("APKStartupEnable"),
        type: "checkbox",
        key: "Config.Indoor.THIRDPARTYAPK.StartupEnable",
        value:
          vm.apiData.configData["Config.Indoor.THIRDPARTYAPK.StartupEnable"],
        description: vm.$t("StartUpDesc"),
      },
      {
        title: vm.$t("TurnBackApp"),
        type: "checkbox",
        key: "Config.Indoor.THIRDPARTYAPK.TurnBackApkEnable",
        value:
          vm.apiData.configData[
            "Config.Indoor.THIRDPARTYAPK.TurnBackApkEnable"
          ],
        description: vm.$t("TurnBackAppDesc"),
      },
      {
        title: vm.$t("TurnBackAppAfterAwakening"),
        type: "checkbox",
        key: "Config.Indoor.THIRDPARTYAPK.AwakeReturn",
        value: vm.apiData.configData["Config.Indoor.THIRDPARTYAPK.AwakeReturn"],
        description: vm.$t("TurnBackAfterAwakingDesc"),
      },
      {
        title: vm.$t("APPKeepAlive"),
        type: "checkbox",
        key: "Config.Indoor.THIRDPARTYAPK.APPKeep-Alive",
        value:
          vm.apiData.configData["Config.Indoor.THIRDPARTYAPK.APPKeep-Alive"],
        description: vm.$t("AppKeepAliveDesc"),
      },
    ],
  };
  return content;
}

function createGeneralContent(vm) {
  let content = {
    key: "general",
    title: vm.$t("General"),
    titleDescription: vm.$t("AppGeneralDesc"),
    items: [
      {
        title: vm.$t("TurnBackAppAfterCalling"),
        type: "checkbox",
        key: "Config.Indoor.THIRDPARTYAPK.TurnBackApkAfterCallEnable",
        value:
          vm.apiData.configData[
            "Config.Indoor.THIRDPARTYAPK.TurnBackApkAfterCallEnable"
          ],
        description: vm.$t("TurnBackAfterCallDesc"),
      },
      {
        title: vm.$t("APKShowAppIcon"),
        type: "checkbox",
        key: "Config.Indoor.THIRDPARTYAPK.ShowAppIcon",
        value: vm.apiData.configData["Config.Indoor.THIRDPARTYAPK.ShowAppIcon"],
        description: vm.$t("AppIconShowDesc"),
      },
    ],
  };
  return content;
}

function uploadApp(vm) {
  let item = getItemByKey(vm.data, "appInstall", "apkFile");
  let fileName = item.value.fileName;
  if (fileName == "" || fileName == vm.$t("UpgradeFilePath")) {
    showErrorInfo(vm, vm.$t("FileEmptyWarning"));
    return;
  }
  item.visible = true;
  //上传
  item.loading = true;
  const upData = new FormData();
  upData.append("file", item.value.fileData);
  axios
    .post("api/phoneApp/upload", upData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      if (res.data.retcode == -1) {
        showErrorInfo(vm, vm.$t("AppUploadFailed"));
      } else if (res.data.retcode == -2) {
        showErrorInfo(vm, vm.$t("AppInstallFailed"));
      } else if (res.data.retcode == 0) {
        getData(vm);
        showRequestSuccess(vm, vm.$t("AppInstallSuccess"));
        item.visible = false;
        item.value.fileName = vm.$t("UpgradeFilePath");
        item.value.fileData = {};
      }
      item.loading = false;
    });
}

function checkCommitData(vm) {
  let success = true;
  if (
    (vm.changedCfgData["Config.Indoor.THIRDPARTYAPK.StartupEnable"] == "1" ||
      vm.changedCfgData["Config.Indoor.THIRDPARTYAPK.APPKeep-Alive"] == "1") &&
    vm.changedCfgData["Config.Indoor.THIRDPARTYAPK.PackageName"] == ""
  ) {
    let item = getItemByKey(
      vm.data,
      "apkConfig",
      "Config.Indoor.THIRDPARTYAPK.PackageName"
    );
    item.isWarn = true;
    success = false;
  }

  //仅变更包名，没变更保活，也需要提交保活信息
  if (
    "undefined" !=
    typeof vm.submitCfgData["Config.Indoor.THIRDPARTYAPK.PackageName"]
  ) {
    vm.submitCfgData["Config.Indoor.THIRDPARTYAPK.APPKeep-Alive"] =
      vm.changedCfgData["Config.Indoor.THIRDPARTYAPK.APPKeep-Alive"];
  }

  if (vm.submitCfgData["Config.Indoor.THIRDPARTYAPK.APPKeep-Alive"] == 1) {
    if (!confirm(vm.$t("NeedRestartApp"))) {
      success = false;
    }
  }

  return success;
}
</script>