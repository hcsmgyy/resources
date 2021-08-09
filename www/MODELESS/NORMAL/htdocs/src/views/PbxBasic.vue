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
  showErrorInfo,
  isPort
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
      interObj: Object,
      dotNumArr:[0,0],
      dotTxtArr:["",""],
      timeCntArr:[0,0],
    };
  },
  created() {
    getData(this);
    this.interObj = setInterval(() =>{
       getPBXStatus(this);
    }, 500);
  },
  destroyed() {
    clearInterval(this.interObj);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      setChangedData(this, event);
    },
  },
};

function setChangedData(vm, event) {

}

function getPBXStatus(vm) {
  vm.$axios.get("api/pbxBasic/info").then((response) => {
    vm.getDataSuccess = true;
    OnStatusAction(vm,response.data.data.PbxInformation.Status);
    setPortEnabled(vm,response.data.data.PbxInformation.Status);
  });
}

function OnStatusAction(vm,statusValue){
  let item = getItemByKey(
    vm.data,
    "PBXBasicSetting",
    "PbxStatus"
  );
  if(statusValue == "3"){
  item.value = vm.$t("PBXStatusStarted");
    clearInterval(vm.interObj);
  } else if(statusValue == "2"){
    if(vm.dotNumArr[0] >= 5){
      vm.dotNumArr[0] = 0;
      vm.dotTxtArr[0] = "";
    }
    item.value = vm.$t("PBXStatusStarting") + vm.dotTxtArr[0];
    vm.dotTxtArr[0] += ".";
    vm.dotNumArr[0]++;
    vm.timeCntArr[0]++;
  } else if(statusValue == "4"){
    if(vm.dotNumArr[0] >= 5)
		{
			vm.dotNumArr[0] = 0;
			vm.dotTxtArr[0] = "";
		}
		item.value =  vm.$t("PBXStatusStopping") + vm.dotTxtArr[0];
		vm.dotTxtArr[0] += ".";
		vm.dotNumArr[0]++;
		vm.timeCntArr[0]++;
  } else if(statusValue == "1"){
    item.value = vm.$t("PBXStatusStopped");
    clearInterval(vm.interObj);
  } else if(statusValue == "0"){
    item.value = vm.$t("PBXStatusUnReady");
		clearInterval(vm.interObj);
	} else{
    if(vm.dotNumArr[1] >= 5){
      vm.dotNumArr[1] = 0;
      vm.dotTxtArr[1] = "";
    }
    if(vm.timeCntArr[1] > 20){
      clearInterval(vm.interObj);
      vm.dotNumArr[1] = vm.timeCntArr[1] = 0;
      item.value = vm.$t("UnRegistered");
      vm.dotTxtArr[1] = "";
    } else{
      item.value = vm.$t("UnRegistered");
    }
    vm.dotTxtArr[1] += ".";
    vm.dotNumArr[1]++;
    vm.timeCntArr[1]++;
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let data = {};
  //model
  let modelItem = getItemByKey(
    vm.data,
    "PBXBasicSetting",
    "PbxMediaModel"
  );
  if(modelItem.value != vm.apiData.data.PbxInformation.MediaModel) {
    vm.apiData.data.PbxInformation.MediaModel = modelItem.value;
    data["PBXMediaModel"] = modelItem.value;
  }

  //service
  let serviceItem = getItemByKey(
    vm.data,
    "PBXBasicSetting",
    "PbxServiceEnabled"
  );
  if(serviceItem.value != vm.apiData.data.PbxInformation.PbxService) {
    vm.apiData.data.PbxInformation.PbxService = serviceItem.value;
    data["PBXService"] = serviceItem.value;
  }

  //port
  let portItem = getItemByKey(
    vm.data,
    "PBXBasicSetting",
    "PbxPort"
  );
  if(portItem.value != vm.apiData.data.PbxInformation.PbxPort) {
    vm.apiData.data.PbxInformation.PbxPort = portItem.value;
    data["PBXPort"] = portItem.value;
  }

  let requestData = {
    target: "pbxBasic",
    action: "set",
    configData: vm.submitCfgData,
    data: data,
  };

  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      showRequestSuccess(vm);
    }
    vm.data.submitLoading = false;
  });
}

function getData(vm) {
  vm.$axios.get("api/pbxBasic/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    createPageData(vm);
  });
}

function setPortEnabled(vm,statusValue) {
  let item = getItemByKey(
    vm.data,
    "PBXBasicSetting",
    "PbxPort"
  );
  item.disabled = (statusValue > 1);
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
      firstTitle: vm.$t("PBX"),
      secondTitle: vm.$t("PBXBasic"),
    },
    onSubmit: function () {
      getCommitData(vm);
      if (!checkCommitData(vm)) {
        return;
      }
      submitData(vm);
      vm.interObj = setInterval(() =>{
        getPBXStatus(vm);
      }, 500);
    },
    onCancel: function () {
      vm.data.cancelLoading = true;
      getData(vm);
    },
    submitLoading: false,
    cancelLoading: false,
    contents: [],
  };

  vm.data.contents.push(createPBXBasicContent(vm));
  getPBXTableData(vm, 1);
}

