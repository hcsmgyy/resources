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
  isPort,
  showErrorInfo,
  checkShellRule,
} from "@/js/common.js";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      changedCfgData: {},
      submitCfgData: {},
      submitData: {},
      apiData: {},
      stateData: {},
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
      if (event.itemKey == "Config.Settings.LOGLEVEL.Level") {
        this.changedCfgData[event.itemKey] = event.newVal;
        changeSystemLogLevel(this);
      } else if (event.itemKey == "Config.Settings.LOGLEVEL.RemoteSyslog") {
        this.changedCfgData[event.itemKey] = event.newVal;
        changeSystemServerDisabled(this);
      } else {
        this.changedCfgData[event.itemKey] = event.newVal;
      }
    },
  },
};

function getData(vm) {
  vm.$axios.get("api/upgradeDiagnosis/info").then((response) => {
    if(response.data.retcode == -1){
      vm.data= {
        showNoPermission: true,
      };
      return;
    }
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.stateData = response.data.data;
    vm.changedCfgData = deepClone(response.data.configData);

    createPageData(vm);
    changeSystemServerDisabled(vm);

    if (vm.stateData.State.PCAPState == 1) {
      setStartPCAPSts(vm);
    } else {
      setStopPCAPSts(vm);
    }
  });
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "upgradeDiagnosis",
    action: "set",
    configData: vm.submitCfgData,
  };
  vm.$axios.post("api", requestData).then((response) => {
    if (response.data.retcode == -1) {
      showErrorInfo(vm, vm.$t("RemoteServerError"));
    } else {
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

function changeSystemLogLevel(vm) {
  let requestData = {
    target: "upgradeDiagnosis",
    action: "set",
    configData: {
      "Config.Settings.LOGLEVEL.Level":
        vm.changedCfgData["Config.Settings.LOGLEVEL.Level"],
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm, vm.$t("Success"));
  });
}

function changeSystemServerDisabled(vm) {
  let item = getItemByKey(
    vm.data,
    "systemLog",
    "Config.Settings.LOGLEVEL.RemoteServer"
  );
  if (vm.changedCfgData["Config.Settings.LOGLEVEL.RemoteSyslog"] == 0) {
    item.disabled = true;
  } else {
    item.disabled = false;
  }
}

function onExport(vm, type) {
  let requestData = {
    target: "upgradeDiagnosis",
    action: "export",
    data: {
      type: type,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm, vm.$t("ExportSuccess"));
    let address = response.data.data.address;
    window.open(address);
  });
}

function checkCommitData(vm) {
  let success = true;
  //SystemServer校验
  if (
    vm.changedCfgData["Config.Settings.LOGLEVEL.RemoteSyslog"] == 1 &&
    (vm.changedCfgData["Config.Settings.LOGLEVEL.RemoteServer"] == "" ||
      !checkShellRule(
        vm.changedCfgData["Config.Settings.LOGLEVEL.RemoteServer"]
      ))
  ) {
    let item = getItemByKey(
      vm.data,
      "systemLog",
      "Config.Settings.LOGLEVEL.RemoteServer"
    );
    item.isWarn = true;
    success = false;
  }

  //PCAP Specific Port校验
  if (
    "undefined" != typeof vm.submitCfgData["Config.Settings.PCAP.SpecificPort"]
  ) {
    if (
      vm.submitCfgData["Config.Settings.PCAP.SpecificPort"].length != 0 &&
      !isPort(vm.submitCfgData["Config.Settings.PCAP.SpecificPort"])
    ) {
      let item = getItemByKey(
        vm.data,
        "pcap",
        "Config.Settings.PCAP.SpecificPort"
      );
      item.isWarn = true;
      success = false;
    }
  }
  return success;
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Upgrade"),
      secondTitle: vm.$t("Diagnosis"),
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
  vm.data.contents.push(createSystemLogContent(vm));
  vm.data.contents.push(createPCAPContent(vm));
}

function createSystemLogContent(vm) {
  let content = {
    key: "systemLog",
    title: vm.$t("SystemLog"),
    titleDescription: vm.$t("SystemLogDesc"),
    items: [
      {
        title: vm.$t("LogLevel"),
        type: "select",
        key: "Config.Settings.LOGLEVEL.Level",
        value: vm.apiData.configData["Config.Settings.LOGLEVEL.Level"],
        selectItems: [
          { key: 0, label: "0" },
          { key: 1, label: "1" },
          { key: 2, label: "2" },
          { key: 3, label: "3" },
          { key: 4, label: "4" },
          { key: 5, label: "5" },
          { key: 6, label: "6" },
          { key: 7, label: "7" },
        ],
        description: vm.$t("LogLevelDesc"),
      },
      {
        title: vm.$t("ExportLog"),
        type: "button",
        key: "exportLog",
        onClick: function () {
          onExport(vm, "ExportLog");
        },
        isShowPopover: true,
        buttonName: vm.$t("Export"),
        buttonIcon: "iconexport",
        description: vm.$t("ExportLogDesc"),
      },
      {
        title: vm.$t("RemoteSystemLog"),
        type: "checkbox",
        key: "Config.Settings.LOGLEVEL.RemoteSyslog",
        value: vm.apiData.configData["Config.Settings.LOGLEVEL.RemoteSyslog"],
        description: vm.$t("RemoteLogEnabled"),
      },
      {
        title: vm.$t("RemoteSystemServer"),
        type: "input",
        disabled: false,
        isWarn: false,
        maxLength: 127,
        warnLabel: vm.$t("PleaseCheckSubmitData"),
        key: "Config.Settings.LOGLEVEL.RemoteServer",
        value: vm.apiData.configData["Config.Settings.LOGLEVEL.RemoteServer"],
        description: vm.$t("RemoteSystemServerDesc"),
      },
    ],
  };
  return content;
}

function createPCAPContent(vm) {
  let content = {
    key: "pcap",
    title: vm.$t("PCAP"),
    titleDescription: vm.$t("PCAPDesc"),
    items: [
      {
        title: vm.$t("PCAPSpecificPort"),
        type: "input",
        showHint: true,
        disabled: false,
        isWarn: false,
        hintContent: vm.$t("(1~65535)"),
        warnLabel: vm.$t("PCAPPortRangeError"),
        key: "Config.Settings.PCAP.SpecificPort",
        value: vm.apiData.configData["Config.Settings.PCAP.SpecificPort"],
        description: vm.$t("PCAPSpecificPortDesc"),
      },
      {
        title: vm.$t("PCAP"),
        type: "multilple-button",
        key: "pcapLog",
        startDisabled: false,
        stopDisabled: true,
        exportDisabled: false,
        startBtnName: vm.$t("StartLabel"),
        stopBtnName: vm.$t("StopLabel"),
        exportBtnName: vm.$t("Export"),
        onStart: function () {
          onStartPCAP(vm);
        },
        onStop: function () {
          onStopPCAP(vm);
        },
        onExport: function () {
          onExport(vm, "ExportPCAP");
        },
        description: vm.$t("PCAPDesc"),
      },
      {
        title: vm.$t("PCAPAutoRefresh"),
        type: "checkbox",
        key: "Config.Settings.PCAP.RefreshEnable",
        value: vm.apiData.configData["Config.Settings.PCAP.RefreshEnable"],
        description: vm.$t("PCAPAutoRefreshDesc"),
      },
    ],
  };
  return content;
}
var PCAPStopType = 1;
var mSecs0 = 10000;

function onStartPCAP(vm) {
  let requestData = {
    target: "upgradeDiagnosis",
    action: "pcap",
    configData: vm.changedCfgData,
    data: {
      startPCAP: "1",
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    setTimeout(() => {
      startPCAPCheck(vm);
    }, 500);
  });
  alert("start");
  setStartPCAPSts(vm);
}

function startPCAPCheck(vm) {
  PCAPStopType = 0;
  intervCheckStsOfPCAP(vm);
}

function onStopPCAP(vm) {
  let requestData = {
    target: "upgradeDiagnosis",
    action: "pcap",
    configData: vm.changedCfgData,
    data: {
      stopPCAP: "1",
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    getData(vm);
    PCAPStopType = 1;
  });
  alert("stop");
  setStopPCAPSts(vm);
}

function intervCheckStsOfPCAP(vm) {
  if (1 != PCAPStopType) {
    getData(vm);
    onStsOfPCAP(vm);
  }
  if (0 == PCAPStopType) {
    setTimeout(() => {
      intervCheckStsOfPCAP(vm);
    }, mSecs0);
  }
}

function onStsOfPCAP(vm) {
  setTimeout(() => {
    if (0 == vm.stateData.State.PCAPState && PCAPStopType == 0) {
      PCAPStopType = 2;
      setStopPCAPSts(vm);
      var maxPCAPFileSize = "50MB";
      var tmpStr =
        "PCAP file is over " + maxPCAPFileSize + ", PCAP will be stopped";
      alert(tmpStr);
    }
  }, 5000);
}

function setStartPCAPSts(vm) {
  let item = getItemByKey(vm.data, "pcap", "pcapLog");
  item.startDisabled = true;
  item.stopDisabled = false;
  item.exportDisabled = true;
}

function setStopPCAPSts(vm) {
  let item = getItemByKey(vm.data, "pcap", "pcapLog");
  item.startDisabled = false;
  item.stopDisabled = true;
  item.exportDisabled = false;
}
</script>