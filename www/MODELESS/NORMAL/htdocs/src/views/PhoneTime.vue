<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  getIndexByKey,
  getItemByKey,
  deepClone,
  notContainInvalid_NotEmpty,
  isAnInterger
} from "@/js/common.js";
import moment from 'moment';

export default {
  components: {
    CommonPage,
  },
  data(){
    return{
      changedCfgData:{},
      submitCfgData:{},
      apiData: {},
      data: {
        getDataSuccess: false,
      },
      date: new Date(),
      time: new Date(),
      use12Hours: Boolean,
      timeZoneItems: [],
      dateFormatItems: [
        {key: 0, label: "YYYY-MM-DD"},
        {key: 1, label: "YYYY/MM/DD"},
        {key: 2, label: "DD-MM-YYYY"},
        {key: 3, label: "DD/MM/YYYY"},
        {key: 6, label: "MM-DD-YYYY"},
        {key: 7, label: "MM/DD/YYYY"},
      ],
    }
  },
  created() {
    getData(this);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      if(event.itemKey == "Config.Settings.SNTP.Enable"){
        changeAutoDisabeld(this,event.newVal);
        this.changedCfgData[event.itemKey] = event.newVal;
      } else if(event.itemKey == "Config.Settings.DATETIME.TimeFormat"){
        changeTimeFormat(this,event.newVal);
        this.changedCfgData[event.itemKey] = event.newVal;
      } else if(event.itemKey == "Config.Settings.DATETIME.DateFormat"){
        for(var i = 0; i < this.dateFormatItems.length; i++){
          if (this.dateFormatItems[i].key.toString() == event.newVal){
            changeDateFormat(this, this.dateFormatItems[i].label);
            break;
          }
        }
        this.changedCfgData[event.itemKey] = event.newVal;
      } else if(event.itemKey == "phoneDate"){
        this.date = event.newVal;
        let item = getItemByKey(
          this.data,
          "timeSetting",
          "phoneDate"
        );
        item.value = moment(this.date);
      } else if(event.itemKey == "phoneTime"){
        this.time = event.newVal.toDate();
        let item = getItemByKey(
          this.data,
          "timeSetting",
          "phoneTime"
        );
        item.value = event.newVal;
      } else if(event.itemKey == "Config.Settings.SNTP.Name"){
        let itemIndex = getIndexByKey(this.timeZoneItems,event.newVal);
        this.changedCfgData[event.itemKey] = event.newVal;
        this.changedCfgData["Config.Settings.SNTP.TimeZone"] = this.timeZoneItems[itemIndex].timeZone;
      } else{
        this.changedCfgData[event.itemKey] = event.newVal;
      }
    },
  },
};

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneTime",
    action: "set",
    configData: vm.submitCfgData,
    data: {
      "Time.Year": vm.date.getYear(),
      "Time.Month": vm.date.getMonth(),
      "Time.Day": vm.date.getDate(),
      "Time.Hour": vm.time.getHours(),
      "Time.Minutes": vm.time.getMinutes(),
      "Time.Seconds": vm.time.getSeconds(),
      "Time.Auto": vm.changedCfgData["Config.Settings.SNTP.Enable"],
    },
  };

  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      showRequestSuccess(vm);
    }
    vm.data.submitLoading = false;
  });
}

function getData(vm) {
  vm.$axios.get("api/phoneTime/info").then((response) => {
    vm.getDataSuccess = true;
    vm.apiData = response.data;
    vm.data = response.data.data;
    vm.changedCfgData = deepClone(response.data.configData);

    //获取时间
    vm.date.setYear(vm.data.Time.Year);
    vm.date.setMonth(vm.data.Time.Month);
    vm.date.setDate(vm.data.Time.Day);
    vm.time.setHours(vm.data.Time.Hour);
    vm.time.setMinutes(vm.data.Time.Minutes);

    //获取TimeZone
    vm.timeZoneItems = [];
    for(var i = 0; i < vm.data.TimeZones.length; i++){
      let item = {"key":vm.data.TimeZones[i].TimeZoneName,"label":vm.data.TimeZones[i].TimeZone + ' ' +vm.data.TimeZones[i].TimeZoneName,"timeZone": vm.data.TimeZones[i].TimeZone};
      vm.timeZoneItems.push(item);
    }
    createPageData(vm);

    //判断是否自动获取时间
    changeAutoDisabeld(vm,vm.changedCfgData["Config.Settings.SNTP.Enable"]);

    //获取dateFormat
    for(var i = 0; i < vm.dateFormatItems.length; i++){
      if (vm.dateFormatItems[i].key.toString() == vm.apiData.configData['Config.Settings.DATETIME.DateFormat']){
        changeDateFormat(vm, vm.dateFormatItems[i].label);
        break;
      }
    }

    //获取timeFormat
    changeTimeFormat(vm,vm.apiData.configData['Config.Settings.DATETIME.TimeFormat']);
  });
}

function getCommitData(vm){
  vm.submitCfgData = {};
  for (var changedKey in vm.changedCfgData) {
    if(vm.apiData.configData[changedKey] != vm.changedCfgData[changedKey]){
      vm.submitCfgData[changedKey] = vm.changedCfgData[changedKey];
    }
  }
}

