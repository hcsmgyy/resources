<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { showRequestSuccess, deepClone, getItemByKey} from "@/js/common.js";

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
      this.changedCfgData[event.itemKey] = event.newVal;
      if(event.itemKey == "Config.Features.INTERCOM.Enable"){
        handlerPageChanged(this);
      }
    },
  },
};

function handlerPageChanged(vm) {
  let itemIntercomEnable = getItemByKey(vm.data, "intercom", "Config.Features.INTERCOM.Enable");
  let itemIntercomMute = getItemByKey(vm.data, "intercom", "Config.Features.INTERCOM.Mute");
  let itemIntercomPreview = getItemByKey(vm.data, "intercom", "Config.Features.INTERCOM.Preview");
  if(itemIntercomEnable.value == 0){
    itemIntercomMute.disabled = true;
    itemIntercomPreview.disabled = true;
  } else{
    itemIntercomMute.disabled = false;
    itemIntercomPreview.disabled = false;
  }
}


function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneIntercom",
    action: "set",
    configData: vm.submitCfgData,
  };
  vm.$axios.post("api", requestData).then((response) => {
    if("undefined" != typeof(response)){
      showRequestSuccess(vm);
    }
    vm.data.submitLoading = false;
  });
}

function getData(vm) {
  vm.$axios.get("api/phoneIntercom/info").then((response) => {
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    createPageData(vm);
    handlerPageChanged(vm);
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
      secondTitle: vm.$t("Intercom"),
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
    contents: [
      {
        key: "sos",
        title: vm.$t("SOS"),
        titleDescription: vm.$t("SOSDesc"),
        items: [
          {
            title: vm.$t("CallNumber") + " 1",
            type: "input",
            key: "Config.Features.CALLROBIN.Num01",
            value: vm.apiData.configData["Config.Features.CALLROBIN.Num01"],
            description: vm.$t("CallNumberDesc"),
          },
          {
            title: vm.$t("CallNumber") + " 2",
            type: "input",
            key: "Config.Features.CALLROBIN.Num02",
            value: vm.apiData.configData["Config.Features.CALLROBIN.Num02"],
            description: vm.$t("CallNumberDesc"),
          },
          {
            title: vm.$t("CallNumber") + " 3",
            type: "input",
            key: "Config.Features.CALLROBIN.Num03",
            value: vm.apiData.configData["Config.Features.CALLROBIN.Num03"],
            description: vm.$t("CallNumberDesc"),
          },
          {
            title: vm.$t("CallTimeout") + "( " + vm.$t("Second") + ")",
            type: "select",
            key: "Config.Features.CALLROBIN.Time",
            value: vm.apiData.configData["Config.Features.CALLROBIN.Time"],
            selectItems: [
              { key: 5, label: 5 },
              { key: 15, label: 15 },
              { key: 30, label: 30 },
              { key: 60, label: 60 },
            ],
            description: vm.$t("CallTimeOutDesc"),
          },
          {
            title: vm.$t("LoopTimes"),
            type: "select",
            key: "Config.Features.CALLROBIN.Count",
            value: vm.apiData.configData["Config.Features.CALLROBIN.Count"],
            selectItems: [
              { key: 1, label: 1 },
              { key: 2, label: 2 },
              { key: 3, label: 3 },
            ],
            description: vm.$t("LoopTimesDesc"),
          },
        ],
      },
      {
        key: "intercom",
        title: vm.$t("Intercom"),
        titleDescription: vm.$t("IntercomDesc"),
        items: [
          {
            title: vm.$t("IntercomActive"),
            type: "checkbox",
            key: "Config.Features.INTERCOM.Enable",
            value: vm.apiData.configData["Config.Features.INTERCOM.Enable"],
            description: vm.$t("IntercomActiveDesc"),
          },
          {
            title: vm.$t("IntercomMute"),
            type: "checkbox",
            key: "Config.Features.INTERCOM.Mute",
            value: vm.apiData.configData["Config.Features.INTERCOM.Mute"],
            description: vm.$t("IntercomMuteDesc"),
          },
          {
            title: vm.$t("IntercomPreview"),
            type: "checkbox",
            key: "Config.Features.INTERCOM.Preview",
            value: vm.apiData.configData["Config.Features.INTERCOM.Preview"],
            description: vm.$t("IntercomPreviewDesc"),
          },
        ],
      },
    ],
  };
}
</script>