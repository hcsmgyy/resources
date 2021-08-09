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
  checkIpAddr,
  checkSubMaskV4,
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
      ipTypeChanged: false,
      ipChanged: false,
    }
  },
  created() {
    getData(this);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      if (event.itemKey == "Config.Network.LAN.Type") {
        this.ipTypeChanged = !this.ipTypeChanged;
        isShowStaticDiv(this,event.newVal);
        this.changedCfgData[event.itemKey] = event.newVal;
      } else {
        this.changedCfgData[event.itemKey] = event.newVal;
      }
    },
  },
};

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "networkBasic",
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
  vm.$axios.get("api/networkBasic/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    vm.ipTypeChanged = false;
    createPageData(vm);
    isShowStaticDiv(vm,vm.apiData.configData["Config.Network.LAN.Type"]);
  });
}

function getCommitData(vm){
  vm.submitCfgData = {};

  // for (var changedKey in vm.changedCfgData) {
  //   if(vm.apiData.configData[changedKey] != vm.changedCfgData[changedKey]){
  //     vm.submitCfgData[changedKey] = vm.changedCfgData[changedKey];
  //   }
  // }

  //ipTypeChange且type为dhcp
  if(vm.ipTypeChanged == true && vm.changedCfgData["Config.Network.LAN.Type"] == "0"){
    vm.ipChanged = true;
    vm.submitCfgData["Config.Network.LAN.Type"] = "0";
  } else if(vm.changedCfgData["Config.Network.LAN.Type"] == "2"){
    if(vm.ipTypeChanged == true
      || vm.apiData.configData["Config.Network.LAN.StaticIP"] != vm.changedCfgData["Config.Network.LAN.StaticIP"]
      || vm.apiData.configData["Config.Network.LAN.SubnetMask"] != vm.changedCfgData["Config.Network.LAN.SubnetMask"]
      || vm.apiData.configData["Config.Network.LAN.DefaultGateway"] != vm.changedCfgData["Config.Network.LAN.DefaultGateway"]
      || vm.apiData.configData["Config.Network.LAN.PrimaryDNS"] != vm.changedCfgData["Config.Network.LAN.PrimaryDNS"]
      || vm.apiData.configData["Config.Network.LAN.SecondaryDNS"] != vm.changedCfgData["Config.Network.LAN.SecondaryDNS"]){
        
      vm.ipChanged = true;
      vm.submitCfgData["Config.Network.LAN.Type"] = "2";
      vm.submitCfgData["Config.Network.LAN.StaticIP"] = vm.changedCfgData["Config.Network.LAN.StaticIP"];
      vm.submitCfgData["Config.Network.LAN.SubnetMask"] = vm.changedCfgData["Config.Network.LAN.SubnetMask"];
      vm.submitCfgData["Config.Network.LAN.DefaultGateway"] = vm.changedCfgData["Config.Network.LAN.DefaultGateway"];
      vm.submitCfgData["Config.Network.LAN.PrimaryDNS"] = vm.changedCfgData["Config.Network.LAN.PrimaryDNS"];
      vm.submitCfgData["Config.Network.LAN.SecondaryDNS"] = vm.changedCfgData["Config.Network.LAN.SecondaryDNS"];
    } else{
      vm.ipChanged = false;
    }
  }
}

function isShowStaticDiv(vm,lanPortType){
  let item1 = getItemByKey(
    vm.data,
    "lanPort",
    "Config.Network.LAN.StaticIP"
  );
  let item2 = getItemByKey(
    vm.data,
    "lanPort",
    "Config.Network.LAN.SubnetMask"
  );
  let item3 = getItemByKey(
    vm.data,
    "lanPort",
    "Config.Network.LAN.DefaultGateway"
  );
  let item4 = getItemByKey(
    vm.data,
    "lanPort",
    "Config.Network.LAN.PrimaryDNS"
  );
  let item5 = getItemByKey(
    vm.data,
    "lanPort",
    "Config.Network.LAN.SecondaryDNS"
  );
  if(lanPortType == "0"){
    item1.isShow = false;
    item2.isShow = false;
    item3.isShow = false;
    item4.isShow = false;
    item5.isShow = false;
  } else{
    item1.isShow = true;
    item2.isShow = true;
    item3.isShow = true;
    item4.isShow = true;
    item5.isShow = true;
  }
}

