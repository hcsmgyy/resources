<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  deepClone,
  isAnInterger,
  getItemByKey,
  dateFtt,
  formatAMPM,
  onWebHangup,
  onWebDial,
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
      setChangedData(this, event);
      //this.changedCfgData[event.itemKey] = event.newVal;
    },
  },
};

function setChangedData(vm, event) {
  if (event.contentKey == "calllog") {
    if (event.itemKey == "callHistoryType") {
      getCallLogsTableData(vm, 1);
    } else {
      vm.changedCfgData[event.itemKey] = event.newVal;
    }
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneCallLog",
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
  vm.$axios.get("api/phoneCallLog/info").then((response) => {
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
  return checkCallLog(vm);
}
function checkCallLog(vm) {
  let success = true;
  let upperLimit = getItemByKey(
    vm.data,
    "calllog",
    "Config.Settings.Capture.UpperLimit"
  );
  if (vm.changedCfgData["Config.Settings.Capture.UpperLimit"] == "") {
    upperLimit.isWarn = true;
    upperLimit.warnLabel = vm.$t("UpperLimitWarning");
    success = false;
  }
  if (!isAnInterger(vm.changedCfgData["Config.Settings.Capture.UpperLimit"])) {
    upperLimit.isWarn = true;
    upperLimit.warnLabel = vm.$t("ValueMustBeNumber");
    success = false;
  } else {
    if (vm.changedCfgData["Config.Settings.Capture.UpperLimit"] <= 0) {
      upperLimit.isWarn = true;
      upperLimit.warnLabel = vm.$t("ValueGreater0Info");
      success = false;
    }
  }
  return success;
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Contacts"),
      secondTitle: vm.$t("CallLog"),
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
  vm.data.contents.push(createCallLogContent(vm));
  getCallLogsTableData(vm, 1);
}

function createCallLogContent(vm) {
  //call log type items
  let callLogTypeItems = [
    { key: 0, label: vm.$t("All") },
    { key: 1, label: vm.$t("Dialed") },
    { key: 2, label: vm.$t("Received") },
    { key: 3, label: vm.$t("Missed") },
    { key: 4, label: vm.$t("Forwarded") },
  ];
  //capture delay items
  let captureDelayItems = [];
  for (let i = 0; i <= 10; i++) {
    captureDelayItems.push({ key: i, label: i });
  }
  //table footer
  let tableFooterData = {
    onDelete: function () {
      onDeleteLog(vm, "select");
    },
    onDeleteAll: function () {
      onDeleteLog(vm, "all");
    },
    onPageChange: function (page) {
      getCallLogsTableData(vm, page);
    },
    sum: 0,
    pageNumber: 15,
    curPage: 0,
    deleteDisabled: true,
    deleteAllDisabled: false,
  };
  //content
  let content = {
    key: "calllog",
    title: vm.$t("CallLog"),
    titleDescription: vm.$t("CallLogDesc"),
    items: [
      {
        title: vm.$t("CaptureDelay") + " (" + vm.$t("Second") + ")",
        type: "select",
        key: "Config.Settings.Capture.Delay",
        value: vm.apiData.configData["Config.Settings.Capture.Delay"],
        selectItems: captureDelayItems,
        description: vm.$t("CaptureDelayDesc"),
      },
      {
        title: vm.$t("UpperLimit"),
        type: "input",
        key: "Config.Settings.Capture.UpperLimit",
        value: vm.apiData.configData["Config.Settings.Capture.UpperLimit"],
        isWarn: false,
        warnLabel: vm.$t("UpperLimitWarning"),
        description: vm.$t("UpperLimitDesc"),
      },
      {
        title: vm.$t("CallHistory"),
        type: "select",
        showCallLogBtn: true,
        key: "callHistoryType",
        value: "0",
        selectItems: callLogTypeItems,
        onHangup: function () {
          onWebHangup(vm);
        },
        onExport: function () {
          onExport(vm);
        },
        description: vm.$t("CallHistoryDesc"),
      },
      {
        type: "table",
        key: "calllog",
        showFooter: true,
        showRowSelection: true,
        selectedRowKeys: [],
        tableFooterData: tableFooterData,
        tableData: [],
        onClickDial: function(index){
          onDial(vm,index);
        },
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
            title: vm.$t("Type"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            align: "center",
            width: "10%",
          },
          {
            type: "label",
            title: vm.$t("DateLabel"),
            dataIndex: "date",
            scopedSlots: { customRender: "date" },
            align: "center",
            width: "10%",
          },
          {
            type: "label",
            title: vm.$t("Time"),
            dataIndex: "time",
            scopedSlots: { customRender: "time" },
            align: "center",
            width: "10%",
          },
          {
            type: "label",
            title: vm.$t("LocalIdentity"),
            dataIndex: "identity",
            scopedSlots: { customRender: "identity" },
            align: "center",
            width: "20%",
          },
          {
            type: "label",
            title: vm.$t("Name"),
            dataIndex: "name",
            scopedSlots: { customRender: "name" },
            align: "center",
            width: "20%",
          },
          {
            type: "click-label",
            title: vm.$t("NumberLabel"),
            dataIndex: "number",
            scopedSlots: { customRender: "number" },
            align: "center",
            width: "20%",
          },
        ],
      },
    ],
  };
  return content;
}

function onDial(vm,columnIndex){
  let itemValue = getItemByKey(
    vm.data,
    "calllog",
    "calllog"
  ).tableData;
  var number = itemValue[columnIndex-1].number.split("@")[0];
  var account = itemValue[columnIndex-1].identity.split("@")[0];
  if (confirm(vm.$t("MakeCallWarn"))) {
    onWebDial(vm,number,account,true);
  }
}

function getCallLogsTableData(vm, page) {
  var dateFormat = "yyyy-MM-dd";
  let apiDateFormat =
    vm.apiData.configData["Config.Settings.DATETIME.DateFormat"];
  if (apiDateFormat == "0") {
    dateFormat = "yyyy-MM-dd";
  } else if (apiDateFormat == "1") {
    dateFormat = "yyyy/MM/dd";
  } else if (apiDateFormat == "2") {
    dateFormat = "dd-MM-yyyy";
  } else if (apiDateFormat == "3") {
    dateFormat = "dd/MM/yyyy";
  } else if (apiDateFormat == "6") {
    dateFormat = "MM-dd-yyyy";
  } else if (apiDateFormat == "7") {
    dateFormat = "MM/dd/yyyy";
  }

  vm.$axios
    .get(
      "api/phoneCallLog/get?page=" +
        page +
        "&type=" +
        getItemByKey(vm.data, "calllog", "callHistoryType").value
    )
    .then((response) => {
      let tableData = [];
      let data = response.data.data;
      var types = new Array(
        vm.$t("All"),
        vm.$t("Dialed"),
        vm.$t("Received"),
        vm.$t("Missed"),
        vm.$t("Forwarded")
      );
      for (let i = 0; i < data.callLogList.length; i++) {
        let item = {
          key: data.callLogList[i].id,
          index: i + 1,
          type: types[data.callLogList[i].type],
          date: dateFtt(dateFormat, new Date(data.callLogList[i].date)),
          time:
            vm.apiData.configData["Config.Settings.DATETIME.TimeFormat"] == "0"
              ? formatAMPM(
                  new Date(
                    data.callLogList[i].date + " " + data.callLogList[i].time
                  )
                )
              : data.callLogList[i].time,
          identity: data.callLogList[i].identity,
          name: data.callLogList[i].name,
          number: data.callLogList[i].number,
        };
        tableData.push(item);
      }
      getItemByKey(vm.data, "calllog", "calllog").tableData = tableData;
      getItemByKey(vm.data, "calllog", "calllog").tableFooterData.sum =
        data.sum;
      getItemByKey(vm.data, "calllog", "calllog").tableFooterData.pageNumber =
        data.pageNum;
      getItemByKey(
        vm.data,
        "calllog",
        "calllog"
      ).tableFooterData.curPage = page;
      getItemByKey(vm.data, "calllog", "calllog").selectedRowKeys = [];
    });
}
function onDeleteLog(vm, type) {
  if (
    !confirm(
      type == "all" ? vm.$t("DeleteAllConfirm") : vm.$t("DeleteSelectedConfirm")
    )
  ) {
    return;
  }
  let selectedRowKeys = getItemByKey(vm.data, "calllog", "calllog")
    .selectedRowKeys;
  let requestData = {
    target: "phoneCallLog",
    action: "del",
    data: {
      type: type,
      ids: selectedRowKeys,
      logType: getItemByKey(vm.data, "calllog", "callHistoryType").value,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm, vm.$t("CallLogDeleteSuccess"));
    let tableFooterData = getItemByKey(vm.data, "calllog", "calllog")
      .tableFooterData;
    if (type != "all") {
      let sumPage = Math.ceil(
        (tableFooterData.sum - selectedRowKeys.length) /
          tableFooterData.pageNumber
      );
      sumPage = sumPage == 0 ? 1 : sumPage;
      let page =
        tableFooterData.curPage >= sumPage ? sumPage : tableFooterData.curPage;
      getCallLogsTableData(vm, page);
    } else {
      getCallLogsTableData(vm, 1);
    }
  });
}

function onExport(vm) {
  let requestData = {
    target: "phoneCallLog",
    action: "export",
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm, vm.$t("ExportSuccess"));
    let address = response.data.data.address;
    window.open(address);
  });
}
</script>