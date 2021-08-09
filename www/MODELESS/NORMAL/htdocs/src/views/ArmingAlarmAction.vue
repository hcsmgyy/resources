<template>
  <CommonPage
    :data="data"
    @onDataChange="onCommonPageDataChange($event)"
  ></CommonPage>
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
      changedCfgData: {},
      submitCfgData: {},
      apiData: {},
      data: {
        getDataSuccess: false,
        isSupportRelayB: 0,
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
  if (event.contentKey == "httpCommand" && event.itemKey == "httpCommand") {
    for (let i = 0; i < event.newVal.length; i++) {
      vm.changedCfgData["Config.DoorSetting.WEBRELAY.IOTriggeredCommand" + i] =
        event.newVal[i].command.addOnBefore + event.newVal[i].command.value;
      vm.changedCfgData["Config.DoorSetting.WEBRELAY.CommandSendEnable" + i] =
        event.newVal[i].enable.value;
    }
  } else if (event.contentKey == "receiverOfSIPSetting") {
    if (event.itemKey == "msgTable") {
      for (let i = 0; i < event.newVal.length; i++) {
        vm.changedCfgData[
          "Config.HomeSecurity0.Alarm0" + (i + 1) + ".SmsMessage"
        ] = event.newVal[i].message.value;
        vm.changedCfgData[
          "Config.HomeSecurity0.Alarm0" + (i + 1) + ".SendMessage"
        ] = event.newVal[i].enable.value;
      }
    } else {
      vm.changedCfgData[event.itemKey] = event.newVal;
    }
  } else if (event.contentKey == "callSetting") {
    if (event.itemKey == "callTable") {
      for (let i = 0; i < event.newVal.length; i++) {
        vm.changedCfgData[
          "Config.HomeSecurity0.Alarm0" + (i + 1) + ".SendCall"
        ] = event.newVal[i].callEnable.value;
        vm.changedCfgData[
          "Config.HomeSecurity0.Alarm0" + (i + 1) + ".AlarmSiren"
        ] = event.newVal[i].alarmSiren.value;
      }
    } else {
      vm.changedCfgData[event.itemKey] = event.newVal;
    }
  } else if (event.contentKey == "localRelaySetting" && event.itemKey == "localRelayTable") {
    for (let i = 0; i < event.newVal.length; i++) {
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".LocalRelay1"
      ] = event.newVal[i].localRelay1Enable.value;
      vm.changedCfgData[
        "Config.HomeSecurity0.Alarm0" + (i + 1) + ".LocalRelay2"
      ] = event.newVal[i].localRelay2Enable.value;
    }
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "armingAlarmAction",
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
  vm.$axios.get("api/armingAlarmAction/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    vm.isSupportRelayB = vm.apiData.data.isSupportRelayB;
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
      secondTitle: vm.$t("AlarmAction"),
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
  vm.data.contents.push(createHttpCommandSettingContent(vm));
  vm.data.contents.push(createReceiverOfSIPSettingContent(vm));
  vm.data.contents.push(createCallSettingContent(vm));
  // vm.data.contents.push(createLocalRelayContent(vm));
}

function createLocalRelayContent(vm) {
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
    let item = {
      key: i,
      index: vm.$t("Zone") + (i + 1),
      localRelay1Enable: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".LocalRelay1"
          ],
        isWarn: false,
      },
      localRelay2Enable: {
        value: vm.isSupportRelayB == 0 ? "" :
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".LocalRelay2"
          ],
        isWarn: false,
      },
    };
    tableData.push(item);
  }
  let content = {
    key: "localRelaySetting",
    title: vm.$t("LocalRelaySetting"),
    titleDescription: vm.$t("AlarmLocalRelaySettingDesc"),
    items: [
      {
        type: "table",
        key: "localRelayTable",
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
            type: "select",
            title: vm.$t("LocalRelay1Label"),
            dataIndex: "localRelay1Enable",
            scopedSlots: { customRender: "localRelay1Enable" },
            align: "center",
            width: "40%",
            selectItems: [
              { key: 0, label: vm.$t("Disabled") },
              { key: 1, label: vm.$t("Enabled") },
            ],
          },
          {
            type: "select",
            isHidden: vm.isSupportRelayB == 0,
            title: vm.$t("LocalRelay2Label"),
            dataIndex: "localRelay2Enable",
            scopedSlots: { customRender: "localRelay2Enable" },
            align: "center",
            width: "40%",
            selectItems: [
              { key: 0, label: vm.$t("Disabled") },
              { key: 1, label: vm.$t("Enabled") },
            ],
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createCallSettingContent(vm) {
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
    let item = {
      key: i,
      index: vm.$t("Zone") + (i + 1),
      callEnable: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".SendCall"
          ],
        isWarn: false,
      },
      alarmSiren: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".AlarmSiren"
          ],
        isWarn: false,
      },
    };
    tableData.push(item);
  }
  let content = {
    key: "callSetting",
    title: vm.$t("AlarmCallSetting"),
    titleDescription: vm.$t("CallSettingDesc"),
    items: [
      {
        title: vm.$t("CallNumber"),
        type: "input",
        key: "Config.HomeSecurity0.AlarmEmergency.CallAddress",
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.AlarmEmergency.CallAddress"
          ],
        showDescription: false,
      },
      {
        type: "table",
        key: "callTable",
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
            type: "select",
            title: vm.$t("MakeCallEnable"),
            dataIndex: "callEnable",
            scopedSlots: { customRender: "callEnable" },
            align: "center",
            width: "40%",
            selectItems: [
              { key: 0, label: vm.$t("Disabled") },
              { key: 1, label: vm.$t("Enabled") },
            ],
          },
          {
            type: "select",
            title: vm.$t("AlarmSiren"),
            dataIndex: "alarmSiren",
            scopedSlots: { customRender: "alarmSiren" },
            align: "center",
            width: "40%",
            selectItems: [
              { key: 0, label: vm.$t("Disabled") },
              { key: 1, label: vm.$t("Enabled") },
            ],
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createReceiverOfSIPSettingContent(vm) {
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
    let item = {
      key: i,
      index: vm.$t("Zone") + (i + 1),
      message: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".SmsMessage"
          ],
        isWarn: false,
      },
      enable: {
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.Alarm0" + (i + 1) + ".SendMessage"
          ],
        isWarn: false,
      },
    };
    tableData.push(item);
  }
  let content = {
    key: "receiverOfSIPSetting",
    title: vm.$t("ReceiverAccountSetting"),
    titleDescription: vm.$t("ReceiverSIPSettingDesc"),
    items: [
      {
        title: vm.$t("SIPAccount"),
        type: "input",
        key: "Config.HomeSecurity0.AlarmEmergency.MessageAddress",
        value:
          vm.apiData.configData[
            "Config.HomeSecurity0.AlarmEmergency.MessageAddress"
          ],
        showDescription: false,
      },
      {
        type: "table",
        key: "msgTable",
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
            title: vm.$t("SIPMessage"),
            dataIndex: "message",
            scopedSlots: { customRender: "message" },
            align: "center",
            width: "60%",
            maxLength: 1024,
          },
          {
            type: "select",
            title: vm.$t("SendSipMessage"),
            dataIndex: "enable",
            scopedSlots: { customRender: "enable" },
            align: "center",
            width: "20%",
            selectItems: [
              { key: 0, label: vm.$t("Disabled") },
              { key: 1, label: vm.$t("Enabled") },
            ],
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createHttpCommandSettingContent(vm) {
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.zoneNumber; i++) {
    let item = {
      key: i,
      index: vm.$t("Zone") + (i + 1),
      command: {
        value: vm.apiData.configData[
          "Config.DoorSetting.WEBRELAY.IOTriggeredCommand" + i
        ]
          .replace("http://", "")
          .replace("https://", ""),
        addOnBefore: vm.apiData.configData[
           "Config.DoorSetting.WEBRELAY.IOTriggeredCommand" + i
        ].startsWith("http://")
          ? "http://"
          : vm.apiData.configData[
             "Config.DoorSetting.WEBRELAY.IOTriggeredCommand" + i
            ].startsWith("https://")
          ? "https://"
          : "http://",
        isWarn: false,
      },
      enable: {
        value:
          vm.apiData.configData[
            "Config.DoorSetting.WEBRELAY.CommandSendEnable" + i
          ],
        isWarn: false,
      },
    };
    tableData.push(item);
  }
  let content = {
    key: "httpCommand",
    title: vm.$t("AlarmHttpCommandSetting"),
    titleDescription: vm.$t("HTTPCommondSettingDesc"),
    items: [
      {
        type: "table",
        key: "httpCommand",
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
            title: vm.$t("HttpCommand"),
            dataIndex: "command",
            scopedSlots: { customRender: "command" },
            align: "center",
            width: "60%",
            maxLength: 249,
            addOnBeforeItems: [
              { key: "http://", label: "http://" },
              { key: "https://", label: "https://" },
            ],
          },
          {
            type: "select",
            title: vm.$t("SendHttp"),
            dataIndex: "enable",
            scopedSlots: { customRender: "enable" },
            align: "center",
            width: "20%",
            selectItems: [
              { key: 0, label: vm.$t("Disabled") },
              { key: 1, label: vm.$t("Enabled") },
            ],
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}
</script>