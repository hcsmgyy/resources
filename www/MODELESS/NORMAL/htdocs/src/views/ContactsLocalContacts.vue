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
  isAValidDialedNumber,
  showErrorInfo,
} from "@/js/common.js";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      searchValue: "",
      changedCfgData: {},
      submitCfgData: {},
      apiData: {},
      data: {
        getDataSuccess: false,
      },
      currentContactList: [],
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
  if (
    event.contentKey == "contactsList" &&
    event.itemKey == "contactListSelect"
  ) {
    getContactsTableData(vm, 1);
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneLocalContact",
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
  vm.$axios.get("api/phoneLocalContact/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    createPageData(vm);
    var contactListValue = getItemByKey(
        vm.data,
        "contactsList",
        "contactListSelect"
    ).value;
    if(contactListValue == "AllContacts"){
      getItemByKey(
        vm.data,
        "contactsList",
        "contactListTable"
      ).tableFooterData.moveToValue = "0";
    } else{
      getItemByKey(
        vm.data,
        "contactsList",
        "contactListTable"
      ).tableFooterData.moveToValue = "1"; 
    }
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
      firstTitle: vm.$t("Contacts"),
      secondTitle: vm.$t("LocalContacts"),
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

  vm.data.contents.push(createContactListContent(vm));
  vm.data.contents.push(createDialNumberContent(vm));
  getContactsTableData(vm, 1);
}

function createDialNumberContent(vm) {
  let accountItems = [{ key: 0, label: vm.$t("Auto") }];
  for (let i = 0; i < vm.apiData.data.accountList.length; i++) {
    let item = {
      key: vm.apiData.data.accountList[i].index,
      label:
        vm.$t("Line") +
        vm.apiData.data.accountList[i].index +
        ": " +
        vm.apiData.data.accountList[i].name,
    };
    accountItems.push(item);
  }

  let content = {
    key: "dialNumber",
    title: vm.$t("DialNumber"),
    titleDescription: vm.$t("DialNumberDesc"),
    items: [
      {
        type: "dialInput",
        key: "dialInput",
        selectItems: accountItems,
        description: vm.$t("DialNumberDesc"),
      },
    ],
  };
  return content;
}

function createContactListContent(vm) {
  //添加框
  let addModalData = {
    title: vm.$t("AddContact") ,
    key: -1,
    cancelBtnLabel: vm.$t("Cancel"),
    submitBtnLabel: vm.$t("Submit"),
    visible: false,
    showFooter: true,
    items: [
      {
        title: vm.$t("Name"),
        type: "input",
        key: "name",
        value: "",
        isWarn: false,
        warnLabel: vm.$t("ContactNameNoEmpty"),
        description: vm.$t("ContactNameDesc"),
      },
      {
        title: vm.$t("NumberLabel"),
        type: "input",
        key: "number",
        value: "",
        isWarn: false,
        warnLabel: vm.$t("PleaseCheckSubmitData"),
        description: vm.$t("ContactNumberDesc"),
      },
      {
        title: vm.$t("Group"),
        type: "select",
        key: "group",
        value: "",
        defaultValue: 0,
        selectItems: [
          { key: 0, label: vm.$t("Default") },
          { key: 1, label: vm.$t("BlackList") },
        ],
        description: vm.$t("ContactGroupDesc"),
      },
      {
        title: vm.$t("DialAccount"),
        type: "select",
        key: "account",
        value: "",
        defaultValue: 0,
        selectItems: [
          { key: 0, label: vm.$t("Account") + 1 },
          { key: 1, label: vm.$t("Account") + 2 },
        ],
        description: vm.$t("DialAccountDesc"),
      },
    ],
    onConfirm: function () {
      onChangeContact(vm);
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
        title: vm.$t("FileLabel") + " (.xml/.csv)",
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
  //table head
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
  //table footer
  let tableFooterData = {
    onDelete: function () {
      onDeleteContact(vm, "select");
    },
    onDeleteAll: function () {
      onDeleteContact(vm, "all");
    },
    onPageChange: function (page) {
      getContactsTableData(vm, page);
    },
    moveChange: function (){
      moveContactGroup(vm);
    },
    sum: 0,
    pageNumber: 5,
    curPage: 0,
    deleteDisabled: true,
    deleteAllDisabled: false,
    isShowMove: true,
    moveToValue: "0",
  };
  //content
  let content = {
    key: "contactsList",
    title: vm.$t("ContactsListSetting"),
    titleDescription: vm.$t("ContactListSettingDesc"),
    items: [
      {
        title: vm.$t("ContactsList"),
        type: "select",
        key: "contactListSelect",
        value: "AllContacts",
        selectItems: [
          { key: "AllContacts", label: vm.$t("AllContacts") },
          { key: "BlackList", label: vm.$t("BlackList") },
        ],
        description: vm.$t("ContactListDesc"),
      },
      {
        title: vm.$t("Search"),
        type: "input",
        key: "search",
        value: "",
        showBtn: true,
        isWarn: false,
        warnLabel: vm.$t("ConSearchPrompt"),
        onSearch: function (value) {
          onContactSearch(vm, value);
        },
        onReset: function () {
          onContactSearchReset(vm);
        },
        description: vm.$t("ContactSearchDesc"),
      },
      {
        type: "table",
        key: "contactListTable",
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
            title: vm.$t("Name"),
            dataIndex: "name",
            scopedSlots: { customRender: "name" },
            align: "center",
            width: "30%",
          },
          {
            type: "label",
            title: vm.$t("NumberLabel"),
            dataIndex: "number",
            scopedSlots: { customRender: "number" },
            align: "center",
            width: "30%",
          },
          // {
          //   type: "label",
          //   title: vm.$t("Group"),
          //   dataIndex: "group",
          //   scopedSlots: { customRender: "group" },
          //   align: "center",
          //   width: "20%",
          // },
          {
            type: "label",
            title: vm.$t("Account"),
            dataIndex: "account",
            scopedSlots: { customRender: "account" },
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

function getContactsTableData(vm, page) {
  let group = getItemByKey(vm.data, "contactsList", "contactListSelect").value;
  vm.$axios
    .get(
      "api/phoneLocalContact/get?page=" +
        page +
        "&group=" +
        group +
        "&search=" +
        vm.searchValue
    )
    .then((response) => {
      let tableData = [];
      let data = response.data.data;
      vm.currentContactList = response.data.data.contactList;
      for (let i = 0; i < data.contactList.length; i++) {
        let item = {
          key: data.contactList[i].id,
          index: i + 1,
          name: data.contactList[i].name,
          number: data.contactList[i].number,
          group:
            data.contactList[i].group == "BlockList"
              ? 1
              : 0,
          account: vm.$t("Account") + (data.contactList[i].account + 1),
          edit: i,
        };
        tableData.push(item);
      }
      getItemByKey(
        vm.data,
        "contactsList",
        "contactListTable"
      ).tableData = tableData;
      getItemByKey(
        vm.data,
        "contactsList",
        "contactListTable"
      ).tableFooterData.sum = data.sum;
      getItemByKey(
        vm.data,
        "contactsList",
        "contactListTable"
      ).tableFooterData.pageNumber = data.pageNum;
      getItemByKey(
        vm.data,
        "contactsList",
        "contactListTable"
      ).tableFooterData.curPage = page;
      getItemByKey(
        vm.data,
        "contactsList",
        "contactListTable"
      ).selectedRowKeys = [];

      if (group == "AllContacts"){
        getItemByKey(
          vm.data,
          "contactsList",
          "contactListTable"
        ).tableFooterData.moveToValue = "0";
      } else {
        getItemByKey(
          vm.data,
          "contactsList",
          "contactListTable"
        ).tableFooterData.moveToValue = "1";
      }
    });
}

function onChangeContact(vm) {
  let addModalData = getItemByKey(vm.data, "contactsList", "contactListTable")
    .tableHeadData.addModalData;
  let name = addModalData.items[getIndexByKey(addModalData.items, "name")];
  let number = addModalData.items[getIndexByKey(addModalData.items, "number")];
  let group = addModalData.items[getIndexByKey(addModalData.items, "group")];
  let account =
    addModalData.items[getIndexByKey(addModalData.items, "account")];
  let id = addModalData.key;

  let errFlag = false;
  if (name.value == "" && group.value == 0) {
    name.isWarn = true;
    name.warnLabel = vm.$t("NameEmptyWarning");
    errFlag = true;
  }
  if (!isAValidDialedNumber(number.value)) {
    number.isWarn = true;
    errFlag = true;
  }

  if (errFlag) {
    return;
  }

  let oriGroup = 0;
  if (id >= 0) {
    for (let i = 0; i < vm.currentContactList.length; i++) {
      if (vm.currentContactList[i].id == id) {
        oriGroup = vm.currentContactList[i].group == "BlockList" ? 1 : 0;
      }
    }
  }

  if (oriGroup != group.value && id >= 0) {
    if (oriGroup == 0){
      if (!confirm(vm.$t("MoveToBLConfirm"))){
        return;
      } 
    } else {
      if (!confirm(vm.$t("MoveFrBLConfirm"))){
        return;
      }
    }
  }

  let data = {
    name: name.value,
    number: number.value,
    group: group.value,
    oriGroup: oriGroup,
    account: account.value,
    id: id,
  };
  let action = id >= 0 ? "edit" : "add";

  let requestData = {
    target: "phoneLocalContact",
    action: action,
    data: data,
  };
  vm.$axios.post("api", requestData).then((response) => {
    let ret = response.data.retcode;
    if (ret == 0) {
      name.value = "";
      number.value = "";
      group.value = 0;
      account.value = 0;
      let page = 0;
      let tableItem = getItemByKey(vm.data, "contactsList", "contactListTable");
      if (action == "add") {
        //页面数据变化
        page = Math.ceil(
          (tableItem.tableFooterData.sum + 1) /
            tableItem.tableFooterData.pageNumber
        );
      } else {
        page = tableItem.tableFooterData.curPage;
      }
      getContactsTableData(vm, page);
      //关闭窗口并展示成功
      addModalData.visible = false;
      showRequestSuccess(vm);
    } else if (ret == 7) {
      name.isWarn = true;
      name.warnLabel = vm.$t("SameNameWarning");
    } else if (ret == 17) {
      showErrorInfo(vm, vm.$t("TooManyContactsWarning"));
    } else if (ret == 18) {
      showErrorInfo(vm, vm.$t("TooManyBLWarning"));
    }
  });
}

function onSetEditValue(index, key, vm) {
  let tableItem = getItemByKey(vm.data, "contactsList", "contactListTable");
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "number")
  ].value = tableItem.tableData[index].number;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "name")
  ].value = tableItem.tableData[index].name;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "account")
  ].value = tableItem.tableData[index].account;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "group")
  ].value = tableItem.tableData[index].group;
}