function createPBXBasicContent(vm) {
  //添加框
  let addModalData = {
    title: vm.$t("AddPBX"),
    key: -1,
    cancelBtnLabel: vm.$t("Cancel"),
    submitBtnLabel: vm.$t("Submit"),
    visible: false,
    showFooter: true,
    items: [
      {
        title: vm.$t("PBXUserName"),
        type: "input",
        key: "userName",
        value: "",
        isWarn: false,
        warnLabel: vm.$t("PBXUsernameError"),
        description: vm.$t("PBXUsernameDesc"),
      },
      {
        title: vm.$t("PasswordLabel"),
        type: "input",
        key: "password",
        value: "",
        maxLength: 32,
        isWarn: false,
        warnLabel: vm.$t("PBXPasswordEmpty"),
        description: vm.$t("PBXPasswordDesc"),
      },
      {
        title: vm.$t("PBXDisplayName"),
        type: "input",
        key: "displayName",
        value: "",
        isWarn: false,
        maxLength: 32,
        warnLabel: vm.$t("PBXDisplayNameEmpty"),
        description: vm.$t("PBXDisplayNameDesc"),
      },
      {
        title: vm.$t("PBXEnableStatus"),
        type: "select",
        key: "pbxStatus",
        value: "",
        defaultValue: 0,
        selectItems: [
          { key: 0, label: vm.$t("Disabled") },
          { key: 1, label: vm.$t("Enabled") },
        ],
        description: vm.$t("PBXAddStatusDesc"),
      },
    ],
    onConfirm: function () {
      onChangePBX(vm);
    },
  };

  //table head
  let tableHeadData = {
    addModalData: addModalData,
  };

  //table footer
  let tableFooterData = {
    onDelete: function () {
      onDeletePBXUser(vm, "select");
    },
    onDeleteAll: function () {
      onDeletePBXUser(vm, "all");
    },
    onPageChange: function (page) {
      getPBXTableData(vm, page);
    },
    sum: 0,
    pageNumber: 20,
    curPage: 0,
    deleteDisabled: true,
    deleteAllDisabled: false,
  };

  let content = {
    key: "PBXBasicSetting",
    title: vm.$t("PBXBasicLabel"),
    titleDescription: vm.$t("PBXBasicDesc"),
    items: [
      {
        title: vm.$t("PBXServiceEnable"),
        type: "checkbox",
        key: "PbxServiceEnabled",
        value: vm.apiData.data.PbxInformation.PbxService,
        description: vm.$t("PBXServiceEnableDesc"),
      },
      {
        title: vm.$t("PBXStatus"),
        type: "input",
        key: "PbxStatus",
        value: "",
        description: vm.$t("PBXStatusDesc"),
      },
      {
        title: vm.$t("MediaModel"),
        type: "select",
        key: "PbxMediaModel",
        description: vm.$t("MediaModelDesc"),
        value: vm.apiData.data.PbxInformation.MediaModel,
        selectItems: [
          { key: 0, label: vm.$t("Default") },
          { key: 1, label: vm.$t("Bypass") },
        ],
      },
      {
        title: vm.$t("PBXPort"),
        type: "input",
        key: "PbxPort",
        value: vm.apiData.data.PbxInformation.PbxPort,
        description: vm.$t("PBXPortDesc"),
        isWarn: false,
      },

      {
        type: "table",
        key: "pbxUserTable",
        showHead: true,
        showFooter: true,
        showRowSelection: true,
        selectedRowKeys: [],
        tableHeadData: tableHeadData,
        showImport: false,
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
            title: vm.$t("PBXUserName"),
            dataIndex: "userName",
            scopedSlots: { customRender: "userName" },
            align: "center",
            width: "15%",
          },
          {
            type: "label",
            title: vm.$t("PasswordLabel"),
            dataIndex: "password",
            scopedSlots: { customRender: "password" },
            align: "center",
            width: "15%",
          },
          {
            type: "label",
            title: vm.$t("PBXDisplayName"),
            dataIndex: "displayName",
            scopedSlots: { customRender: "displayName" },
            align: "center",
            width: "30%",
          },
          {
            type: "style-label",
            title: vm.$t("PBXEnableStatus"),
            dataIndex: "pbxStatus",
            scopedSlots: { customRender: "pbxStatus" },
            align: "center",
            width: "20%",
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

function getPBXTableData(vm, page) {
  vm.$axios.get("api/pbxBasic/get?page=" + page).then((response) => {
    let tableData = [];
    let data = response.data.data;

    for (let i = 0; i < data.pbxUserList.length; i++) {
      let statusValue = "";
      let isRedColor = false;
      if (data.pbxUserList[i].status == 0){
        statusValue = vm.$t("Disabled");
      } else if (data.pbxUserList[i].status == 1) {
        statusValue = vm.$t("Calling");
      } else if (data.pbxUserList[i].status == 2) {
        statusValue = vm.$t("Registered");
      } else if (data.pbxUserList[i].status == 3) {
        statusValue = vm.$t("UnRegistered");
        isRedColor = true;
      }
      let item = {
        key: data.pbxUserList[i].userName,
        index: i + 1,
        userName: data.pbxUserList[i].userName,
        password: data.pbxUserList[i].password,
        displayName: data.pbxUserList[i].displayName,
        pbxStatus: {
          isRedLabel: isRedColor,
          value: statusValue,
        },
        edit: i,
      };
      tableData.push(item);
    }
    getItemByKey(vm.data, "PBXBasicSetting", "pbxUserTable").tableData = tableData;
    getItemByKey(vm.data, "PBXBasicSetting", "pbxUserTable").tableFooterData.sum =
      data.sum;
    getItemByKey(vm.data, "PBXBasicSetting", "pbxUserTable").tableFooterData.pageNumber =
      data.pageNum;
    getItemByKey(
      vm.data,
      "PBXBasicSetting",
      "pbxUserTable"
    ).tableFooterData.curPage = page;
    getItemByKey(vm.data, "PBXBasicSetting", "pbxUserTable").selectedRowKeys = [];
  });
}

function onChangePBX(vm) {
  let addModalData = getItemByKey(vm.data, "PBXBasicSetting", "pbxUserTable")
    .tableHeadData.addModalData;
  let userName =
    addModalData.items[getIndexByKey(addModalData.items, "userName")];
  let password =
    addModalData.items[getIndexByKey(addModalData.items, "password")];
  let displayName =
    addModalData.items[getIndexByKey(addModalData.items, "displayName")];
  let pbxStatus =
    addModalData.items[getIndexByKey(addModalData.items, "pbxStatus")];

  let errFlag = false;
  //username
  if (userName.value == "" || isNaN(userName.value) || userName.value.length < 2 || userName.value.length > 5) {
    userName.isWarn = true;
    errFlag = true;
  }
  //password
  if (password.value == "") {
    password.isWarn = true;
    errFlag = true;
  }
  //displayName
  if (displayName.value == "") {
    displayName.isWarn = true;
    errFlag = true;
  }

  if (errFlag) {
    return;
  }


  let data = {
    userName: userName.value,
    password: password.value,
    displayName: displayName.value,
    pbxStatus: pbxStatus.value,
  };

  let requestData = {
    target: "pbxBasic",
    action: "add",
    data: data,
  };
  vm.$axios.post("api", requestData).then((response) => {
    let ret = response.data.retcode;
    if (ret == 0) {
      userName.value = "";
      password.value = "";
      displayName.value = "";
      pbxStatus.value = "";
      let page = 0;
      let tableItem = getItemByKey(vm.data, "PBXBasicSetting", "pbxUserTable");
      page = response.data.data.page + 1;
      getPBXTableData(vm, page);
      //关闭窗口并展示成功
      addModalData.visible = false;
      showRequestSuccess(vm);
    }
  });
}

function onSetEditValue(index, key, vm) {
  let tableItem = getItemByKey(vm.data, "PBXBasicSetting", "pbxUserTable");
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "userName")
  ].value = tableItem.tableData[index].userName;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "userName")
  ].disabled = true;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "password")
  ].value = tableItem.tableData[index].password;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "displayName")
  ].value = tableItem.tableData[index].displayName;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "pbxStatus")
  ].value = (tableItem.tableData[index].pbxStatus.value == vm.$t("Disabled")?0:1);
}

