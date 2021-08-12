<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  deepClone,
  notContainInvalid,
  getItemByKey,
  checkIpAddr,
} from "@/js/common.js";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      statusItems: [
        { key: 0, label: this.$t("Disabled") },
        { key: 1, label: this.$t("Enabled") },
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
      //界面变化
      handlerPageChanged(this);
    },
  },
};

let showDelAllBtn = false;

function setChangedData(vm, event) {
  if (
    event.contentKey == "relaySetting" ||
    event.contentKey == "openRelayViaHttp" ||
    event.contentKey == "remoteControl" ||
    event.contentKey == "webRelay"
  ) {
    vm.changedCfgData[event.itemKey] = event.newVal;
  } else if (
    event.contentKey == "softkeyInTalking" &&
    event.itemKey == "softkeyInTalking"
  ) {
    for (let i = 0; i < event.newVal.length; i++) {
      vm.changedCfgData["Config.DoorSetting.RELAY.TalkingStatus" + (i + 1)] =
        event.newVal[i].status.value;
      vm.changedCfgData[
        "Config.DoorSetting.RELAY.TalkingColDisplayName" + (i + 1)
      ] = event.newVal[i].displayName.value;
      vm.changedCfgData["Config.DoorSetting.RELAY.TalkingRelayType" + (i + 1)] =
        event.newVal[i].type.value;
    }
  } else if (
    event.contentKey == "softkeyInHomeOrMore" &&
    event.itemKey == "softkeyInHomeOrMore"
  ) {
    vm.changedCfgData["Config.DoorSetting.RELAY.IdleStatus"] =
      event.newVal[0].status.value;
    vm.changedCfgData["Config.DoorSetting.RELAY.IdleDisplayName"] =
      event.newVal[0].displayName.value;
    vm.changedCfgData["Config.DoorSetting.RELAY.IdleRelayType"] =
      event.newVal[0].type.value;
  } else if (
    event.contentKey == "softkeyInCallPreview" &&
    event.itemKey == "softkeyInCallPreview"
  ) {
    vm.changedCfgData["Config.DoorSetting.RELAY.IncomingStatus"] =
      event.newVal[0].status.value;
    vm.changedCfgData["Config.DoorSetting.RELAY.IncomingDisplayName"] =
      event.newVal[0].displayName.value;
    vm.changedCfgData["Config.DoorSetting.RELAY.IncomingRelayType"] =
      event.newVal[0].type.value;
  } else if (
    event.contentKey == "softkeyInMonitor" &&
    event.itemKey == "softkeyInMonitor"
  ) {
    vm.changedCfgData["Config.DoorSetting.RELAY.MonitorStatus"] =
      event.newVal[0].status.value;
    vm.changedCfgData["Config.DoorSetting.RELAY.MonitorDisplayName"] =
      event.newVal[0].displayName.value;
    vm.changedCfgData["Config.DoorSetting.RELAY.MonitorRelayType"] =
      event.newVal[0].type.value;
  } else if (
    event.contentKey == "remoteRelayByHttp" &&
    event.itemKey == "remoteRelayByHttp" &&
    event.tableOperateType != "selection"
  ) {
    for (let i = 0; i < event.newVal.length; i++) {
      vm.changedCfgData["Config.DoorSetting.REMOTERELAY.RemoteIP" + i] =
        event.newVal[i].remoteIp.value;
      vm.changedCfgData["Config.DoorSetting.REMOTERELAY.RemoteURL" + i] =
        event.newVal[i].remoteAddress.value;
      vm.changedCfgData["Config.DoorSetting.REMOTERELAY.RemoteUser" + i] =
        event.newVal[i].username.value;
      vm.changedCfgData["Config.DoorSetting.REMOTERELAY.RemotePasswd" + i] =
        event.newVal[i].password.value;
      let doorNum = "";
      for (let j = 0; j < event.newVal[i].doorNum.value.length; j++) {
        doorNum += event.newVal[i].doorNum.value[j];
        if (j != event.newVal[i].doorNum.value.length - 1) {
          doorNum += ",";
        }
      }
      vm.changedCfgData[
        "Config.DoorSetting.REMOTERELAY.RemoteDoorNum" + i
      ] = doorNum;
    }
  } else if (
    event.contentKey == "webRelayActionSetting" &&
    event.itemKey == "webRelayActionSetting"
  ) {
    for (let i = 0; i < event.newVal.length; i++) {
      vm.changedCfgData["Config.DoorSetting.WEBRELAY.WebRelayIP" + i] =
        event.newVal[i].ip.value;
      vm.changedCfgData["Config.DoorSetting.WEBRELAY.WebRelaySIP" + i] =
        event.newVal[i].sip.value;
      vm.changedCfgData["Config.DoorSetting.WEBRELAY.WebAction" + i] =
        event.newVal[i].action.value;
    }
  }

  if(event.itemKey == "remoteRelayByHttp"){
    let selectRow = getItemByKey(
      vm.data,
      "remoteRelayByHttp",
      "remoteRelayByHttp"
    ).selectedRowKeys;
    if(selectRow.length > 0){
      getItemByKey(
        vm.data,
        "remoteRelayByHttp",
        "remoteRelayByHttpDel"
      ).delDisabled = false;
    } else{
      getItemByKey(
        vm.data,
        "remoteRelayByHttp",
        "remoteRelayByHttpDel"
      ).delDisabled = true;
    }
  }
}

