<template >
  <div class="ak-homepage-div" v-if="getDataSuccess">
    <div class="ak-homepage-head">
      <div class="ak-homepage-head-logo"
        :style="hiddenArr.isShowLogoLabel != 1 ? {visibility:'hidden'} : {visibility:'visible'}">
        <img src="../Image/logo1.png" />
        <label>{{apiData.data.Product.ProductName}}</label>
      </div>
      <div class="ak-homepage-language">
        <a-select
          size="default"
          :value="Number(apiData.data.Product.WebLang)"
          :defaultValue="$t('English')"
          style="margin-right:30px;width:120px;border-radius:18px"
          @change="changeLang"
          dropdownClassName="ak-select-item"
        >
          <a-icon
            slot="suffixIcon"
            type="caret-down"
            theme="filled"
            :style="{color:'#343434',fontSize:'20px'}"
          />
          <a-select-option v-for="item in langArray" :key="item.key">{{ item.label }}</a-select-option>
        </a-select>
        <div @click="onLogOut" class="ak-logout-div">
          <my-icon type="iconlogout" :style="{ fontSize: '20px'}"></my-icon>
          <label class="ak-logout-label">{{$t("LogOut")}}</label>
        </div>
      </div>
    </div>
    <div class="ak-homepage-device-info-div">
      <div class="ak-homepage-device-info">
        <div class="ak-homepage-device-info-status">
          <div style="width:175px">
            <label>{{$t("Status")}}</label>
            <div class="ak-homepage-device-info-status-border"></div>
          </div>
        </div>
        <div class="ak-homepage-device-info-item">
          <label>{{$t("ProductReleaseName")}}</label>
          <label>{{apiData.data.Product.ProductName}}</label>
        </div>
        <div class="ak-homepage-device-info-item">
          <label>{{$t("HardwareVersion")}}</label>
          <label>{{apiData.data.Product.HardwareVersion}}</label>
        </div>
        <div class="ak-homepage-device-info-item">
          <label>{{$t("FirmwareVersion")}}</label>
          <label>{{apiData.data.Product.FirmwareVersion}}</label>
        </div>
        <div class="ak-homepage-device-info-item">
          <label>{{$t("MACAddress")}}</label>
          <label>{{MACAddress}}</label>
        </div>
        <div class="ak-homepage-device-info-item">
          <label>{{$t("IPAddressLabel")}}</label>
          <label>{{apiData.data.Network.IPAddress}}</label>
        </div>
        <div class="ak-homepage-device-info-item"
          :style="hiddenArr.isShowLogoLabel != 1 ? {visibility:'hidden'} : {visibility:'visible'}">
          <label>{{$t("SIPLabel")}}1</label>
          <label>{{apiData.data.Accounts[0].showValue}}</label>
        </div>
        <div class="ak-homepage-device-info-item"
          :style="hiddenArr.isShowLogoLabel != 1 ? {visibility:'hidden'} : {visibility:'visible'}">
          <label>{{$t("SIPLabel")}}2</label>
          <label>{{apiData.data.Accounts[1].showValue}}</label>
        </div>
      </div>
    </div>
    
    <div class="ak-homepage-menu-btn-div">
      <div class="ak-homepage-menu-sub-block" v-if="hiddenArr.accountShow">
        <router-link to="AccountBasic" class="ak-homepage-menu-router">
        <div class="ak-homepage-menu-btn" id="account" @mouseover="onHover('account')" @mouseout="onOver('account')">
          <div class="ak-homepage-menu-normal">
            <MyIcon type="iconAccount1" class="ak-homepage-menu-icon"></MyIcon>
            <label class="ak-homepage-menu-title">{{$t("Account")}}</label>
            <label class="ak-homepage-menu-sub-title">{{$t("SIPAccount")}}</label>
            <label class="ak-homepage-menu-sub-title">{{$t("AudioVideoCodec")}}</label>
          </div>
          <div class="ak-homepage-menu-hover">
            <MyIcon type="iconAccount1" class="ak-homepage-menu-icon-hover"></MyIcon>
            <label class="ak-homepage-menu-title-hover">{{$t("Account")}}</label>
          </div>
        </div>
      </router-link>
      </div>

      <div class="ak-homepage-menu-sub-block" v-if="hiddenArr.networkShow">
        <router-link to="NetworkBasic" class="ak-homepage-menu-router">
          <div class="ak-homepage-menu-btn" id="network" @mouseover="onHover('network')" @mouseout="onOver('network')">
            <div class="ak-homepage-menu-normal">
              <MyIcon type="iconNetwork1" class="ak-homepage-menu-icon"></MyIcon>
              <label class="ak-homepage-menu-title">{{$t("Network")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("DHCP")}}</label>
            </div>
            <div class="ak-homepage-menu-hover">
              <MyIcon type="iconNetwork1" class="ak-homepage-menu-icon-hover"></MyIcon>
              <label class="ak-homepage-menu-title-hover">{{$t("Network")}}</label>
            </div>
          </div>
        </router-link>
      </div>

      <div class="ak-homepage-menu-sub-block" v-if="hiddenArr.deviceShow">
        <router-link to="PhoneCallFeature" class="ak-homepage-menu-router">
          <div class="ak-homepage-menu-btn" id="phone" @mouseover="onHover('phone')" @mouseout="onOver('phone')">
            <div class="ak-homepage-menu-normal">
              <MyIcon type="iconphone" class="ak-homepage-menu-icon"></MyIcon>
              <label class="ak-homepage-menu-title">{{$t("Phone")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("Relay")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("CallFeature")}}</label>
            </div>
            <div class="ak-homepage-menu-hover">
              <MyIcon type="iconphone" class="ak-homepage-menu-icon-hover"></MyIcon>
              <label class="ak-homepage-menu-title-hover">{{$t("Phone")}}</label>
            </div>
          </div>
        </router-link>
      </div>

      <div class="ak-homepage-menu-sub-block" v-if="hiddenArr.contactShow">
        <router-link to="ContactsLocalContacts" class="ak-homepage-menu-router">
          <div class="ak-homepage-menu-btn" style="margin:0px" id="contacts" @mouseover="onHover('contacts')" @mouseout="onOver('contacts')">
            <div class="ak-homepage-menu-normal">
              <MyIcon type="iconContacts1" class="ak-homepage-menu-icon"></MyIcon>
              <label class="ak-homepage-menu-title">{{$t("Contacts")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("LocalContacts")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("CallLog")}}</label>
            </div>
            <div class="ak-homepage-menu-hover">
              <MyIcon type="iconContacts1" class="ak-homepage-menu-icon-hover"></MyIcon>
              <label class="ak-homepage-menu-title-hover">{{$t("Contacts")}}</label>
            </div>
          </div>
        </router-link>
      </div>

      <div class="ak-homepage-menu-sub-block">
        <router-link to="UpgradeBasic" class="ak-homepage-menu-router">
          <div class="ak-homepage-menu-btn" id="upgrade" @mouseover="onHover('upgrade')" @mouseout="onOver('upgrade')">
            <div class="ak-homepage-menu-normal">
              <MyIcon type="iconUpgrade1" class="ak-homepage-menu-icon"></MyIcon>
              <label class="ak-homepage-menu-title">{{$t("Upgrade")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("UpgradeFirmwareVersion")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("AutoProvision")}}</label>
            </div>
            <div class="ak-homepage-menu-hover">
              <MyIcon type="iconUpgrade1" class="ak-homepage-menu-icon-hover"></MyIcon>
              <label class="ak-homepage-menu-title-hover">{{$t("Upgrade")}}</label>
            </div>
          </div>
        </router-link>
      </div>

      <div class="ak-homepage-menu-sub-block">
        <router-link to="SecurityBasic" class="ak-homepage-menu-router">
          <div class="ak-homepage-menu-btn" id="security" @mouseover="onHover('security')" @mouseout="onOver('security')">
            <div class="ak-homepage-menu-normal">
              <MyIcon type="iconSecurity" class="ak-homepage-menu-icon"></MyIcon>
              <label class="ak-homepage-menu-title">{{$t("Security")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("WebPassword")}}</label>
            </div>
            <div class="ak-homepage-menu-hover">
              <MyIcon type="iconSecurity" class="ak-homepage-menu-icon-hover"></MyIcon>
              <label class="ak-homepage-menu-title-hover">{{$t("Security")}}</label>
            </div>
          </div>
        </router-link>
      </div>

      <div class="ak-homepage-menu-sub-block" v-if="hiddenArr.settingShow">
        <router-link to="SettingBasic" class="ak-homepage-menu-router">
          <div class="ak-homepage-menu-btn" id="setting" @mouseover="onHover('setting')" @mouseout="onOver('setting')">
            <div class="ak-homepage-menu-normal">
              <MyIcon type="iconSetting" class="ak-homepage-menu-icon"></MyIcon>
              <label class="ak-homepage-menu-title">{{$t("Settings")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("VoiceAssistant")}}</label>
            </div>
            <div class="ak-homepage-menu-hover">
              <MyIcon type="iconSetting" class="ak-homepage-menu-icon-hover"></MyIcon>
              <label class="ak-homepage-menu-title-hover">{{$t("Settings")}}</label>
            </div>
          </div>
        </router-link>
      </div>

      <div class="ak-homepage-menu-sub-block" v-if="hiddenArr.armingShow">
        <router-link to="ArmingZoneSetting" class="ak-homepage-menu-router">
          <div class="ak-homepage-menu-btn" style="margin:0px" id="arming" @mouseover="onHover('arming')" @mouseout="onOver('arming')">
            <div class="ak-homepage-menu-normal">
              <MyIcon type="iconArming1" class="ak-homepage-menu-icon"></MyIcon>
              <label class="ak-homepage-menu-title">{{$t("Arming")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("ZoneSetting")}}; {{$t("ArmingMode")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("DisarmCode")}}; {{$t("AlarmAction")}}</label>
            </div>
            <div class="ak-homepage-menu-hover">
              <MyIcon type="iconArming1" class="ak-homepage-menu-icon-hover"></MyIcon>
              <label class="ak-homepage-menu-title-hover">{{$t("Arming")}}</label>
            </div>
          </div>
        </router-link>
      </div>

      <div class="ak-homepage-menu-sub-block" v-if="hiddenArr.pbxShow">
        <router-link to="PbxBasic" class="ak-homepage-menu-router">
          <div class="ak-homepage-menu-btn" style="margin:0px" id="pbx" @mouseover="onHover('pbx')" @mouseout="onOver('pbx')">
            <div class="ak-homepage-menu-normal">
              <MyIcon type="iconPBX" class="ak-homepage-menu-icon"></MyIcon>
              <label class="ak-homepage-menu-title">{{$t("PBX")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("Basic")}}</label>
              <label class="ak-homepage-menu-sub-title">{{$t("RingGroup")}}</label>
            </div>
            <div class="ak-homepage-menu-hover">
              <MyIcon type="iconPBX" class="ak-homepage-menu-icon-hover"></MyIcon>
              <label class="ak-homepage-menu-title-hover">{{$t("PBX")}}</label>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    <CommonChangePwd
      :data="modalVisible"
      :userName="userName"
      :cancelBtnLabel="cancelBtnLabel"
      :title="modalTitle"
      :oldPswShow="oldPswShow"
      :isCenterd="true"
    ></CommonChangePwd>
  </div>