function changeAutoDisabeld(vm,autoValue){
  let item1 = getItemByKey(
    vm.data,
    "timeSetting",
    "phoneDate"
  );
  let item2 = getItemByKey(
    vm.data,
    "timeSetting",
    "phoneTime"
  );
  if(autoValue == 1){
    item1.disabled = true;
    item2.disabled = true;
  } else{
    item1.disabled = false;
    item2.disabled = false;
  }
}

function changeDateFormat(vm,dateFormat){
  let item = getItemByKey(
    vm.data,
    "timeSetting",
    "phoneDate"
  );
  item.dateFormat = dateFormat;
}

function changeTimeFormat(vm,timeFormat){
  let item = getItemByKey(
    vm.data,
    "timeSetting",
    "phoneTime"
  );
  if(timeFormat == 0){
    item.timeFormat = 'h:mm a';
    item.use12Hours = true;
  } else{
    item.timeFormat = 'HH:mm ';
    item.use12Hours = false;
  }
}

function checkCommitData(vm){
  let success = true;
  //ntpServer1校验
  if("undefined" != typeof(vm.submitCfgData["Config.Settings.SNTP.NTPServer1"])){
    let item = getItemByKey(
      vm.data,
      "ntp",
      "Config.Settings.SNTP.NTPServer1"
    );
    if(vm.submitCfgData["Config.Settings.SNTP.NTPServer1"].length == 0){
      item.isWarn = true;
      item.warnLabel = vm.$t("SntpServer1NoEmpty");
      success = false;
    } else if(!notContainInvalid_NotEmpty(vm.submitCfgData["Config.Settings.SNTP.NTPServer1"])){
      item.isWarn = true;
      item.warnLabel = vm.$t("SntpServer1Unvalid");
      success = false;
    }
  }

  //UpdateInterval校验
  if("undefined" != typeof(vm.submitCfgData["Config.Settings.SNTP.Interval"])){
    if(!isAnInterger(vm.submitCfgData["Config.Settings.SNTP.Interval"]) || Number(vm.submitCfgData["Config.Settings.SNTP.Interval"]) < 3600){
      let item = getItemByKey(
        vm.data,
        "ntp",
        "Config.Settings.SNTP.Interval"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("UpdateIntervalRangeError");
      success = false;
    }
  }

  return success;
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Phone"),
      secondTitle: vm.$t("Time"),
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
  vm.data.contents.push(createTimeSettingContent(vm));
  vm.data.contents.push(createNTPContent(vm));
}

function createTimeSettingContent(vm) {
  let content = {
    key: "timeSetting",
    title: vm.$t("TimeSettingLabel"),
    titleDescription: vm.$t("TimeSettingDesc"),
    items: [
      {
        title: vm.$t("AutomaticDateTime"),
        type: "checkbox",
        key: "Config.Settings.SNTP.Enable",
        value: vm.apiData.configData["Config.Settings.SNTP.Enable"],
        description: vm.$t("AutoDateTimeDesc"),
      },
      {
        title: vm.$t("TimeFormat"),
        type: "select",
        key: "Config.Settings.DATETIME.TimeFormat",
        value: vm.apiData.configData["Config.Settings.DATETIME.TimeFormat"],
        selectItems: [
          {key: 1, label: "24-Hour Format"},
          {key: 0, label: "12-Hour Format"},
        ],
        description: vm.$t("TimeFormatDesc"),
      },
      {
        title: vm.$t("DateFormat"),
        type: "select",
        key: "Config.Settings.DATETIME.DateFormat",
        value: vm.apiData.configData["Config.Settings.DATETIME.DateFormat"],
        selectItems: vm.dateFormatItems,
        description: vm.$t("DateFormatDesc"),
      },
      {
        title: vm.$t("DateLabel"),
        type: "date",
        key: "phoneDate",
        value: moment(vm.date),
        description: vm.$t("DateDesc"),
      },
      {
        title: vm.$t("Time"),
        type: "time",
        key: "phoneTime",
        value: moment(vm.time),
        description: vm.$t("TimeDesc"),
      },
      {
        title: vm.$t("TimeZone"),
        type: "select",
        key: "Config.Settings.SNTP.Name",
        value: vm.apiData.configData["Config.Settings.SNTP.Name"],
        selectItems: vm.timeZoneItems,
        description: vm.$t("TimeZoneDesc"),
      },
    ],
  };
  return content;
}

function createNTPContent(vm) {
  let content = {
    key: "ntp",
    title: vm.$t("NTP"),
    titleDescription: vm.$t("NTPDesc"),
    items: [
      {
        title: vm.$t("PreferredServer"),
        type: "input",
        isWarn: false,
        warnLabel: vm.$t("error"),
        key: "Config.Settings.SNTP.NTPServer1",
        value: vm.apiData.configData["Config.Settings.SNTP.NTPServer1"],
        description: vm.$t("PreferServerDesc"),
      },
      {
        title: vm.$t("UpdateInterval"),
        type: "input",
        isShow: false,
        showHint:true,
        hintContent:vm.$t("(>=3600Sec)"),
        isWarn: false,
        warnLabel: vm.$t("error"),
        key: "Config.Settings.SNTP.Interval",
        value: vm.apiData.configData["Config.Settings.SNTP.Interval"],
        description: vm.$t("UpdateIntervalDesc"),
      },
    ],
  };
  return content;
}
</script>