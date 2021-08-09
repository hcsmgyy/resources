<template>
  <CommonPage :data="data" @onDataChange="onCommonPageDataChange($event)"></CommonPage>
</template>

<script>
import CommonPage from "@/components/CommonPage.vue";
import {
  showRequestSuccess,
  deepClone,
  checkFileFormat,
  showErrorInfo,
  getItemByKey,
  getContentByKey,
} from "@/js/common.js";
import { getOptionsByLabel } from "@/js/commonKeys.js";

export default {
  components: {
    CommonPage,
  },
  data() {
    return {
      wallpaperFileItems: [],
      wallpaperFileItemsCall: [],
      screenSaverTypeItems: [],
      screenSaverPictureItems: [],
      screenSaverVideoItems: [],
      typeItems: [],
      type2Items: [],
      appSelectItems: [],
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
      handlerPageChanged(this, event);
    },
  },
};

function setChangedData(vm, event) {
  if (event.contentKey == "homepage" && event.itemKey == "homepage") {
    let tableData = event.newVal;
    for (let i = 0; i < tableData.length; i++) {
      vm.changedCfgData["Config.Indoor.PAGE1AREA" + (i + 1) + ".DisplayType"] =
        tableData[i].type.value;
      vm.changedCfgData["Config.Indoor.PAGE1AREA" + (i + 1) + ".LABEL"] =
        tableData[i].label.value;
      vm.changedCfgData["Config.Indoor.PAGE1AREA" + (i + 1) + ".Value"] =
        tableData[i].value.value;

      if (event.newVal[i].icon.fileName != event.oldVal[i].icon.fileName) {
        vm.changedCfgData["Config.Indoor.PAGE1AREA" + (i + 1) + ".ICON"] =
          tableData[i].icon.fileName == vm.$t("UpgradeFilePath")
            ? ""
            : tableData[i].icon.fileName;
      }
    }
  } else if (event.contentKey == "morepage" && event.itemKey == "morepage") {
    let tableData = event.newVal;
    for (let i = 0; i < tableData.length; i++) {
      vm.changedCfgData["Config.Indoor.PAGE2AREA" + (i + 1) + ".DisplayType"] =
        tableData[i].type.value;
      vm.changedCfgData["Config.Indoor.PAGE2AREA" + (i + 1) + ".LABEL"] =
        tableData[i].label.value;
      vm.changedCfgData["Config.Indoor.PAGE2AREA" + (i + 1) + ".Value"] =
        tableData[i].value.value;

      if (event.newVal[i].icon.fileName != event.oldVal[i].icon.fileName) {
        vm.changedCfgData["Config.Indoor.PAGE2AREA" + (i + 1) + ".ICON"] =
          tableData[i].icon.fileName == vm.$t("UpgradeFilePath")
            ? ""
            : tableData[i].icon.fileName;
      }
    }
  } else if (event.contentKey == "themeSetting") {
    let wallpaperItems = getItemByKey(vm.data, "wallpaper", "Config.Settings.LOGO.Wallpaper");
    wallpaperItems.value = "/sdcard/Pictures/wallpaper/default/7.jpg";
    vm.changedCfgData["Config.Settings.LOGO.Wallpaper"] = "/sdcard/Pictures/wallpaper/default/7.jpg";
    vm.changedCfgData[event.itemKey] = event.newVal;
  } else {
    vm.changedCfgData[event.itemKey] = event.newVal;
  }
}