function handlerPageChanged(vm) {
  if (vm.changedCfgData["Config.DoorSetting.RELAY.RelayOnWeb"] == 0) {
    getItemByKey(
      vm.data,
      "openRelayViaHttp",
      "Config.DoorSetting.RELAY.RelayOnWebUser"
    ).disabled = true;
    getItemByKey(
      vm.data,
      "openRelayViaHttp",
      "Config.DoorSetting.RELAY.RelayOnWebPwd"
    ).disabled = true;
  } else {
    getItemByKey(
      vm.data,
      "openRelayViaHttp",
      "Config.DoorSetting.RELAY.RelayOnWebUser"
    ).disabled = false;
    getItemByKey(
      vm.data,
      "openRelayViaHttp",
      "Config.DoorSetting.RELAY.RelayOnWebPwd"
    ).disabled = false;
  }
  getItemByKey(
    vm.data,
    "relaySetting",
    "Config.DoorSetting.RELAY.DTMFCode2"
  ).isHide = vm.apiData.data.supportThreeDtmf != 1;
  getItemByKey(
    vm.data,
    "relaySetting",
    "Config.DoorSetting.RELAY.DTMFCode3"
  ).isHide = vm.apiData.data.supportThreeDtmf != 1;

  if(vm.changedCfgData["Config.DoorSetting.RELAY.RemoteControl"] == 0){
    getItemByKey(
      vm.data,
      "relaySetting",
      "Config.DoorSetting.RELAY.LocalDTMF"
    ).disabled = true;
  } else{
    getItemByKey(
      vm.data,
      "relaySetting",
      "Config.DoorSetting.RELAY.LocalDTMF"
    ).disabled = false;
  }
  if(vm.changedCfgData["Config.DoorSetting.RELAY.RemoteControl2"] == 0){
    getItemByKey(
      vm.data,
      "relaySetting",
      "Config.DoorSetting.RELAY.LocalDTMF2"
    ).disabled = true;
  } else{
    getItemByKey(
      vm.data,
      "relaySetting",
      "Config.DoorSetting.RELAY.LocalDTMF2"
    ).disabled = false;
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneRelay",
    action: "set",
    configData: vm.submitCfgData,
  };
  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      showRequestSuccess(vm);
    }
    vm.data.submitLoading = false;
    getData(vm);
  });
}

