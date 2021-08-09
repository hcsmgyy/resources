<template>
  <div>
    <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
  </div>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { 
  showRequestSuccess,
  deepClone,
  getIndexByKey,
  isPort,
  notContainInvalid,
  isAnInterger,
} from "@/js/common.js";
import { getItemByKey } from '../js/common';

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      changedCfgData:{},
      submitCfgData:{},
      apiData: {},
      data: {
        getDataSuccess: false,
      },
      CurrentAccount: 1,
      AccountItems:[],
      AccountStatus: "",
      interObj: Object,
      dotNumArr:[0,0],
      dotTxtArr:["",""],
      timeCntArr:[0,0],
    };
  },
  created() {
    getData(this,this.CurrentAccount);
    this.interObj = setInterval(() =>{
       getStatueData(this);
    }, 500);
  },
  destroyed() {
    clearInterval(this.interObj);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      if(event.itemKey == "currentAccount"){
        this.CurrentAccount = event.newVal;
        getData(this,this.CurrentAccount);
        this.interObj = setInterval(() =>{
          getStatueData(this);
        }, 500);
      } else {
        this.changedCfgData[event.itemKey] = event.newVal;
      }
    },
  },
};

function getStatueData(vm) {
  vm.$axios.get("api/accountBasic/info?accountId="+vm.CurrentAccount).then((response) => {
    vm.getDataSuccess = true;
    OnStatusAction(vm,response.data.data.Account.Status);
  });
}

function getData(vm,accountId) {
  vm.$axios.get("api/accountBasic/info?accountId="+accountId).then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);

    vm.AccountItems = [];
    for(var i = 1; i <= vm.apiData.data.Account.AccountNumber; i++){
      let item = {"key": i, "label": vm.$t("Account") + i};
      vm.AccountItems.push(item);
    }

    createPageData(vm);
  });
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "accountBasic",
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

function getCommitData(vm){
  vm.submitCfgData = {};
  for (var changedKey in vm.changedCfgData) {
    if(vm.apiData.configData[changedKey] != vm.changedCfgData[changedKey]){
      vm.submitCfgData[changedKey] = vm.changedCfgData[changedKey]
    }
  }
}

function OnStatusAction(vm,statusValue){
  let item = getItemByKey(
    vm.data,
    "sipAccount",
    "currentAccountStatus"
  );
  if(statusValue == "2"){
  item.value = vm.$t("Registered");
    clearInterval(vm.interObj);
  } else if(statusValue == "1"){
    if(vm.dotNumArr[0] >= 5){
      vm.dotNumArr[0] = 0;
      vm.dotTxtArr[0] = "";
    }
    if(vm.timeCntArr[0] > 280){
      clearInterval(vm.interObj);
      vm.dotNumArr[0] = timeCntArr[0] = 0;
      item.value = "time out";
      vm.dotTxtArr[0] = "";
    } else{
      item.value = vm.$t("Registering Failed") + vm.dotTxtArr[0];
    }
    vm.dotTxtArr[0] = ".";
    vm.dotNumArr[0]++;
    vm.timeCntArr[0]++;
  } else if(statusValue == "3"){
    item.value = vm.$t("Registration Failed");
    clearInterval(vm.interObj);
  } else if(statusValue == "0"){
    item.value = vm.$t("Disabled");
    clearInterval(vm.interObj);
  } else{
    if(vm.dotNumArr[1] >= 5){
      vm.dotNumArr[1] = 0;
      vm.dotTxtArr[1] = "";
    }
    if(vm.timeCntArr[1] > 20){
      clearInterval(vm.interObj);
      vm.dotNumArr[1] = vm.timeCntArr[1] = 0;
      item.value = vm.$t("UnRegistered");
      vm.dotTxtArr[0] = "";
    } else{
      item.value = vm.$t("UnRegistered");
    }
    vm.dotTxtArr[1] = ".";
    vm.dotNumArr[1]++;
    vm.timeCntArr[1]++;
  }
}