</template>

<script>
import Vue from "vue";
import iconFront from "../js/iconfont";
import { Icon } from "ant-design-vue";
import { getAccountStatusStr, langMap, getLangArray } from "@/js/common.js";
import { getCookie, delCookie, setCookie } from "@/js/cookieProcess.js";
import CommonChangePwd from "@/components/CommonChangePwd.vue";

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: iconFront,
});
Vue.component("MyIcon", IconFont);

export default {
  components: {
    CommonChangePwd,
  },
  data() {
    return {
      modalVisible: {
        visible: false,
      },
      langArray: getLangArray(this),
      getDataSuccess: false,
      apiData: {},
      userName: "",
      cancelBtnLabel: "",
      modalTitle: "",
      oldPswShow: false,
      MACAddress: "",
      hiddenArr: divHidden,
    };
  },
  methods: {
    changeLang(value, option) {
      if (langMap.has(value)) {
        let data = {
          webLang: value,
        };
        let requestData = {
          target: "status",
          action: "set",
          data: data,
        };
        this.$axios.post("api", requestData).then((response) => {
          this.$router.go(0);
        });
      }
    },
    onLogOut() {
      let requestData = {
        target: "login",
        action: "logout",
      };
      this.$axios.post("api", requestData).then((response) => {
        delCookie("token");
        this.$router.push("/");
      });
    },
    onHover(fileName) {
        var image = require('../Image/'+fileName+'.png');
        document.getElementById(fileName).style.background = "url("+image+")";
    },
    onOver(id){
      document.getElementById(id).style.background = "#f5f5f5";
    },
  },
  created() {
    getData(this);
  },
};

