<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { showRequestSuccess, deepClone } from "@/js/common.js";
import { getIndexByKey, getItemByKey } from "../js/common";

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
      setChangedData(this, event);
      handlerPageChanged(this);
    },
  },
};

function handlerPageChanged(vm) {
  if (vm.changedCfgData["Config.HomeSecurity0.Customized.Status"] == 1) {
    for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
      getItemByKey(vm.data, "customizedAlarm", "zoneAlarmContent").tableData[
        i
      ].content.disabled =
        vm.changedCfgData[
          "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Status"
        ] <= 0;
    }
  } else {
    for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
      getItemByKey(vm.data, "customizedAlarm", "zoneAlarmContent").tableData[
        i
      ].content.disabled = true;
    }
  }
}

function setChangedData(vm, event) {
  if (event.contentKey == "rtspdSetting") {
    vm.changedCfgData[event.itemKey] = event.newVal;
  } else if (
    event.contentKey == "zoneSetting" &&
    event.itemKey == "zoneSetting"
  ) {
    for (let i = 0; i < event.newVal.length; i++) {
      vm.changedCfgData["Config.HomeSecurity0.Alarm0" + (i + 1) + ".Status"] =
        event.newVal[i].status.value;
      vm.changedCfgData["Config.HomeSecurity0.Alarm0" + (i + 1) + ".Place"] =
        event.newVal[i].location.value;
      vm.changedCfgData["Config.HomeSecurity0.Alarm0" + (i + 1) + ".Type"] =
        event.newVal[i].type.value;
      vm.changedCfgData["Config.HomeSecurity0.Alarm0" + (i + 1) + ".Trigger"] =
        event.newVal[i].triggerMode.value;
    }
  } else if (event.contentKey == "customizedAlarm") {
    if (event.itemKey == "zoneAlarmContent") {
      for (let i = 0; i < event.newVal.length; i++) {
        vm.changedCfgData[
          "Config.HomeSecurity0.Alarm0" + (i + 1) + ".CustomizedContent"
        ] = event.newVal[i].content.value;
      }
    } else {
      vm.changedCfgData[event.itemKey] = event.newVal;
    }
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "armingZoneSetting",
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
  vm.$axios.get("api/armingZoneSetting/info").then((response) => {
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

function checkCommitData(vm) {
  return checkAlarmContent(vm);
}

function checkAlarmContent(vm) {
  let success = true;
  for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
    if (
      vm.changedCfgData["Config.HomeSecurity0.Customized.Status"] == 1 &&
      vm.changedCfgData["Config.HomeSecurity0.Alarm0" + (i + 1) + ".Status"] >
        0 &&
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".CustomizedContent"
      ] == ""
    ) {
      getItemByKey(vm.data, "customizedAlarm", "zoneAlarmContent").tableData[
        i
      ].content.isWarn = true;
      success = false;
    }
  }
  return success;
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Arming"),
      secondTitle: vm.$t("ZoneSetting"),
    },
    onSubmit: function () {
      if (!checkCommitData(vm)) {
        return;
      }
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
  vm.data.contents.push(createZoneSettingContent(vm));
  vm.data.contents.push(createCustomizedAlarmContent(vm));
}

function createCustomizedAlarmContent(vm) {

  let tableData = [];
  for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
    let item = {
      key: i,
      index: vm.$t("Zone") + (i + 1),
      content: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".CustomizedContent"
          ],
        isWarn: false,
        disabled: true,
        warnLabel: vm.$t("ValueEmptyWarning"),
      },
    };
    if(vm.apiData.configData["Config.HomeSecurity0.Customized.Status"] == 1){
      if(vm.apiData.configData["Config.HomeSecurity0.Alarm0" + (i + 1) + ".Status"] == 1){
        item.content.disabled = false;
      }
    }
    tableData.push(item);
  }
  let content = {
    key: "customizedAlarm",
    title: vm.$t("CustomizedAlarm"),
    titleDescription: vm.$t("CustomizedAlarmDesc"),
    items: [
      {
        title: vm.$t("CustomizedAlarmEnabled"),
        type: "checkbox",
        key: "Config.HomeSecurity0.Customized.Status",
        value: vm.apiData.configData["Config.HomeSecurity0.Customized.Status"],
        description: vm.$t("CustomizedAlarmEnableDesc"),
      },
      {
        type: "table",
        key: "zoneAlarmContent",
        tableColumns: [
          {
            type: "label",
            title: vm.$t("Zone"),
            dataIndex: "index",
            scopedSlots: { customRender: "index" },
            align: "center",
            width: "20%",
          },
          {
            type: "input",
            title: vm.$t("AlarmContent"),
            dataIndex: "content",
            scopedSlots: { customRender: "content" },
            align: "center",
            width: "80%",
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createZoneSettingContent(vm) {
  //table data
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
    let item = {
      key: i,
      index: vm.$t("Zone") + (i + 1),
      location: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Place"
          ],
        isWarn: false,
      },
      type: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Type"
          ],
        isWarn: false,
      },
      triggerMode: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Trigger"
          ],
        isWarn: false,
        disabled: false,
      },
      status: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Status"
          ],
        isWarn: false,
        disabled: false,
      },
    };
    tableData.push(item);
  }
  //status items
  let statusItem = [
    { key: 0, label: vm.$t("Disabled") },
    { key: 1, label: vm.$t("Enabled") },
    { key: 2, label: vm.$t("24H") },
  ];
  //trigger mode items
  let modeItems = [
    { key: 1, label: vm.$t("NC") },
    { key: 2, label: vm.$t("NO") },
  ];
  //type items
  let typeItems = [
    { key: "Infrared", label: vm.$t("Infrared") },
    { key: "Drmagnet", label: vm.$t("Drmagnet") },
    { key: "Smoke", label: vm.$t("Smoke") },
    { key: "Gas", label: vm.$t("Gas") },
    { key: "Urgency", label: vm.$t("Urgency") },
  ];
  //location items
  let locationItems = [
    { key: "Gate", label: vm.$t("Gate") },
    { key: "Door", label: vm.$t("Door") },
    { key: "Bedroom", label: vm.$t("Bedroom") },
    { key: "Guest room", label: vm.$t("Guestroom") },
    { key: "Hall", label: vm.$t("Hall") },
    { key: "Window", label: vm.$t("Window") },
    { key: "Balcony", label: vm.$t("Balcony") },
    { key: "Kitchen", label: vm.$t("Kitchen") },
    { key: "Study", label: vm.$t("Study") },
    { key: "Bathroom", label: vm.$t("Bathroom") },
  ];
  //content
  let content = {
    key: "zoneSetting",
    title: vm.$t("ZoneSetting"),
    titleDescription: vm.$t("ZoneSettingDesc"),
    items: [
      {
        type: "table",
        key: "zoneSetting",
        tableColumns: [
          {
            type: "label",
            title: vm.$t("Zone"),
            dataIndex: "index",
            scopedSlots: { customRender: "index" },
            align: "center",
            width: "10%",
          },
          {
            type: "select",
            title: vm.$t("ZoneLocation"),
            dataIndex: "location",
            scopedSlots: { customRender: "location" },
            align: "center",
            selectItems: locationItems,
            width: "22%",
          },
          {
            type: "select",
            title: vm.$t("ZoomType"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            align: "center",
            selectItems: typeItems,
            width: "22%",
          },
          {
            type: "select",
            title: vm.$t("TriggerMode"),
            dataIndex: "triggerMode",
            scopedSlots: { customRender: "triggerMode" },
            align: "center",
            selectItems: modeItems,
            width: "22%",
          },
          {
            type: "select",
            title: vm.$t("Status"),
            dataIndex: "status",
            scopedSlots: { customRender: "status" },
            align: "center",
            selectItems: statusItem,
            width: "22%",
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}
</script>