function checkCommitData(vm) {
  let success = true;
  //active 判username和sip server为null
  if(vm.changedCfgData["Config.Account"+vm.CurrentAccount+".GENERAL.Enable"] == 1){
    if(vm.changedCfgData["Config.Account"+vm.CurrentAccount+".GENERAL.UserName"] == ""){
      let item = getItemByKey(
        vm.data,
        "sipAccount",
        "Config.Account"+vm.CurrentAccount+".GENERAL.UserName"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("UserNameNoEmpty");
      success = false;
    }
    if(vm.changedCfgData["Config.Account"+vm.CurrentAccount+".SIP.Server"] == ""){
      let item = getItemByKey(
        vm.data,
        "sipServer",
        "Config.Account"+vm.CurrentAccount+".SIP.Server"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("AccountServerIPNoEmpty");
      success = false;
    }
  }

  //sip server校验
  if("undefined" != typeof(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".SIP.Server"])){
    if(!notContainInvalid(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".SIP.Server"])){
      let item = getItemByKey(
        vm.data,
        "sipServer",
        "Config.Account"+vm.CurrentAccount+".SIP.Server"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("AccountServerIPUnvalid");
      success = false;
    }
  }

  //sip port校验
  if("undefined" != typeof(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".SIP.Port"])){
    if(!(isPort(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".SIP.Port"]) 
      && (vm.submitCfgData["Config.Account"+vm.CurrentAccount+".SIP.Port"] >= 1024))){
      let item = getItemByKey(
        vm.data,
        "sipServer",
        "Config.Account"+vm.CurrentAccount+".SIP.Port"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("ServerPortRangeError");
      success = false;
    }
  }

  //Registration Period校验
  if("undefined" != typeof(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".REG.Timeout"])){
    if(!notContainInvalid(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".REG.Timeout"]) 
      || !isAnInterger(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".REG.Timeout"])
      || !(30 <= vm.submitCfgData["Config.Account"+vm.CurrentAccount+".REG.Timeout"] && vm.submitCfgData["Config.Account"+vm.CurrentAccount+".REG.Timeout"] <=65535)){
      let item = getItemByKey(
        vm.data,
        "sipServer",
        "Config.Account"+vm.CurrentAccount+".REG.Timeout"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("RegistrationPeriodRangeError");
      success = false;
    }
  }

  //outbond server1校验
  if(vm.changedCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.Enable"] == 1
    && vm.changedCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.Server"] == ""){
    let item = getItemByKey(
      vm.data,
      "outbondProxyServer",
      "Config.Account"+vm.CurrentAccount+".OUTPROXY.Server"
    );
    item.isWarn = true;
    item.warnLabel = vm.$t("PreOutboundServerNoEmpty");
    success = false;
  }

  //server1字符校验
  if("undefined" != typeof(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.Server"])){
    if(!notContainInvalid(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.Server"])){
      let item = getItemByKey(
        vm.data,
        "outbondProxyServer",
        "Config.Account"+vm.CurrentAccount+".OUTPROXY.Server"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("PreOutboundServerUnvalid");
      success = false;
    }
  }

  //port1端口校验
  if("undefined" != typeof(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.Port"])){
    if(!(isPort(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.Port"]) 
      && (vm.submitCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.Port"] >= 1024))){
      let item = getItemByKey(
        vm.data,
        "outbondProxyServer",
        "Config.Account"+vm.CurrentAccount+".OUTPROXY.Port"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("ServerPortRangeError");
      success = false;
    }
  }

  //server2字符校验
  if("undefined" != typeof(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.BakServer"])){
    if(!notContainInvalid(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.BakServer"])){
      let item = getItemByKey(
        vm.data,
        "outbondProxyServer",
        "Config.Account"+vm.CurrentAccount+".OUTPROXY.BakServer"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("AltOutboundServerUnvalid");
      success = false;
    }
  }

  //port2端口校验
  if("undefined" != typeof(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.BakPort"])){
    if(!(isPort(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.BakPort"]) 
      && (vm.submitCfgData["Config.Account"+vm.CurrentAccount+".OUTPROXY.BakPort"] >= 1024))){
      let item = getItemByKey(
        vm.data,
        "outbondProxyServer",
        "Config.Account"+vm.CurrentAccount+".OUTPROXY.BakPort"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("ServerPortRangeError");
      success = false;
    }
  }

  return success;
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Account"),
      secondTitle: vm.$t("Basic"),
    },
    onSubmit: function () {
      getCommitData(vm);
      if (!checkCommitData(vm)) {
        return;
      }
      submitData(vm);
      vm.interObj = setInterval(() =>{
        getStatueData(vm);
      }, 500);
    },
    onCancel: function () {
      vm.data.cancelLoading = true;
      getData(vm,vm.CurrentAccount);
    },
    submitLoading: false,
    cancelLoading: false,
    contents: [],
  };
  vm.data.contents.push(createSipAccountContent(vm));
  vm.data.contents.push(createSipServerContent(vm));
  vm.data.contents.push(createOutbondProxyServerContent(vm));
  vm.data.contents.push(createTransportTypeContent(vm));
}

function createSipAccountContent(vm) {
  let content = {
    key: "sipAccount",
    title: vm.$t("SIPAccount"),
    titleDescription: vm.$t("SIPAccountDesc"),
    items: [
      {
        title: vm.$t("Status"),
        type: "label",
        key: "currentAccountStatus",
        value: vm.AccountStatus,
        showDescription: true,
        description: vm.$t("StatusDesc"),
      },
      {
        title: vm.$t("Account"),
        type: "select",
        key: "currentAccount",
        description: vm.$t("AccountDesc"),
        value: vm.CurrentAccount,
        selectItems: vm.AccountItems,
      },
      {
        title: vm.$t("AccountEnable"),
        type: "checkbox",
        key: "Config.Account"+vm.CurrentAccount+".GENERAL.Enable",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".GENERAL.Enable"],
        description: vm.$t("AccountEnableDesc"),
      },
      {
        title: vm.$t("DisplayLabel"),
        type: "input",
        key: "Config.Account"+vm.CurrentAccount+".GENERAL.Label",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".GENERAL.Label"],
        description: vm.$t("DisplayLabelDesc"),
      },
      {
        title: vm.$t("DisplayName"),
        type: "input",
        key: "Config.Account"+vm.CurrentAccount+".GENERAL.DisplayName",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".GENERAL.DisplayName"],
        description: vm.$t("DisplayNameDesc"),
      },
      {
        title: vm.$t("RegisterName"),
        type: "input",
        key: "Config.Account"+vm.CurrentAccount+".GENERAL.AuthName",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".GENERAL.AuthName"],
        description: vm.$t("RegisterNameDesc"),
      },
      {
        title: vm.$t("UserName"),
        type: "input",
        isWarn: false,
        key: "Config.Account"+vm.CurrentAccount+".GENERAL.UserName",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".GENERAL.UserName"],
        description: vm.$t("UsernameDesc"),
      },
      {
        title: vm.$t("PasswordLabel"),
        type: "input",
        inputType:"password",
        key: "Config.Account"+vm.CurrentAccount+".GENERAL.Pwd",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".GENERAL.Pwd"],
        description: vm.$t("PasswordDesc"),
      },
    ],
  };
  return content;
}

function createSipServerContent(vm) {
  let content = {
    key: "sipServer",
    title: vm.$t("SIPServer"),
    titleDescription: vm.$t("SIPServerDesc"),
    items: [
      {
        title: vm.$t("ServerAddress"),
        type: "input",
        isWarn: false,
        key: "Config.Account"+vm.CurrentAccount+".SIP.Server",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".SIP.Server"],
        description: vm.$t("ServerAddressDesc"),
      },
      {
        title: vm.$t("ServerPort"),
        type: "input",
        showHint:true,
        isWarn: false,
        hintContent:vm.$t("(1024~65535)"),
        key: "Config.Account"+vm.CurrentAccount+".SIP.Port",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".SIP.Port"],
        description: vm.$t("ServerPortDesc"),
      },
      {
        title: vm.$t("RegistrationPeriod"),
        type: "input",
        showHint:true,
        isWarn: false,
        hintContent:vm.$t("(30~65535 Sec)"),
        key: "Config.Account"+vm.CurrentAccount+".REG.Timeout",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".REG.Timeout"],
        description: vm.$t("RegistrationPeriodDesc"),
      },
    ],
  };
  return content;
}

function createOutbondProxyServerContent(vm) {
  let content = {
    key: "outbondProxyServer",
    title: vm.$t("OutbondProxyServer"),
    titleDescription: vm.$t("OutboundProxyServerDesc"),
    items: [
      {
        title: vm.$t("OutboundEnabled"),
        type: "checkbox",
        key: "Config.Account"+vm.CurrentAccount+".OUTPROXY.Enable",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".OUTPROXY.Enable"],
        description: vm.$t("OutboundEnableDesc"),
      },
      {
        title: vm.$t("PreferredOutboundServer"),
        type: "input",
        isWarn: false,
        key: "Config.Account"+vm.CurrentAccount+".OUTPROXY.Server",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".OUTPROXY.Server"],
        description: vm.$t("PreferredServerDesc"),
      },
      {
        title: vm.$t("PreferredServerPortLabel"),
        type: "input",
        showHint:true,
        isWarn: false,
        hintContent:vm.$t("(1024~65535)"),
        key: "Config.Account"+vm.CurrentAccount+".OUTPROXY.Port",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".OUTPROXY.Port"],
        description: vm.$t("PreferredServerPortDesc"),
      },
      {
        title: vm.$t("AlternateOutboundServer"),
        type: "input",
        isWarn: false,
        key: "Config.Account"+vm.CurrentAccount+".OUTPROXY.BakServer",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".OUTPROXY.BakServer"],
        description: vm.$t("AlternateServerDesc"),
      },
      {
        title: vm.$t("AlternateServerPortLabel"),
        type: "input",
        showHint:true,
        isWarn: false,
        hintContent:vm.$t("(1024~65535)"),
        key: "Config.Account"+vm.CurrentAccount+".OUTPROXY.BakPort",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".OUTPROXY.BakPort"],
        description: vm.$t("AlternateServerPortDesc"),
      },
    ],
  };
  return content;
}

function createTransportTypeContent(vm) {
  let content = {
    key: "transportType",
    title: vm.$t("TransportType"),
    titleDescription: vm.$t("TransportTypeDesc"),
    items: [
      {
        title: vm.$t("Type"),
        type: "select",
        key: "Config.Account"+vm.CurrentAccount+".SIP.TransType",
        value: vm.apiData.configData["Config.Account"+vm.CurrentAccount+".SIP.TransType"],
        selectItems: [
          { key: 0, label: 'UDP' },
          { key: 1, label: 'TCP' },
          { key: 2, label: 'TLS' },
          { key: 3, label: 'DNS-SRV' },
        ],
        description: vm.$t("TypeDesc"),
      },
    ],
  };
  return content;
}
</script>