function onModifyPageShowModifyPswWindow(vm, nFirstTimeLogin) {
  if (3 != nFirstTimeLogin && "" == vm.userName) {
    return 0;
  }
  if ("" == vm.userName) {
    vm.userName = "admin";
    vm.cancelBtnLabel = vm.$t("Ignore");
    vm.modalTitle = vm.$t("WebPasswordModifyAlert");
    vm.oldPswShow = false;
  } else {
    vm.cancelBtnLabel = vm.$t("Cancel");
    vm.modalTitle = vm.$t("ChangePsw");
    vm.oldPswShow = true;
  }
  vm.modalVisible.visible = true;
}

function getData(vm) {
  vm.$axios.get("api/status/info").then((response) => {
    vm.apiData = response.data;

    for (var i = 0; i < vm.apiData.data.Accounts.length; i++) {
      vm.apiData.data.Accounts[i]["showValue"] =
        getAccountStatusStr(vm, vm.apiData.data.Accounts[i].AccountStatue) +
        (vm.apiData.data.Accounts[i].AccountName == ""
          ? ""
          : "/" + vm.apiData.data.Accounts[i].AccountName);
    }

    let macArr = vm.apiData.data.Product.MACAddress.split(":");
    for(var i = 0; i < macArr.length; i++) {
      vm.MACAddress += macArr[i];
    }

    vm.userName = "";
    vm.cancelBtnLabel = "";
    vm.modalTitle = "";
    vm.oldPswShow = false;
    onModifyPageShowModifyPswWindow(
      vm,
      vm.apiData.data.FirstLogin.isFirstLogin
    );
    vm.getDataSuccess = true;
  });
}
</script>

