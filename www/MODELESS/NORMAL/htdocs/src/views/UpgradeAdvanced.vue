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
  checkRangeOfNumber,
  notContainInvalid,
  isHour,
  isMinuteOrSec,
  checkFileSize,
} from "@/js/common.js";
import { checkFileFormat, showErrorInfo } from "../js/common";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      changedCfgData: {},
      submitCfgData: {},
      submitData: {},
      apiData: {},
      data: {
        getDataSuccess: false,
      },
      stateData: {},
      interObj: Object,
      dhcpOptionItems: [
        { key: 1, label: this.$t("CustomOption") },
        { key: 2, label: this.$t("Option43") },
        { key: 4, label: this.$t("Option66") },
      ],
      scheduleWeekItems: [],
      scheduleSomeDayItems: [],
      someDayOfWeek: [],
    };
  },
  created() {
    getData(this);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      //DHCP Option Enable
      if (event.itemKey == "Config.Autoprovision.DHCP_OPTION.Enable") {
        let item = getItemByKey(
          this.data,
          "dhcpOption",
          "Config.Autoprovision.DHCP_OPTION.Enable"
        );
        item.value = event.newVal;
        this.changedCfgData[event.itemKey] = getDhcpOptionValue(event.newVal);
      }
      //Mode
      else if (event.itemKey == "Config.Autoprovision.MODE.Mode") {
        this.changedCfgData[event.itemKey] = event.newVal;
        onCheckScheduleAvail(this);
      }
      //SomeDay
      else if (event.itemKey == "Config.Autoprovision.SCHEDULE.DayOfWeek") {
        this.changedCfgData[event.itemKey] = event.newVal;
        let item = getItemByKey(
          this.data,
          "automaticAutop",
          "Config.Autoprovision.SCHEDULE.SomeDayOfWeek"
        );
        if (event.newVal == 8) {
          item.isShow = true;
        } else {
          item.isShow = false;
        }
      } else if (
        event.itemKey == "Config.Autoprovision.SCHEDULE.SomeDayOfWeek"
      ) {
        let item = getItemByKey(
          this.data,
          "automaticAutop",
          "Config.Autoprovision.SCHEDULE.SomeDayOfWeek"
        );
        item.value = event.newVal;
        var someDayValue = "";
        for (var i in event.newVal) {
          someDayValue = someDayValue + event.newVal[i] + ",";
        }
        this.changedCfgData[event.itemKey] = someDayValue.substring(
          0,
          someDayValue.length - 1
        );
      } else if (event.itemKey == "Config.Autoprovision.REBOOT_MODE.Mode") {
        this.changedCfgData[event.itemKey] = event.newVal;
        onCheckRebootScheduleAvail(this);
      } else {
        this.changedCfgData[event.itemKey] = event.newVal;
      }
    },
  },
};

var NotGetResponse = 0;
var NotGetResponseNum = 0;
var IsAlreadyReboot = 0;

function getDhcpOptionValue(value) {
  var boxes = 0;
  for (var index in value) {
    boxes = boxes | value[index];
  }
  return boxes;
}

function getData(vm) {
  vm.$axios.get("api/upgradeAdvanced/info").then((response) => {
    if(response.data.retcode == -1){
      vm.data= {
        showNoPermission: true,
      };
      return;
    }
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.changedCfgData = deepClone(response.data.configData);
    vm.stateData = response.data.data;

    //scheduleWeekItems赋值
    vm.scheduleWeekItems = [];
    let weekItem = { key: "0", label: vm.$t("EveryDay") };
    vm.scheduleWeekItems.push(weekItem);
    vm.scheduleWeekItems = getWeekItems(
      vm.scheduleWeekItems,
      vm.$t("AllWeekDays")
    );
    weekItem = { key: "8", label: vm.$t("SomeDay") };
    vm.scheduleWeekItems.push(weekItem);

    //scheduleSomdayItems赋值
    vm.scheduleSomeDayItems = [];
    vm.scheduleSomeDayItems = getWeekItems(
      vm.scheduleSomeDayItems,
      vm.$t("AllWeekDays")
    );

    //someDayOfWeek赋值
    vm.someDayOfWeek = vm.changedCfgData[
      "Config.Autoprovision.SCHEDULE.SomeDayOfWeek"
    ].split(",");

    createPageData(vm);
    vm.data.getDataSuccess = true;

    //dhcpOption
    let item = getItemByKey(
      vm.data,
      "dhcpOption",
      "Config.Autoprovision.DHCP_OPTION.Enable"
    );
    item.value = [];
    var dhcpOptionEnable =
      vm.changedCfgData["Config.Autoprovision.DHCP_OPTION.Enable"];
    for (var index in vm.dhcpOptionItems) {
      if (vm.dhcpOptionItems[index].key & dhcpOptionEnable) {
        item.value.push(vm.dhcpOptionItems[index].key);
      }
    }
    IsAlreadyReboot = 0;

    // Automatic Autop
    onCheckScheduleAvail(vm);
    onCheckRebootScheduleAvail(vm);

    getAcutoPStatus(vm);
  });
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "upgradeAdvanced",
    action: "set",
    configData: vm.submitCfgData,
    data: vm.submitData,
  };
  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      showRequestSuccess(vm);
    }
    vm.data.submitLoading = false;
  });

  vm.submitData = {};
}