function getData(vm) {
  vm.$axios.get("api/phoneRelay/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    createPageData(vm);
    handlerPageChanged(vm);
    if(showDelAllBtn){
      getItemByKey(
        vm.data,
        "remoteRelayByHttp",
        "remoteRelayByHttpDel"
      ).delAllDisabled = false;
    } else{
      getItemByKey(
        vm.data,
        "remoteRelayByHttp",
        "remoteRelayByHttpDel"
      ).delAllDisabled = true;
    }
    showDelAllBtn = false;
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
  return (
    checkRemoteControl(vm) &&
    checkRemoteRelayHttp(vm) &&
    checkWebRelay(vm) &&
    checkWebRelayActionSetting(vm)
  );
}

function checkWebRelayActionSetting(vm) {
  let success = true;
  for (let i = 0; i < vm.apiData.data.webRelayActionMaxNum; i++) {
    let tableData = getItemByKey(
      vm.data,
      "webRelayActionSetting",
      "webRelayActionSetting"
    ).tableData;
    tableData[i].ip.isWarn = false;
    tableData[i].sip.isWarn = false;
    tableData[i].action.isWarn = false;
    if (
      vm.changedCfgData["Config.DoorSetting.WEBRELAY.WebRelayIP" + i] == "" &&
      vm.changedCfgData["Config.DoorSetting.WEBRELAY.WebRelaySIP" + i] == "" &&
      vm.changedCfgData["Config.DoorSetting.WEBRELAY.WebAction" + i] != ""
    ) {
      tableData[i].ip.isWarn = true;
      tableData[i].sip.isWarn = true;
      success = false;
    }
    if (
      (vm.changedCfgData["Config.DoorSetting.WEBRELAY.WebRelayIP" + i] != "" ||
        vm.changedCfgData["Config.DoorSetting.WEBRELAY.WebRelaySIP" + i] !=
          "") &&
      vm.changedCfgData["Config.DoorSetting.WEBRELAY.WebAction" + i] == ""
    ) {
      tableData[i].action.isWarn = true;
      success = false;
    }
  }
  return success;
}

function checkWebRelay(vm) {
  let success = true;
  if (
    vm.changedCfgData["Config.DoorSetting.WEBRELAY.IpAddress"] != "" &&
    !checkIpAddr(vm.changedCfgData["Config.DoorSetting.WEBRELAY.IpAddress"])
  ) {
    getItemByKey(
      vm.data,
      "webRelay",
      "Config.DoorSetting.WEBRELAY.IpAddress"
    ).isWarn = true;
    success = false;
  }
  return success;
}

function checkRemoteRelayHttp(vm) {
  let success = true;
  for (let i = 0; i < vm.apiData.data.maxRemoteRelayNum; i++) {
    if (
      (vm.changedCfgData["Config.DoorSetting.REMOTERELAY.RemoteURL" + i] !=
        "" ||
        vm.changedCfgData["Config.DoorSetting.REMOTERELAY.RemoteUser" + i] !=
          "") &&
      vm.changedCfgData["Config.DoorSetting.REMOTERELAY.RemoteIP" + i] == ""
    ) {
      let tableData = getItemByKey(
        vm.data,
        "remoteRelayByHttp",
        "remoteRelayByHttp"
      ).tableData;
      tableData[i].remoteIp.isWarn = true;
      success = false;
    }
  }
  return success;
}

function checkRemoteControl(vm) {
  let success = true;
  if (
    !notContainInvalid(
      vm.changedCfgData["Config.Features.REMOTECONTROL.ActionURIAllowIPList"]
    )
  ) {
    getItemByKey(
      vm.data,
      "remoteControl",
      "Config.Features.REMOTECONTROL.ActionURIAllowIPList"
    ).isWarn = true;
    success = false;
  }
  return success;
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Phone"),
      secondTitle: vm.$t("Relay"),
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

  vm.data.contents.push(createRelaySettingContent(vm));
  vm.data.contents.push(createRemoteControlContent(vm));
  vm.data.contents.push(createOpenRelayViaHttpContent(vm));
  vm.data.contents.push(createSoftkeyInTalkingContent(vm));
  vm.data.contents.push(createSoftkeyInHomeOrMoreContent(vm));
  vm.data.contents.push(createSoftkeyInMonitorContent(vm));
  vm.data.contents.push(createSoftkeyInCallPreviewContent(vm));
  vm.data.contents.push(createRemoteRelayByHttpContent(vm));
  vm.data.contents.push(createWebRelayContent(vm));
  vm.data.contents.push(createWebRelayActionSettingContent(vm));
}

function createWebRelayActionSettingContent(vm) {
  //table data
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.webRelayActionMaxNum; i++) {
    let item = {
      key: i,
      actionId: vm.$t("WebRelayColId") + " " + (i + 1),
      ip: {
        value:
          vm.apiData.configData["Config.DoorSetting.WEBRELAY.WebRelayIP" + i],
        isWarn: false,
        warnLabel: vm.$t("ValueEmptyWarning"),
      },
      sip: {
        value:
          vm.apiData.configData["Config.DoorSetting.WEBRELAY.WebRelaySIP" + i],
        isWarn: false,
        warnLabel: vm.$t("ValueEmptyWarning"),
      },
      action: {
        value:
          vm.apiData.configData["Config.DoorSetting.WEBRELAY.WebAction" + i],
        isWarn: false,
        warnLabel: vm.$t("ValueEmptyWarning"),
      },
    };
    tableData.push(item);
  }
  //content
  let content = {
    key: "webRelayActionSetting",
    title: vm.$t("WebRelayActionSetting"),
    titleDescription: vm.$t("WebRelayActionDesc"),
    items: [
      {
        type: "table",
        key: "webRelayActionSetting",
        tableColumns: [
          {
            type: "label",
            title: vm.$t("WebRelayColId"),
            dataIndex: "actionId",
            scopedSlots: { customRender: "actionId" },
            align: "center",
            selectItems: vm.statusItems,
            width: "10%",
          },
          {
            type: "input",
            title: vm.$t("IP"),
            dataIndex: "ip",
            scopedSlots: { customRender: "ip" },
            align: "center",
            width: "30%",
            maxLength: 32,
          },
          {
            type: "input",
            title: vm.$t("SIP"),
            dataIndex: "sip",
            scopedSlots: { customRender: "sip" },
            align: "center",
            width: "30%",
            maxLength: 32,
          },
          {
            type: "input",
            title: vm.$t("WebRelayColAction"),
            dataIndex: "action",
            scopedSlots: { customRender: "action" },
            align: "center",
            width: "30%",
            maxLength: 127,
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createWebRelayContent(vm) {
  let content = {
    key: "webRelay",
    title: vm.$t("WebRelay"),
    titleDescription: vm.$t("WebRelayDesc"),
    items: [
      {
        title: vm.$t("WebRelayIPAddress"),
        type: "input",
        key: "Config.DoorSetting.WEBRELAY.IpAddress",
        value: vm.apiData.configData["Config.DoorSetting.WEBRELAY.IpAddress"],
        isWarn: false,
        warnLabel: vm.$t("IpFormatError"),
        description: vm.$t("WebRelayIPDesc"),
      },
      {
        title: vm.$t("WebRelayUser"),
        type: "input",
        key: "Config.DoorSetting.WEBRELAY.UserName",
        value: vm.apiData.configData["Config.DoorSetting.WEBRELAY.UserName"],
        description: vm.$t("WebRelayUsernameDesc"),
      },
      {
        title: vm.$t("WebRelayPwd"),
        inputType: "password",
        type: "input",
        key: "Config.DoorSetting.WEBRELAY.Passwd",
        value: vm.apiData.configData["Config.DoorSetting.WEBRELAY.Passwd"],
        description: vm.$t("WebRelayPassDesc"),
      },
    ],
  };
  return content;
}

function createRemoteRelayByHttpContent(vm) {
  //doornum items
  let doorNumItems = [];
  for (let i = 1; i <= 4; i++) {
    let item = {
      key: i,
      label: i,
    };
    doorNumItems.push(item);
  }
  //tabledata
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.maxRemoteRelayNum; i++) {
    let item = {
      key: i,
      index: i + 1,
      remoteIp: {
        value:
          vm.apiData.configData["Config.DoorSetting.REMOTERELAY.RemoteIP" + i],
        isWarn: false,
        warnLabel: vm.$t("ValueEmptyWarning"),
      },
      remoteAddress: {
        value:
          vm.apiData.configData["Config.DoorSetting.REMOTERELAY.RemoteURL" + i],
        isWarn: false,
      },
      username: {
        value:
          vm.apiData.configData[
            "Config.DoorSetting.REMOTERELAY.RemoteUser" + i
          ],
        isWarn: false,
      },
      password: {
        value:
          vm.apiData.configData[
            "Config.DoorSetting.REMOTERELAY.RemotePasswd" + i
          ],
        isWarn: false,
      },
      doorNum: {
        value:
          vm.apiData.configData["Config.DoorSetting.REMOTERELAY.RemoteDoorNum" + i].replace(/(^s*)|(s*$)/g, "").length==0 ? [] : vm.apiData.configData["Config.DoorSetting.REMOTERELAY.RemoteDoorNum" + i].split(","),
        isWarn: false,
      },
    };
    if(item.remoteIp.value != ""){
      showDelAllBtn = true;
    }
    tableData.push(item);
  }

  //content
  let content = {
    key: "remoteRelayByHttp",
    title: vm.$t("RemoteRelaySetting"),
    titleDescription: vm.$t("RemoteRelayByHttpDesc"),
    items: [
      {
        type: "table",
        key: "remoteRelayByHttp",
        showRowSelection: true,
        selectedRowKeys: [],
        getCheckboxPropsDisable: function(record){
          return checkRemoteRelayHttpDisable(record);
        },
        tableColumns: [
          {
            type: "label",
            title: vm.$t("Index"),
            dataIndex: "index",
            scopedSlots: { customRender: "index" },
            align: "center",
            width: "7%",
          },
          {
            type: "input",
            title: vm.$t("RemoteRelayIP"),
            dataIndex: "remoteIp",
            scopedSlots: { customRender: "remoteIp" },
            align: "center",
            width: "18%",
          },
          {
            type: "input",
            title: vm.$t("RemoteRelayURL"),
            dataIndex: "remoteAddress",
            scopedSlots: { customRender: "remoteAddress" },
            align: "center",
            width: "18%",
            maxLength: 255,
          },
          {
            type: "input",
            title: vm.$t("RelayUserName"),
            dataIndex: "username",
            scopedSlots: { customRender: "username" },
            align: "center",
            width: "18%",
          },
          {
            type: "input",
            title: vm.$t("Password"),
            dataIndex: "password",
            scopedSlots: { customRender: "password" },
            align: "center",
            width: "18%",
            inputType: "password",
          },
          {
            type: "select",
            title: vm.$t("DoorNum"),
            dataIndex: "doorNum",
            scopedSlots: { customRender: "doorNum" },
            align: "center",
            width: "18%",
            mode: "multiple",
            selectItems: doorNumItems,
          },
        ],
        tableData: tableData,
      },
      {
        type: "delete-button",
        key: "remoteRelayByHttpDel",
        onDel: function () {
          onDelRelayByHttp(vm);
        },
        onDelAll: function () {
          onDelAllRelayByHttp(vm);
        },
        delLoading: false,
        delAllLoading: false,
        delDisabled: true,
        delAllDisabled: true,
      }
    ],
  };
  return content;
}

function checkRemoteRelayHttpDisable(record){
  if(record.remoteIp.value === ""){
    var object = {disabled:true};
    record.props = object;
  }
  return record;
}

function onDelRelayByHttp(vm){
  let delData = {};
  let selectRow = getItemByKey(
      vm.data,
      "remoteRelayByHttp",
      "remoteRelayByHttp"
    ).selectedRowKeys;
  
  for(var i = 0; i < selectRow.length; i++){
    delData["Config.DoorSetting.REMOTERELAY.RemoteIP" + selectRow[i]] = "";
    delData["Config.DoorSetting.REMOTERELAY.RemoteURL" + selectRow[i]] = "";
    delData["Config.DoorSetting.REMOTERELAY.RemoteUser" + selectRow[i]] = "";
    delData["Config.DoorSetting.REMOTERELAY.RemotePasswd" + selectRow[i]] = "";
    delData["Config.DoorSetting.REMOTERELAY.RemoteDoorNum" + selectRow[i]] = "1,2,3,4";
  }
  if (confirm(vm.$t("DeleteSelectedConfirm"))) {
    let requestData = {
      target: "phoneRelay",
      action: "set",
      configData: delData,
    };
    vm.$axios.post("api", requestData).then((response) => {
      showRequestSuccess(vm);
      getData(vm);
    });
  }
}

function onDelAllRelayByHttp(vm){
  let delAllData = {};
  for(var i = 0; i < vm.apiData.data.maxRemoteRelayNum; i++){
    delAllData["Config.DoorSetting.REMOTERELAY.RemoteIP" + i] = "";
    delAllData["Config.DoorSetting.REMOTERELAY.RemoteURL" + i] = "";
    delAllData["Config.DoorSetting.REMOTERELAY.RemoteUser" + i] = "";
    delAllData["Config.DoorSetting.REMOTERELAY.RemotePasswd" + i] = "";
    delAllData["Config.DoorSetting.REMOTERELAY.RemoteDoorNum" + i] = "1,2,3,4";
  }
  if (confirm(vm.$t("DeleteAllConfirm"))) {
    let requestData = {
      target: "phoneRelay",
      action: "set",
      configData: delAllData,
    };
    vm.$axios.post("api", requestData).then((response) => {
      showRequestSuccess(vm);
      getData(vm);
    });
  }
}

function createSoftkeyInCallPreviewContent(vm) {
  //table data
  let tableData = [
    {
      key: 0,
      status: {
        value: vm.apiData.configData["Config.DoorSetting.RELAY.IncomingStatus"],
        isWarn: false,
      },
      displayName: {
        value:
          vm.apiData.configData["Config.DoorSetting.RELAY.IncomingDisplayName"],
        isWarn: false,
      },
      type: {
        value:
          vm.apiData.configData["Config.DoorSetting.RELAY.IncomingRelayType"],
        isWarn: false,
      },
    },
  ];
  //type items
  let typeItems = [];
  if (vm.apiData.data.supportRelayB == 1) {
      typeItems.push({ key: 0, label: vm.$t("LocalRelay") + "1" });
      typeItems.push({ key: 1, label: vm.$t("LocalRelay") + "2" });
    } else {
      typeItems.push({ key: 0, label: vm.$t("LocalRelay") });
    }
  typeItems.push({ key: 3, label: vm.$t("RemoteRelayHTTP") });
  typeItems.push({ key: 4, label: vm.$t("WebRelayAction") });
  if (vm.apiData.data.connectMode == 2) {
    typeItems.push({ key: 16, label: vm.$t("ConfigOnCloud") });
  }
  //content
  let content = {
    key: "softkeyInCallPreview",
    title: vm.$t("CallPreviewPageTitle"),
    titleDescription: vm.$t("SoftkeyInCallDesc"),
    items: [
      {
        type: "table",
        key: "softkeyInCallPreview",
        tableColumns: [
          {
            type: "select",
            title: vm.$t("Status"),
            dataIndex: "status",
            scopedSlots: { customRender: "status" },
            align: "center",
            selectItems: vm.statusItems,
            width: "30%",
          },
          {
            type: "input",
            title: vm.$t("DisplayName"),
            dataIndex: "displayName",
            scopedSlots: { customRender: "displayName" },
            align: "center",
            width: "30%",
          },
          {
            type: "select",
            title: vm.$t("Type"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            align: "center",
            selectItems: typeItems,
            width: "40%",
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createSoftkeyInMonitorContent(vm) {
  //table data
  let tableData = [
    {
      key: 0,
      status: {
        value: vm.apiData.configData["Config.DoorSetting.RELAY.MonitorStatus"],
        isWarn: false,
      },
      displayName: {
        value:
          vm.apiData.configData["Config.DoorSetting.RELAY.MonitorDisplayName"],
        isWarn: false,
      },
      type: {
        value:
          vm.apiData.configData["Config.DoorSetting.RELAY.MonitorRelayType"],
        isWarn: false,
      },
    },
  ];
  //type items
  let typeItems = [];
  if (vm.apiData.data.supportRelayB == 1) {
      typeItems.push({ key: 0, label: vm.$t("LocalRelay") + "1" });
      typeItems.push({ key: 1, label: vm.$t("LocalRelay") + "2" });
    } else {
      typeItems.push({ key: 0, label: vm.$t("LocalRelay") });
    }
  typeItems.push({ key: 3, label: vm.$t("RemoteRelayHTTP") });
  typeItems.push({ key: 4, label: vm.$t("WebRelayAction") });
  if (vm.apiData.data.connectMode == 2) {
    typeItems.push({ key: 16, label: vm.$t("ConfigOnCloud") });
  }
  //content
  let content = {
    key: "softkeyInMonitor",
    title: vm.$t("MonitorPageTitle"),
    titleDescription: vm.$t("SoftKeyInMonitorDesc"),
    items: [
      {
        type: "table",
        key: "softkeyInMonitor",
        tableColumns: [
          {
            type: "select",
            title: vm.$t("Status"),
            dataIndex: "status",
            scopedSlots: { customRender: "status" },
            align: "center",
            selectItems: vm.statusItems,
            width: "30%",
          },
          {
            type: "input",
            title: vm.$t("DisplayName"),
            dataIndex: "displayName",
            scopedSlots: { customRender: "displayName" },
            align: "center",
            width: "30%",
          },
          {
            type: "select",
            title: vm.$t("Type"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            align: "center",
            selectItems: typeItems,
            width: "40%",
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createSoftkeyInHomeOrMoreContent(vm) {
  //table data
  let tableData = [
    {
      key: 0,
      status: {
        value: vm.apiData.configData["Config.DoorSetting.RELAY.IdleStatus"],
        isWarn: false,
        disabled: true,
      },
      displayName: {
        value:
          vm.apiData.configData["Config.DoorSetting.RELAY.IdleDisplayName"],
        isWarn: false,
      },
      type: {
        value: vm.apiData.configData["Config.DoorSetting.RELAY.IdleRelayType"],
        isWarn: false,
      },
    },
  ];
  //type items
  let typeItems = [];
  for (let i = 0; i < vm.apiData.data.maxRemoteRelayNum; i++) {
    let item = {
      key: i + 1,
      label: vm.$t("RemoteRelayHTTP") + (i + 1),
    };
    typeItems.push(item);
  }
  //content
  let content = {
    key: "softkeyInHomeOrMore",
    title: vm.$t("HomeOrMorePageTitle"),
    titleDescription: vm.$t("SoftkeyInHomeDesc"),
    items: [
      {
        type: "table",
        key: "softkeyInHomeOrMore",
        tableColumns: [
          {
            type: "select",
            title: vm.$t("Status"),
            dataIndex: "status",
            scopedSlots: { customRender: "status" },
            align: "center",
            selectItems: vm.statusItems,
            width: "30%",
          },
          {
            type: "input",
            title: vm.$t("DisplayName"),
            dataIndex: "displayName",
            scopedSlots: { customRender: "displayName" },
            align: "center",
            width: "30%",
          },
          {
            type: "select",
            title: vm.$t("Type"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            align: "center",
            selectItems: typeItems,
            width: "40%",
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createSoftkeyInTalkingContent(vm) {
  //type items
  let typeItems = [];
  typeItems.push({ key: 3, label: vm.$t("RemoteRelayHTTP") });
  if (vm.apiData.data.maxRelaySoftkeyNum == 3) {
    if (vm.apiData.data.supportThreeDtmf == 1) {
      typeItems.push({ key: 2, label: vm.$t("RemoteRelayDTMF") + "1" });
      typeItems.push({ key: 14, label: vm.$t("RemoteRelayDTMF") + "2" });
      typeItems.push({ key: 15, label: vm.$t("RemoteRelayDTMF") + "3" });
    } else {
      typeItems.push({ key: 2, label: vm.$t("RemoteRelayDTMF") });
    }
    if (vm.apiData.data.supportRelayB == 1) {
      typeItems.push({ key: 0, label: vm.$t("LocalRelay") + "1" });
      typeItems.push({ key: 1, label: vm.$t("LocalRelay") + "2" });
    } else {
      typeItems.push({ key: 0, label: vm.$t("LocalRelay") });
    }
  } else {
    typeItems.push({ key: 2, label: vm.$t("RemoteRelayDTMF") });
    typeItems.push({ key: 0, label: vm.$t("LocalRelay") });
  }
  typeItems.push({ key: 4, label: vm.$t("WebRelayActionValue") });
  if (vm.apiData.data.connectMode == 2) {
    typeItems.push({ key: 16, label: vm.$t("ConfigOnCloud") });
  }
  //table data
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.maxRelaySoftkeyNum; i++) {
    let item = {
      key: i,
      keyLabel: vm.$t("Key") + (i + 1),
      status: {
        value:
          vm.apiData.configData[
            "Config.DoorSetting.RELAY.TalkingStatus" + (i + 1)
          ],
        isWarn: false,
      },
      displayName: {
        value:
          vm.apiData.configData[
            "Config.DoorSetting.RELAY.TalkingColDisplayName" + (i + 1)
          ],
        isWarn: false,
      },
      type: {
        value:
          vm.apiData.configData[
            "Config.DoorSetting.RELAY.TalkingRelayType" + (i + 1)
          ],
        isWarn: false,
      },
    };
    tableData.push(item);
  }
  //content
  let content = {
    key: "softkeyInTalking",
    title: vm.$t("SoftKeyInTalking"),
    titleDescription: vm.$t("SoftkeyInTalkDesc"),
    items: [
      {
        type: "table",
        key: "softkeyInTalking",
        tableColumns: [
          {
            type: "label",
            title: vm.$t("Key"),
            dataIndex: "keyLabel",
            scopedSlots: { customRender: "keyLabel" },
            align: "center",
            width: "10%",
          },
          {
            type: "select",
            title: vm.$t("Status"),
            dataIndex: "status",
            scopedSlots: { customRender: "status" },
            align: "center",
            selectItems: vm.statusItems,
            width: "30%",
          },
          {
            type: "input",
            title: vm.$t("DisplayName"),
            dataIndex: "displayName",
            scopedSlots: { customRender: "displayName" },
            align: "center",
            width: "30%",
          },
          {
            type: "select",
            title: vm.$t("Type"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            align: "center",
            selectItems: typeItems,
            width: "30%",
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function createOpenRelayViaHttpContent(vm) {
  let content = {
    key: "openRelayViaHttp",
    title: vm.$t("OpenRelaySetting"),
    titleDescription: vm.$t("OpenRelayViaDesc"),
    items: [
      {
        title: vm.$t("Switch"),
        type: "checkbox",
        key: "Config.DoorSetting.RELAY.RelayOnWeb",
        value: vm.apiData.configData["Config.DoorSetting.RELAY.RelayOnWeb"],
        description: vm.$t("SwitchDesc"),
      },
      {
        title: vm.$t("RemoteRelayUser"),
        type: "input",
        key: "Config.DoorSetting.RELAY.RelayOnWebUser",
        value: vm.apiData.configData["Config.DoorSetting.RELAY.RelayOnWebUser"],
        disabled: false,
        description: vm.$t("RelayUsernameDesc"),
      },
      {
        title: vm.$t("RemoteRelayPasswd"),
        type: "input",
        key: "Config.DoorSetting.RELAY.RelayOnWebPwd",
        value: vm.apiData.configData["Config.DoorSetting.RELAY.RelayOnWebPwd"],
        disabled: false,
        inputType: "password",
        description: vm.$t("RelayPasswordDesc"),
      },
    ],
  };
  return content;
}

function createRemoteControlContent(vm) {
  let content = {
    key: "remoteControl",
    title: vm.$t("RemoteControl"),
    titleDescription: vm.$t("RemoteControllerTiDesc"),
    items: [
      {
        title: vm.$t("AllowedAccessIPList"),
        type: "input",
        key: "Config.Features.REMOTECONTROL.ActionURIAllowIPList",
        value:
          vm.apiData.configData[
            "Config.Features.REMOTECONTROL.ActionURIAllowIPList"
          ],
        isWarn: false,
        warnLabel: vm.$t("PleaseCheckAlarmSubmitData"),
        description: vm.$t("AllowAccessIPDesc"),
      },
    ],
  };
  return content;
}

function createRelaySettingContent(vm) {
  //delay items
  let delayItems = [];
  for (let i = 0; i <= 60; i++) {
    let item = {
      key: i,
      label: i,
    };
    delayItems.push(item);
  }
  delayItems.push({ key: -1, label: vm.$t("Never") });

  //relay type
  let relayTypeItems = [];
  relayTypeItems.push({ key: 0, label: vm.$t("OpenDoor") });
  if (vm.apiData.data.chimeBellType == 1) {
    relayTypeItems.push({ key: 1, label: vm.$t("ExtensionSpeaker") });
  } else if (vm.apiData.data.chimeBellType == 2) {
    relayTypeItems.push({ key: 2, label: vm.$t("ChimeBell") });
  } else {
    relayTypeItems.push({ key: 2, label: vm.$t("ChimeBell") });
    if (vm.apiData.data.supportHideSOSAction != 1) {
      relayTypeItems.push({ key: 3, label: vm.$t("SOSAction") });
    }
  }

  let content = {
    key: "relaySetting",
    title: vm.$t("RelaySetting"),
    titleDescription: vm.$t("RelaySettingDesc"),
    items: [
      {
        title: vm.$t("LocalRelay") + "1",
        type: "label",
        key: "localRelay1",
        value: "",
        titleBold: true,
      },
      {
        title: vm.$t("RelayDelayName1"),
        type: "select",
        key: "Config.DoorSetting.RELAY.Delay1",
        value: vm.apiData.configData["Config.DoorSetting.RELAY.Delay1"],
        selectItems: delayItems,
        description: vm.$t("RelayDelayDesc"),
      },
      {
        title: vm.$t("LocalRelayTypeName1"),
        type: "select",
        key: "Config.DoorSetting.RELAY.LocalRelayType1",
        value:
          vm.apiData.configData["Config.DoorSetting.RELAY.LocalRelayType1"],
        selectItems: relayTypeItems,
        description: vm.$t("RelayTypeDesc"),
      },
      {
        title: vm.$t("RemoteControl"),
        type: "select",
        key: "Config.DoorSetting.RELAY.RemoteControl",
        value:
          vm.apiData.configData["Config.DoorSetting.RELAY.RemoteControl"],
        selectItems: vm.statusItems,
        description: vm.$t("RemoteControlDesc"),
      },
      {
        title: vm.$t("DTMF"),
        type: "input",
        key: "Config.DoorSetting.RELAY.LocalDTMF",
        value: vm.apiData.configData["Config.DoorSetting.RELAY.LocalDTMF"],
        description: vm.$t("RelayDTMFDesc"),
      },
      {
        title: vm.$t("LocalRelay") + "2",
        type: "label",
        key: "localRelay2",
        value: "",
        titleBold: true,
      },
      {
        title: vm.$t("RelayDelayName2"),
        type: "select",
        key: "Config.DoorSetting.RELAY.Delay2",
        value: vm.apiData.configData["Config.DoorSetting.RELAY.Delay2"],
        selectItems: delayItems,
        description: vm.$t("RelayDelayDesc"),
      },
      {
        title: vm.$t("LocalRelayTypeName2"),
        type: "select",
        key: "Config.DoorSetting.RELAY.LocalRelayType2",
        value:
          vm.apiData.configData["Config.DoorSetting.RELAY.LocalRelayType2"],
        selectItems: relayTypeItems,
        description: vm.$t("RelayTypeDesc"),
      },
      {
        title: vm.$t("RemoteControl"),
        type: "select",
        key: "Config.DoorSetting.RELAY.RemoteControl2",
        value:
          vm.apiData.configData["Config.DoorSetting.RELAY.RemoteControl2"],
        selectItems: vm.statusItems,
        description: vm.$t("RemoteControlDesc"),
      },
      {
        title: vm.$t("DTMF"),
        type: "input",
        key: "Config.DoorSetting.RELAY.LocalDTMF2",
        value: vm.apiData.configData["Config.DoorSetting.RELAY.LocalDTMF2"],
        description: vm.$t("RelayDTMFDesc"),
      },
      {
        title: vm.$t("RemoteRelay"),
        type: "label",
        key: "remoteRelay",
        value: "",
        titleBold: true,
      },
      {
        title: vm.$t("DTMF") + "1 " + vm.$t("Code"),
        type: "input",
        key: "Config.DoorSetting.RELAY.DTMFCode",
        value: vm.apiData.configData["Config.DoorSetting.RELAY.DTMFCode"],
        description: vm.$t("DTMFCodeDesc"),
      },
      {
        title: vm.$t("DTMF") + "2 " + vm.$t("Code"),
        type: "input",
        key: "Config.DoorSetting.RELAY.DTMFCode2",
        value: vm.apiData.configData["Config.DoorSetting.RELAY.DTMFCode2"],
        isHide: false,
        description: vm.$t("DTMFCodeDesc"),
      },
      {
        title: vm.$t("DTMF") + "3 " + vm.$t("Code"),
        type: "input",
        key: "Config.DoorSetting.RELAY.DTMFCode3",
        value: vm.apiData.configData["Config.DoorSetting.RELAY.DTMFCode3"],
        isHide: false,
        description: vm.$t("DTMFCodeDesc"),
      },
    ],
  };
  return content;
}
</script>