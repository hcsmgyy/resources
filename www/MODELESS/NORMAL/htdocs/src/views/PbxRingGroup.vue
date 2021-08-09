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
      allUserItems: [],
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

}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "pbxRingGroup",
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
  vm.$axios.get("api/pbxRingGroup/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    vm.allUserItems = [];
    for (let i = 0; i < vm.apiData.data.pbxAllUserList.length; i++) {
      let item = {
        key: vm.apiData.data.pbxAllUserList[i].number,
        label: vm.apiData.data.pbxAllUserList[i].number,
      };
      vm.allUserItems.push(item);
    }
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
      firstTitle: vm.$t("PBX"),
      secondTitle: vm.$t("RingGroup"),
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

  vm.data.contents.push(createPBXRingGroupContent(vm));
  getPBXGroupTableData(vm, 1);
}

function createPBXRingGroupContent(vm) {
  //添加框
  let addModalData = {
    title: vm.$t("AddGroup"),
    key: -1,
    cancelBtnLabel: vm.$t("Cancel"),
    submitBtnLabel: vm.$t("Submit"),
    visible: false,
    showFooter: true,
    items: [
      {
        title: vm.$t("GroupName"),
        type: "input",
        key: "groupName",
        value: "",
        maxLength: 16,
        isWarn: false,
        warnLabel: vm.$t("PBXGroupNameEmpty"),
        description: vm.$t("PBXGroupNameDesc"),
      },
      {
        title: vm.$t("QuickDial"),
        type: "input",
        key: "quickDial",
        value: "",
        isWarn: false,
        warnLabel: vm.$t("PBXQuickDialError"),
        description: vm.$t("PBXGroupQuickDialDesc"),
      },
      {
        title: vm.$t("Member"),
        type: "select",
        key: "member",
        value: "",
        defaultValue: [],
        mode: "multiple",
        selectItems: vm.allUserItems,
        description: vm.$t("PBXGroupMemberDesc"),
      },
    ],
    onConfirm: function () {
      onChangePBXGroup(vm);
    },
  };

  //table head
  let tableHeadData = {
    addModalData: addModalData,
  };

  //table footer
  let tableFooterData = {
    onDelete: function () {
      onDeletePBXGroup(vm, "select");
    },
    onDeleteAll: function () {
      onDeletePBXGroup(vm, "all");
    },
    onPageChange: function (page) {
      getPBXGroupTableData(vm, page);
    },
    sum: 0,
    pageNumber: 10,
    curPage: 0,
    deleteDisabled: true,
    deleteAllDisabled: false,
  };

  let content = {
    key: "PBXRingGroupSetting",
    title: vm.$t("GroupSetting"),
    titleDescription: vm.$t("PBXGroupSettingDesc"),
    items: [
      {
        type: "table",
        key: "pbxRingGroupTable",
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
            title: vm.$t("GroupName"),
            dataIndex: "groupName",
            scopedSlots: { customRender: "groupName" },
            align: "center",
            width: "20%",
          },
          {
            type: "label",
            title: vm.$t("QuickDial"),
            dataIndex: "quickDial",
            scopedSlots: { customRender: "quickDial" },
            align: "center",
            width: "20%",
          },
          {
            type: "label",
            title: vm.$t("Member"),
            dataIndex: "member",
            scopedSlots: { customRender: "member" },
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
              onSetEditValue(index, key, vm);
            },
          },
        ],
      },
    ],
  };
  return content;
}

function getPBXGroupTableData(vm, page) {
  vm.$axios.get("api/pbxRingGroup/get?page=" + page).then((response) => {
    let tableData = [];
    let data = response.data.data;

    for (let i = 0; i < data.pbxGroupList.length; i++) {
      let item = {
        key: data.pbxGroupList[i].groupName,
        index: i + 1,
        groupName: data.pbxGroupList[i].groupName,
        quickDial: data.pbxGroupList[i].quickDial,
        member: data.pbxGroupList[i].member.substring(0,data.pbxGroupList[i].member.length-1),
        edit: i,
      };
      tableData.push(item);
    }
    getItemByKey(vm.data, "PBXRingGroupSetting", "pbxRingGroupTable").tableData = tableData;
    getItemByKey(vm.data, "PBXRingGroupSetting", "pbxRingGroupTable").tableFooterData.sum =
      data.sum;
    getItemByKey(vm.data, "PBXRingGroupSetting", "pbxRingGroupTable").tableFooterData.pageNumber =
      data.pageNum;
    getItemByKey(
      vm.data,
      "PBXRingGroupSetting",
      "pbxRingGroupTable"
    ).tableFooterData.curPage = page;
    getItemByKey(vm.data, "PBXRingGroupSetting", "pbxRingGroupTable").selectedRowKeys = [];
  });
}

