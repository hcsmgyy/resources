<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  getIndexByKey,
  getItemByKey,
  deepClone,
  isPort,
  checkRangeOfNumber,
  isAnInterger,
  isPortUsed,
  showErrorInfo
} from "@/js/common.js";

export default {
  components: {
    CommonPage,
  },
  data(){
    return{
      changedCfgData:{},
      submitCfgData:{},
      apiData: {},
      data: {
        getDataSuccess: false,
      },
      deviceAddressItems:[],
      usedPortItems:[],
      connectType: "None",
      deviceLocationKey: "Config.DoorSetting.DEVICENODE.Location",
      deviceLocationValue: "",
    }
  },
  created() {
    getData(this);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      if(event.itemKey == "Config.DoorSetting.DEVICENODE.Address"){
        this.deviceAddressItems = event.newVal;
        var deviceAddressValue = "";
        for(var i = 0; i < 5; i++){
          if(this.deviceAddressItems[i].label == ""){
            break;
          }
          deviceAddressValue = deviceAddressValue + this.deviceAddressItems[i].label + ".";
        }
        this.changedCfgData[event.itemKey] = deviceAddressValue.substring(0,(deviceAddressValue.length-1));
      } else if(event.itemKey == this.deviceLocationKey){
        this.deviceLocationValue = event.newVal;
        this.changedCfgData[event.itemKey] = event.newVal;
      } else{
        this.changedCfgData[event.itemKey] = event.newVal;
      }

      checkPortWarn(this);
    },
  },
};