function getCommitData(vm) {
  vm.submitCfgData = {};
  for (var changedKey in vm.changedCfgData) {
    if (vm.apiData.configData[changedKey] != vm.changedCfgData[changedKey]) {
      vm.submitCfgData[changedKey] = vm.changedCfgData[changedKey];
    }
  }
}

function getWeekItems(items, value) {
  var DayOfWeek = value.split("&");
  for (var i = 1; i < 7; i++) {
    let weekItem = { key: i.toString(), label: DayOfWeek[i] };
    items.push(weekItem);
  }
  let weekItem = { key: "7", label: DayOfWeek[0] };
  items.push(weekItem);
  return items;
}

// AUTOP_STATE_SUCCESS = 0,
// AUTOP_STATE_FAILED, 1
// AUTOP_STATE_CHECK_ROM_FAILED, 2
// AUTOP_STATE_UPGRADING, 3
// TIMEOUT 4
// FINISHED 5
// TALKING -1
// WAITING -2
function getAcutoPStatus(vm) {
  if (vm.stateData.State.AutopNowState == "-1") {
    setTimeout(() => {
      resetToNormalPage(vm);
    }, 6500);
  } else if (vm.stateData.State.AutopNowState == "0") {
    setTimeout(() => {
      resetToNormalPage(vm);
    }, 6500);
  } else if (vm.stateData.State.AutopNowState == "1") {
    setTimeout(() => {
      resetToNormalPage(vm);
    }, 6500);
    var tmp = vm.stateData.State.AutopNowReason.split(";");
    var tmpLen = tmp.length;
    var tmpShow = "Reason: ";
    for (var i = 0; i < tmpLen - 1; i++) {
      if (tmp[i] == "undefined") {
        break;
      }
      tmpShow += vm.$t("AutoPFailedReasonArr")[tmp[i]];
    }
    showErrorInfo(vm, tmpShow);
  } else if (vm.stateData.State.AutopNowState == "3") {
    reStartCheckAutoP(vm);
    vm.interObj = setInterval(() => {
      LongCheckStatus(vm);
    }, 4000);
  } else if (vm.stateData.State.AutopNowState == "-2") {
    reStartCheckAutoP(vm);
    vm.interObj = setInterval(() => {
      LongCheckStatus(vm);
    }, 4000);
  } else {
    resetToNormalPage(vm);
  }
}

function LongCheckStatus(vm) {
  if (1 == NotGetResponse) {
    {
      statusCheck(vm);
      NotGetResponseNum = 0;
      NotGetResponse = 0;
    }
  } else {
    NotGetResponseNum++;
    if (NotGetResponseNum >= 3) {
      NotGetResponse = 1;
    }
  }
}

function resetNotGetResponse(vm) {
  clearInterval(vm.interObj);
  vm.interObj = setInterval(() => {
    LongCheckStatus(vm);
  }, 4000);
  NotGetResponse = 0;
  NotGetResponseNum = 0;
}

function reStartCheckAutoP(vm) {
  setTimeout(() => {
    statusCheck(vm);
  }, 3000);
}

function statusCheck(vm) {
  getStatueData(vm);
}

