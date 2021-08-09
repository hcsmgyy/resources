<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  deepClone,
  getIndexByKey,
  getItemByKey,
  showErrorInfo,
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
      //this.changedCfgData[event.itemKey] = event.newVal;
    },
  },
};

function setChangedData(vm, event) {
  if (event.contentKey == "liftControl" && event.itemKey == "liftControl") {
    for (let i = 0; i < event.newVal.length; i++) {
      vm.changedCfgData["Config.Features.LIFT" + (i + 1) + ".Status"] =
        event.newVal[i].status.value;
      vm.changedCfgData["Config.Features.LIFT" + (i + 1) + ".Icon"] =
        event.newVal[i].icon.value;
      vm.changedCfgData["Config.Features.LIFT" + (i + 1) + ".Label"] =
        event.newVal[i].label.value;
      vm.changedCfgData["Config.Features.LIFT" + (i + 1) + ".HttpCommand"] =
        event.newVal[i].command.addOnBefore + event.newVal[i].command.value;
    }
  }
}

function handlerPageChanged(vm) {
  let liftTableData = getItemByKey(vm.data, "liftControl", "liftControl")
    .tableData;
  for (let i = 0; i < 2; i++) {
    if (vm.changedCfgData["Config.Features.LIFT" + (i + 1) + ".Status"] == 0) {
      liftTableData[i].label.disabled = true;
      liftTableData[i].command.disabled = true;
    } else {
      liftTableData[i].label.disabled = false;
      liftTableData[i].command.disabled = false;
    }
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneLift",
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
  vm.$axios.get("api/phoneLift/info").then((response) => {
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
      secondTitle: vm.$t("Lift"),
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

  vm.data.contents.push(createLiftControlContent(vm));
  vm.data.contents.push(createLiftHintsContent(vm));
  getHintsTableData(vm, 1);
}

function createLiftHintsContent(vm) {
  //添加框
  let addModalData = {
    title: vm.$t("AddHints") ,
    key: -1,
    cancelBtnLabel: vm.$t("Cancel"),
    submitBtnLabel: vm.$t("Submit"),
    visible: false,
    showFooter: true,
    items: [
      {
        title: vm.$t("HttpStatusCode"),
        type: "input",
        key: "code",
        value: "",
        isWarn: false,
        warnLabel: "",
        disabled: false,
        description: vm.$t("LiftHTTPCodeDesc"),
      },
      {
        title: vm.$t("Hints"),
        type: "input",
        key: "hint",
        value: "",
        isWarn: false,
        warnLabel: vm.$t("EmptyErr"),
        description: vm.$t("LiftHintFieldDesc"),
      },
      {
        title: vm.$t("Lift"),
        type: "select",
        key: "lift",
        value: "",
        defaultValue: -1,
        selectItems: [
          { key: -1, label: vm.$t("All") },
          { key: 0, label: vm.$t("Lift") + 1 },
          { key: 1, label: vm.$t("Lift") + 2 },
        ],
        description: vm.$t("LiftIndexDesc"),
      },
    ],
    onConfirm: function () {
      onChangeHint(vm);
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
        title: vm.$t("FileLabel") + " (.xml)",
        type: "file-input",
        key: "import",
        acceptFileType: ".xml",
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
  //table head
  let tableHeadData = {
    addModalData: addModalData,
    importModalData: importModalData,
    exportItems: [{ key: "xml", label: "xml" }],
    onExport: function (type) {
      onExport(vm, type);
    },
  };
  //table footer
  let tableFooterData = {
    onDelete: function () {
      onDeleteHint(vm, "select");
    },
    onDeleteAll: function () {
      onDeleteHint(vm, "all");
    },
    onPageChange: function (page) {
      getHintsTableData(vm, page);
    },
    sum: 0,
    pageNumber: 5,
    curPage: 0,
    deleteDisabled: true,
    deleteAllDisabled: false,
  };
  //content
  let content = {
    key: "liftHints",
    title: vm.$t("Hints"),
    titleDescription: vm.$t("LiftHintDesc"),
    items: [
      {
        type: "table",
        key: "liftHints",
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
            title: vm.$t("HttpStatusCode"),
            dataIndex: "code",
            scopedSlots: { customRender: "code" },
            align: "center",
            width: "15%",
          },
          {
            type: "label",
            title: vm.$t("Lift"),
            dataIndex: "lift",
            scopedSlots: { customRender: "lift" },
            align: "center",
            width: "15%",
          },
          {
            type: "label",
            title: vm.$t("Hints"),
            dataIndex: "hint",
            scopedSlots: { customRender: "hint" },
            align: "center",
            width: "50%",
          },
          {
            type: "edit",
            title: vm.$t("EditLabel"),
            dataIndex: "edit",
            scopedSlots: { customRender: "edit" },
            align: "center",
            width: "10%",
            onEdit: function (index, key) {
              onSetEditValue(index, key, vm);
            },
          },
        ],
      },
    ],
  };
  return content;
}

function createLiftControlContent(vm) {
  //iconItems
  let iconItems = [
    { key: 0, label: vm.$t("Up") },
    { key: 1, label: vm.$t("Down") },
    { key: 2, label: vm.$t("General") },
  ];

  //data
  let tableData = [];
  for (let i = 0; i < 2; i++) {
    let item = {
      key: i,
      index: vm.$t("Lift") + (i + 1),
      status: {
        value:
          vm.apiData.configData["Config.Features.LIFT" + (i + 1) + ".Status"],
        isWarn: false,
      },
      icon: {
        value:
          vm.apiData.configData["Config.Features.LIFT" + (i + 1) + ".Icon"],
        isWarn: false,
      },
      label: {
        value:
          vm.apiData.configData["Config.Features.LIFT" + (i + 1) + ".Label"],
        isWarn: false,
        disabled: false,
      },
      command: {
        value: vm.apiData.configData[
          "Config.Features.LIFT" + (i + 1) + ".HttpCommand"
        ]
          .replace("http://", "")
          .replace("https://", ""),
        addOnBefore: vm.apiData.configData[
          "Config.Features.LIFT" + (i + 1) + ".HttpCommand"
        ].startsWith("http://")
          ? "http://"
          : vm.apiData.configData[
              "Config.Features.LIFT" + (i + 1) + ".HttpCommand"
            ].startsWith("https://")
          ? "https://"
          : "http://",
        isWarn: false,
        disabled: false,
      },
    };
    tableData.push(item);
  }
  //content
  let content = {
    key: "liftControl",
    title: vm.$t("LiftControl"),
    titleDescription: vm.$t("LiftControlDesc"),
    items: [
      {
        type: "table",
        key: "liftControl",
        tableColumns: [
          {
            type: "label",
            title: vm.$t("Name"),
            dataIndex: "index",
            scopedSlots: { customRender: "index" },
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
            width: "15%",
          },
          {
            type: "select",
            title: vm.$t("IconLabel"),
            dataIndex: "icon",
            scopedSlots: { customRender: "icon" },
            align: "center",
            selectItems: iconItems,
            width: "15%",
          },
          {
            type: "input",
            title: vm.$t("Label"),
            dataIndex: "label",
            scopedSlots: { customRender: "label" },
            align: "center",
            width: "20%",
          },
          {
            type: "input",
            title: vm.$t("HttpCommand"),
            dataIndex: "command",
            scopedSlots: { customRender: "command" },
            align: "center",
            width: "40%",
            maxLength: 249,
            addOnBeforeItems: [
              { key: "http://", label: "http://" },
              { key: "https://", label: "https://" },
            ],
          },
        ],
        tableData: tableData,
      },
    ],
  };
  return content;
}

function getHintsTableData(vm, page) {
  vm.$axios.get("api/phoneLift/get?page=" + page).then((response) => {
    let tableData = [];
    let data = response.data.data;
    for (let i = 0; i < data.hintsList.length; i++) {
      let item = {
        key: data.hintsList[i].id,
        index: i + 1,
        code: data.hintsList[i].code,
        lift:
          data.hintsList[i].lift == -1
            ? vm.$t("All")
            : vm.$t("Lift") + (data.hintsList[i].lift + 1),
        hint: data.hintsList[i].hint,
        edit: i,
      };
      tableData.push(item);
    }
    getItemByKey(vm.data, "liftHints", "liftHints").tableData = tableData;
    getItemByKey(vm.data, "liftHints", "liftHints").tableFooterData.sum =
      data.sum;
    getItemByKey(vm.data, "liftHints", "liftHints").tableFooterData.pageNumber =
      data.pageNum;
    getItemByKey(
      vm.data,
      "liftHints",
      "liftHints"
    ).tableFooterData.curPage = page;
    getItemByKey(vm.data, "liftHints", "liftHints").selectedRowKeys = [];
  });
}

function onChangeHint(vm) {
  let addModalData = getItemByKey(vm.data, "liftHints", "liftHints")
    .tableHeadData.addModalData;
  let lift = addModalData.items[getIndexByKey(addModalData.items, "lift")];
  let hint = addModalData.items[getIndexByKey(addModalData.items, "hint")];
  let code = addModalData.items[getIndexByKey(addModalData.items, "code")];
  let id = addModalData.key;

  let errFlag = false;
  if (code.value == "") {
    code.isWarn = true;
    code.warnLabel = vm.$t("EmptyErr");
    errFlag = true;
  }
  if (isNaN(code.value)) {
    code.isWarn = true;
    code.warnLabel = vm.$t("LiftCodeErr");
    errFlag = true;
  }

  if (hint.value == "") {
    hint.isWarn = true;
    errFlag = true;
  }

  if (errFlag) {
    return;
  }

  let data = {
    code: code.value,
    hint: hint.value,
    lift: lift.value,
    id: id,
  };

  let action = id >= 0 ? "edit" : "add";

  let requestData = {
    target: "phoneLift",
    action: action,
    data: data,
  };
  vm.$axios.post("api", requestData).then((response) => {
    let ret = response.data.retcode;
    if (ret == 0) {
      code.value = "";
      hint.value = "";
      lift.value = -1;
      let page = 0;
      let tableItem = getItemByKey(vm.data, "liftHints", "liftHints");
      if (action == "add") {
        //页面数据变化
        page = Math.ceil(
          (tableItem.tableFooterData.sum + 1) /
            tableItem.tableFooterData.pageNumber
        );
      } else {
        page = tableItem.tableFooterData.curPage;
      }
      getHintsTableData(vm, page);
      //关闭窗口并展示成功
      addModalData.visible = false;
      showRequestSuccess(vm);
    } else if (ret == 7) {
      code.isWarn = true;
      code.warnLabel = vm.$t("LiftHintCodeExist");
    } else if (ret == 10) {
      showErrorInfo(vm, vm.$t("LiftHintAddMaxErr"));
    }
  });
}

function onSetEditValue(index, key, vm) {
  let tableItem = getItemByKey(vm.data, "liftHints", "liftHints");
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "lift")
  ].value = tableItem.tableData[index].lift;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "code")
  ].disabled = true;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "code")
  ].value = tableItem.tableData[index].code;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "hint")
  ].value = tableItem.tableData[index].hint;
}