function checkCommitData(vm){
  let success = true;

  //static时校验
  if(vm.changedCfgData["Config.Network.LAN.Type"] == "2"){
    //检查是否为null和ip校验
    if("undefined" != typeof(vm.submitCfgData["Config.Network.LAN.StaticIP"])){
      let item = getItemByKey(
        vm.data,
        "lanPort",
        "Config.Network.LAN.StaticIP"
      );
      if(0 == vm.submitCfgData["Config.Network.LAN.StaticIP"].length){
        item.isWarn = true;
        item.warnLabel = vm.$t("IPAddressNoEmpty");
        success = false;
      } else if(!checkIpAddr(vm.submitCfgData["Config.Network.LAN.StaticIP"])){
        item.isWarn = true;
        item.warnLabel = vm.$t("IPAddressUnvalid");
        success = false;
      }
    }

    //检查是否为null和SubnetMask校验
    if("undefined" != typeof(vm.submitCfgData["Config.Network.LAN.SubnetMask"])){
      let item = getItemByKey(
        vm.data,
        "lanPort",
        "Config.Network.LAN.SubnetMask"
      );
      if(0 == vm.submitCfgData["Config.Network.LAN.SubnetMask"].length){
        item.isWarn = true;
        item.warnLabel = vm.$t("SubnetMaskNoEmpty");
        success = false;
      } else if(!checkIpAddr(vm.submitCfgData["Config.Network.LAN.SubnetMask"])){
        item.isWarn = true;
        item.warnLabel = vm.$t("SubnetMaskUnvalid");
        success = false;
      }
    }

    //检查是否为null和DefaultGateway校验
    if("undefined" != typeof(vm.submitCfgData["Config.Network.LAN.DefaultGateway"])){
      let item = getItemByKey(
        vm.data,
        "lanPort",
        "Config.Network.LAN.DefaultGateway"
      );
      if(0 == vm.submitCfgData["Config.Network.LAN.DefaultGateway"].length){
        item.isWarn = true;
        item.warnLabel = vm.$t("DefaultGatewayNoEmpty");
        success = false;
      } else if(!checkIpAddr(vm.submitCfgData["Config.Network.LAN.DefaultGateway"])){
        item.isWarn = true;
        item.warnLabel = vm.$t("DefaultGatewayUnvalid");
        success = false;
      }
    }

    //PrimaryDNS校验
    if("undefined" != typeof(vm.submitCfgData["Config.Network.LAN.PrimaryDNS"])){
      if(!checkIpAddr(vm.submitCfgData["Config.Network.LAN.PrimaryDNS"])){
        let item = getItemByKey(
          vm.data,
          "lanPort",
          "Config.Network.LAN.PrimaryDNS"
        );
        item.isWarn = true;
        item.warnLabel = vm.$t("PreferDNSServerUnvalid");
        success = false;
      }
    }

    //SecondaryDNS校验
    if("undefined" != typeof(vm.submitCfgData["Config.Network.LAN.SecondaryDNS"]) && vm.submitCfgData["Config.Network.LAN.SecondaryDNS"] !=""){
      if(!checkIpAddr(vm.submitCfgData["Config.Network.LAN.SecondaryDNS"])){
        let item = getItemByKey(
          vm.data,
          "lanPort",
          "Config.Network.LAN.SecondaryDNS"
        );
        item.isWarn = true;
        item.warnLabel = vm.$t("AlterDNSServerUnvalid");
        success = false;
      }
    }

    //CheckSubMask校验
    if(!checkSubMaskV4(vm.changedCfgData["Config.Network.LAN.StaticIP"],vm.changedCfgData["Config.Network.LAN.SubnetMask"])){
      let item = getItemByKey(
          vm.data,
          "lanPort",
          "Config.Network.LAN.SubnetMask"
        );
        item.isWarn = true;
        item.warnLabel = vm.$t("SubnetOrGateWayInvalid");
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
      secondTitle: vm.$t("Basic"),
    },
    onSubmit: function () {
      getCommitData(vm);
      if (!checkCommitData(vm)) {
        return;
      }
      if(vm.ipChanged){
        vm.$confirm({
          content: vm.$t("CheckIPWarning"),
          onOk() {
            submitData(vm);
            return;
          },
        });
      }
      else{
        submitData(vm);
      }
    },
    onCancel: function () {
      vm.data.cancelLoading = true;
      getData(vm);
    },
    submitLoading: false,
    cancelLoading: false,
    contents: [],
  };
  vm.data.contents.push(createLANPortContent(vm));
}

function createLANPortContent(vm) {
  let content = {
    key: "lanPort",
    title: vm.$t("LANPort"),
    titleDescription: vm.$t("LANPortDesc"),
    items: [
      {
        type: "radiogroup",
        key: "Config.Network.LAN.Type",
        title: vm.$t("Type"),
        descriptionContent: vm.$t("Network"),
        value: vm.apiData.configData["Config.Network.LAN.Type"],
        radioItems:[
          {"key": "0", "label":vm.$t("DHCP")},
          {"key": "2", "label":vm.$t("StaticIP")},
        ],
        description: vm.$t("LANTypeDesc"),
      },
      {
        title: vm.$t("IPAddress"),
        type: "input",
        isShow: false,
        isWarn: false,
        key: "Config.Network.LAN.StaticIP",
        value: vm.apiData.configData["Config.Network.LAN.StaticIP"],
        description: vm.$t("IPAddressDesc"),
      },
      {
        title: vm.$t("SubnetMask"),
        type: "input",
        isShow: false,
        isWarn: false,
        key: "Config.Network.LAN.SubnetMask",
        value: vm.apiData.configData["Config.Network.LAN.SubnetMask"],
        description: vm.$t("SubnetMaskDesc"),
      },
      {
        title: vm.$t("DefaultGageway"),
        type: "input",
        isShow: false,
        isWarn: false,
        key: "Config.Network.LAN.DefaultGateway",
        value: vm.apiData.configData["Config.Network.LAN.DefaultGateway"],
        description: vm.$t("DefaultGatwayDesc"),
      },
      {
        title: vm.$t("PrimaryDNS"),
        type: "input",
        isShow: false,
        isWarn: false,
        key: "Config.Network.LAN.PrimaryDNS",
        value: vm.apiData.configData["Config.Network.LAN.PrimaryDNS"],
        description: vm.$t("PreDNSServerDesc"),
      },
      {
        title: vm.$t("SecondaryDNS"),
        type: "input",
        isShow: false,
        isWarn: false,
        key: "Config.Network.LAN.SecondaryDNS",
        value: vm.apiData.configData["Config.Network.LAN.SecondaryDNS"],
        description: vm.$t("AlterDNSServerDes"),
      },
    ],
  };
  return content;
}

</script>