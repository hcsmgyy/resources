<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { showRequestSuccess, deepClone } from "@/js/common.js";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      delayItems: [
        { key: 0, label: "0" + this.$t("SecondAbbr") },
        { key: 30, label: "30" + this.$t("SecondAbbr") },
        { key: 60, label: "60" + this.$t("SecondAbbr") },
        { key: 90, label: "90" + this.$t("SecondAbbr") },
      ],
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
    },
  },
};

function setChangedData(vm, event) {
  if (event.contentKey == "armingMode") {
    vm.changedCfgData[event.itemKey] = event.newVal;
  } else if (event.contentKey == "indoor") {
    for (let i = 0; i < event.newVal.length; i++) {
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Home_Status"
      ] = event.newVal[i].status.value ? 1 : 0;
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Home_DefenceDelay"
      ] = event.newVal[i].defenceDelay.value;
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Home_AlarmDelay"
      ] = event.newVal[i].alarmDelay.value;
    }
  } else if (event.contentKey == "night") {
    for (let i = 0; i < event.newVal.length; i++) {
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Night_Status"
      ] = event.newVal[i].status.value ? 1 : 0;
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Night_DefenceDelay"
      ] = event.newVal[i].defenceDelay.value;
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Night_AlarmDelay"
      ] = event.newVal[i].alarmDelay.value;
    }
  } else if (event.contentKey == "away") {
    for (let i = 0; i < event.newVal.length; i++) {
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Leaving_Status"
      ] = event.newVal[i].status.value ? 1 : 0;
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Leaving_DefenceDelay"
      ] = event.newVal[i].defenceDelay.value;
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Leaving_AlarmDelay"
      ] = event.newVal[i].alarmDelay.value;
    }
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "armingMode",
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
  vm.$axios.get("api/armingMode/info").then((response) => {
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
      firstTitle: vm.$t("Arming"),
      secondTitle: vm.$t("ArmingMode"),
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
  vm.data.contents.push(createArmingModeContent(vm));
  vm.data.contents.push(createIndoorContent(vm));
  vm.data.contents.push(createNightContent(vm));
  vm.data.contents.push(createAwayContent(vm));
}

function createAwayContent(vm) {
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
    let item = {
      key: i,
      index: vm.$t("Zone") + (i + 1),
      location: getOptionsByType(
        vm,
        vm.apiData.configData[
          "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Place"
        ]
      ),
      type: getOptionsByType(
        vm,
        vm.apiData.configData["Config.HomeSecurity0.Alarm0" + (i + 1) + ".Type"]
      ),
      defenceDelay: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Leaving_DefenceDelay"
          ],
        isWarn: false,
      },
      alarmDelay: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Leaving_AlarmDelay"
          ],
        isWarn: false,
      },
      status: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Leaving_Status"
          ] == 1,
        disabled:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Status"
          ] == 0,
      },
    };
    tableData.push(item);
  }
  let content = {
    key: "away",
    title: vm.$t("Away"),
    titleDescription: vm.$t("Away"),
    items: [
      {
        type: "table",
        key: "awayTable",
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
            type: "label",
            title: vm.$t("ZoneLocation"),
            dataIndex: "location",
            scopedSlots: { customRender: "clocationntent" },
            align: "center",
            width: "18%",
          },
          {
            type: "label",
            title: vm.$t("ZoomType"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            align: "center",
            width: "18%",
          },
          {
            type: "select",
            title: vm.$t("DefenceDelay"),
            dataIndex: "defenceDelay",
            scopedSlots: { customRender: "defenceDelay" },
            align: "center",
            width: "18%",
            selectItems: vm.delayItems,
          },
          {
            type: "select",
            title: vm.$t("AlarmDelay"),
            dataIndex: "alarmDelay",
            scopedSlots: { customRender: "alarmDelay" },
            align: "center",
            width: "18%",
            selectItems: vm.delayItems,
          },
          {
            type: "checkbox",
            title: vm.$t("Status"),
            dataIndex: "status",
            scopedSlots: { customRender: "status" },
            align: "center",
            width: "18%",
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createNightContent(vm) {
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
    let item = {
      key: i,
      index: vm.$t("Zone") + (i + 1),
      location: getOptionsByType(
        vm,
        vm.apiData.configData[
          "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Place"
        ]
      ),
      type: getOptionsByType(
        vm,
        vm.apiData.configData["Config.HomeSecurity0.Alarm0" + (i + 1) + ".Type"]
      ),
      defenceDelay: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Night_DefenceDelay"
          ],
        isWarn: false,
      },
      alarmDelay: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Night_AlarmDelay"
          ],
        isWarn: false,
      },
      status: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Night_Status"
          ] == 1,
        disabled:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Status"
          ] == 0,
      },
    };
    tableData.push(item);
  }
  let content = {
    key: "night",
    title: vm.$t("Night"),
    titleDescription: vm.$t("Night"),
    items: [
      {
        type: "table",
        key: "nightTable",
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
            type: "label",
            title: vm.$t("ZoneLocation"),
            dataIndex: "location",
            scopedSlots: { customRender: "clocationntent" },
            align: "center",
            width: "18%",
          },
          {
            type: "label",
            title: vm.$t("ZoomType"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            align: "center",
            width: "18%",
          },
          {
            type: "select",
            title: vm.$t("DefenceDelay"),
            dataIndex: "defenceDelay",
            scopedSlots: { customRender: "defenceDelay" },
            align: "center",
            width: "18%",
            selectItems: vm.delayItems,
          },
          {
            type: "select",
            title: vm.$t("AlarmDelay"),
            dataIndex: "alarmDelay",
            scopedSlots: { customRender: "alarmDelay" },
            align: "center",
            width: "18%",
            selectItems: vm.delayItems,
          },
          {
            type: "checkbox",
            title: vm.$t("Status"),
            dataIndex: "status",
            scopedSlots: { customRender: "status" },
            align: "center",
            width: "18%",
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createIndoorContent(vm) {
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
    let item = {
      key: i,
      index: vm.$t("Zone") + (i + 1),
      location: getOptionsByType(
        vm,
        vm.apiData.configData[
          "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Place"
        ]
      ),
      type: getOptionsByType(
        vm,
        vm.apiData.configData["Config.HomeSecurity0.Alarm0" + (i + 1) + ".Type"]
      ),
      defenceDelay: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Home_DefenceDelay"
          ],
        isWarn: false,
      },
      alarmDelay: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Home_AlarmDelay"
          ],
        isWarn: false,
      },
      status: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Home_Status"
          ] == 1,
        disabled:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".Status"
          ] == 0,
      },
    };
    tableData.push(item);
  }
  let content = {
    key: "indoor",
    title: vm.$t("Indoor"),
    titleDescription: vm.$t("Indoor"),
    items: [
      {
        type: "table",
        key: "indoorTable",
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
            type: "label",
            title: vm.$t("ZoneLocation"),
            dataIndex: "location",
            scopedSlots: { customRender: "clocationntent" },
            align: "center",
            width: "18%",
          },
          {
            type: "label",
            title: vm.$t("ZoomType"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            align: "center",
            width: "18%",
          },
          {
            type: "select",
            title: vm.$t("DefenceDelay"),
            dataIndex: "defenceDelay",
            scopedSlots: { customRender: "defenceDelay" },
            align: "center",
            width: "18%",
            selectItems: vm.delayItems,
          },
          {
            type: "select",
            title: vm.$t("AlarmDelay"),
            dataIndex: "alarmDelay",
            scopedSlots: { customRender: "alarmDelay" },
            align: "center",
            width: "18%",
            selectItems: vm.delayItems,
          },
          {
            type: "checkbox",
            title: vm.$t("Status"),
            dataIndex: "status",
            scopedSlots: { customRender: "status" },
            align: "center",
            width: "18%",
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createArmingModeContent(vm) {
  let content = {
    key: "armingMode",
    title: vm.$t("ArmingMode"),
    titleDescription: vm.$t("ArmingModeDesc"),
    items: [
      {
        title: vm.$t("Mode"),
        type: "select",
        key: "Config.Settings.ARMINGMODE.Mode",
        value: vm.apiData.configData["Config.Settings.ARMINGMODE.Mode"],
        selectItems: [
          { key: 0, label: vm.$t("Disarm") },
          { key: 1, label: vm.$t("Indoor") },
          { key: 2, label: vm.$t("Night") },
          { key: 3, label: vm.$t("Away") },
        ],
        showDescription: false,
      },
    ],
  };
  return content;
}

function getOptionsByType(vm, tmptype) {
  switch (tmptype) {
    case "Gate":
      return vm.$t("Gate");
    case "Door":
      return vm.$t("Door");
    case "Bedroom":
      return vm.$t("Bedroom");
    case "Guest room":
      return vm.$t("Guestroom");
    case "Guestroom":
      return vm.$t("Guestroom");
    case "Hall":
      return vm.$t("Hall");
    case "Window":
      return vm.$t("Window");
    case "Balcony":
      return vm.$t("Balcony");
    case "Kitchen":
      return vm.$t("Kitchen");
    case "Study":
      return vm.$t("Study");
    case "Bathroom":
      return vm.$t("Bathroom");
    case "Infrared":
      return vm.$t("Infrared");
    case "Drmagnet":
      return vm.$t("Drmagnet");
    case "Smoke":
      return vm.$t("Smoke");
    case "Gas":
      return vm.$t("Gas");
    case "Urgency":
      return vm.$t("Urgency");
    default:
      return vm.$t("NA");
  }
}
</script>