function checkPortWarn(vm){
  var portinterval = 4;
  let item1 = getItemByKey(
    vm.data,
    "localRTP",
    "Config.Network.RTPPORT.Min"
  );
  let item2 = getItemByKey(
    vm.data,
    "localRTP",
    "Config.Network.RTPPORT.Max"
  );

  if(item1.isWarn == false && item2.isWarn == false){
    return;
  }

  if(isAnInterger(vm.changedCfgData["Config.Network.RTPPORT.Min"]) && isAnInterger(vm.changedCfgData["Config.Network.RTPPORT.Max"])){
    if(Number(vm.changedCfgData["Config.Network.RTPPORT.Min"])%2 != 0 || Number(vm.changedCfgData["Config.Network.RTPPORT.Max"])%2 != 0 ){
      portinterval = 6;
    }
    if(portinterval <= (Number(vm.changedCfgData["Config.Network.RTPPORT.Max"])-Number(vm.changedCfgData["Config.Network.RTPPORT.Min"]))
      && 0 == isPortUsed(vm.changedCfgData["Config.Network.RTPPORT.Min"],vm.changedCfgData["Config.Network.RTPPORT.Max"],vm.usedPortItems)){
      item1.isWarn = false;
      item2.isWarn = false;
      return;
    }
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "networkAdvanced",
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
  vm.$axios.get("api/networkAdvanced/info").then((response) => {
    if(response.data.retcode == -1){
      vm.data= {
        showNoPermission: true,
      };
      return;
    }
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);

    vm.deviceAddressItems = [];
    var deviceAddress = vm.changedCfgData["Config.DoorSetting.DEVICENODE.Address"].split(".");
    for(var i = 0; i < 5; i++){
      let item = {"key": i, "label": i < deviceAddress.length ? deviceAddress[i] : "", "isWarn": false, "warnLabel": vm.$t("DeviceAddressWarning")};
      vm.deviceAddressItems.push(item);
    }
    
    //port端口
    vm.usedPortItems = [];
    for(var i = 0; i < vm.apiData.data.rtpPorts.length; i++){
      let item = {"min": vm.apiData.data.rtpPorts[i].min,"max": vm.apiData.data.rtpPorts[i].max};
      vm.usedPortItems.push(item);
    }

    //connectType
    if(vm.changedCfgData["Config.DoorSetting.CONNECT.ServerMode"] == "1"){
      vm.connectType = "SDMC";
    } else if(vm.changedCfgData["Config.DoorSetting.CONNECT.ServerMode"] == "2"){
      vm.connectType = "Cloud";
      vm.deviceLocationKey = "Config.Account1.GENERAL.DisplayName";
    }
    vm.deviceLocationValue = vm.changedCfgData[vm.deviceLocationKey];
    
    createPageData(vm);
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

function checkCommitData(vm){
  let success = true;
  var maxPortErrFlag = false;
  var minPortErrFlag = false;
  //MinPort
  if("undefined" != typeof(vm.submitCfgData["Config.Network.RTPPORT.Min"])){
    let item = getItemByKey(
      vm.data,
      "localRTP",
      "Config.Network.RTPPORT.Min"
    );
    if(!isPort(vm.submitCfgData["Config.Network.RTPPORT.Min"])){
      item.isWarn = true;
      item.warnLabel = vm.$t("StartingRTPPortUnvalid");
      minPortErrFlag = true;
      success = false;
    }
    if(!checkRangeOfNumber(vm.submitCfgData["Config.Network.RTPPORT.Min"],1024,65535)){
      item.isWarn = true;
      item.warnLabel = vm.$t("StartingRTPPortUnvalid");
      minPortErrFlag = true;
      success = false;
    }
  }

  //MaxPort
  if("undefined" != typeof(vm.submitCfgData["Config.Network.RTPPORT.Max"])){
    let item = getItemByKey(
      vm.data,
      "localRTP",
      "Config.Network.RTPPORT.Max"
    );
    if(!isPort(vm.submitCfgData["Config.Network.RTPPORT.Max"])){
      item.isWarn = true;
      item.warnLabel = vm.$t("MaxRTPPortUnvalid");
      maxPortErrFlag = true;
      success = false;
    }
    if(!checkRangeOfNumber(vm.submitCfgData["Config.Network.RTPPORT.Max"],1024,65535)){
      item.isWarn = true;
      item.warnLabel = vm.$t("MaxRTPPortUnvalid");
      maxPortErrFlag = true;
      success = false;
    }
  }

  var portinterval = 4;
  let item1 = getItemByKey(
    vm.data,
    "localRTP",
    "Config.Network.RTPPORT.Min"
  );
  let item2 = getItemByKey(
    vm.data,
    "localRTP",
    "Config.Network.RTPPORT.Max"
  );
  if(isAnInterger(vm.changedCfgData["Config.Network.RTPPORT.Min"]) && isAnInterger(vm.changedCfgData["Config.Network.RTPPORT.Max"])){
    if(Number(vm.changedCfgData["Config.Network.RTPPORT.Min"])%2 != 0 || Number(vm.changedCfgData["Config.Network.RTPPORT.Max"])%2 != 0 ){
      portinterval = 6;
    }
    if(portinterval > (Number(vm.changedCfgData["Config.Network.RTPPORT.Max"])-Number(vm.changedCfgData["Config.Network.RTPPORT.Min"])) && !maxPortErrFlag && !minPortErrFlag){
      item1.isWarn = true;
      item2.isWarn = true;
      success = false;
      if(6 == portinterval){
        item1.warnLabel = vm.$t("WarningInvalidAndroidRTPSetting")+"6!";
        item2.warnLabel = vm.$t("WarningInvalidAndroidRTPSetting")+"6!";
        minPortErrFlag = true;
        maxPortErrFlag = true;
      } else{
        item1.warnLabel = vm.$t("WarningInvalidAndroidRTPSetting")+"4!";
        item2.warnLabel = vm.$t("WarningInvalidAndroidRTPSetting")+"4!";
        minPortErrFlag = true;
        maxPortErrFlag = true;
      }
    }
  }

  if("undefined" != typeof(vm.submitCfgData["Config.Network.RTPPORT.Min"]) || "undefined" != typeof(vm.submitCfgData["Config.Network.RTPPORT.Max"])){
    var isPortUsedValue = isPortUsed(vm.changedCfgData["Config.Network.RTPPORT.Min"],vm.changedCfgData["Config.Network.RTPPORT.Max"],vm.usedPortItems);
    if(3 == isPortUsedValue){
      if(!maxPortErrFlag){
        item2.isWarn = true;
        item2.warnLabel = vm.$t("WarningPortUsedAlready");
        maxPortErrFlag = true;
        success = false;
      }
      if(!minPortErrFlag){
        item1.isWarn = true;
        item1.warnLabel = vm.$t("WarningPortUsedAlready");
        minPortErrFlag = true;
        success = false;
      }
    } else if(2 == isPortUsedValue && !maxPortErrFlag){
      item2.isWarn = true;
      item2.warnLabel = vm.$t("WarningPortUsedAlready");
      maxPortErrFlag = true;
      success = false;
    } else if(1 == isPortUsedValue && !minPortErrFlag){
      item1.isWarn = true;
      item1.warnLabel = vm.$t("WarningPortUsedAlready");
      minPortErrFlag = true;
      success = false;
    }
  }

  //device address
  var reg="^[0-9A-H]+$";
  if(vm.deviceAddressItems[3].label == "" && vm.deviceAddressItems[4].label != ""){
    vm.deviceAddressItems[3].isWarn = true;
    vm.deviceAddressItems[3].warnLabel = vm.$t("DeviceAddressWarning");
    success = false;
  } 
  if(vm.deviceAddressItems[2].label == "" && (vm.deviceAddressItems[3].label != "" || vm.deviceAddressItems[4].label != "")){
    vm.deviceAddressItems[2].isWarn = true;
    vm.deviceAddressItems[2].warnLabel = vm.$t("DeviceAddressWarning");
    success = false;
  } 
  if(vm.deviceAddressItems[1].label == "" && (vm.deviceAddressItems[2].label != "" || vm.deviceAddressItems[3].label != "" || vm.deviceAddressItems[4].label != "")){
    vm.deviceAddressItems[1].isWarn = true;
    vm.deviceAddressItems[1].warnLabel = vm.$t("DeviceAddressWarning");
    success = false;
  } 
  if(vm.deviceAddressItems[0].label == ""){
    vm.deviceAddressItems[0].isWarn = true;
    vm.deviceAddressItems[0].warnLabel = vm.$t("DeviceAddressWarning");
    success = false;
  }

  for(var i = 0; i < 5; i++){
    if(vm.deviceAddressItems[i].label != "" && vm.deviceAddressItems[i].label.match(reg) == null){
      vm.deviceAddressItems[i].isWarn = true;
      vm.deviceAddressItems[i].warnLabel = vm.$t("DeviceAddressWarning");
      success = false;
    }
  }

  return success;
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Network"),
      secondTitle: vm.$t("Advance"),
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
  vm.data.contents.push(createLocalRTPContent(vm));
  vm.data.contents.push(createConnectSettingContent(vm));
}

function createLocalRTPContent(vm) {
  let content = {
    key: "localRTP",
    title: vm.$t("LocalRTP"),
    titleDescription: vm.$t("LocalRTPDesc"),
    items: [
      {
        title: vm.$t("RTPPort"),
        type: "input",
        showHint:true,
        hintContent:vm.$t("(1024~65535)"),
        key: "Config.Network.RTPPORT.Min",
        value: vm.apiData.configData["Config.Network.RTPPORT.Min"],
        description: vm.$t("StartRTPPortDesc"),
      },
      {
        title: vm.$t("MaxRTPPort"),
        type: "input",
        showHint:true,
        hintContent:vm.$t("(1024~65535)"),
        isWarn: false,
        key: "Config.Network.RTPPORT.Max",
        value: vm.apiData.configData["Config.Network.RTPPORT.Max"],
        description: vm.$t("MaxPortDesc"),
      },
    ],
  };
  return content;
}

function createConnectSettingContent(vm) {
  let content = {
    key: "connectSetting",
    title: vm.$t("ConnectSetting"),
    titleDescription: vm.$t("ConnectSettingDesc"),
    items: [
      {
        title: vm.$t("ConnectType"),
        type: "label",
        key: "connectType",
        value: vm.connectType,
        showDescription: true,
        description: vm.$t("ConnectModeDesc"),
      },
      {
        title: vm.$t("DiscoveryMode"),
        type: "checkbox",
        key: "Config.DoorSetting.CONNECT.DiscoveryMode",
        value: vm.apiData.configData["Config.DoorSetting.CONNECT.DiscoveryMode"],
        description: vm.$t("DiscoveryModeDesc"),
      },
      {
        title: vm.$t("DeviceAddress"),
        type: "multipleInput",
        value: vm.deviceAddressItems,
        key: "Config.DoorSetting.DEVICENODE.Address",
        description: vm.$t("DeviceAddressDesc"),
      },
      {
        title: vm.$t("DeviceExtension"),
        type: "input",
        key: "Config.DoorSetting.DEVICENODE.Extension",
        value: vm.apiData.configData["Config.DoorSetting.DEVICENODE.Extension"],
        description: vm.$t("DeviceExtensionDesc"),
      },
      {
        title: vm.$t("DeviceLocation"),
        type: "input",
        key: vm.deviceLocationKey,
        value: vm.deviceLocationValue,
        description: vm.$t("DeviceLocationDesc"),
      },
    ],
  };
  return content;
}

</script>