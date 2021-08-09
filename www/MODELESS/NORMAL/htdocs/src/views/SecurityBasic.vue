<template>
  <div>
    <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
  </div>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import { 
  showRequestSuccess,
  deepClone,
  getIndexByKey,
  getItemByKey,
  checkRangeOfNumber
} from "@/js/common.js";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      changedCfgData:{},
      submitCfgData:{},
      apiData: {},
      data: {
        getDataSuccess: false,
      },
      modalVisible: false,
      userName: "",
      userNameItems: [],
    };
  },
  created() {
    getData(this);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      if(event.itemKey == "userName"){
        this.data.userName = event.newVal;
      } else{
        this.changedCfgData[event.itemKey] = event.newVal;
      }
    },
  },
};

function getData(vm) {
  vm.$axios.get("api/securityBasic/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);

    vm.userNameItems = [];
    for(var i = 0; i < vm.apiData.data.UserNameList.length; i++){
      var value = vm.apiData.data.UserNameList[i].UserNameValue;
      let item = {"key": value,"label": value};
      vm.userNameItems.push(item);
    }

    createPageData(vm);
    vm.data.userName = vm.apiData.data.UserInformation.UserName;
  });
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "securityBasic",
    action: "set",
    configData: vm.submitCfgData,
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm);
    vm.data.submitLoading = false;
  });
}

function getCommitData(vm){
  vm.submitCfgData = {};
  for (var changedKey in vm.changedCfgData) {
    if(vm.apiData.configData[changedKey] != vm.changedCfgData[changedKey]){
      vm.submitCfgData[changedKey] = vm.changedCfgData[changedKey]
    }
  }
}

function checkCommitData(vm){
  let success = true;
  if("undefined" != typeof(vm.submitCfgData["Config.Settings.WEB_LOGIN_STATUS.SessionTimeOut"])){
    if(!checkRangeOfNumber(vm.submitCfgData["Config.Settings.WEB_LOGIN_STATUS.SessionTimeOut"], 60, 14400)){
      let item = getItemByKey(
        vm.data,
        "sessionTimeOut",
        "Config.Settings.WEB_LOGIN_STATUS.SessionTimeOut"
      );
      item.isWarn = true;
      success = false;
    }
  }

  return success;
}

function createPageData(vm) {
  vm.data = {
    isChangePwdShow: true,
    getDataSuccess: true,
    modalVisible: {
      visible: false,
    },
    userName: "",
    cancelBtnLabel: "",
    modalTitle: "",
    oldPswShow: false,
    breadCrumb: {
      firstTitle: vm.$t("Security"),
      secondTitle: vm.$t("Basic"),
    },
    onSubmit: function () {
      getCommitData(vm);
      if (!checkCommitData(vm)) {
        return;
      }
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
  vm.data.contents.push(createWebPasswordModifyContent(vm));
  if(localStorage.getItem("userType") == "admin"){
    vm.data.contents.push(createAccountStatusContent(vm));
    vm.data.contents.push(createSessionTimeOutContent(vm));
  }
}

function createWebPasswordModifyContent(vm) {
  let content = {
    key: "webPasswordModify",
    title: vm.$t("WebPasswordModify"),
    titleDescription: vm.$t("WebPasswordModifyDesc"),
    items: [
      {
        title: vm.$t("UserName"),
        type: "select",
        key: "userName",
        value: vm.apiData.data.UserInformation.UserName,
        selectItems: vm.userNameItems,
        showChangeBtn: true,
        ChangeLabel: vm.$t("ChangePsw"),
        onClickChange: function(){
          onModifyPageShowModifyPswWindow(vm,0);
        },
        description: vm.$t("SecurityUsernameDesc"),
      },
    ],
  };
  return content;
}

function createAccountStatusContent(vm) {
  let content = {
    key: "accountStatus",
    title: vm.$t("AccountStatus"),
    titleDescription: vm.$t("SecurityAccountStatusDesc"),
    items: [
      {
        title: vm.$t("admin"),
        type: "label",
        key: "admin",
        value: vm.$t("Enabled"),
        showDescription: true,
        description: vm.$t("SecurityAdminDesc"),
      },
      {
        title: vm.$t("AccountUser"),
        type: "select",
        key: "Config.Settings.SECURITY.UserAccountEnabled",
        value: vm.apiData.configData["Config.Settings.SECURITY.UserAccountEnabled"],
        selectItems: [
          {"key": 0,"label": vm.$t("Disabled")},
          {"key": 1,"label": vm.$t("Enabled")},
        ],
        description: vm.$t("SecurityUserDesc"),
      },
    ],
  };
  return content;
}

function createSessionTimeOutContent(vm) {
  let content = {
    key: "sessionTimeOut",
    title: vm.$t("SessionTimeOut"),
    titleDescription: vm.$t("SessionTimeOutDesc"),
    items: [
      {
        title: vm.$t("SessionTimeOutValue"),
        type: "input",
        showHint:true,
        isWarn: false,
        warnLabel: vm.$t("SessionTimeRangeError"),
        hintContent:vm.$t("(60~14400Sec)"),
        key: "Config.Settings.WEB_LOGIN_STATUS.SessionTimeOut",
        value: vm.apiData.configData["Config.Settings.WEB_LOGIN_STATUS.SessionTimeOut"],
        description: vm.$t("SessionTimeOutDesc"),
      },
    ],
  };
  return content;
}

function onModifyPageShowModifyPswWindow(vm,value){
  var nFirstTimeLogin = value;
  if(1 != nFirstTimeLogin && "" == vm.data.userName){
    return 0;
  }
  if("" == vm.data.userName){
    vm.data.userName = "admin";
    vm.data.cancelBtnLabel = vm.$t("Ignore");
    vm.data.modalTitle = vm.$t("WebPasswordModifyAlert");
    vm.data.oldPswShow = false;
  } else{
    vm.data.cancelBtnLabel = vm.$t("Cancel");
    vm.data.modalTitle = vm.$t("ChangePsw");
    vm.data.oldPswShow = true;
  }
  vm.data.modalVisible.visible = true;
}
</script>