<style lang="less" scoped>
.ak-homepage-div {
  margin: 0 auto;
  min-width: 1900px;
  width: 100%;
  height: 100%;
  background: url(../Image/homepageBg.png) 0 0 no-repeat;
  background-position: center top;
}

.ak-homepage-head {
  display: inline-flex;
  width: 100%;
  padding-top: 10px;
  align-items: center;
  justify-content: center;
}

.ak-homepage-head-logo {
  color: #1d1d1d;
  font-weight: bold;
  display: flex;
  align-items: center;
  margin-right: 1330px;
}
.ak-homepage-head-logo label {
  font-size: 34px;
  margin-left: 16px;
  border-left-style: solid;
  padding-left: 16px;
}
.ak-homepage-language {
  display: flex;
  align-items: center;
  justify-content: center;
}

/deep/.ant-select-selection {
  border-radius: 20px;
}
/deep/.ant-select-selection__rendered {
  margin-left: 20px;
}
/deep/.ant-select-arrow {
  top: 40%;
}

.ak-homepage-device-info-div {
  display: inline-flex;
  justify-content: center;
  width: 100%;
  padding-left: 750px;
  margin-top: 40px;
}

.ak-homepage-device-info-status {
  margin-right: 304px;
}
.ak-homepage-device-info-status label {
  color: #111111;
  font-weight: bold;
  font-size: 27px;
}

.ak-homepage-device-info-status-border {
  margin-top: 13px;
  margin-bottom: 18px;
  width: 100%;
  height: 5px;
  border-radius: 5px;
  background: linear-gradient(90deg, #086cca 0%, #5fffff 100%);
}
.ak-homepage-device-info-item {
  margin-top: 16px;
  font-size: 18px;
}
.ak-homepage-device-info-item > label {
  color: #111111;
  font-weight: bold;
  max-width: 300px; 
  text-overflow: ellipsis;
  overflow: hidden;
}

.ak-homepage-device-info-item > label + label {
  float: right;
  color: #333333;
  font-weight: unset;
}

.ak-homepage-menu-btn-div {
  width: 1300px;
  padding-top: 57px;
  margin: 0 auto;
}

.ak-homepage-menu-btn {
  width: 255px;
  height: 170px;
  background: #f5f5f5;
  border-radius: 18px;
  // margin-right: 72px;
}

.ak-homepage-menu-btn-op {
  width: 255px;
  height: 170px;
  background: #000000;
  opacity: 0;
  border-radius: 18px;
  // margin-right: 72px;
}

.ak-homepage-menu-btn:hover > .ak-homepage-menu-normal {
  display: none;
}
.ak-homepage-menu-btn:hover > .ak-homepage-menu-hover {
  display: block;
}
.ak-homepage-menu-hover {
  display: none;
}

.ak-homepage-menu-title-hover {
  color: #ffffff;
  font-size: 20px;
  text-align: center;
  width: 100%;
  display: block;
  margin-top: 9px;
}

.ak-homepage-menu-icon {
  font-size: 54px;
  color: #777777;
  padding-top: 18px;
  padding-left: 18px;
  padding-bottom: 14px;
  width: 100%;
  text-align: left;
}
.ak-homepage-menu-icon-hover {
  font-size: 58px;
  color: #ffffff;
  width: 100%;
  margin-top: 33px;
}

.ak-homepage-menu-title {
  color: #555555;
  font-size: 16px;
  margin-left: 18px;
  margin-bottom: 4px;
  display: block;
}
.ak-homepage-menu-sub-title {
  margin-left: 18px;
  color: #888888;
  font-size: 13px;
  display: block;
}
.ak-homepage-menu-sub-block {
  float: left;
  display: inline;
  margin-right: 70px;
  margin-top: 8px;
}

.ak-logout-label {
  cursor: pointer;
  font-size: 14px;
  color: #333333;
  margin-left: 15px;
}

.ak-logout-div {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ak-homepage-menu-router{
  margin-right: 72px;
}
</style>