function onDeletePBXUser(vm, type) {
  if (
    !confirm(
      type == "all" ? vm.$t("DeleteAllConfirm") : vm.$t("DeleteSelectedConfirm")
    )
  ) {
    return;
  }
  let selectedRowKeys = getItemByKey(vm.data, "PBXBasicSetting", "pbxUserTable")
    .selectedRowKeys;
  let requestData = {
    target: "pbxBasic",
    action: "del",
    data: {
      type: type,
      userNames: selectedRowKeys,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm);
    let tableFooterData = getItemByKey(vm.data, "PBXBasicSetting", "pbxUserTable")
      .tableFooterData;
    if (type != "all") {
      let sumPage = Math.ceil(
        (tableFooterData.sum - selectedRowKeys.length) /
          tableFooterData.pageNumber
      );
      sumPage = sumPage == 0 ? 1 : sumPage;
      let page =
        tableFooterData.curPage >= sumPage ? sumPage : tableFooterData.curPage;
      getPBXTableData(vm, page);
    } else {
      getPBXTableData(vm, 1);
    }
  });
}

function checkCommitData(vm) {
  let success = true;
  //port
  let portItem = getItemByKey(
    vm.data,
    "PBXBasicSetting",
    "PbxPort"
  );
  
  if(portItem.value != vm.apiData.data.PbxInformation.PbxPort) {
    if(!(isPort(portItem.value) && (portItem.value>=1024))){
      portItem.isWarn = true;
      portItem.warnLabel = vm.$t("ServerPortRangeError");
      success = false;
    } else {
      var usedportlist = vm.apiData.data.PbxInformation.UsedPort.split("\n");
      for(var i=0;i<usedportlist.length;i++){
        if(usedportlist[i]==portItem.value){
          portItem.isWarn = true;
          portItem.warnLabel = vm.$t("WarningPortUsedAlready");
          success = false;
        }
      }
    }
  }
  return success;
}

</script>