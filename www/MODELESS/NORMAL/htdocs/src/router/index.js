import Vue from 'vue'
import VueRouter from 'vue-router'
import StatusBasic from "../views/StatusBasic.vue";
import AccountBasic from "../views/AccountBasic.vue";
import AccountAdvanced from "../views/AccountAdvanced.vue";
import NetworkBasic from "../views/NetworkBasic.vue";
import NetworkAdvanced from "../views/NetworkAdvanced.vue";
import PhoneMulicast from "../views/PhoneMulicast.vue";
import PhoneCallFeature from "../views/PhoneCallFeature.vue";
import PhoneLift from "../views/PhoneLift.vue";
import PhoneRelay from "../views/PhoneRelay.vue";
import PhoneApp from "../views/PhoneApp.vue";
import PhoneMonitor from "../views/PhoneMonitor.vue";
import PhoneIntercom from "../views/PhoneIntercom.vue";
import PhoneTime from "../views/PhoneTime.vue";
import PhoneDisplaySetting from "../views/PhoneDisplaySetting.vue";
import PhoneAudio from "../views/PhoneAudio.vue";
import UpgradeBasic from "../views/UpgradeBasic.vue";
import UpgradeAdvanced from "../views/UpgradeAdvanced.vue";
import UpgradeDiagnosis from "../views/UpgradeDiagnosis.vue";
import SecurityBasic from "../views/SecurityBasic.vue";
import SecurityAdvanced from "../views/SecurityAdvanced.vue";
import SettingBasic from "../views/SettingBasic.vue";
import SettingVoiceAssistant from "../views/SettingVoiceAssistant.vue";
import ContactsLocalContacts from "../views/ContactsLocalContacts.vue";
import ContactsCallLog from "../views/ContactsCallLog.vue";
import ArmingZoneSetting from "../views/ArmingZoneSetting.vue";
import ArmingMode from "../views/ArmingMode.vue";
import ArmingDisarmCode from "../views/ArmingDisarmCode.vue";
import ArmingAlarmAction from "../views/ArmingAlarmAction.vue";
import Homepage from "../views/Homepage.vue";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import HiddenPage from "../views/HiddenPage.vue";
import PbxBasic from "../views/PbxBasic.vue";
import PbxRingGroup from "../views/PbxRingGroup.vue";

import { SavePageConfirm as ENGLISH } from "../locales/ENGLISH.json"
import { SavePageConfirm as CHINESE_S } from "../locales/CHINESE_S.json"
import { SavePageConfirm as CHINESE_T } from "../locales/CHINESE_T.json"
import { SavePageConfirm as CZECH } from "../locales/CZECH.json"
import { SavePageConfirm as DUTCH } from "../locales/DUTCH.json"
import { SavePageConfirm as FRENCH } from "../locales/FRENCH.json"
import { SavePageConfirm as GERMAN } from "../locales/GERMAN.json"
import { SavePageConfirm as JAPANESE } from "../locales/JAPANESE.json"
import { SavePageConfirm as MONGOLIA } from "../locales/MONGOLIA.json"
import { SavePageConfirm as POLISH } from "../locales/POLISH.json"
import { SavePageConfirm as PORTUGUESE } from "../locales/PORTUGUESE.json"
import { SavePageConfirm as RUSSIAN } from "../locales/RUSSIAN.json"
import { SavePageConfirm as SPANISH } from "../locales/SPANISH.json"
import { SavePageConfirm as TURKISH } from "../locales/TURKISH.json"
import { SavePageConfirm as VIETNAMESE } from "../locales/VIETNAMESE.json"

import { getDataChanged, setDataChanged } from "@/js/common.js";

Vue.use(VueRouter)

