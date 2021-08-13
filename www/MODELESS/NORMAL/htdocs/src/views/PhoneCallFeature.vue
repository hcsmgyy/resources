<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import moment from "moment";
import {
  showRequestSuccess,
  deepClone,
  getEnableSelectItems,
  getItemByKey,
  checkRangeOfNumber,
  getIndexByKey,
  showErrorInfo,
  checkFileFormat,
  showWarningInfo,
} from "@/js/common.js";

const returnCodeItems = [
  { key: 404, label: "404(Not Found)" },
  { key: 480, label: "480(Temporarily Unavailable)" },
  { key: 486, label: "486(Busy Here)" },
  { key: 603, label: "603(Decline)" },
];

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
      //界面变化
      handlerPageChanged(this);
    },
  },
};

function setChangedData(vm, event) {
  if (
    event.itemKey == "Config.Features.DND.StartTime" ||
    event.itemKey == "Config.Features.DND.EndTime"
  ) {
    vm.changedCfgData[event.itemKey] =
      event.newVal.toDate().getHours() +
      ":" +
      event.newVal.toDate().getMinutes();
  } else {
    vm.changedCfgData[event.itemKey] = event.newVal;
  }
}

function handlerPageChanged(vm) {
  let scheduleModeItem = getItemByKey(
    vm.data,
    "DND",
    "Config.Features.DND.ScheduleMode"
  );
  let dndStartTimeItem = getItemByKey(
    vm.data,
    "DND",
    "Config.Features.DND.StartTime"
  );
  let dndEndTimeItem = getItemByKey(
    vm.data,
    "DND",
    "Config.Features.DND.EndTime"
  );
  if (vm.changedCfgData["Config.Features.DND.WholeDay"] == "1") {
    scheduleModeItem.disabled = true;
    dndStartTimeItem.disabled = true;
    dndEndTimeItem.disabled = true;
  } else {
    scheduleModeItem.disabled = false;
    if (vm.changedCfgData["Config.Features.DND.ScheduleMode"] == "1") {
      dndStartTimeItem.disabled = false;
      dndEndTimeItem.disabled = false;
    } else {
      dndStartTimeItem.disabled = true;
      dndEndTimeItem.disabled = true;
    }
  }

  let startTimeMin =
    vm.changedCfgData["Config.Features.DND.StartTime"].split(":")[0] * 60 +
    vm.changedCfgData["Config.Features.DND.StartTime"].split(":")[1];
  let endTimeMin =
    vm.changedCfgData["Config.Features.DND.EndTime"].split(":")[0] * 60 +
    vm.changedCfgData["Config.Features.DND.EndTime"].split(":")[1];
  if (parseInt(startTimeMin) >= parseInt(endTimeMin)) {
    dndEndTimeItem.showHint = true;
  } else {
    dndEndTimeItem.showHint = false;
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneCallFeature",
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
  vm.$axios.get("api/phoneCallFeature/info").then((response) => {
    vm.getDataSuccess = true;
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
      secondTitle: vm.$t("CallFeature"),
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

  vm.data.contents.push(createForwardContent(vm));
  vm.data.contents.push(createDNDContent(vm));
  vm.data.contents.push(createAudioCallSettingContent(vm));
  vm.data.contents.push(createOthersContent(vm));
  vm.data.contents.push(createAllowlistsContent(vm));
  getAllowTableData(vm, 1);
}

function createAllowlistsContent(vm) {
  //添加框
  let addModalData = {
    title: vm.$t("AddLabel") + " " + vm.$t("AutoAnswerWhitelist"),
    key: -1,
    cancelBtnLabel: vm.$t("Cancel"),
    submitBtnLabel: vm.$t("Submit"),
    visible: false,
    showFooter: true,
    items: [
      {
        title: vm.$t("DeviceLocation"),
        type: "input",
        key: "deviceLocation",
        value: "",
        isWarn: false,
        warnLabel: vm.$t("AllowDeviceNoEmpty"),
        description: vm.$t("AllowDeviceLocationDesc"),
      },
      {
        title: vm.$t("DeviceNumber"),
        type: "input",
        key: "deviceNumber",
        value: "",
        isWarn: false,
        warnLabel: vm.$t("AllowIPSIPNoEmpty"),
        description: vm.$t("AllowSIPDesc"),
      },
    ],
    onConfirm: function () {
      onChangeAllowList(vm);
    },
  };

  //导入框
  let importModalData = {
    title: " ",
    cancelBtnLabel: vm.$t("Cancel"),
    submitBtnLabel: vm.$t("Import"),
    showFooter: true,
    visible: false,
    items: [
      {
        title: vm.$t("AllowListImportHint"),
        type: "file-input",
        key: "import",
        acceptFileType: ".xml,.csv",
        loading: false,
        value: {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        },
        importBtnName: vm.$t("Reset"),
      },
    ],
    onConfirm: function () {
      onImport(vm);
    },
    confirmLoading: false,
  };

  //表头数据
  let tableHeadData = {
    addModalData: addModalData,
    importModalData: importModalData,
    exportItems: [
      { key: "xml", label: "xml" },
      { key: "csv", label: "csv" },
    ],
    onExport: function (type) {
      onExport(vm, type);
    },
  };

  //表尾数据
  let tableFooterData = {
    onDelete: function () {
      onDeleteAllowList(vm, "select");
    },
    onDeleteAll: function () {
      onDeleteAllowList(vm, "all");
    },
    onPageChange: function (page) {
      getAllowTableData(vm, page);
    },
    sum: 0,
    pageNumber: 10,
    curPage: 0,
    deleteDisabled: true,
    deleteAllDisabled: false,
  };

  //表格数据

  let content = {
    key: "allowlist",
    title: vm.$t("AutoAnswerWhitelist"),
    titleDescription: vm.$t("AllowlistDesc"),
    items: [
      {
        type: "table",
        key: "allowlist",
        showHead: true,
        showFooter: true,
        showRowSelection: true,
        selectedRowKeys: [],
        tableHeadData: tableHeadData,
        tableFooterData: tableFooterData,
        tableData: [],
        tableColumns: [
          {
            type: "label",
            title: vm.$t("Index"),
            dataIndex: "index",
            scopedSlots: { customRender: "index" },
            align: "center",
            width: "10%",
          },
          {
            type: "label",
            title: vm.$t("DeviceLocation"),
            dataIndex: "deviceLocation",
            scopedSlots: { customRender: "deviceLocation" },
            align: "center",
            width: "40%",
          },
          {
            type: "label",
            title: vm.$t("DeviceNumber"),
            dataIndex: "deviceNumber",
            scopedSlots: { customRender: "deviceNumber" },
            align: "center",
            width: "40%",
          },
          {
            type: "edit",
            title: vm.$t("EditLabel"),
            dataIndex: "edit",
            scopedSlots: { customRender: "edit" },
            align: "center",
            width: "10%",
            onEdit: function (index, key) {
              let allowTableItem = getItemByKey(
                vm.data,
                "allowlist",
                "allowlist"
              );
              //location
              allowTableItem.tableHeadData.addModalData.items[
                getIndexByKey(
                  allowTableItem.tableHeadData.addModalData.items,
                  "deviceLocation"
                )
              ].value = allowTableItem.tableData[index].deviceLocation;
              //number
              allowTableItem.tableHeadData.addModalData.items[
                getIndexByKey(
                  allowTableItem.tableHeadData.addModalData.items,
                  "deviceNumber"
                )
              ].value = allowTableItem.tableData[index].deviceNumber;
            },
          },
        ],
      },
    ],
  };
  return content;
}

function createOthersContent(vm) {
  let content = {
    key: "others",
    title: vm.$t("Others"),
    titleDescription: vm.$t("CallFeatureOthersDesc"),
    items: [
      {
        title: vm.$t("ReturnCodeRefuse"),
        type: "select",
        key: "Config.Features.REJECT.ReturnCode",
        value: vm.apiData.configData["Config.Features.REJECT.ReturnCode"],
        selectItems: returnCodeItems,
        description: vm.$t("ReturnCodeRefuseDesc"),
      },
      {
        title: vm.$t("AutoAnswerDelay"),
        type: "input",
        key: "Config.Features.AUTOANSWER.Delay",
        value: vm.apiData.configData["Config.Features.AUTOANSWER.Delay"],
        showHint: true,
        hintContent: "( 0~30" + vm.$t("Second") + " )",
        isWarn: false,
        warnLabel: vm.$t("AutoAnswerDelayRangeError"),
        description: vm.$t("AutoAnswerDelayDesc"),
      },
      {
        title: vm.$t("AnswerMode"),
        type: "select",
        key: "Config.Features.ANSWERMODE.Priority",
        value: vm.apiData.configData["Config.Features.ANSWERMODE.Priority"],
        selectItems: [
          { key: 0, label: vm.$t("Audio") },
          { key: 1, label: vm.$t("Video") },
        ],
        description: vm.$t("AnswerModeDesc"),
      },
      {
        title: vm.$t("AnswerTone"),
        type: "select",
        key: "Config.Settings.AUDIO.AnswerTone",
        value: vm.apiData.configData["Config.Settings.AUDIO.AnswerTone"],
        selectItems: [
          { key: 0, label: vm.$t("Disabled") },
          { key: 1, label: vm.$t("Enabled") },
        ],
        description: vm.$t("AnswerModeDesc"),
      },
      {
        title: vm.$t("HangupBusyTone"),
        type: "checkbox",
        key: "Config.Settings.GENERAL.HungUpBusyTone",
        value: vm.apiData.configData["Config.Settings.GENERAL.HungUpBusyTone"],
        description: vm.$t("BusyToneDesc"),
      },
      {
        title: vm.$t("IndoorAutoAnswer"),
        type: "checkbox",
        key: "Config.Features.AUTO_ANSWER.IndoorToIndoor",
        value:
          vm.apiData.configData["Config.Features.AUTO_ANSWER.IndoorToIndoor"],
        description: vm.$t("IndoorAutoAnswerDesc"),
      },
      {
        title: vm.$t("DirectIPCall"),
        type: "checkbox",
        key: "Config.Settings.GENERAL.DirectIP",
        value: vm.apiData.configData["Config.Settings.GENERAL.DirectIP"],
        description: vm.$t("DirectIPCallDesc"),
      },
      {
        title: vm.$t("DirectIPCallPort"),
        type: "input",
        key: "Config.Settings.GENERAL.DirectIPPort",
        value: vm.apiData.configData["Config.Settings.GENERAL.DirectIPPort"],
        isWarn: false,
        showHint: true,
        hintContent: "( 1~65535 )",
        description: vm.$t("DirectIPCallPortDesc"),
      },
    ],
  };
  return content;
}

function createAudioCallSettingContent(vm) {
  let content = {
    key: "audioCallSetting",
    title: vm.$t("AudioCallSetting"),
    titleDescription: vm.$t("AudioCallSettingDesc"),
    items: [
      {
        title: vm.$t("ReceiveLiveStream"),
        type: "checkbox",
        key: "Config.Features.AUDIO_CALL.ReceiveLiveStream",
        value:
          vm.apiData.configData["Config.Features.AUDIO_CALL.ReceiveLiveStream"],
        description: vm.$t("ReceiveLiveDesc"),
      },
    ],
  };
  return content;
}

function createForwardContent(vm) {
  let noAnswerRingTimeItems = [];
  for (let i = 0; i < 21; i++) {
    noAnswerRingTimeItems.push({
      key: i * 6,
      label: " " + i * 6,
    });
  }

  let content = {
    key: "forwardTransfer",
    title: vm.$t("ForwardTransfer"),
    titleDescription: vm.$t("CallFowardDesc"),
    items: [
      {
        title: vm.$t("ForwardAlways"),
        type: "select",
        key: "Config.Forward.ALWAYS.Enable",
        value: vm.apiData.configData["Config.Forward.ALWAYS.Enable"],
        selectItems: getEnableSelectItems(vm),
        description: vm.$t("AlwaysTransferDesc"),
      },
      {
        title: vm.$t("AlwaysTargetNumber"),
        type: "input",
        key: "Config.Forward.ALWAYS.Target",
        value: vm.apiData.configData["Config.Forward.ALWAYS.Target"],
        isWarn: false,
        warnLabel: vm.$t("TargetNumberNoEmpty"),
        description: vm.$t("AlwaysForNumberDesc"),
      },
      {
        title: vm.$t("ForwardBusy"),
        type: "select",
        key: "Config.Forward.BUSY.Enable",
        value: vm.apiData.configData["Config.Forward.BUSY.Enable"],
        selectItems: getEnableSelectItems(vm),
        description: vm.$t("BusyTransferDesc"),
      },
      {
        title: vm.$t("BusyTargetNumber"),
        type: "input",
        key: "Config.Forward.BUSY.Target",
        value: vm.apiData.configData["Config.Forward.BUSY.Target"],
        isWarn: false,
        warnLabel: vm.$t("TargetNumberNoEmpty"),
        description: vm.$t("BusyForNumberDesc"),
      },
      {
        title: vm.$t("ForwardNoAnswer"),
        type: "select",
        key: "Config.Forward.TIMEOUT.Enable",
        value: vm.apiData.configData["Config.Forward.TIMEOUT.Enable"],
        selectItems: getEnableSelectItems(vm),
        description: vm.$t("NoAnswreTransferDesc"),
      },
      {
        title: vm.$t("NoAnswerTargetNumber"),
        type: "input",
        key: "Config.Forward.TIMEOUT.Target",
        value: vm.apiData.configData["Config.Forward.TIMEOUT.Target"],
        isWarn: false,
        warnLabel: vm.$t("TargetNumberNoEmpty"),
        description: vm.$t("NoAnswerForNumberDesc"),
      },
      {
        title: vm.$t("NoAnswerRingTime") + " (" + vm.$t("Second") + ")",
        type: "select",
        key: "Config.Forward.TIMEOUT.Timeout",
        value: vm.apiData.configData["Config.Forward.TIMEOUT.Timeout"],
        selectItems: noAnswerRingTimeItems,
        description: vm.$t("NoAnswerDurationDesc"),
      },
    ],
  };
  return content;
}

function createDNDContent(vm) {
  let dndStartTime = new Date();
  dndStartTime.setHours(
    vm.apiData.configData["Config.Features.DND.StartTime"].split(":")[0]
  );
  dndStartTime.setMinutes(
    vm.apiData.configData["Config.Features.DND.StartTime"].split(":")[1]
  );

  let dndEndTime = new Date();
  dndEndTime.setHours(
    vm.apiData.configData["Config.Features.DND.EndTime"].split(":")[0]
  );
  dndEndTime.setMinutes(
    vm.apiData.configData["Config.Features.DND.EndTime"].split(":")[1]
  );

  let content = {
    key: "DND",
    title: vm.$t("DND"),
    titleDescription: vm.$t("DNDDesc"),
    items: [
      {
        title: vm.$t("WholeDay"),
        type: "checkbox",
        key: "Config.Features.DND.WholeDay",
        value: vm.apiData.configData["Config.Features.DND.WholeDay"],
        description: vm.$t("WholeDayDesc"),
      },
      {
        title: vm.$t("DNDSchedule"),
        type: "checkbox",
        key: "Config.Features.DND.ScheduleMode",
        disabled: false,
        value: vm.apiData.configData["Config.Features.DND.ScheduleMode"],
        description: vm.$t("ScheduleDesc"),
      },
      {
        title: vm.$t("DNDStartTime"),
        type: "time",
        key: "Config.Features.DND.StartTime",
        timeFormat: vm.apiData.configData["Config.Settings.DATETIME.TimeFormat"] == 0 ? "h:mm a" : "HH:mm",
        use12Hours: vm.apiData.configData["Config.Settings.DATETIME.TimeFormat"] == 0 ? true : false,
        value: moment(dndStartTime),
        description: vm.$t("DNDStartTimeDesc"),
      },
      {
        title: vm.$t("DNDEndTime"),
        type: "time",
        key: "Config.Features.DND.EndTime",
        timeFormat: vm.apiData.configData["Config.Settings.DATETIME.TimeFormat"] == 0 ? "h:mm a" : "HH:mm",
        use12Hours: vm.apiData.configData["Config.Settings.DATETIME.TimeFormat"] == 0 ? true : false,
        value: moment(dndEndTime),
        showHint: true,
        hintContent: vm.$t("NextDay"),
        description: vm.$t("DNDEndTimeDesc"),
      },
      {
        title: vm.$t("ReturnCodeDND"),
        type: "select",
        key: "Config.Features.DND.ReturnCode",
        value: vm.apiData.configData["Config.Features.DND.ReturnCode"],
        selectItems: returnCodeItems,
        description: vm.$t("ReturnCodeDNDDesc"),
      },
    ],
  };
  return content;
}

function checkCommitData(vm) {
  return checkForwardData(vm) && checkOthersData(vm);
}

function checkOthersData(vm) {
  let success = true;

  if (
    !checkRangeOfNumber(
      vm.changedCfgData["Config.Features.AUTOANSWER.Delay"],
      0,
      30
    ) ||
    "" == vm.changedCfgData["Config.Features.AUTOANSWER.Delay"]
  ) {
    let item = getItemByKey(
      vm.data,
      "others",
      "Config.Features.AUTOANSWER.Delay"
    );
    item.isWarn = true;
    success = false;
  }

  let directIpPortitem = getItemByKey(
    vm.data,
    "others",
    "Config.Settings.GENERAL.DirectIPPort"
  );
  if (
    !checkRangeOfNumber(
      vm.changedCfgData["Config.Settings.GENERAL.DirectIPPort"],
      1,
      65535
    )
  ) {
    directIpPortitem.isWarn = true;
    directIpPortitem.warnLabel = vm.$t("DirectIPPortRangeError");
    success = false;
  }
  if (
    vm.changedCfgData["Config.Settings.GENERAL.DirectIPPort"] == "5062" ||
    vm.changedCfgData["Config.Settings.GENERAL.DirectIPPort"] == "5063"
  ) {
    directIpPortitem.isWarn = true;
    directIpPortitem.warnLabel = vm.$t("SameSipPortErr");
    success = false;
  }
  return success;
}

function checkForwardData(vm) {
  let success = true;
  if (
    vm.changedCfgData["Config.Forward.ALWAYS.Enable"] == "1" &&
    vm.changedCfgData["Config.Forward.ALWAYS.Target"] == ""
  ) {
    let item = getItemByKey(
      vm.data,
      "forwardTransfer",
      "Config.Forward.ALWAYS.Target"
    );
    item.isWarn = true;
    success = false;
  }
  if (
    vm.changedCfgData["Config.Forward.BUSY.Enable"] == "1" &&
    vm.changedCfgData["Config.Forward.BUSY.Target"] == ""
  ) {
    let item = getItemByKey(
      vm.data,
      "forwardTransfer",
      "Config.Forward.BUSY.Target"
    );
    item.isWarn = true;
    success = false;
  }
  if (
    vm.changedCfgData["Config.Forward.TIMEOUT.Enable"] == "1" &&
    vm.changedCfgData["Config.Forward.TIMEOUT.Target"] == ""
  ) {
    let item = getItemByKey(
      vm.data,
      "forwardTransfer",
      "Config.Forward.TIMEOUT.Target"
    );
    item.isWarn = true;
    success = false;
  }
  return success;
}

function getAllowTableData(vm, page) {
  vm.$axios.get("api/phoneCallFeature/get?page=" + page).then((response) => {
    let tableData = [];
    let data = response.data.data;
    for (let i = 0; i < data.allowList.length; i++) {
      let item = {
        key: data.allowList[i].id,
        index: i + 1,
        deviceLocation: data.allowList[i].location,
        deviceNumber: data.allowList[i].number,
        edit: i,
      };
      tableData.push(item);
    }
    getItemByKey(vm.data, "allowlist", "allowlist").tableData = tableData;
    getItemByKey(vm.data, "allowlist", "allowlist").tableFooterData.sum =
      data.sum;
    getItemByKey(vm.data, "allowlist", "allowlist").tableFooterData.pageNumber =
      data.pageNum;
    getItemByKey(
      vm.data,
      "allowlist",
      "allowlist"
    ).tableFooterData.curPage = page;
    getItemByKey(vm.data, "allowlist", "allowlist").selectedRowKeys = [];
  });
}

function onChangeAllowList(vm) {
  let addModalData = getItemByKey(vm.data, "allowlist", "allowlist")
    .tableHeadData.addModalData;
  let deviceLoaction =
    addModalData.items[getIndexByKey(addModalData.items, "deviceLocation")];
  let deviceNumber =
    addModalData.items[getIndexByKey(addModalData.items, "deviceNumber")];
  let id = addModalData.key;

  let errFlag = false;
  if (deviceLoaction.value == "") {
    deviceLoaction.isWarn = true;
    errFlag = true;
  }

  if (deviceNumber.value == "") {
    deviceNumber.isWarn = true;
    deviceNumber.warnLabel = vm.$t("AllowIPSIPNoEmpty");
    errFlag = true;
  }

  if (errFlag) {
    return;
  }

  let data = {
    location: deviceLoaction.value,
    number: deviceNumber.value,
    id: id,
  };

  let action = id >= 0 ? "edit" : "add";

  let requestData = {
    target: "phoneCallFeature",
    action: action,
    data: data,
  };
  vm.$axios.post("api", requestData).then((response) => {
    let ret = response.data.retcode;
    if (ret == 0) {
      deviceLoaction.value = "";
      deviceNumber.value = "";
      let page = 0;
      let tableItem = getItemByKey(vm.data, "allowlist", "allowlist");
      if (action == "add") {
        //页面数据变化
        page = Math.ceil(
          (tableItem.tableFooterData.sum + 1) /
            tableItem.tableFooterData.pageNumber
        );
      } else {
        page = tableItem.tableFooterData.curPage;
      }
      getAllowTableData(vm, page);
      //关闭窗口并展示成功
      addModalData.visible = false;
      showRequestSuccess(vm);
    } else if (ret == 7) {
      deviceNumber.isWarn = true;
      deviceNumber.warnLabel = vm.$t("WhileNumberAlreadyExist");
    } else {
      showErrorInfo(vm, vm.$t("WhileListAddErr"));
    }
  });
}

function onDeleteAllowList(vm, type) {
  if (
    !confirm(
      type == "all" ? vm.$t("DeleteAllConfirm") : vm.$t("DeleteSelectedConfirm")
    )
  ) {
    return;
  }
  let selectedRowKeys = getItemByKey(vm.data, "allowlist", "allowlist")
    .selectedRowKeys;
  let requestData = {
    target: "phoneCallFeature",
    action: "del",
    data: {
      type: type,
      ids: selectedRowKeys,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm, vm.$t("DeleteAllowListSuccess"));
    if (type != "all") {
      let tableFooterData = getItemByKey(vm.data, "allowlist", "allowlist")
        .tableFooterData;
      let sumPage = Math.ceil(
        (tableFooterData.sum - selectedRowKeys.length) /
          tableFooterData.pageNumber
      );
      sumPage = sumPage == 0 ? 1 : sumPage;
      let page =
        tableFooterData.curPage >= sumPage ? sumPage : tableFooterData.curPage;
      getAllowTableData(vm, page);
    } else {
      getAllowTableData(vm, 1);
    }
  });
}

function onExport(vm, type) {
  let requestData = {
    target: "phoneCallFeature",
    action: "export",
    data: {
      type: type,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm, vm.$t("ExportSuccess"));
    let address = response.data.data.address;
    window.open(address);
  });
}

function onImport(vm) {
  let modal = getItemByKey(vm.data, "allowlist", "allowlist").tableHeadData
    .importModalData;
  let item = modal.items[getIndexByKey(modal.items, "import")];
  let fileName = item.value.fileName;
  if (fileName == "" || fileName == vm.$t("UpgradeFilePath")) {
    showErrorInfo(vm, vm.$t("FileEmptyWarning"));
    return;
  }

  modal.confirmLoading = true;
  const upData = new FormData();
  upData.append("file", item.value.fileData);
  axios
    .post("api/phoneCallFeature/import", upData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      if (res.data.retcode == -1) {
        showErrorInfo(vm, vm.$t("WhiteListImportFail"));
      } else if (res.data.retcode == 2) {
        showWarningInfo(vm, vm.$t("WhiteListImportExistWarning"));
        item.value.fileName = vm.$t("UpgradeFilePath");
        item.value.fileData = {};
        modal.visible = false;
      } else if (res.data.retcode == 0) {
        showRequestSuccess(vm, vm.$t("WhiteListImportSuccess"));
        item.value.fileName = vm.$t("UpgradeFilePath");
        item.value.fileData = {};
        modal.visible = false;
      }
      modal.confirmLoading = false;
      let page = getItemByKey(vm.data, "allowlist", "allowlist").tableFooterData
        .curPage;
      getAllowTableData(vm, page);
    });
}
</script>