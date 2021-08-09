<template>
  <div class="ak-left-menu-div">
    <div class="ak-logo">
      <img src="../Image/logo.png" v-if="hiddenArr.isShowLogoLabel" />
      <label>{{model}}</label>
    </div>
    <a-menu
      mode="inline"
      :open-keys="openKeys"
      :default-selected-keys="defaultSelectKeys"
      :selected-keys="selectKeys"
      :inline-indent="40"
      @openChange="onOpenChange"
      theme="dark"
    >
      <a-sub-menu key="linkHomepage">
        <span slot="title">
          <my-icon type="iconHome1" class="ak-menu-logo"></my-icon>
          <span class="ak-menu-homepage">{{ $t("HomePage") }}</span>
        </span>
      </a-sub-menu>

      <a-sub-menu key="linkA">
        <span slot="title">
          <my-icon type="iconStatus" class="ak-menu-logo"></my-icon>
           <span class="ak-menu-homepage">{{ $t("Status") }}</span>
        </span>
      </a-sub-menu>

      <a-sub-menu key="linkB" v-if="hiddenArr.accountShow">
        <span slot="title">
          <my-icon type="iconAccount1" class="ak-menu-logo"></my-icon>
          <span>{{ $t("Account") }}</span>
          <MenuArrow></MenuArrow>
        </span>
        <a-menu-item key="linkB1">
          <router-link to="AccountBasic">{{ $t("Basic") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkB2" v-if="this.isShowAdvanced">
          <router-link to="AccountAdvanced">{{ $t("Advance") }}</router-link>
        </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="linkC" v-if="hiddenArr.networkShow">
        <span slot="title">
          <my-icon type="iconNetwork1" class="ak-menu-logo"></my-icon>
          <span>{{ $t("Network") }}</span>
          <MenuArrow></MenuArrow>
        </span>
        <a-menu-item key="linkC1">
          <router-link to="NetworkBasic">{{ $t("Basic") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkC2" v-if="this.isShowAdvanced">
          <router-link to="NetworkAdvanced">{{ $t("Advance") }}</router-link>
        </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="linkD" v-if="hiddenArr.deviceShow">
        <span slot="title">
          <my-icon type="iconphone" class="ak-menu-logo"></my-icon>
          <span>{{ $t("Phone") }}</span>
          <MenuArrow></MenuArrow>
        </span>
        <a-menu-item key="linkD1">
          <router-link to="PhoneTime">{{ $t("Time") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkD2">
          <router-link to="PhoneCallFeature">{{ $t("CallFeature") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkD3">
          <router-link to="PhoneDisplaySetting">{{ $t("DisplaySetting") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkD4">
          <router-link to="PhoneAudio">{{ $t("Audio") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkD5">
          <router-link to="PhoneMulicast">{{ $t("Multicast") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkD6">
          <router-link to="PhoneMonitor">{{ $t("PhoneMonitor") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkD7">
          <router-link to="PhoneIntercom">{{ $t("Intercom") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkD8">
          <router-link to="PhoneRelay">{{ $t("Relay") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkD9">
          <router-link to="PhoneApp">{{ $t("ThirdPartyAPK") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkD10">
          <router-link to="PhoneLift">{{ $t("Lift") }}</router-link>
        </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="linkE" v-if="hiddenArr.contactShow">
        <span slot="title">
          <my-icon type="iconContacts1" class="ak-menu-logo"></my-icon>
          <span>{{ $t("Contacts") }}</span>
          <MenuArrow></MenuArrow>
        </span>
        <a-menu-item key="linkE1">
          <router-link to="ContactsLocalContacts">{{ $t("LocalContacts") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkE2">
          <router-link to="ContactsCallLog">{{ $t("CallLog") }}</router-link>
        </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="linkF">
        <span slot="title">
          <my-icon type="iconUpgrade1" class="ak-menu-logo"></my-icon>
          <span>{{ $t("Upgrade") }}</span>
          <MenuArrow></MenuArrow>
        </span>
        <a-menu-item key="linkF1">
          <router-link to="UpgradeBasic">{{ $t("Basic") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkF2" v-if="this.isShowAdvanced">
          <router-link to="UpgradeAdvanced">{{ $t("Advance") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkF3" v-if="this.isShowAdvanced">
          <router-link to="UpgradeDiagnosis">{{ $t("Diagnosis") }}</router-link>
        </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="linkG">
        <span slot="title">
          <my-icon type="iconSecurity" class="ak-menu-logo"></my-icon>
          <span>{{ $t("Security") }}</span>
          <MenuArrow></MenuArrow>
        </span>
        <a-menu-item key="linkG1">
          <router-link to="SecurityBasic">{{ $t("Basic") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkG2" v-if="this.isShowAdvanced">
          <router-link to="SecurityAdvanced">{{ $t("Advance") }}</router-link>
        </a-menu-item>
      </a-sub-menu>
      <a-sub-menu key="linkH" v-if="hiddenArr.settingShow">
        <span slot="title">
          <my-icon type="iconSetting" class="ak-menu-logo"></my-icon>
          <span>{{ $t("Settings") }}</span>
          <MenuArrow></MenuArrow>
        </span>
        <a-menu-item key="linkH1">
          <router-link to="SettingBasic">{{ $t("Basic") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkH4">
          <router-link to="SettingVoiceAssistant">{{ $t("VoiceAssistant") }}</router-link>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu key="linkI" v-if="hiddenArr.armingShow">
        <span slot="title">
          <my-icon type="iconArming1" class="ak-menu-logo"></my-icon>
          <span>{{ $t("Arming") }}</span>
          <MenuArrow></MenuArrow>
        </span>
        <a-menu-item key="linkI1">
          <router-link to="ArmingZoneSetting">{{ $t("ZoneSetting") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkI2">
          <router-link to="ArmingMode">{{ $t("ArmingMode") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkI3">
          <router-link to="ArmingDisarmCode">{{ $t("DisarmCode") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkI4">
          <router-link to="ArmingAlarmAction">{{ $t("AlarmAction") }}</router-link>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu key="linkJ" v-if="hiddenArr.pbxShow">
        <span slot="title">
          <my-icon type="iconPBX" class="ak-menu-logo"></my-icon>
          <span>{{ $t("PBX") }}</span>
          <MenuArrow></MenuArrow>
        </span>
        <a-menu-item key="linkJ1">
          <router-link to="PbxBasic">{{ $t("Basic") }}</router-link>
        </a-menu-item>
        <a-menu-item key="linkJ2">
          <router-link to="PbxRingGroup">{{ $t("RingGroup") }}</router-link>
        </a-menu-item>
      </a-sub-menu>
      
    </a-menu>
  </div>
</template>

<script>
import Vue from "vue";
import iconFront from "../js/iconfont";
import { Icon } from "ant-design-vue";
import { appendHTML } from "../js/common.js";
import MenuArrow from "@/components/MenuArrow.vue";

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: iconFront,
});

Vue.component("my-icon", IconFont);

//左侧边任务栏相关映射常量
const linkMap = new Map([
  ["Home", "linkHomepage,"],
  ["StatusBasic", "linkA,linkA1"],
  ["AccountBasic", "linkB,linkB1"],
  ["AccountAdvanced", "linkB,linkB2"],
  ["NetworkBasic", "linkC,linkC1"],
  ["NetworkAdvanced", "linkC,linkC2"],
  ["PhoneTime", "linkD,linkD1"],
  ["PhoneCallFeature", "linkD,linkD2"],
  ["PhoneDisplaySetting", "linkD,linkD3"],
  ["PhoneAudio", "linkD,linkD4"],
  ["PhoneMulicast", "linkD,linkD5"],
  ["PhoneMonitor", "linkD,linkD6"],
  ["PhoneIntercom", "linkD,linkD7"],
  ["PhoneRelay", "linkD,linkD8"],
  ["PhoneApp", "linkD,linkD9"],
  ["PhoneLift", "linkD,linkD10"],
  ["ContactsLocalContacts", "linkE,linkE1"],
  ["ContactsCallLog", "linkE,linkE2"],
  ["UpgradeBasic", "linkF,linkF1"],
  ["UpgradeAdvanced", "linkF,linkF2"],
  ["UpgradeDiagnosis", "linkF,linkF3"],
  ["SecurityBasic", "linkG,linkG1"],
  ["SecurityAdvanced", "linkG,linkG2"],
  ["SettingBasic", "linkH,linkH1"],
  ["SettingVoiceAssistant", "linkH,linkH4"],
  ["ArmingZoneSetting", "linkI,linkI1"],
  ["ArmingMode", "linkI,linkI2"],
  ["ArmingDisarmCode", "linkI,linkI3"],
  ["ArmingAlarmAction", "linkI,linkI4"],
  ["PbxBasic", "linkJ,linkJ1"],
  ["PbxRingGroup", "linkJ,linkJ2"],
]);

export default {
  name: "Left",
  props: {
    model: String,
  },
  components: {
    MenuArrow,
  },
  data() {
    return {
      rootSubmenuKeys: [
        "linkHomepage",
        "linkA",
        "linkB",
        "linkC",
        "linkD",
        "linkE",
        "linkF",
        "linkG",
        "linkH",
        "linkI",
        "linkJ",
      ],
      openKeys: ["linkA"],
      defaultSelectKeys: ["linkA1"],
      selectKeys: ["linkA1"],
      isShowAdvanced: localStorage.getItem("userType") == "admin",
      hiddenArr: divHidden,
    };
  },
  methods: {
    onOpenChange(openKeys) {
      if ((openKeys.length >= 2 && openKeys[1] == "linkHomepage")
          || (openKeys.length == 1 && openKeys[0] == "linkHomepage")) {
        this.$router.replace("/Homepage");
      }else if ( (openKeys.length >= 2 && openKeys[1] == "linkA") 
          || (openKeys.length == 1 && openKeys[0] == "linkA")) {
        openKeys=["linkA"];
        if(this.$router.history.current.name != "StatusBasic"){
          this.$router.replace("/StatusBasic");
        }
      }
      const latestOpenKey = openKeys.find(
        (key) => this.openKeys.indexOf(key) === -1
      );
      if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.openKeys = openKeys;
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : [];
      }
    },
  },
  watch: {
    $route(to, from) {
      //浏览器点后退的时候，选中地区没法自动重新选中，需要类似这种方式来实现
      if (linkMap.has(to.name)) {
        let link = linkMap.get(to.name).split(",");
        this.openKeys = [link[0]];
        this.selectKeys = [link[1]];
      }
    },
  },
  mounted() {
    if (linkMap.has(this.$route.name)) {
      let link = linkMap.get(this.$route.name).split(",");
      this.openKeys = [link[0]];
      this.selectKeys = [link[1]];
    }
  },
};
</script>


<style lang="less">
@import "../styles/theme/index.less";

.ak-logo {
  height: 90px;
  width: 325px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ak-logo img {
  width: 165px;
  height: 46px;
  color: white;
  font-weight: bold;
  border-right-style: solid;
  margin-right: 19px;
  padding-right: 14px;
}

.ak-logo label {
  font-size: 30px;
  color: white;
  font-weight: bold;
}

.ant-layout-sider-children {
  background: @ak-sider-bg;
}

.ant-menu-submenu-open,
.ant-menu-sub {
  background: @ak-menu-sub-bg !important;
}
.ant-menu-inline .ant-menu-item:not(:last-child),
.ant-menu-inline .ant-menu-submenu-title,
.ant-menu-inline .ant-menu-item {
  margin-bottom: 0px !important;
  margin-top: 0px !important;
}
.ant-menu-sub.ant-menu-inline > .ant-menu-item,
.ant-menu-inline > .ant-menu-submenu > .ant-menu-submenu-title {
  height: 60px !important;
  line-height: 60px !important;
}
.ant-menu-inline .ant-menu-submenu-title,
.ant-menu-inline .ant-menu-item {
  font-size: 18px !important;
}

.ant-menu-submenu-selected > .ant-menu-submenu-title {
  color: #a4a4a6 !important;
}

.ant-menu-submenu-open > .ant-menu-submenu-title {
  font-size: 20px !important;
}

.ant-menu-submenu-title .anticon + span {
  padding-left: 10px;
}

.ant-menu-submenu-title {
  border-left-style: solid;
  border-color: #252834;
  border-left-width: 5px;
}

.ant-menu-submenu .ant-menu-sub {
  transition: none !important;
}

.ant-menu-submenu-open > div {
  border-left-style: solid;
  border-color: @ak-menu-open-border-bg;
  border-left-width: 5px;
}

.ant-menu-item {
  display: list-item !important;
  padding-left: 70px !important;
  list-style-type: circle !important;
}

.ant-menu-item-selected,
.ant-menu-item-active {
  list-style-type: disc !important;
}

.ant-menu-item > a {
  display: inline-block !important;
}

.ant-menu-submenu-arrow {
  display: none;
}

.ak-menu-homepage:hover {
  color: #ffffff;
}
.ant-menu-submenu-open > div > span > span,
.ant-menu-submenu-open > div > span > i,
.ant-menu-submenu-open > div > span > div {
  color: #ffffff;
}

.ak-left-menu-div {
  overflow-y: scroll;
  overflow-y: overlay;
  height: 100vh;
}

.ak-left-menu-div::-webkit-scrollbar {
  display: none;
}

.ak-menu-logo {
  font-size: 22px !important;
}
</style>