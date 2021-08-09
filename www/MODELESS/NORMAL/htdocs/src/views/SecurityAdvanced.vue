<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { 
  showRequestSuccess,
  deepClone,
  getIndexByKey,
  getItemByKey
} from "@/js/common.js";

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
    };
  },
  created() {
    getData(this);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      this.changedCfgData[event.itemKey] = event.newVal;
    },
  },
};

function getData(vm) {
  vm.$axios.get("api/securityAdvanced/info").then((response) => {
    if(response.data.retcode == -1){
      vm.data= {
        showNoPermission: true,
      };
      return;
    }
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    createPageData(vm);
  });
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "securityAdvanced",
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

function checkCommitData(vm){
  let success = true;
  return success;
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Security"),
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
  vm.data.contents.push(createServiceContent(vm));
}

function createServiceContent(vm) {
  let content = {
    key: "service",
    title: vm.$t("ServiceLabel"),
    titleDescription: vm.$t("SecurityServiceDesc"),
    items: [
      {
        title: vm.$t("LocationLabel"),
        type: "select",
        key: "Config.Settings.SERVICE.Location",
        value: vm.apiData.configData["Config.Settings.SERVICE.Location"],
        selectItems: [
          { key: 0, label: vm.$t("Disabled") },
          { key: 1, label: vm.$t("OnlyDevice") },
          { key: 2, label: vm.$t("HighAccuracy") },
        ],
        description: vm.$t("SecurtiyLocationDesc"),
      },
    ],
  };
  return content;
}

</script>