<template>
  <div>
    <CommonPage :data="data"></CommonPage>
  </div>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { showRequestSuccess,getAccountStatusStr } from "@/js/common.js";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      apiData: {},
      data: {
        getDataSuccess: false,
      },
      accountState_data: [],
      accountName_data: [],
      accountServer_data: [],
      accountItems: [],
      MACAddress: "",
    };
  },
  created() {
    getData(this);
  },
};

function getData(vm) {
  vm.$axios.get("api/status/info").then((response) => {
    vm.apiData = response.data;
    //Type
    if (vm.apiData.data.Network.LANPortType == 0){
      vm.apiData.data.Network.LANPortType = 'DHCPAUTO';
    } else if (vm.apiData.data.Network.LANPortType == 1){
      vm.apiData.data.Network.LANPortType = 'PPPOE';
    } else if (vm.apiData.data.Network.LANPortType == 2){
      vm.apiData.data.Network.LANPortType = 'StaticIP';
    }
    //Account

    vm.accountItems = [];
    for (var i = 0; i < vm.apiData.data.Accounts.length; i++){
      vm.accountServer_data[i] = vm.apiData.data.Accounts[i].AccountServer == "" ? 'None' : vm.apiData.data.Accounts[i].AccountServer;
      vm.accountName_data[i] = vm.apiData.data.Accounts[i].AccountName == "" ? 'None' : vm.apiData.data.Accounts[i].AccountName;
      vm.accountState_data[i] = getAccountStatusStr(vm,vm.apiData.data.Accounts[i].AccountStatue);
      let item1 = {"title": vm.$t('Account')+(i+1),"type": "label","key":"data.Accounts.Name"+i,"value": vm.accountName_data[i]+'@'+vm.accountServer_data[i],"textAlign":"right"};
      let item2 = {"title": "","type": "label","key":"data.Accounts.State"+i,"value": vm.accountState_data[i],"textAlign":"right"};
      vm.accountItems.push(item1);
      vm.accountItems.push(item2);
    }

    let macArr = vm.apiData.data.Product.MACAddress.split(":");
    for(var i = 0; i < macArr.length; i++) {
      vm.MACAddress += macArr[i];
    }

    createPageData(vm);
    vm.getDataSuccess = true;
  });
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Status"),
      secondTitle: vm.$t("Basic"),
    },
    onSubmit: function () {
      submitData(vm);
    },
    onCancel: function () {
      vm.data.cancelLoading = true;
      getData(vm);
    },
    submitLoading: false,
    cancelLoading: false,
    showSubmit: false,
    contents: []
  };
  vm.data.contents.push(createProductInformationContent(vm));
  vm.data.contents.push(createNetworkInformationContent(vm));
  if (vm.$root.hiddenArr.isShowStatusAccountInformation == 1) {
    vm.data.contents.push(createAccountInformationContent(vm));
  }
}

function createProductInformationContent(vm) {
  let content = {
    key: "productInfo",
    title: vm.$t("ProductInfo"),
    titleDescription: vm.$t("ProductInformationDesc"),
    items: [
      {
        title: vm.$t('ProductReleaseName'),
        type: "label",
        key: "data.Product.ProductName",
        value: vm.apiData.data.Product.ProductName,
        textAlign:"right"
      },
      {
        title: vm.$t('HardwareModel'),
        type: "label",
        key: "data.Product.HardwareModel",
        value: vm.apiData.data.Product.HardwareModel,
        textAlign:"right"
      },
      {
        title: vm.$t('MACAddress'),
        type: "label",
        key: "data.Product.MACAddress",
        value: vm.MACAddress,
        textAlign:"right"
      },
      {
        title: vm.$t('FirmwareVersion'),
        type: "label",
        key: "data.Product.FirmwareVersion",
        value: vm.apiData.data.Product.FirmwareVersion,
        textAlign:"right"
      },
      {
        title: vm.$t('HardwareVersion'),
        type: "label",
        key: "data.Product.HardwareVersion",
        value: vm.apiData.data.Product.HardwareVersion,
        textAlign:"right"
      },
    ],
  };
  return content;
}

function createNetworkInformationContent(vm) {
  let content = {
    key: "networkInfo",
    title: vm.$t("NetworkInfo"),
    titleDescription: vm.$t("NetworkInformationDesc"),
    items: [
      {
        title: vm.$t('LANPortType'),
        type: "label",
        key: "data.Network.LANPortType",
        value: vm.$t(vm.apiData.data.Network.LANPortType),
        textAlign:"right"
      },
      {
        title: vm.$t('LinkStatus'),
        type: "label",
        key: "data.Network.LinkStatus",
        value: vm.apiData.data.Network.LinkStatus==1 ? vm.$t('Connected') : vm.$t('Disconnect'),
        textAlign:"right"
      },
      {
        title: vm.$t('IPAddress'),
        type: "label",
        key: "data.Network.IPAddress",
        value: vm.apiData.data.Network.IPAddress,
        textAlign:"right"
      },
      {
        title: vm.$t('SubnetMask'),
        type: "label",
        key: "data.Network.SubnetMask",
        value: vm.apiData.data.Network.SubnetMask,
        textAlign:"right"
      },
      {
        title: vm.$t('GateWay'),
        type: "label",
        key: "data.Network.Gateway",
        value: vm.apiData.data.Network.Gateway,
        textAlign:"right"
      },
      {
        title: vm.$t('PreferredDNS'),
        type: "label",
        key: "data.Network.PreferredDNS",
        value: vm.apiData.data.Network.PreferredDNS,
        textAlign:"right"
      },
      {
        title: vm.$t('AlternateDNS'),
        type: "label",
        key: "data.Network.AlternateDNS",
        value: vm.apiData.data.Network.AlternateDNS,
        textAlign:"right"
      },
    ],
  };
  return content;
}

function createAccountInformationContent(vm) {
  let content = {
    key: "accountInfo",
    title: vm.$t("AccountInfo"),
    titleDescription: vm.$t("AccountInformationDesc"),
    items: vm.accountItems,
    textAlign:"right",
  };
  return content;
}
</script>