function onChangePBXGroup(vm) {
  let addModalData = getItemByKey(vm.data, "PBXRingGroupSetting", "pbxRingGroupTable")
    .tableHeadData.addModalData;
  let groupName =
    addModalData.items[getIndexByKey(addModalData.items, "groupName")];
  let quickDial =
    addModalData.items[getIndexByKey(addModalData.items, "quickDial")];
  let member =
    addModalData.items[getIndexByKey(addModalData.items, "member")];
  let id = addModalData.key;

  let errFlag = false;

  //groupname
  if(groupName.value == "") {
    groupName.isWarn = true;
    errFlag = true;
  }

  //quickDial
  if (quickDial.value == "" || isNaN(quickDial.value) || quickDial.value.length > 5) {
    quickDial.isWarn = true;
    errFlag = true;
  }

  if (errFlag) {
    return;
  }
  let data = {
    groupName: groupName.value,
    quickDial: quickDial.value,
    member: member.value,
  };

  let requestData = {
    target: "pbxRingGroup",
    action: "add",
    data: data,
  };

  vm.$axios.post("api", requestData).then((response) => {
    let ret = response.data.retcode;
    if (ret == 0) {
      groupName.value = "";
      quickDial.value = "";
      member.value = "";
      let page = 0;
      let tableItem = getItemByKey(vm.data, "PBXRingGroupSetting", "pbxRingGroupTable");
      page = response.data.data.page + 1;
      getPBXGroupTableData(vm, page);
      //关闭窗口并展示成功
      addModalData.visible = false;
      showRequestSuccess(vm);
    } else if (ret == -1) {
      if (id == -1) {
        showErrorInfo(vm, vm.$t("PBXAddGroupFailed"));
      } else{
        showErrorInfo(vm, vm.$t("PBXEditGroupFailed"));
      }
    }
  });
}

function onSetEditValue(index, key, vm) {
  let tableItem = getItemByKey(vm.data, "PBXRingGroupSetting", "pbxRingGroupTable");
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "groupName")
  ].value = tableItem.tableData[index].groupName;
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "groupName")
  ].disabled = true;

  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "quickDial")
  ].value = tableItem.tableData[index].quickDial;

  let memberArr = tableItem.tableData[index].member == "" ? [] : tableItem.tableData[index].member.split(",");
  tableItem.tableHeadData.addModalData.items[
    getIndexByKey(tableItem.tableHeadData.addModalData.items, "member")
  ].value = memberArr;
}

function onDeletePBXGroup(vm, type) {
  if (
    !confirm(
      type == "all" ? vm.$t("DeleteAllConfirm") : vm.$t("DeleteSelectedConfirm")
    )
  ) {
    return;
  }
  let selectedRowKeys = getItemByKey(vm.data, "PBXRingGroupSetting", "pbxRingGroupTable")
    .selectedRowKeys;
  let requestData = {
    target: "pbxRingGroup",
    action: "del",
    data: {
      type: type,
      groupNames: selectedRowKeys,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm);
    let tableFooterData = getItemByKey(vm.data, "PBXRingGroupSetting", "pbxRingGroupTable")
      .tableFooterData;
    if (type != "all") {
      let sumPage = Math.ceil(
        (tableFooterData.sum - selectedRowKeys.length) /
          tableFooterData.pageNumber
      );
      sumPage = sumPage == 0 ? 1 : sumPage;
      let page =
        tableFooterData.curPage >= sumPage ? sumPage : tableFooterData.curPage;
      getPBXGroupTableData(vm, page);
    } else {
      getPBXGroupTableData(vm, 1);
    }
  });
}

</script>