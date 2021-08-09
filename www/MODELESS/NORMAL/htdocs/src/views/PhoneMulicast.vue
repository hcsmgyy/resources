<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  showErrorInfo,
  isPort,
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
      //mulitcast List部分
      if (event.contentKey == "mulitcastList") {
        //单选逻辑
        let falseCount = 0;
        for (let i = 0; i < event.newVal.length; i++) {
          this.changedCfgData["Config.Multicast.GROUP" + (i + 1) + ".IP"] =
            event.newVal[i].multicastAddress.value;
          if (!event.newVal[i].enabled.value) {
            falseCount++;
          }
          if (event.newVal[i].enabled.value && !event.oldVal[i].enabled.value) {
            this.changedCfgData[
              "Config.Multicast.SELECTEDGROUP.SelectedGroup"
            ] = i + 1;
            for (let j = 0; j < event.newVal.length; j++) {
              if (i != j) {
                this.data.contents[event.contentIndex].items[
                  event.itemIndex
                ].tableData[j].enabled.value = false;
              }
            }
          }
        }
        if (falseCount == event.newVal.length) {
          this.changedCfgData["Config.Multicast.SELECTEDGROUP.SelectedGroup"] =
            "0";
        }
      } else if (event.contentKey == "listenList") {
        //listen list 部分
        for (let i = 0; i < event.newVal.length; i++) {
          this.changedCfgData["Config.Multicast.LISTEN" + i + ".IP"] =
            event.newVal[i].listeningAddress.value;
          this.changedCfgData["Config.Multicast.LISTEN" + i + ".Label"] =
            event.newVal[i].label.value;
        }
      }
      // checkCommitData(this);
    },
  },
};
function checkCommitData(vm) {
  let success = true;
  //multicast list
  let multicastListContentIndex = vm.data.contents
    .map((item) => item.key)
    .indexOf("mulitcastList");
  let multicastListItemIndex = vm.data.contents[multicastListContentIndex].items
    .map((item) => item.key)
    .indexOf("mulitcastList");
  let mulitcastTableData =
    vm.data.contents[multicastListContentIndex].items[multicastListItemIndex]
      .tableData;
  for (let i = 0; i < mulitcastTableData.length; i++) {
    mulitcastTableData[i].multicastAddress.isWarn = false;
    if (mulitcastTableData[i].enabled.value == true && mulitcastTableData[i].multicastAddress.value == "") {
      //address不允许为null
      mulitcastTableData[i].multicastAddress.isWarn = true;
      mulitcastTableData[i].multicastAddress.warnLabel = vm.$t("MulticastGroupNoEmpty");
      success = false;
    }
    if (mulitcastTableData[i].multicastAddress.value == "") {
      continue;
    }
    let port = getPort(mulitcastTableData[i].multicastAddress.value);
    if (port == "" || !(isPort(port) && Number(port) >= 1024)) {
      //不允许为空
      mulitcastTableData[i].multicastAddress.isWarn = true;
      mulitcastTableData[i].multicastAddress.warnLabel = vm.$t("MulticastGroupUnvalid");
      success = false;
    } else {
      //不允许重复
      for (let j = 0; j < mulitcastTableData.length; j++) {
        if (
          i != j &&
          getPort(mulitcastTableData[i].multicastAddress.value) ==
            getPort(mulitcastTableData[j].multicastAddress.value)
        ) {
          mulitcastTableData[i].multicastAddress.isWarn = true;
          mulitcastTableData[i].multicastAddress.warnLabel = vm.$t(
            "WarningSamePortExist"
          );
          mulitcastTableData[j].multicastAddress.isWarn = true;
          mulitcastTableData[j].multicastAddress.warnLabel = vm.$t(
            "WarningSamePortExist"
          );
          success = false;
        }
      }
    }
  }
  //listen list
  let listenListContentIndex = vm.data.contents
    .map((item) => item.key)
    .indexOf("listenList");
  let listenListItemIndex = vm.data.contents[listenListContentIndex].items
    .map((item) => item.key)
    .indexOf("listenList");
  let listenTableData =
    vm.data.contents[listenListContentIndex].items[listenListItemIndex]
      .tableData;
  for (let i = 0; i < listenTableData.length; i++) {
    listenTableData[i].listeningAddress.isWarn = false;
    if (listenTableData[i].listeningAddress.value == "") {
      continue;
    }
    let port = getPort(listenTableData[i].listeningAddress.value);
    if (port == "" || !(isPort(port) && Number(port) >= 1024)) {
      //不允许为空
      listenTableData[i].listeningAddress.isWarn = true;
      listenTableData[i].listeningAddress.warnLabel = vm.$t("ListenGroupUnvalid");
      success = false;
    } else {
      //不允许重复
      for (let j = 0; j < listenTableData.length; j++) {
        if (
          i != j &&
          getPort(listenTableData[i].listeningAddress.value) ==
            getPort(listenTableData[j].listeningAddress.value)
        ) {
          listenTableData[i].listeningAddress.isWarn = true;
          listenTableData[i].listeningAddress.warnLabel = vm.$t(
            "WarningSamePortExist"
          );
          listenTableData[j].listeningAddress.isWarn = true;
          listenTableData[j].listeningAddress.warnLabel = vm.$t(
            "WarningSamePortExist"
          );
          success = false;
        }
      }
    }
  }
  return success;
}