function moveContactGroup(vm) {
  let selectedRowKeys = getItemByKey(
    vm.data,
    "contactsList",
    "contactListTable"
  ).selectedRowKeys;
  let oriContactGroup = getItemByKey(
      vm.data,
      "contactsList",
      "contactListSelect"
  ).value;
  if (selectedRowKeys == ""){
    showErrorInfo(vm, vm.$t("ValueMustSelectedWarning"));
    return;
  }
  let requestData = {
    target: "phoneLocalContact",
    action: "edit",
    data: {
      moveTo: 1,
      ids: selectedRowKeys,
      oriGroup: oriContactGroup,
    },
  };
  if (oriContactGroup == "AllContacts"){
    if (!confirm(vm.$t("MoveToBLConfirm"))){
      return;
    } 
  } else {
    if (!confirm(vm.$t("MoveFrBLConfirm"))){
      return;
    }
  }
  vm.$axios.post("api", requestData).then((response) => {
    let tableFooterData = getItemByKey(
      vm.data,
      "contactsList",
      "contactListTable"
    ).tableFooterData;
    getContactsTableData(vm, tableFooterData.curPage);
  });
}

function onDeleteContact(vm, type) {
  let group = getItemByKey(vm.data, "contactsList", "contactListSelect").value;
  if (
    !confirm(
      type == "all" ? vm.$t("DeleteAllConfirm") : vm.$t("DeleteSelectedConfirm")
    )
  ) {
    return;
  }
  let selectedRowKeys = getItemByKey(
    vm.data,
    "contactsList",
    "contactListTable"
  ).selectedRowKeys;
  let requestData = {
    target: "phoneLocalContact",
    action: "del",
    data: {
      type: type,
      ids: selectedRowKeys,
      group: group,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm, vm.$t("HintDeleteSuccess"));
    let tableFooterData = getItemByKey(
      vm.data,
      "contactsList",
      "contactListTable"
    ).tableFooterData;
    if (type != "all") {
      let sumPage = Math.ceil(
        (tableFooterData.sum - selectedRowKeys.length) /
          tableFooterData.pageNumber
      );
      sumPage = sumPage == 0 ? 1 : sumPage;
      let page =
        tableFooterData.curPage >= sumPage ? sumPage : tableFooterData.curPage;
      getContactsTableData(vm, page);
    } else {
      getContactsTableData(vm, 1);
    }
  });
}