function handlerPageChanged(vm, event) {
  //theme
  let themeData = getItemByKey(vm.data, "themeSetting", "Config.Settings.DISPLAYSTYLE.IdleStyle");
  let wallpaperItems = getItemByKey(vm.data, "wallpaper", "Config.Settings.LOGO.Wallpaper");
  let homePageContent = getContentByKey(vm.data, "homepage");
  let morePageContent = getContentByKey(vm.data, "morepage");
  if (themeData.value == 4) {
    wallpaperItems.selectItems = vm.wallpaperFileItems;
    //换图片
    homePageContent.imgName = "home_page_default.png";
    morePageContent.imgName = "more_page_default.png";
  } else {
    wallpaperItems.selectItems = vm.wallpaperFileItemsCall;
    homePageContent.imgName = "home_page_call.png";
    morePageContent.imgName = "more_page_call.png";
  }
  //homepage
  let homepageItem = getItemByKey(vm.data, "homepage", "homepage");
  let homepageTableData = homepageItem.tableData;
  for (let i = 0; i < homepageTableData.length; i++) {
    //type是否相同
    homepageTableData[i].type.isWarn = false;
    for (let j = 0; j < homepageTableData.length; j++) {
      if (
        i != j &&
        homepageTableData[j].type.value == homepageTableData[i].type.value &&
        homepageTableData[j].type.value !=
          getAreaTypeByLabel("Custom APK", vm) &&
        homepageTableData[j].type.value != getAreaTypeByLabel("Browser", vm) &&
        homepageTableData[j].type.value != getAreaTypeByLabel("N/A", vm)
      ) {
        homepageTableData[i].type.isWarn = true;
        homepageTableData[j].type.isWarn = true;
      }
    }
    //icon显示与否
    if (homepageTableData[i].type.value == getAreaTypeByLabel("DND", vm)) {
      homepageTableData[i].icon.isShow = false;
    } else {
      homepageTableData[i].icon.isShow = true;
    }
    //label是否禁用
    if (
      homepageTableData[i].type.value == getAreaTypeByLabel("DND", vm) ||
      homepageTableData[i].type.value == getAreaTypeByLabel("Unlock", vm)
    ) {
      homepageTableData[i].label.disabled = true;
    } else {
      homepageTableData[i].label.disabled = false;
    }
    //value是否禁用
    if (
      homepageTableData[i].type.value == getAreaTypeByLabel("Custom APK", vm) ||
      homepageTableData[i].type.value == getAreaTypeByLabel("Browser", vm)
    ) {
      homepageTableData[i].value.disabled = false;
    } else {
      homepageTableData[i].value.disabled = true;
    }
    //value值的input和select框变换
    if (
      homepageTableData[i].type.value == getAreaTypeByLabel("Custom APK", vm)
    ) {
      homepageTableData[i].value.itemType = "select";
      homepageTableData[i].value.disabled = false;
       homepageTableData[i].value.isWarn=false;
    } else {
      homepageTableData[i].value.itemType = "input";
       homepageTableData[i].value.isWarn = false;
    }

    //type变化时label值更新，value值更新
    if (
      "undefined" != typeof event &&
      event.itemKey == "homepage" &&
      event.contentKey == "homepage"
    ) {
      if (event.newVal[i].type.value != event.oldVal[i].type.value) {
        if (
          vm.apiData.configData[
            "Config.Indoor.PAGE1AREA" + (i + 1) + ".LABEL"
          ] != "" &&
          vm.apiData.configData[
            "Config.Indoor.PAGE1AREA" + (i + 1) + ".DisplayType"
          ] == event.newVal[i].type.value
        ) {
          tableData[i].label.value =
            vm.apiData.configData[
              "Config.Indoor.PAGE1AREA" + (i + 1) + ".LABEL"
            ];
        } else {
          homepageTableData[i].label.value = getOptionsByLabel(
            vm,
            getAreaTypeByKey(homepageTableData[i].type.value, vm)
          );
          vm.changedCfgData["Config.Indoor.PAGE1AREA" + (i + 1) + ".LABEL"] =
            homepageTableData[i].label.value;
        }
        if (
          vm.apiData.configData[
            "Config.Indoor.PAGE1AREA" + (i + 1) + ".DisplayType"
          ] == event.newVal[i].type.value
        ) {
          homepageTableData[i].value.value =
            vm.apiData.configData[
              "Config.Indoor.PAGE1AREA" + (i + 1) + ".Value"
            ];
        } else {
          homepageTableData[i].value.value = "";
          vm.changedCfgData["Config.Indoor.PAGE1AREA" + (i + 1) + ".Value"] =
            "";
        }
      }
    }
  }
  //morepage
  let morepageItem = getItemByKey(vm.data, "morepage", "morepage");
  let morepageTableData = morepageItem.tableData;
  for (let i = 0; i < morepageTableData.length; i++) {
    //type是否相同
    morepageTableData[i].type.isWarn = false;
    for (let j = 0; j < morepageTableData.length; j++) {
      if (
        i != j &&
        morepageTableData[j].type.value == morepageTableData[i].type.value &&
        morepageTableData[j].type.value !=
          getAreaTypeByLabel("Custom APK", vm) &&
        morepageTableData[j].type.value != getAreaTypeByLabel("Browser", vm) &&
        morepageTableData[j].type.value != getAreaTypeByLabel("N/A", vm)
      ) {
        morepageTableData[i].type.isWarn = true;
        morepageTableData[j].type.isWarn = true;
      }
    }
    //icon显示与否
    if (morepageTableData[i].type.value == getAreaTypeByLabel("DND", vm)) {
      morepageTableData[i].icon.isShow = false;
    } else {
      morepageTableData[i].icon.isShow = true;
    }
    //label是否禁用
    if (
      morepageTableData[i].type.value == getAreaTypeByLabel("DND", vm) ||
      morepageTableData[i].type.value == getAreaTypeByLabel("Unlock", vm)
    ) {
      morepageTableData[i].label.disabled = true;
    } else {
      morepageTableData[i].label.disabled = false;
    }
    //value是否禁用
    if (
      morepageTableData[i].type.value == getAreaTypeByLabel("Custom APK", vm) ||
      morepageTableData[i].type.value == getAreaTypeByLabel("Browser", vm)
    ) {
      morepageTableData[i].value.disabled = false;
    } else {
      morepageTableData[i].value.disabled = true;
    }
    //value值的input和select框变换
    if (
      morepageTableData[i].type.value == getAreaTypeByLabel("Custom APK", vm)
    ) {
      morepageTableData[i].value.itemType = "select";
      morepageTableData[i].value.disabled = false;
      morepageTableData[i].value.isWarn=false;
    } else {
      morepageTableData[i].value.itemType = "input";
      morepageTableData[i].value.isWarn=false;
    }

    //type变化时label值更新，value值更新
    if (
      "undefined" != typeof event &&
      event.itemKey == "morepage" &&
      event.contentKey == "morepage"
    ) {
      if (event.newVal[i].type.value != event.oldVal[i].type.value) {
        if (
          vm.apiData.configData[
            "Config.Indoor.PAGE2AREA" + (i + 1) + ".LABEL"
          ] != "" &&
          vm.apiData.configData[
            "Config.Indoor.PAGE2AREA" + (i + 1) + ".DisplayType"
          ] == event.newVal[i].type.value
        ) {
          morepageTableData[i].label.value =
            vm.apiData.configData[
              "Config.Indoor.PAGE2AREA" + (i + 1) + ".LABEL"
            ];
        } else {
          morepageTableData[i].label.value = getOptionsByLabel(
            vm,
            getAreaTypeByKey(morepageTableData[i].type.value, vm)
          );
          vm.changedCfgData["Config.Indoor.PAGE2AREA" + (i + 1) + ".LABEL"] =
            morepageTableData[i].label.value;
        }
        if (
          vm.apiData.configData[
            "Config.Indoor.PAGE2AREA" + (i + 1) + ".DisplayType"
          ] == event.newVal[i].type.value
        ) {
          morepageTableData[i].value.value =
            vm.apiData.configData[
              "Config.Indoor.PAGE2AREA" + (i + 1) + ".Value"
            ];
        } else {
          morepageTableData[i].value.value = "";
          vm.changedCfgData["Config.Indoor.PAGE2AREA" + (i + 1) + ".Value"] =
            "";
        }
      }
    }
  }
  //wall papaer
  let wallPaperFileItem = getItemByKey(
    vm.data,
    "wallpaper",
    "Config.Settings.LOGO.Wallpaper"
  );
  wallPaperFileItem.delDisabled = false;
  let wallpaperDefaultPicture = vm.apiData.data.wallpaperDefaultFiles.split("\n");
  for (let i = 0; i < wallpaperDefaultPicture.length; i++) {
    var wallpaperPicture = vm.apiData.data.wallpaperPath + "default/" +wallpaperDefaultPicture[i];
    if(wallPaperFileItem.value == wallpaperPicture){
      wallPaperFileItem.delDisabled = true;
      break;
    }
  }
}