function onDeleteHint(vm, type) {
  if (
    !confirm(
      type == "all" ? vm.$t("DeleteAllConfirm") : vm.$t("DeleteSelectedConfirm")
    )
  ) {
    return;
  }
  let selectedRowKeys = getItemByKey(vm.data, "liftHints", "liftHints")
    .selectedRowKeys;
  let requestData = {
    target: "phoneLift",
    action: "del",
    data: {
      type: type,
      ids: selectedRowKeys,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm, vm.$t("HintDeleteSuccess"));
    let tableFooterData = getItemByKey(vm.data, "liftHints", "liftHints")
      .tableFooterData;
    if (type != "all") {
      let sumPage = Math.ceil(
        (tableFooterData.sum - selectedRowKeys.length) /
          tableFooterData.pageNumber
      );
      sumPage = sumPage == 0 ? 1 : sumPage;
      let page =
        tableFooterData.curPage >= sumPage ? sumPage : tableFooterData.curPage;
      getHintsTableData(vm, page);
    } else {
      getHintsTableData(vm, 1);
    }
  });
}

function onImport(vm) {
  let modal = getItemByKey(vm.data, "liftHints", "liftHints").tableHeadData
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
    .post("api/phoneLift/import", upData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      if (res.data.retcode == 17) {
        showErrorInfo(vm, vm.$t("TooManyMonitorsWarning"));
        item.value.fileName = vm.$t("UpgradeFilePath");
        item.value.fileData = {};
        modal.visible = false;
      } else if (res.data.retcode == 0) {
        showRequestSuccess(vm, vm.$t("ImportSuccess"));
        item.value.fileName = vm.$t("UpgradeFilePath");
        item.value.fileData = {};
        modal.visible = false;
      } else if (res.data.retcode == -1){
        showErrorInfo(vm, vm.$t("FileFormatWarning"));
      }
      modal.confirmLoading = false;
      let page = getItemByKey(vm.data, "liftHints", "liftHints").tableFooterData
        .curPage;
      getHintsTableData(vm, page);
    });
}

function onExport(vm, type) {
  let requestData = {
    target: "phoneLift",
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
</script>