function onExport(vm, type) {
  let requestData = {
    target: "phoneLocalContact",
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
  let modal = getItemByKey(vm.data, "contactsList", "contactListTable")
    .tableHeadData.importModalData;
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
    .post("api/phoneLocalContact/import", upData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      if (res.data.retcode == -2) {
        showWarningInfo(vm, vm.$t("TooManyGroupsWarning"));
        item.value.fileName = vm.$t("UpgradeFilePath");
        item.value.fileData = {};
        modal.visible = false;
      } else if (res.data.retcode == 0) {
        showRequestSuccess(vm, vm.$t("ContactImportSuccess"));
        item.value.fileName = vm.$t("UpgradeFilePath");
        item.value.fileData = {};
        modal.visible = false;
      } else if (res.data.retcode == -1){
        showErrorInfo(vm, vm.$t("FileFormatWarning"));
      } else if (res.data.retcode == 17){
        showErrorInfo(vm, vm.$t("TooManyContactsWarning"));
      } else {
        showErrorInfo(vm, vm.$t("ContactImportFail"));
      }
      modal.confirmLoading = false;
      let page = getItemByKey(vm.data, "contactsList", "contactListTable")
        .tableFooterData.curPage;
      getContactsTableData(vm, page);
    });
}

function onContactSearch(vm, value) {
  if (value == "") {
    getItemByKey(vm.data, "contactsList", "search").isWarn = true;
    return;
  }
  // let groupSelectItem = getItemByKey(
  //   vm.data,
  //   "contactsList",
  //   "contactListSelect"
  // );
  // groupSelectItem.selectItems = [
  //   { key: "AllContacts", label: vm.$t("AllContacts") },
  //   { key: "BlackList", label: vm.$t("BlackList") },
  // ];
  // groupSelectItem.value = "AllContacts";
  vm.searchValue = value;
  getContactsTableData(vm, 1);
}

function onContactSearchReset(vm) {
  let groupSelectItem = getItemByKey(
    vm.data,
    "contactsList",
    "contactListSelect"
  );
  groupSelectItem.selectItems = [
    { key: "AllContacts", label: vm.$t("AllContacts") },
    { key: "BlackList", label: vm.$t("BlackList") },
  ];
  groupSelectItem.value = "AllContacts";
  vm.searchValue = "";
  getItemByKey(vm.data, "contactsList", "search").value = "";
  getContactsTableData(vm, 1);
}
</script>