function getPort(value) {
  return value.indexOf(":") == -1
    ? ""
    : value.split(":")[value.split(":").length - 1];
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneIntercom",
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
  vm.$axios.get("api/phoneMulticast/info").then((response) => {
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
  let mulitcastListTableData = [];
  let listenListTableData = [];
  for (let i = 1; i <= 3; i++) {
    let mulitcastData = {
      key: i - 1,
      mluticastGroup: vm.$t("MulticastGroup") + " " + i,
      multicastAddress: {
        value: vm.apiData.configData["Config.Multicast.GROUP" + i + ".IP"],
        isWarn: false,
        warnLabel: "",
      },
      enabled: {
        value:
          vm.apiData.configData[
            "Config.Multicast.SELECTEDGROUP.SelectedGroup"
          ] == i,
        disabled: false,
      },
    };
    mulitcastListTableData.push(mulitcastData);

    let listenData = {
      key: i - 1,
      listeningAddress: {
        value:
          vm.apiData.configData["Config.Multicast.LISTEN" + (i - 1) + ".IP"],
        isWarn: false,
        warnLabel: "",
      },
      label: {
        value:
          vm.apiData.configData["Config.Multicast.LISTEN" + (i - 1) + ".Label"],
        isWarn: false,
        warnLabel: "",
      },
      listenGroup: vm.$t("ListenGroup") + " " + i,
    };
    listenListTableData.push(listenData);
  }

  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Phone"),
      secondTitle: vm.$t("Multicast"),
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
    contents: [
      {
        key: "mulitcastList",
        title: vm.$t("MulticastList"),
        titleDescription: vm.$t("MulticastListDesc"),
        items: [
          {
            type: "table",
            key: "mulitcastList",
            tableColumns: [
              {
                type: "label",
                title: vm.$t("MulticastGroup"),
                dataIndex: "mluticastGroup",
                scopedSlots: { customRender: "mluticastGroup" },
                align: "center",
                width: "20%",
              },
              {
                type: "input",
                title: vm.$t("MulticastAddress"),
                dataIndex: "multicastAddress",
                scopedSlots: { customRender: "multicastAddress" },
                align: "center",
                width: "50%",
              },
              {
                type: "checkbox",
                title: vm.$t("Enabled"),
                dataIndex: "enabled",
                scopedSlots: { customRender: "enabled" },
                align: "center",
                width: "30%",
              },
            ],
            tableData: mulitcastListTableData,
          },
        ],
      },
      {
        key: "listenList",
        title: vm.$t("ListenList"),
        titleDescription: vm.$t("ListenListDesc"),
        items: [
          {
            type: "table",
            key: "listenList",
            tableColumns: [
              {
                type: "label",
                title: vm.$t("ListenGroup"),
                dataIndex: "listenGroup",
                scopedSlots: { customRender: "listenGroup" },
                align: "center",
                width: "20%",
              },
              {
                type: "input",
                title: vm.$t("ListeningAddress"),
                dataIndex: "listeningAddress",
                scopedSlots: { customRender: "listeningAddress" },
                align: "center",
                width: "50%",
              },
              {
                type: "input",
                title: vm.$t("Label"),
                dataIndex: "label",
                scopedSlots: { customRender: "label" },
                align: "center",
                width: "30%",
              },
            ],
            tableData: listenListTableData,
          },
        ],
      },
    ],
  };
}
</script>