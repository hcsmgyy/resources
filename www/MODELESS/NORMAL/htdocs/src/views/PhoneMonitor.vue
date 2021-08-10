<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  deepClone,
  getItemByKey,
  getIndexByKey,
  showWarningInfo,
  showErrorInfo
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
    },
  },
};

function setChangedData(vm, event) {
  if (event.contentKey == "monitorSetting") {
    vm.changedCfgData[event.itemKey] = event.newVal;
  } 
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneMonitor",
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
  vm.$axios.get("api/phoneMonitor/info").then((response) => {
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
      firstTitle: vm.$t("Phone"),
      secondTitle: vm.$t("PhoneMonitor"),
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

  vm.data.contents.push(createMonitorSettingContent(vm));
  vm.data.contents.push(createDoorPhoneContent(vm));
  getDoorPhoneTableData(vm, 1);
}

function createDoorPhoneContent(vm) {
  //添加框
  let addModalData = {
    title: vm.$t("AddMonitor") ,
    key: -1,
    cancelBtnLabel: vm.$t("Cancel"),
    submitBtnLabel: vm.$t("Submit"),
    visible: false,
    showFooter: true,
    items: [
      {
        title: vm.$t("MonitorDeviceNumber"),
        type: "input",
        key: "deviceNumber",
        value: "",
        placeholder: vm.$t("DeviceNumber"),
        description: vm.$t("DeviceNumberDesc"),
      },
      {
        title: vm.$t("DeviceName"),
        type: "input",
        key: "deviceName",
        value: "",
        isWarn: false,
        warnLabel: vm.$t("MonitorDeviceNameNoEmpty"),
        description: vm.$t("DeviceNameDesc"),
      },
      {
        title: vm.$t("DoorPhoneURL"),
        type: "input",
        key: "address",
        value: "",
        isWarn: false,
        warnLabel: vm.$t("MonitorRTSPNoEmpty"),
        addOnBefore: "rtsp://",
        maxLength:120,
        description: vm.$t("RTSPAddressDesc"),
      },
      {
        title: vm.$t("UserName"),
        type: "input",
        key: "userName",
        value: "",
        description: vm.$t("MonitorUserNameDesc"),
      },
      {
        title: vm.$t("DoorSettingWebRelayPwd"),
        type: "input",
        key: "password",
        value: "",
        inputType: "password",
        description: vm.$t("MonitorPasswordDesc"),
      },
      {
        title: vm.$t("DisplayInCall"),
        type: "select",
        key: "displayInCall",
        value: "",
        defaultValue: 0,
        selectItems: [
          { key: 0, label: vm.$t("Disabled") },
          { key: 1, label: vm.$t("Enabled") },
        ],
        description: vm.$t("MonitorDisplayInCallDesc"),
      },
    ],
    onConfirm: function () {
      onChangeDoorPhone(vm);
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
        title: vm.$t("FileLabel") +" (.xml)",
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
    onExport:function(type){
      onExport(vm, type) 
    }
  };
  //table footer
  let tableFooterData = {
    onDelete: function () {
      onDeleteDoorPhone(vm, "select");
    },
    onDeleteAll: function () {
      onDeleteDoorPhone(vm, "all");
    },
    onPageChange: function (page) {
      getDoorPhoneTableData(vm, page);
    },
    sum: 0,
    pageNumber: 10,
    curPage: 0,
    deleteDisabled: true,
    deleteAllDisabled: false,
  };

  //content
  let content = {
    key: "doorPhone",
    title: vm.$t("Doorphone"),
    titleDescription: vm.$t("DoorPhoneDesc"),
    items: [
      {
        type: "table",
        key: "doorPhone",
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
            title: vm.$t("MonitorDeviceNumber"),
            dataIndex: "deviceNumber",
            scopedSlots: { customRender: "deviceNumber" },
            align: "center",
            width: "15%",
          },
          {
            type: "label",
            title: vm.$t("DeviceName"),
            dataIndex: "deviceName",
            scopedSlots: { customRender: "deviceName" },
            align: "center",
            width: "10%",
          },
          {
            type: "label",
            title: vm.$t("DoorPhoneURL"),
            dataIndex: "address",
            scopedSlots: { customRender: "address" },
            align: "center",
            width: "30%",
          },
          {
            type: "label",
            title: vm.$t("UserName"),
            dataIndex: "userName",
            scopedSlots: { customRender: "userName" },
            align: "center",
            width: "10%",
          },
          {
            type: "label",
            title: vm.$t("DisplayInCall"),
            dataIndex: "displayInCall",
            scopedSlots: { customRender: "displayInCall" },
            align: "center",
            width: "15%",
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

function createMonitorSettingContent(vm) {
  let displayItems = [
    { key: 0, label: vm.$t("MultipleMonitorDisplay") },
    { key: 1, label: vm.$t("SingleMonitorDisplay") },
  ];
  let content = {
    key: "monitorSetting",
    title: vm.$t("MonitorSetting"),
    titleDescription: vm.$t("MonitorSettingDesc"),
    items: [
      {
        title: vm.$t("MonitorDisplay"),
        type: "select",
        key: "Config.Settings.MONITOR.MonitorDisplay",
        value: vm.apiData.configData["Config.Settings.MONITOR.MonitorDisplay"],
        selectItems: displayItems,
        description: vm.$t("MonitorDisplayDesc"),
      },
    ],
  };
  return content;
}

function getDoorPhoneTableData(vm, page) {
  vm.$axios.get("api/phoneMonitor/get?page=" + page).then((response) => {
    let tableData = [];
    let data = response.data.data;
    for (let i = 0; i < data.doorPhoneList.length; i++) {
      let item = {
        key: data.doorPhoneList[i].id,
        index: i + 1,
        deviceNumber: data.doorPhoneList[i].deviceNumber,
        deviceName: data.doorPhoneList[i].deviceName,
        address: data.doorPhoneList[i].address,
        userName: data.doorPhoneList[i].userName,
        password: data.doorPhoneList[i].password,
        displayInCall:
          data.doorPhoneList[i].displayInCall == 0
            ? vm.$t("Disabled")
            : vm.$t("Enabled"),
        edit: i,
      };
      tableData.push(item);
    }
    getItemByKey(vm.data, "doorPhone", "doorPhone").tableData = tableData;
    getItemByKey(vm.data, "doorPhone", "doorPhone").tableFooterData.sum =
      data.sum;
    getItemByKey(vm.data, "doorPhone", "doorPhone").tableFooterData.pageNumber =
      data.pageNum;
    getItemByKey(
      vm.data,
      "doorPhone",
      "doorPhone"
    ).tableFooterData.curPage = page;
    getItemByKey(vm.data, "doorPhone", "doorPhone").selectedRowKeys = [];
  });
}

function onChangeDoorPhone(vm) {
  console.log("aaa");
  let addModalData = getItemByKey(vm.data, "doorPhone", "doorPhone")
    .tableHeadData.addModalData;
  let deviceName =
    addModalData.items[getIndexByKey(addModalData.items, "deviceName")];
  let deviceNumber =
    addModalData.items[getIndexByKey(addModalData.items, "deviceNumber")];
  let id = addModalData.key;
  let address =
    addModalData.items[getIndexByKey(addModalData.items, "address")];
  let userName =
    addModalData.items[getIndexByKey(addModalData.items, "userName")];
  let password =
    addModalData.items[getIndexByKey(addModalData.items, "password")];
  let displayInCall =
    addModalData.items[getIndexByKey(addModalData.items, "displayInCall")];

  let errFlag = false;
  if (deviceName.value == "") {
    deviceName.isWarn = true;
    deviceName.warnLabel = vm.$t("MonitorDeviceNameNoEmpty");
    errFlag = true;
  }

  if (address.value == "") {
    address.isWarn = true;
    errFlag = true;
  }

  if (errFlag) {
    return;
  }


  let data = {
    deviceName: deviceName.value,
    deviceNumber: deviceNumber.value,
    address: "rtsp://" + address.value,
    userName: userName.value,
    password: password.value,
    displayInCall: displayInCall.value,
    id: id,
  };

  let action = id >= 0 ? "edit" : "add";

  let requestData = {
    target: "phoneMonitor",
    action: action,
    data: data,
  };
  vm.$axios.post("api", requestData).then((response) => {
    let ret = response.data.retcode;
    if (ret == 0) {
      deviceName.value = "";
      deviceNumber.value = "";
      address.value = "";
      userName.value = "";
      password.value = "";
      displayInCall.value = "";
      let page = 0;
      let tableItem = getItemByKey(vm.data, "doorPhone", "doorPhone");
      if (action == "add") {
        //页面数据变化
        page = Math.ceil(
          (tableItem.tableFooterData.sum + 1) /
            tableItem.tableFooterData.pageNumber
        );
      } else {
        page = tableItem.tableFooterData.curPage;
      }
      getDoorPhoneTableData(vm, page);
      //关闭窗口并展示成功
      addModalData.visible = false;
      showRequestSuccess(vm);
    } else if (ret == -2) {
      //hcsm
      console.log("Bbb");
      deviceName.isWarn = true;
      deviceName.warnLabel = vm.$t("MonitorExistWarning");
    }
  });
}

function onSetEditValue(index, key, vm) {
  let tableItem = getItemByKey(vm.data, "doorPhone", "doorPhone");
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "deviceName")
  ].value = tableItem.tableData[index].deviceName;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "deviceNumber")
  ].value = tableItem.tableData[index].deviceNumber;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "address")
  ].value = tableItem.tableData[index].address.replace("rtsp://", "");
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "userName")
  ].value = tableItem.tableData[index].userName;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "password")
  ].value = tableItem.tableData[index].password;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "displayInCall")
  ].value = (tableItem.tableData[index].displayInCall == vm.$t("Disabled")?0:1);
}