const routes = [
  {
    path: "/8848",
    name: "HiddenPage",
    component: HiddenPage,
  },
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/Home",
    name: "Home",
    component: Home,
  },
  {
    path: "/Homepage",
    name: "Homepage",
    component: Homepage,
  },
  {
    path: "/StatusBasic",
    name: "StatusBasic",
    component: StatusBasic
  },
  {
    path: "/AccountBasic",
    name: "AccountBasic",
    component: AccountBasic
  },
  {
    path: "/AccountAdvanced",
    name: "AccountAdvanced",
    component: AccountAdvanced
  },
  {
    path: "/NetworkBasic",
    name: "NetworkBasic",
    component: NetworkBasic
  },
  {
    path: "/NetworkAdvanced",
    name: "NetworkAdvanced",
    component: NetworkAdvanced
  },
  {
    path: "/PhoneMulicast",
    name: "PhoneMulicast",
    component: PhoneMulicast
  },
  {
    path: "/PhoneLift",
    name: "PhoneLift",
    component: PhoneLift
  },
  {
    path: "/PhoneCallFeature",
    name: "PhoneCallFeature",
    component: PhoneCallFeature
  },
  {
    path: "/PhoneRelay",
    name: "PhoneRelay",
    component: PhoneRelay
  },
  {
    path: "/PhoneApp",
    name: "PhoneApp",
    component: PhoneApp
  },
  {
    path: "/PhoneMonitor",
    name: "PhoneMonitor",
    component: PhoneMonitor
  },
  {
    path: "/PhoneIntercom",
    name: "PhoneIntercom",
    component: PhoneIntercom
  },
  {
    path: "/UpgradeBasic",
    name: "UpgradeBasic",
    component: UpgradeBasic
  },
  {
    path: "/UpgradeAdvanced",
    name: "UpgradeAdvanced",
    component: UpgradeAdvanced
  },
  {
    path: "/UpgradeDiagnosis",
    name: "UpgradeDiagnosis",
    component: UpgradeDiagnosis
  },
  {
    path: "/SecurityBasic",
    name: "SecurityBasic",
    component: SecurityBasic
  },
  {
    path: "/SecurityAdvanced",
    name: "SecurityAdvanced",
    component: SecurityAdvanced
  },
  {
    path: "/SettingBasic",
    name: "SettingBasic",
    component: SettingBasic
  },
  {
    path: "/PhoneTime",
    name: "PhoneTime",
    component: PhoneTime
  },
  {
    path: "/PhoneDisplaySetting",
    name: "PhoneDisplaySetting",
    component: PhoneDisplaySetting
  },
  {
    path: "/SettingVoiceAssistant",
    name: "SettingVoiceAssistant",
    component: SettingVoiceAssistant
  },
  {
    path: "/PhoneAudio",
    name: "PhoneAudio",
    component: PhoneAudio
  },
  {
    path: "/ContactsLocalContacts",
    name: "ContactsLocalContacts",
    component: ContactsLocalContacts
  },
  {
    path: "/ContactsCallLog",
    name: "ContactsCallLog",
    component: ContactsCallLog
  },
  {
    path: "/ArmingZoneSetting",
    name: "ArmingZoneSetting",
    component: ArmingZoneSetting
  },
  {
    path: "/ArmingMode",
    name: "ArmingMode",
    component: ArmingMode
  },
  {
    path: "/ArmingDisarmCode",
    name: "ArmingDisarmCode",
    component: ArmingDisarmCode
  },
  {
    path: "/ArmingAlarmAction",
    name: "ArmingAlarmAction",
    component: ArmingAlarmAction
  },
  {
    path: "/PbxBasic",
    name: "PbxBasic",
    component: PbxBasic
  },
  {
    path: "/PbxRingGroup",
    name: "PbxRingGroup",
    component: PbxRingGroup
  },
]

const router = new VueRouter({
  routes
})

const langMap = new Map([
  [0, ENGLISH],
  [1, CHINESE_S],
  [2, CHINESE_T],
  [3, RUSSIAN],
  [4, CZECH],
  [5, PORTUGUESE],
  [6, SPANISH],
  [8, DUTCH],
  [9, FRENCH],
  [10, GERMAN],
  [13, POLISH],
  [14, TURKISH],
  [15, JAPANESE],
  [16, MONGOLIA],
  [17, VIETNAMESE],
]);

router.beforeEach((to, from, next) => {
  if (getDataChanged() && to.name != "Login") {
    let webLang = Number(localStorage.getItem("webLang"));
    let confirmText = ENGLISH;
    if (langMap.has(webLang)) {
      confirmText = langMap.get(webLang);
    }
    if (confirm(confirmText)) {
      setDataChanged(false);
      next();
    }
  } else {
    setDataChanged(false);
    next();
  }
})

export default router