function onStsActOfAutoP(vm) {
  if (vm.stateData.State.AutopNowState == "2") {
    setTimeout(() => {
      getData(vm);
    }, 6500);
  } else if (vm.stateData.State.AutopNowState == "1") {
    clearInterval(vm.interObj);
    setTimeout(() => {
      var tmp = vm.stateData.State.AutopNowReason.split(";");
      var tmpLen = tmp.length;
      var tmpShow = "Reason: ";
      for (var i = 0; i < tmpLen - 1; i++) {
        if (tmp[i] == "undefined") {
          break;
        }
        tmpShow += vm.$t("AutoPFailedReasonArr")[tmp[i]];
      }
      showErrorInfo(vm, tmpShow);
      getData(vm);
    }, 6500);
    return "NotGoOn";
  } else if (vm.stateData.State.AutopNowState == "3") {
  } else if (vm.stateData.State.AutopNowState == "-2") {
  } else if (vm.stateData.State.AutopNowState == "4") {
    setTimeout(() => {
      showErrorInfo(vm, vm.$t("TimeOutWarning"));
      getData(vm);
    }, 6500);
    return "NotGoOn";
  } else if (vm.stateData.State.AutopNowState == "5") {
    if ("1" == IsAlreadyReboot) {
      return "NotGoOn";
    }
    IsAlreadyReboot = "1";
    setTimeout(() => {
      showRequestSuccess(vm, vm.$t("AUTOPFinishedNotice"));
      getData(vm);
    }, 7000);
  }
}

function getStatueData(vm) {
  vm.$root.processingVisible = true;
  vm.$axios.get("api/upgradeAdvanced/info?AutopNow=1").then((response) => {
    vm.stateData = response.data.data;
    resetNotGetResponse(vm);
    var thisRes = onStsActOfAutoP(vm);
    if ("NotGoOn" == thisRes) {
      return;
    }
    reStartCheckAutoP(vm);
  });
}

function resetToNormalPage(vm) {
  clearInterval(vm.interObj);
  vm.$root.processingVisible = false;
}

function onAutoPConfirm(vm) {
  getCommitData(vm);
  if (vm.changedCfgData["Config.Autoprovision.MODE.Mode"] == 0) {
    alert(vm.$t("AUTOPDisabledWarning"));
    return;
  }
  if (!checkCommitData(vm)) {
    return;
  }
  if (confirm(vm.$t("SaveAndAutoPConfirm"))) {
    vm.submitData = { AUTOPNow: "1" };
    submitData(vm);
    vm.$root.processingVisible = true;
    vm.$axios.get("api/upgradeAdvanced/info?AutopNow=1").then((response) => {
      vm.stateData = response.data.data;
      getAcutoPStatus(vm);
    });
  }
}

function onCheckScheduleAvail(vm) {
  var sts = true;
  let item = getItemByKey(
    vm.data,
    "automaticAutop",
    "Config.Autoprovision.SCHEDULE.SomeDayOfWeek"
  );
  if (
    vm.changedCfgData["Config.Autoprovision.MODE.Mode"] == 2 ||
    vm.changedCfgData["Config.Autoprovision.MODE.Mode"] == 3
  ) {
    sts = false;
    if (vm.changedCfgData["Config.Autoprovision.SCHEDULE.DayOfWeek"] == 8) {
      item.isShow = true;
    }
  } else {
    item.isShow = false;
  }
  let item1 = getItemByKey(
    vm.data,
    "automaticAutop",
    "Config.Autoprovision.SCHEDULE.DayOfWeek"
  );
  let item2 = getItemByKey(
    vm.data,
    "automaticAutop",
    "Config.Autoprovision.SCHEDULE.HourOfDay"
  );
  let item3 = getItemByKey(
    vm.data,
    "automaticAutop",
    "Config.Autoprovision.SCHEDULE.MinuteOfHour"
  );
  item1.disabled = sts;
  item2.disabled = sts;
  item3.disabled = sts;
}

function onCheckRebootScheduleAvail(vm) {
  var sts = true;
  if (vm.changedCfgData["Config.Autoprovision.REBOOT_MODE.Mode"] == 1) {
    sts = false;
  }
  let item = getItemByKey(
    vm.data,
    "rebootSchedule",
    "Config.Autoprovision.REBOOT_SCHEDULE.DayOfWeek"
  );
  item.disabled = sts;
  item = getItemByKey(
    vm.data,
    "rebootSchedule",
    "Config.Autoprovision.REBOOT_SCHEDULE.HourOfDay"
  );
  item.disabled = sts;
}

