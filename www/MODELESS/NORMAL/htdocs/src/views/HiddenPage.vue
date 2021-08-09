<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { showRequestSuccess, deepClone } from "@/js/common.js";
import { getItemByKey, checkShellRule } from "../js/common";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      changedCfgData: {},
      submitCfgData: {},
      apiData: {},
      interObj: Object,
      data: {
        getDataSuccess: false,
      },
    };
  },
  created() {
    getData(this);
  },
  destroyed() {
    clearInterval(this.interObj);
    clearPingResult(this);
  },
  updated() {
    clearPingResult(this);
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

  let requestData = {
    target: "phoneHidden",
    action: "set",
    configData: vm.submitCfgData,
    data: {
      telnetEnable: getItemByKey(vm.data, "telnet", "telnetEnable").value,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      showRequestSuccess(vm);
    }
    vm.data.submitLoading = false;
  });
}

function getData(vm) {
  vm.$axios.get("api/phoneHidden/info").then((response) => {
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
      firstTitle: vm.$t("HiddenPage"),
      secondTitle: vm.$t("HiddenPage"),
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
  vm.data.contents.push(createTelnetContent(vm));
  vm.data.contents.push(createToolsContent(vm));
}

function createTelnetContent(vm) {
  let content = {
    key: "telnet",
    title: vm.$t("Telnet"),
    titleDescription: vm.$t("Telnet"),
    items: [
      {
        title: vm.$t("TelnetActive"),
        type: "select",
        key: "telnetEnable",
        value: vm.apiData.data.telnetEnable == "true" ? 1 : 0,
        selectItems: [
          { key: 0, label: vm.$t("Disabled") },
          { key: 1, label: vm.$t("Enabled") },
        ],
      },
    ],
  };
  return content;
}

function createToolsContent(vm) {
  let content = {
    key: "tools",
    title: vm.$t("ToolsLabel"),
    titleDescription: vm.$t("Telnet"),
    items: [
      {
        title: vm.$t("VerifyNetworkLabel"),
        type: "input",
        key: "VerifyNetwork",
        value: "",
        showBtn2: true,
        onClick: function () {
          onStartPing(vm);
        },
        pingLoading: false,
        delDisabled: false,
        description: vm.$t("VerifyNetworkLabel"),
        isWarn: false,
        warnLabel: vm.$t("PingError"),
      },
      {
        type: "text-area",
        key: "VerifyResult",
        value: "",
        readonly: true,
      }
    ],
  };
  return content;
}

var tmp=0;
var lock=0;
function onStartPing(vm) {
  let item = getItemByKey(vm.data, "tools", "VerifyNetwork");
  var address = item.value;
  //check
  if (!checkShellRule(address)) {
    item.isWarn = true;
    return;
  }

  checkPingShow(vm, true);
  let result = getItemByKey(vm.data, "tools", "VerifyResult");
  result.value = "";

  // start ping
  let requestData = {
    target: "phoneHidden",
    action: "set",
    data: {
      pingAddress: address,
    },
  };
  tmp=0;
	lock=0;
  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      vm.interObj = setInterval(() =>{
        getStatuePingResult(vm);
      },1000);
    } 
  });
}

function getStatuePingResult(vm) {
  vm.$axios.get("api/phoneHidden/get").then((response) => {
    var resultValue = response.data.data.pingResult;
    if(tmp!=-1){
      getItemByKey(vm.data, "tools", "VerifyResult").value = resultValue + "\n";
    }
    if(resultValue.search("3 packets transmitted")!=-1 ||resultValue.search("unknown host")!=-1 || resultValue.search("connect: Invalid argument")!=-1){
      clearInterval(vm.interObj);
      checkPingShow(vm, false);
      tmp=-1;
      if(lock != -1){
        clearPingResult(vm);
        lock=-1;
      }
		}
  });
}

function clearPingResult(vm) {
  let requestData = {
    target: "phoneHidden",
    action: "set",
    data: {
      clearPingResult: 1,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {

    } 
  });
}

function checkPingShow(vm, isShow) {
  let item = getItemByKey(vm.data, "tools", "VerifyNetwork");
  if (isShow) {
    item.disabled = true;
    item.pingLoading = true;
  } else {
    item.disabled = false;
    item.pingLoading = false;
  }
}
</script>