function getAreaTypeByLabel(label, vm) {
  let types = vm.apiData.data.Page1DisplayTypes;
  for (let i = 0; i < types.length; i++) {
    if (types[i].label == label) {
      return types[i].key;
    }
  }
  return -1;
}

function getAreaTypeByKey(key, vm) {
  let types = vm.apiData.data.Page1DisplayTypes;
  for (let i = 0; i < types.length; i++) {
    if (types[i].key == key) {
      return types[i].label;
    }
  }
  return -1;
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "phoneDisplaySetting",
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
  vm.$axios.get("api/phoneDisplaySetting/info").then((response) => {
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
    if ( (vm.apiData.configData[changedKey] != vm.changedCfgData[changedKey]) || changedKey == "Config.Settings.LOGO.Wallpaper") {
      vm.submitCfgData[changedKey] = vm.changedCfgData[changedKey];
    }
  }
}

function checkCommitData(vm) {
  return checkHomepageData(vm) && checkMorepageData(vm);
}

function checkMorepageData(vm) {
  let success = true;
  let item = getItemByKey(vm.data, "morepage", "morepage");
  let tableData = item.tableData;
  for (let i = 0; i < tableData.length; i++) {
    //type是否相同
    for (let j = 0; j < tableData.length; j++) {
      if (
        i != j &&
        tableData[j].type.value == tableData[i].type.value &&
        tableData[j].type.value != getAreaTypeByLabel("Custom APK", vm) &&
        tableData[j].type.value != getAreaTypeByLabel("Browser", vm) &&
        tableData[j].type.value != getAreaTypeByLabel("N/A", vm)
      ) {
        success = false;
      }
    }
    if(tableData[i].type.value == getAreaTypeByLabel("Custom APK", vm) ||
        tableData[i].type.value == getAreaTypeByLabel("Browser", vm)
      ){
        if(tableData[i].value.value == ""){
          tableData[i].value.isWarn = true;
          success = false;
        }
      }
  }
  return success;
}

function checkHomepageData(vm) {
  let success = true;
  let item = getItemByKey(vm.data, "homepage", "homepage");
  let tableData = item.tableData;
  for (let i = 0; i < tableData.length; i++) {
    //type是否相同
    for (let j = 0; j < tableData.length; j++) {
      if (
        i != j &&
        tableData[j].type.value == tableData[i].type.value &&
        tableData[j].type.value != getAreaTypeByLabel("Custom APK", vm) &&
        tableData[j].type.value != getAreaTypeByLabel("Browser", vm) &&
        tableData[j].type.value != getAreaTypeByLabel("N/A", vm)
      ) {
        success = false;
      }
    }

    if(tableData[i].type.value == getAreaTypeByLabel("Custom APK", vm) ||
        tableData[i].type.value == getAreaTypeByLabel("Browser", vm)
    ){
      if(tableData[i].value.value == ""){
        tableData[i].value.isWarn = true;
        success = false;
      }
    }
  }
  return success;
}

function createSelectItems(vm) {
  //apklist
  vm.appSelectItems = [];
  let appItems = vm.apiData.data.apkList.split("&");
  if (vm.apiData.data.apkList == "null") {
    vm.appSelectItems.push({ key: "", label: "" });
  } else {
    for (let i = 0; i < appItems.length; i++) {
      if (appItems[i].length == 0) {
        continue;
      }
      let arr = appItems[i].split("=");
      var selectItem = {
        key: arr[1],
        label: arr[0],
      };
      vm.appSelectItems.push(selectItem);
    }
  }

  //page1 type select items
  vm.typeItems = [];
  let types = vm.apiData.data.Page1DisplayTypes;
  for (let i = 0; i < types.length-1; i++) {
    let item = {
      key: types[i].key,
      label: getOptionsByLabel(vm, types[i].label),
    };
    vm.typeItems.push(item);
  }

  //page2 type select items
  vm.type2Items = [];
  let types2 = vm.apiData.data.Page1DisplayTypes;
  for (let i = 0; i < types2.length; i++) {
    let item = {
      key: types[i].key,
      label: getOptionsByLabel(vm, types[i].label),
    };
    vm.type2Items.push(item);
  }

  //screen picture
  vm.screenSaverVideoItems = [];
  vm.screenSaverPictureItems = [];
  let screenSaver = vm.apiData.data.screenSaverFiles.split("\n");
  for (let i = 0; i < screenSaver.length; i++) {
    if (screenSaver[i] != "") {
      let item = {
        key: screenSaver[i],
        label: screenSaver[i],
      };
      if (
        checkFileFormat(screenSaver[i], ".JPG", 4) ||
        checkFileFormat(screenSaver[i], ".JPEG", 5) ||
        checkFileFormat(screenSaver[i], ".PNG", 4)
      ) {
        vm.screenSaverPictureItems.push(item);
      } else if (
        checkFileFormat(screenSaver[i], ".MP4", 4) ||
        checkFileFormat(screenSaver[i], ".WMV", 4) ||
        checkFileFormat(screenSaver[i], ".AVI", 4)
      ) {
        vm.screenSaverVideoItems.push(item);
      }
    }
  }
  //screen saver types
  vm.screenSaverTypeItems = [];
  if (vm.apiData.configData["Config.DoorSetting.CONNECT.ServerMode"] == 1) {
    vm.screenSaverTypeItems.push({ key: 0, label: vm.$t("SDMC") });
    vm.screenSaverTypeItems.push({ key: 2, label: vm.$t("SDMCLocalPictures") });
  }
  vm.screenSaverTypeItems.push({ key: 1, label: vm.$t("LocalPictures") });
  vm.screenSaverTypeItems.push({ key: 6, label: vm.$t("Clock") });
  if (vm.apiData.data.hasAkFace != "") {
    if (vm.apiData.configData["Config.DoorSetting.CONNECT.ServerMode"] == 1) {
      vm.screenSaverTypeItems.push({ key: 3, label: vm.$t("SDMCVideos") });
      vm.screenSaverTypeItems.push({ key: 5, label: vm.$t("SDMCLocalVideos") });
    }
    vm.screenSaverTypeItems.push({ key: 4, label: vm.$t("LocalVideos") });
  }
  //wallpaper files
  vm.wallpaperFileItemsCall = [];
  vm.wallpaperFileItems = [];
  let wallpeperDefaultFiles = vm.apiData.data.wallpaperDefaultFiles.split("\n");
  for (let i = 0; i < wallpeperDefaultFiles.length; i++) {
    let item = {
      key: vm.apiData.data.wallpaperPath + "default/" + wallpeperDefaultFiles[i],
      label: wallpeperDefaultFiles[i],
    };
    if (wallpeperDefaultFiles[i] != "") {
      vm.wallpaperFileItems.push(item);
      if (!(wallpeperDefaultFiles[i] == "1.jpg" || wallpeperDefaultFiles[i] == "4.jpg")) {
        vm.wallpaperFileItemsCall.push(item);
      } 
    } 
  }
  let wallpeperFiles = vm.apiData.data.wallpaperFiles.split("\n");
  for (let i = 0; i < wallpeperFiles.length; i++) {
    if (wallpeperFiles[i] != "" && 
      (checkFileFormat(wallpeperFiles[i], ".PNG", 4) ||
          checkFileFormat(wallpeperFiles[i], ".JPG", 4) ||
          checkFileFormat(wallpeperFiles[i], ".JPEG", 5))) {
      let item = {
        key: vm.apiData.data.wallpaperPath + wallpeperFiles[i],
        label: wallpeperFiles[i],
      };
      vm.wallpaperFileItems.push(item);
      vm.wallpaperFileItemsCall.push(item);
    }
  }
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Phone"),
      secondTitle: vm.$t("DisplaySetting"),
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

  createSelectItems(vm);

  vm.data.contents.push(createThemeContent(vm));
  vm.data.contents.push(createHomepageContent(vm));
  vm.data.contents.push(createMorepageContent(vm));
  vm.data.contents.push(createScreenSaverContent(vm));
  vm.data.contents.push(createWallpapaerContent(vm));
  vm.data.contents.push(createBootLogoContent(vm));
}

function createThemeContent(vm) {
  let content = {
    key: "themeSetting",
    title: vm.$t("ThemeLabel"),
    titleDescription: vm.$t("ThemeSettingDesc"),
    items: [
      {
        title: vm.$t("ThemeLabel"),
        type: "select",
        key: "Config.Settings.DISPLAYSTYLE.IdleStyle",
        value: vm.apiData.configData["Config.Settings.DISPLAYSTYLE.IdleStyle"] == "" ? 4 :
          vm.apiData.configData["Config.Settings.DISPLAYSTYLE.IdleStyle"],
        selectItems: [
          { key: 4, label: "Default" },
          { key: 5, label: "Call List" },
        ],
        description: vm.$t("ThemeSettingDesc"),
      },
    ],
  };
  return content;
}

function createBootLogoContent(vm) {
  let content = {
    key: "bootLogo",
    title: vm.$t("BootLogo"),
    titleDescription: vm.$t("BootLogoDesc"),
    items: [
      {
        title: vm.$t("BootLogo"),
        type: "file-input",
        key: "bootLogoUpload",
        acceptFileType: ".zip,.png",
        modalTitle: vm.$t("BootLogoFormat1280"),
        loading: false,
        value: {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        },
        importBtnName: vm.$t("Import"),
        modalConfirmName: vm.$t("Upload"),
        imgResolutionWidth: 1280,
        imgResolutionHeight: 800,
        uploadFunction: function () {
          uploadFile(vm, "bootLogo", "bootLogoUpload");
        },
        isShowExport: true,
        exportBtnName: vm.$t("Reset"),
        exportBtnIcon: "iconreset",
        onExport: function () {
          onDelFile(vm, "", "bootLogo", "bootLogoUpload");
        },
        description: vm.$t("BootLogoDesc"),
      },
    ],
  };
  return content;
}

function createWallpapaerContent(vm) {
  let content = {
    key: "wallpaper",
    title: vm.$t("Wallpaper"),
    titleDescription: vm.$t("WallpaperDesc"),
    items: [
      {
        title: vm.$t("Wallpaper"),
        type: "file-input",
        key: "wallpaperUpload",
        acceptFileType: ".jpg,.jpeg,.png",
        modalTitle: vm.$t("WallpaperFormat1280"),
        loading: false,
        value: {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        },
        importBtnName: vm.$t("Import"),
        modalConfirmName: vm.$t("Upload"),
        imgResolutionWidth: 1280,
        imgResolutionHeight: 800,
        uploadFunction: function () {
          uploadFile(vm, "wallpaper", "wallpaperUpload");
        },
        description: vm.$t("WallpaperDesc"),
      },
      {
        title: vm.$t("WallpaperFiles"),
        type: "select",
        key: "Config.Settings.LOGO.Wallpaper",
        value: vm.apiData.configData["Config.Settings.LOGO.Wallpaper"],
        selectItems: vm.wallpaperFileItems,
        showBtn: true,
        onDel: function (value) {
          if (value != "") {
            onDelFile(vm, value, "wallpaper", "wallpaperDel");
          }
        },
        loading: false,
        delDisabled: false,
        description: vm.$t("WallpaperFileDesc"),
      },
    ],
  };
  return content;
}

function createScreenSaverContent(vm) {
  let content = {
    key: "screenSaver",
    title: vm.$t("ScreenSaverSetting"),
    titleDescription: vm.$t("ScreenSettingDesc"),
    items: [
      {
        title: vm.$t("ScreenSaverPictures"),
        type: "file-input",
        key: "screenSaverPicture",
        acceptFileType: ".jpg,.png,.jpeg",
        modalTitle: vm.$t("ScreenSaverFormat"),
        loading: false,
        value: {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        },
        importBtnName: vm.$t("Import"),
        modalConfirmName: vm.$t("Upload"),
        uploadFunction: function () {
          uploadFile(vm, "screenSaver", "screenSaverPicture");
        },
        maxSize: 2 * 1024 * 1024,
        description: vm.$t("ScreenPictureDesc"),
      },
      {
        title: vm.$t("ScreenSaverVideos"),
        isHide: vm.apiData.data.hasAkFace == "",
        type: "file-input",
        key: "screenSaverVideo",
        acceptFileType: ".mp4,.wmv,.avi",
        modalTitle: vm.$t("ScreenSaverVideoFormat"),
        loading: false,
        value: {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        },
        importBtnName: vm.$t("Import"),
        modalConfirmName: vm.$t("Upload"),
        uploadFunction: function () {
          uploadFile(vm, "screenSaver", "screenSaverVideo");
        },
        maxSize: 500 * 1024 * 1024,
        description: vm.$t("ScreenVideoDesc"),
      },
      {
        title: vm.$t("PictureFiles"),
        type: "select",
        key: "pictureFile",
        value: 
          vm.screenSaverPictureItems.length == 0
            ? ""
            : vm.screenSaverPictureItems[0].key,
        selectItems: vm.screenSaverPictureItems,
        showBtn: true,
        onDel: function (value) {
          if (value != "") {
            onDelFile(vm, value, "screenSaver", "pictureFile");
          }
        },
        loading: false,
        delDisabled: vm.screenSaverPictureItems.length <= 2,
        description: vm.$t("PictureFileDesc"),
      },
      {
        title: vm.$t("VideoFiles"),
        isHide: vm.apiData.data.hasAkFace == "",
        type: "select",
        key: "videoFile",
        value:
          vm.screenSaverVideoItems.length == 0
            ? ""
            : vm.screenSaverVideoItems[0].key,
        selectItems: vm.screenSaverVideoItems,
        showBtn: true,
        onDel: function (value) {
          if (value != "") {
            onDelFile(vm, value, "screenSaver", "videoFile");
          }
        },
        loading: false,
        delDisabled: vm.screenSaverVideoItems.length == 0,
        description: vm.$t("VideoFileDesc"),
      },
      {
        title: vm.$t("ScreenSaverType"),
        type: "select",
        key: "Config.Settings.SCREENSAVER.ScreesaverType",
        value:
          vm.apiData.configData["Config.Settings.SCREENSAVER.ScreesaverType"],
        selectItems: vm.screenSaverTypeItems,
        description: vm.$t("ScreenSaverTypeDesc"),
      },
    ],
  };
  return content;
}

function createMorepageContent(vm) {
  //table data
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.page2Num; i++) {
    let item = {
      key: i,
      area: vm.$t("Area") + (i + 1),
      type: {
        value:
          vm.apiData.configData[
            "Config.Indoor.PAGE2AREA" + (i + 1) + ".DisplayType"
          ],
        isWarn: false,
        warnLabel: vm.$t("PleaseCheckMultiplicity"),
      },
      value: {
        value:
          vm.apiData.configData["Config.Indoor.PAGE2AREA" + (i + 1) + ".Value"],
        isWarn: false,
        warnLabel: vm.$t("WarnInvaildEmptyError"),
        disabled: true,
        itemType: "input",
      },
      label: {
        value:
          vm.apiData.configData["Config.Indoor.PAGE2AREA" + (i + 1) + ".LABEL"],
        isWarn: false,
        warnLabel: "",
        disabled: false,
      },
      icon: {
        fileData: {},
        // fileName: vm.$t("UpgradeFilePath"),
        fileName: vm.apiData.configData["Config.Indoor.PAGE2AREA" + (i + 1) + ".ICON"] == "" ? vm.$t("UpgradeFilePath"): vm.apiData.configData["Config.Indoor.PAGE2AREA" + (i + 1) + ".ICON"],
        isShow: true,
      },
    };
    tableData.push(item);
  }
  //content
  let content = {
    key: "morepage",
    title: vm.$t("Page2Display"),
    titleDescription: vm.$t("MorePageDisplayDesc"),
    showExample: true,
    imgName: "more_page_default.png",
    items: [
      {
        type: "table",
        key: "morepage",
        tableData: tableData,
        tableColumns: [
          {
            type: "label",
            title: vm.$t("Area"),
            dataIndex: "area",
            scopedSlots: { customRender: "area" },
            align: "center",
            width: "11%",
          },
          {
            type: "select",
            title: vm.$t("Type"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            selectItems: vm.type2Items,
            align: "center",
            width: "18%",
          },
          {
            type: "input",
            title: vm.$t("Value"),
            dataIndex: "value",
            scopedSlots: { customRender: "value" },
            align: "center",
            width: "18%",
            maxLength: 127,
            selectItems: vm.appSelectItems,
          },
          {
            type: "input",
            title: vm.$t("Label"),
            dataIndex: "label",
            scopedSlots: { customRender: "label" },
            align: "center",
            width: "18%",
            maxLength: 127,
          },
          {
            type: "file-input",
            title: vm.$t("IconLabel") + "(" + vm.$t("MaxIconSize") + ":100*100)",
            dataIndex: "icon",
            scopedSlots: { customRender: "icon" },
            align: "center",
            width: "35%",
            btnName: vm.$t("DeleteLabel"),
            acceptFileType: ".jpg,.png,.jpeg",
            upload: function (fileData, index) {
              return uploadIcon(fileData, index, vm);
            },
          },
        ],
      },
    ],
  };
  return content;
}

function createHomepageContent(vm) {
  //data
  let tableData = [];
  for (let i = 0; i < vm.apiData.data.page1Num; i++) {
    let item = {
      key: i,
      area: vm.$t("Area") + (i + 1),
      type: {
        value:
          vm.apiData.configData[
            "Config.Indoor.PAGE1AREA" + (i + 1) + ".DisplayType"
          ],
        isWarn: false,
        warnLabel: vm.$t("PleaseCheckMultiplicity"),
      },
      value: {
        value:
          vm.apiData.configData["Config.Indoor.PAGE1AREA" + (i + 1) + ".Value"],
        isWarn: false,
        warnLabel: vm.$t("WarnInvaildEmptyError"),
        disabled: true,
        itemType: "input",
      },
      label: {
        value:
          vm.apiData.configData["Config.Indoor.PAGE1AREA" + (i + 1) + ".LABEL"],
        isWarn: false,
        warnLabel: "",
        disabled: false,
      },
      icon: {
        fileData: {},
        fileName: vm.$t("UpgradeFilePath"),
        fileName: vm.apiData.configData["Config.Indoor.PAGE1AREA" + (i + 1) + ".ICON"] == "" ? vm.$t("UpgradeFilePath"): vm.apiData.configData["Config.Indoor.PAGE1AREA" + (i + 1) + ".ICON"],
        isShow: true,
      },
    };
    tableData.push(item);
  }
  //content
  let content = {
    key: "homepage",
    title: vm.$t("Page1Display"),
    titleDescription: vm.$t("HomePageDisplayDesc"),
    showExample: true,
    imgName: "home_page_default.png",
    items: [
      {
        type: "table",
        key: "homepage",
        tableData: tableData,
        tableColumns: [
          {
            type: "label",
            title: vm.$t("Area"),
            dataIndex: "area",
            scopedSlots: { customRender: "area" },
            align: "center",
            width: "11%",
          },
          {
            type: "select",
            title: vm.$t("Type"),
            dataIndex: "type",
            scopedSlots: { customRender: "type" },
            selectItems: vm.typeItems,
            align: "center",
            width: "18%",
          },
          {
            type: "input",
            title: vm.$t("Value"),
            dataIndex: "value",
            scopedSlots: { customRender: "value" },
            align: "center",
            width: "18%",
            maxLength: 127,
            selectItems: vm.appSelectItems,
          },
          {
            type: "input",
            title: vm.$t("Label"),
            dataIndex: "label",
            scopedSlots: { customRender: "label" },
            align: "center",
            width: "18%",
            maxLength: 127,
          },
          {
            type: "file-input",
            title: vm.$t("IconLabel") + "(" + vm.$t("MaxIconSize") + ":100*100)",
            dataIndex: "icon",
            scopedSlots: { customRender: "icon" },
            align: "center",
            width: "35%",
            btnName: vm.$t("DeleteLabel"),
            acceptFileType: ".jpg,.png,.jpeg",
            upload: function (fileData, index) {
              return uploadIcon(fileData, index, vm);
            },
          },
        ],
      },
    ],
  };
  return content;
}

function uploadIcon(fileData, index, vm) {
  let fileName = fileData.name;
  if (fileName == "" || fileName == vm.$t("UpgradeFilePath")) {
    showErrorInfo(vm, vm.$t("FileEmptyWarning"));
    return;
  }

  //确认图片分辨率
  var reader = new FileReader();
  reader.readAsDataURL(fileData);
  reader.onload = function () {
    var img = new Image();
    img.src = reader.result;
    img.onload = function () {
      //分辨率超出
      if (img.width > 100 || img.height > 100) {
        showErrorInfo(vm, vm.$t("ImageResolutionErr"));
        let item = getItemByKey(vm.data, "homepage", "homepage");
        item.tableData[index].icon = {
          fileData: {},
          fileName: vm.$t("UpgradeFilePath"),
        };
        return;
      }
      //正常上传
      const upData = new FormData();
      upData.append("file", fileData);
      axios
        .post("api/phoneDisplaySetting/upload?type=areaIcon", upData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {});
    };
    img.onerror = function () {
      //图片加载错误
      showErrorInfo(vm, vm.$t("FileFormatWarning"));
      let item = getItemByKey(vm.data, "homepage", "homepage");
      item.tableData[index].icon = {
        fileData: {},
        fileName: vm.$t("UpgradeFilePath"),
      };
    };
  };
}

function uploadFile(vm, contentKey, itemKey) {
  let item = getItemByKey(vm.data, contentKey, itemKey);
  let fileName = item.value.fileName;
  if (fileName == "" || fileName == vm.$t("UpgradeFilePath")) {
    showErrorInfo(vm, vm.$t("FileEmptyWarning"));
    return;
  }
  let confirmText = vm.$t("ImportWallpaperWarning");
  if (contentKey == "screenSaver") {
    confirmText = vm.$t("ImportScreenSaverWarning");
  } else if (contentKey == "bootLogo") {
    confirmText = vm.$t("UploadLogoWarning");
  }
  item.visible = true;
  if (confirm(confirmText)) {
    //上传
    item.loading = true;
    const upData = new FormData();
    upData.append("file", item.value.fileData);
    let apiUrl = "api/phoneDisplaySetting/upload?type=" + itemKey;
    if (itemKey == "bootLogoUpload") {
      apiUrl +=
        "&width=" +
        item.value.fileData.width +
        "&height=" +
        item.value.fileData.height;
    }
    axios
      .post(apiUrl, upData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data.retcode == -1) {
          showErrorInfo(vm, vm.$t("FileUploadFailedWarning"));
        } else if (res.data.retcode == 0) {
          getData(vm);
          showRequestSuccess(vm, vm.$t("UploadFileFinished"));
          item.visible = false;
          item.value.fileName = vm.$t("UpgradeFilePath");
          item.value.fileData = {};
        }
        item.loading = false;
      });
  }
}

function onDelFile(vm, value, contentKey, itemKey) {
  let realItemKey =
    itemKey == "wallpaperDel" ? "Config.Settings.LOGO.Wallpaper" : itemKey;
  let requestData = {
    target: "phoneDisplaySetting",
    action: "del",
    data: {
      fileName: value,
      type: itemKey,
    },
  };
  if (itemKey == "bootLogoUpload") {
    if (!confirm(vm.$t("DeleteLogoConfirm"))) {
      return;
    }
  } else {
    if (!confirm(vm.$t("DeleteSelectedConfirm"))) {
      return;
    }
  }
  getItemByKey(vm.data, contentKey, realItemKey).loading = true;
  vm.$axios.post("api", requestData).then((response) => {
    getItemByKey(vm.data, contentKey, realItemKey).loading = false;
    getData(vm);
    showRequestSuccess(vm);
  });
}
</script>