function onExport(vm, type) {
  let requestData = {
    target: "upgradeAdvanced",
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

function onClearMD5(vm) {
  let requestData = {
    target: "upgradeAdvanced",
    action: "set",
    data: {
      ClearMD5: "1",
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    showRequestSuccess(vm, vm.$t("ClearSuccess"));
  });
}

function onImport(vm) {
  let item = getItemByKey(vm.data, "others", "importConfigFile");
  let fileName = item.value.fileName;
  var fileUpLimit = 1024; //1MB
  var fileLowerLimit = 0;
  if (fileName == "" || fileName == vm.$t("UpgradeFilePath")) {
    showErrorInfo(vm, vm.$t("FileEmptyWarning"));
    return;
  }
  if (fileName.length >= 127) {
    showErrorInfo(vm, vm.$t("WarningFileNameTooLong"));
    return;
  }
  if (
    !(
      checkFileFormat(fileName, ".TGZ", 4) ||
      checkFileFormat(fileName, ".CONF", 5) ||
      checkFileFormat(fileName, ".CFG", 4)
    )
  ) {
    showErrorInfo(vm, vm.$t("FileFormatWarning"));
    return;
  }
  var FileSizeFlag = checkFileSize(
    item.value.fileData,
    fileUpLimit,
    fileLowerLimit
  );
  if (FileSizeFlag == "-1") {
    showErrorInfo(vm, vm.$t("FileNotExistWarning"));
    return;
  }
  if (FileSizeFlag == "-2") {
    showErrorInfo(vm, vm.$t("UploadingFileTooLargeWarning"));
    return;
  }
  if (FileSizeFlag == "-3") {
    showErrorInfo(vm, vm.$t("FileFormatWarning"));
    return;
  }
  vm.$confirm({
    content: vm.$t("ImportConfigRebootHint"),
    onOk() {
      //上传
      item.loading = true;
      const upData = new FormData();
      upData.append("file", item.value.fileData);
      axios
        .post("api/upgradeAdvanced/upload", upData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          if (res.data.retcode == -1) {
            showErrorInfo(vm, vm.$t("ConfigUploadFailed"));
          } else if (res.data.retcode == -2) {
            showErrorInfo(vm, vm.$t("ConfignstallFailed"));
          } else if (res.data.retcode == 0) {
            showRequestSuccess(vm, vm.$t("ConfigInstallSuccess"));
            item.value.fileName = vm.$t("UpgradeFilePath");
            item.value.fileData = {};
          }
          item.loading = false;
        });
      return;
    },
    onCancel() {
      return;
    },
  });
}

function checkCommitData(vm) {
  let success = true;
  //DHCPCustomOption校验
  if (
    "undefined" !=
    typeof vm.submitCfgData["Config.Autoprovision.DHCP_OPTION.CustomId"]
  ) {
    if (
      !checkRangeOfNumber(
        vm.submitCfgData["Config.Autoprovision.DHCP_OPTION.CustomId"],
        128,
        254
      ) &&
      vm.submitCfgData["Config.Autoprovision.DHCP_OPTION.CustomId"] != ""
    ) {
      let item = getItemByKey(
        vm.data,
        "dhcpOption",
        "Config.Autoprovision.DHCP_OPTION.CustomId"
      );
      item.isWarn = true;
      success = false;
    }
  }

  //ServerUserName校验
  if (
    "undefined" !=
    typeof vm.submitCfgData["Config.Autoprovision.GENERAL.UserName"]
  ) {
    if (
      !notContainInvalid(
        vm.submitCfgData["Config.Autoprovision.GENERAL.UserName"]
      )
    ) {
      let item = getItemByKey(
        vm.data,
        "manualAutop",
        "Config.Autoprovision.GENERAL.UserName"
      );
      item.isWarn = true;
      success = false;
    }
  }

  //ServerPassword校验
  if (
    "undefined" != typeof vm.submitCfgData["Config.Autoprovision.GENERAL.Pwd"]
  ) {
    if (
      !notContainInvalid(vm.submitCfgData["Config.Autoprovision.GENERAL.Pwd"])
    ) {
      let item = getItemByKey(
        vm.data,
        "manualAutop",
        "Config.Autoprovision.GENERAL.Pwd"
      );
      item.isWarn = true;
      success = false;
    }
  }

  //ServerCommonAESKey校验
  if (
    "undefined" != typeof vm.submitCfgData["Config.Autoprovision.AES.Key16"]
  ) {
    if (
      !notContainInvalid(vm.submitCfgData["Config.Autoprovision.AES.Key16"])
    ) {
      let item = getItemByKey(
        vm.data,
        "manualAutop",
        "Config.Autoprovision.AES.Key16"
      );
      item.isWarn = true;
      success = false;
    }
  }

  //ServerMACAESKey校验
  if (
    "undefined" != typeof vm.submitCfgData["Config.Autoprovision.AES.Key16Mac"]
  ) {
    if (
      !notContainInvalid(vm.submitCfgData["Config.Autoprovision.AES.Key16Mac"])
    ) {
      let item = getItemByKey(
        vm.data,
        "manualAutop",
        "Config.Autoprovision.AES.Key16Mac"
      );
      item.isWarn = true;
      success = false;
    }
  }

  //hour和minute校验
  if (
    "undefined" !=
    typeof vm.submitCfgData["Config.Autoprovision.SCHEDULE.HourOfDay"]
  ) {
    if (
      !isHour(vm.submitCfgData["Config.Autoprovision.SCHEDULE.HourOfDay"]) ||
      0 == vm.submitCfgData["Config.Autoprovision.SCHEDULE.HourOfDay"].length
    ) {
      let item = getItemByKey(
        vm.data,
        "automaticAutop",
        "Config.Autoprovision.SCHEDULE.HourOfDay"
      );
      item.isWarn = true;
      success = false;
    }
  }

  if (
    "undefined" !=
    typeof vm.submitCfgData["Config.Autoprovision.SCHEDULE.MinuteOfHour"]
  ) {
    if (
      !isMinuteOrSec(
        vm.submitCfgData["Config.Autoprovision.SCHEDULE.MinuteOfHour"]
      ) ||
      0 == vm.submitCfgData["Config.Autoprovision.SCHEDULE.MinuteOfHour"].length
    ) {
      let item = getItemByKey(
        vm.data,
        "automaticAutop",
        "Config.Autoprovision.SCHEDULE.MinuteOfHour"
      );
      item.isWarn = true;
      success = false;
    }
  }

  if (
    "undefined" !=
    typeof vm.submitCfgData["Config.Autoprovision.REBOOT_SCHEDULE.HourOfDay"]
  ) {
    if (
      !isHour(
        vm.submitCfgData["Config.Autoprovision.REBOOT_SCHEDULE.HourOfDay"]
      ) ||
      0 ==
        vm.submitCfgData["Config.Autoprovision.REBOOT_SCHEDULE.HourOfDay"]
          .length
    ) {
      let item = getItemByKey(
        vm.data,
        "rebootSchedule",
        "Config.Autoprovision.REBOOT_SCHEDULE.HourOfDay"
      );
      item.isWarn = true;
      success = false;
    }
  }

  return success;
}

function createPageData(vm) {
  vm.data = {
    // getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Upgrade"),
      secondTitle: vm.$t("Advance"),
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
  vm.data.contents.push(createPnpOptionContent(vm));
  vm.data.contents.push(createDhcpOptionContent(vm));
  vm.data.contents.push(createManualAutopContent(vm));
  vm.data.contents.push(createAutomaticAutopContent(vm));
  vm.data.contents.push(createRebootScheduleContent(vm));
  if (vm.$root.hiddenArr.isShowUpgradeOthers == 1) {
    vm.data.contents.push(createOthersContent(vm));
  }
}

function createPnpOptionContent(vm) {
  let content = {
    key: "pnpOption",
    title: vm.$t("PNPOption"),
    titleDescription: vm.$t("PNPOptionDesc"),
    items: [
      {
        title: vm.$t("PNPConfig"),
        type: "checkbox",
        key: "Config.Autoprovision.PNP.Enable",
        value: vm.apiData.configData["Config.Autoprovision.PNP.Enable"],
        description: vm.$t("PNPOptionDesc"),
      },
    ],
  };
  return content;
}

function createDhcpOptionContent(vm) {
  let content = {
    key: "dhcpOption",
    title: vm.$t("DHCPOption"),
    titleDescription: vm.$t("DHCPOptionDesc"),
    items: [
      {
        title: vm.$t("CustomOption"),
        type: "input",
        showHint: true,
        hintContent: vm.$t("(128~254)"),
        isWarn: false,
        warnLabel: vm.$t("CustomOptionRangeError"),
        key: "Config.Autoprovision.DHCP_OPTION.CustomId",
        value:
          vm.apiData.configData["Config.Autoprovision.DHCP_OPTION.CustomId"],
        description: vm.$t("CustomOptionDesc"),
      },
      {
        title: vm.$t("OptionEnable"),
        type: "multiple-checkbox",
        key: "Config.Autoprovision.DHCP_OPTION.Enable",
        value: [],
        checkboxItems: vm.dhcpOptionItems,
        description: vm.$t("DHCPOptionEnableDesc"),
      },
    ],
  };
  return content;
}

function createManualAutopContent(vm) {
  let content = {
    key: "manualAutop",
    title: vm.$t("ManualAutop"),
    titleDescription: vm.$t("ManualAutopDesc"),
    items: [
      {
        title: vm.$t("URL"),
        type: "input",
        maxLength: 127,
        key: "Config.Autoprovision.GENERAL.Url",
        value: vm.apiData.configData["Config.Autoprovision.GENERAL.Url"],
        description: vm.$t("AutopURLDesc"),
      },
      {
        title: vm.$t("UserName"),
        type: "input",
        isWarn: false,
        warnLabel: vm.$t("PleaseCheckAlarmSubmitData"),
        key: "Config.Autoprovision.GENERAL.UserName",
        value: vm.apiData.configData["Config.Autoprovision.GENERAL.UserName"],
        description: vm.$t("AutopUsernameDesc"),
      },
      {
        title: vm.$t("PasswordLabel"),
        type: "input",
        inputType: "password",
        isWarn: false,
        warnLabel: vm.$t("PleaseCheckAlarmSubmitData"),
        key: "Config.Autoprovision.GENERAL.Pwd",
        value: vm.apiData.configData["Config.Autoprovision.GENERAL.Pwd"],
        description: vm.$t("AutopPasswordDesc"),
      },
      {
        title: vm.$t("CommonAESKey"),
        type: "input",
        inputType: "password",
        isWarn: false,
        warnLabel: vm.$t("PleaseCheckAlarmSubmitData"),
        key: "Config.Autoprovision.AES.Key16",
        value: vm.apiData.configData["Config.Autoprovision.AES.Key16"],
        description: vm.$t("CommonAESKeyDesc"),
      },
      {
        title: vm.$t("MACAESKey"),
        type: "input",
        inputType: "password",
        isWarn: false,
        warnLabel: vm.$t("PleaseCheckAlarmSubmitData"),
        key: "Config.Autoprovision.AES.Key16Mac",
        value: vm.apiData.configData["Config.Autoprovision.AES.Key16Mac"],
        description: vm.$t("AESKeyDesc"),
      },
      {
        type: "button",
        key: "AutoPConfirmBtn",
        onClick: function () {
          onAutoPConfirm(vm);
        },
        isShowPopover: false,
        buttonName: vm.$t("AutoPNow"),
        buttonIcon: "iconautoP",
      },
    ],
  };
  return content;
}

function createAutomaticAutopContent(vm) {
  let content = {
    key: "automaticAutop",
    title: vm.$t("AutomaticAutop"),
    titleDescription: vm.$t("AutomaticAutopDesc"),
    items: [
      {
        title: vm.$t("Mode"),
        type: "select",
        key: "Config.Autoprovision.MODE.Mode",
        value: vm.apiData.configData["Config.Autoprovision.MODE.Mode"],
        selectItems: [
          { key: 0, label: vm.$t("Disabled") },
          { key: 1, label: vm.$t("PowerOn") },
          { key: 2, label: vm.$t("Repeatedly") },
          { key: 3, label: vm.$t("PowerOn") + vm.$t("Repeatedly") },
          { key: 4, label: vm.$t("RepeatedlyByHour") },
        ],
        description: vm.$t("AutopModeDesc"),
      },
      {
        title: vm.$t("Schedule"),
        type: "select",
        disabled: false,
        key: "Config.Autoprovision.SCHEDULE.DayOfWeek",
        value: vm.apiData.configData["Config.Autoprovision.SCHEDULE.DayOfWeek"],
        selectItems: vm.scheduleWeekItems,
        description: vm.$t("AutopScheduleDesc"),
      },
      {
        type: "multiple-checkbox",
        key: "Config.Autoprovision.SCHEDULE.SomeDayOfWeek",
        isShow: false,
        isShowPopover: false,
        value: vm.someDayOfWeek,
        checkboxItems: vm.scheduleSomeDayItems,
      },
      {
        type: "input",
        showHint: true,
        disabled: false,
        isWarn: false,
        warnLabel: vm.$t("ScheduleHourRangeError"),
        hintContent: vm.$t("(0~23Hour)"),
        key: "Config.Autoprovision.SCHEDULE.HourOfDay",
        value: vm.apiData.configData["Config.Autoprovision.SCHEDULE.HourOfDay"],
        showDescription: false,
      },
      {
        type: "input",
        showHint: true,
        disabled: false,
        isWarn: false,
        hintContent: vm.$t("(0~59Min)"),
        warnLabel: vm.$t("ScheduleMinuteRangeError"),
        key: "Config.Autoprovision.SCHEDULE.MinuteOfHour",
        value:
          vm.apiData.configData["Config.Autoprovision.SCHEDULE.MinuteOfHour"],
        showDescription: false,
      },
      {
        title: vm.$t("ExportAutopTemplate"),
        type: "button",
        key: "ExportAutopBtn",
        onClick: function () {
          onExport(vm, "template");
        },
        isShowPopover: true,
        buttonName: vm.$t("Export"),
        buttonIcon: "iconexport",
        description: vm.$t("ExportAutopTemDesc"),
      },
      {
        title: vm.$t("ClearMD5"),
        type: "button",
        key: "ClearMD5Btn",
        onClick: function () {
          onClearMD5(vm);
        },
        isShowPopover: true,
        buttonName: vm.$t("Clear"),
        buttonIcon: "iconclear",
        description: vm.$t("AutopClearMD5Desc"),
      },
    ],
  };
  return content;
}

function createRebootScheduleContent(vm) {
  let content = {
    key: "rebootSchedule",
    title: vm.$t("RebootSchedule"),
    titleDescription: vm.$t("RebootScheduleDesc"),
    items: [
      {
        title: vm.$t("Switch"),
        type: "checkbox",
        key: "Config.Autoprovision.REBOOT_MODE.Mode",
        value: vm.apiData.configData["Config.Autoprovision.REBOOT_MODE.Mode"],
        description: vm.$t("AutopSwitchDesc"),
      },
      {
        title: vm.$t("Schedule"),
        type: "select",
        disabled: false,
        key: "Config.Autoprovision.REBOOT_SCHEDULE.DayOfWeek",
        value:
          vm.apiData.configData[
            "Config.Autoprovision.REBOOT_SCHEDULE.DayOfWeek"
          ],
        selectItems: vm.scheduleWeekItems,
        description: vm.$t("AutopRebootScheduleDesc"),
      },
      {
        type: "input",
        showHint: true,
        disabled: false,
        isWarn: false,
        warnLabel: vm.$t("ScheduleHourRangeError"),
        hintContent: vm.$t("(0~23Hour)"),
        key: "Config.Autoprovision.REBOOT_SCHEDULE.HourOfDay",
        value:
          vm.apiData.configData[
            "Config.Autoprovision.REBOOT_SCHEDULE.HourOfDay"
          ],
        showDescription: false,
      },
    ],
  };
  return content;
}

function createOthersContent(vm) {
  let content = {
    key: "others",
    title: vm.$t("Others"),
    titleDescription: vm.$t("AutopOthersDesc"),
    items: [
      {
        title: vm.$t("ConfigFile"),
        type: "file-input",
        key: "importConfigFile",
        acceptFileType: ".tgz,.conf,.cfg",
        loading: false,
        value: {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        },
        modalTitle: vm.$t("AutopFileHint"),
        importBtnName: vm.$t("Import"),
        exportBtnName: vm.$t("Export"),
        modalConfirmName: vm.$t("Import"),
        uploadFunction: function () {
          onImport(vm);
        },
        isShowExport: true,
        onExport: function () {
          onExport(vm, "config");
        },
        showHint: true,
        hintContent: "(" + vm.$t("Encrypted") + ")",
        description: vm.$t("AutopConfigFileDesc"),
      },
    ],
  };
  return content;
}
</script>