function onDeleteDoorPhone(vm, type) {
  if (
    !confirm(
      type == "all" ? vm.$t("DeleteAllConfirm") : vm.$t("DeleteSelectedConfirm")
    )
  ) {
    return;
  }
  let selectedRowKeys = getItemByKey(vm.data, "doorPhone", "doorPhone")
    .selectedRowKeys;
  let requestData = {
    target: "phoneMonitor",
    action: "del",
    data: {
      type: type,
      ids: selectedRowKeys,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm, vm.$t("DeleteMonitorSuccess"));
    let tableFooterData = getItemByKey(vm.data, "doorPhone", "doorPhone")
      .tableFooterData;
    if (type != "all") {
      let sumPage = Math.ceil(
        (tableFooterData.sum - selectedRowKeys.length) /
          tableFooterData.pageNumber
      );
      sumPage = sumPage == 0 ? 1 : sumPage;
      let page =
        tableFooterData.curPage >= sumPage ? sumPage : tableFooterData.curPage;
      getDoorPhoneTableData(vm, page);
    } else {
      getDoorPhoneTableData(vm, 1);
    }
  });
}

function onExport(vm, type) {
  let requestData = {
    target: "phoneMonitor",
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
  let modal = getItemByKey(vm.data, "doorPhone", "doorPhone").tableHeadData
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
    .post("api/phoneMonitor/import", upData, {
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
      let page = getItemByKey(vm.data, "doorPhone", "doorPhone").tableFooterData
        .curPage;
      getDoorPhoneTableData(vm, page);
    });
}
</script>