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
  isPort,
  checkRangeOfNumber,
  notContainInvalid,
  isPortUsed,
} from "@/js/common.js";
import { getItemByKey } from "../js/common";

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
      CurrentAccount: 1,
      audioCodecsItems: [],
      audioCodecsTargetItems: [],
      videoCodecsItems: [],
      videoCodecsTargetItems: [],
      codeBitRateItems1: [
        { key: "64", label: "64" },
        { key: "128", label: "128" },
      ],
      codeBitRateItems2: [
        { key: "128", label: "128" },
        { key: "256", label: "256" },
        { key: "320", label: "320" },
        { key: "512", label: "512" },
      ],
      codeBitRateItems3: [
        { key: "512", label: "512" },
        { key: "768", label: "768" },
        { key: "1024", label: "1024" },
        { key: "1536", label: "1536" },
        { key: "2048", label: "2048" },
      ],
      codePayLoadItems1: [],
      codePayLoadItems2: [],
      audioCodecsEnableItems: [],
      audioCodecsDisableItems: [],
      videoCodecsEnableItems: [],
      videoCodecsDisableItems: [],
      OPUSEnable: "",
      OPUSDisable: "",
      usedPortItems: [],
    };
  },
  created() {
    for (var i = 90; i < 120; i++) {
      let item1 = { key: i - 89, label: i };
      let item2 = { key: i - 90, label: i };
      this.codePayLoadItems1.push(item1);
      this.codePayLoadItems2.push(item2);
    }
    getData(this, this.CurrentAccount);
  },
  methods: {
    onCommonPageDataChange: function (event) {
      if (event.itemKey == "currentAccount") {
        this.CurrentAccount = event.newVal;
      } else if (event.itemKey == "audioCodecsItems") {
        this.audioCodecsTargetItems = event.newVal;
      } else if (event.itemKey == "videoCodecsItems") {
        this.videoCodecsTargetItems = event.newVal;
      } else if(event.itemKey == "Config.Account" + this.CurrentAccount + ".Video01.ProfileLevel"){
        ChangeCodecResolutionOption(this,"videoCodec","Config.Account" + this.CurrentAccount + ".Video01.MaxBR", event.newVal);
        this.changedCfgData[event.itemKey] = event.newVal;
      } else if(event.itemKey == "Config.Account" + this.CurrentAccount + ".Video00.ProfileLevel"){
        ChangeCodecResolutionOption(this,"videoCodec","Config.Account" + this.CurrentAccount + ".Video00.MaxBR", event.newVal);
        this.changedCfgData[event.itemKey] = event.newVal;
      } else if(event.itemKey == "Config.Account" + this.CurrentAccount + ".Video03.ProfileLevel"){
        ChangeCodecResolutionOption(this,"videoCodec","Config.Account" + this.CurrentAccount + ".Video03.MaxBR", event.newVal);
        this.changedCfgData[event.itemKey] = event.newVal;
      } else {
        this.changedCfgData[event.itemKey] = event.newVal;
      }
      checkPortWarn(this);
    },
  },
  watch: {
    CurrentAccount(newVal, oldVal) {
      getData(this, newVal);
    },
    changedCfgData: {
      handler: function (newVal, oldVal) {
        //监听MWI Subscribe Period
        let contentKeyIndex = getIndexByKey(this.data.contents, "subscribe");
        let itemKeyIndex = getIndexByKey(
          this.data.contents[contentKeyIndex].items,
          "Config.Account" +
            this.CurrentAccount +
            ".SUBSCRIBE.SubscribeMWIExpire"
        );
        if (
          newVal[
            "Config.Account" + this.CurrentAccount + ".SUBSCRIBE.SubsribeMWI"
          ] == 0
        ) {
          this.data.contents[contentKeyIndex].items[
            itemKeyIndex
          ].disabled = true;
        } else {
          this.data.contents[contentKeyIndex].items[
            itemKeyIndex
          ].disabled = false;
        }

        //监听DTMF Type
        contentKeyIndex = getIndexByKey(this.data.contents, "dtmf");
        itemKeyIndex = getIndexByKey(
          this.data.contents[contentKeyIndex].items,
          "Config.Account" + this.CurrentAccount + ".DTMF.InfoType"
        );
        if (
          newVal["Config.Account" + this.CurrentAccount + ".DTMF.Type"] >= 3
        ) {
          this.data.contents[contentKeyIndex].items[
            itemKeyIndex
          ].disabled = false;
        } else {
          this.data.contents[contentKeyIndex].items[
            itemKeyIndex
          ].disabled = true;
        }
      },
      deep: true,
    },
  },
};

function checkPortWarn(vm) {
  let item1 = getItemByKey(
    vm.data,
    "call",
    "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
  );
  let item2 = getItemByKey(
    vm.data,
    "call",
    "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
  );
  if (item1.isWarn == false && item2.isWarn == false) {
    return;
  }

  if (
    0 ==
      isPortUsed(
        vm.changedCfgData[
          "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
        ],
        vm.changedCfgData[
          "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
        ],
        vm.usedPortItems
      ) &&
    Number(
      vm.changedCfgData[
        "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
      ]
    ) -
      Number(
        vm.changedCfgData[
          "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
        ]
      ) >=
      0
  ) {
    item1.isWarn = false;
    item2.isWarn = false;
    return;
  }
}

function getData(vm, accountId) {
  vm.$axios
    .get("api/accountAdvanced/info?accountId=" + accountId)
    .then((response) => {
      if(response.data.retcode == -1){
        vm.data= {
          showNoPermission: true,
        };
        return;
      }
      vm.apiData = response.data;
      vm.changedCfgData = deepClone(response.data.configData);

      vm.AccountItems = [];
      for (var i = 1; i <= vm.apiData.data.Account.AccountNumber; i++) {
        let item = { key: i, label: vm.$t("Account") + i };
        vm.AccountItems.push(item);
      }

      vm.audioCodecsItems = [];
      vm.audioCodecsTargetItems = [];
      var count = 0;
      for (var i = 0; i < vm.apiData.data.AudioCodecs.length; i++) {
        if (vm.apiData.data.AudioCodecs[i].AudioCodesEnable) {
          if (vm.apiData.data.AudioCodecs[i].AudioCodesEnable != "OPUS") {
            let audioItem = {
              key: count.toString(),
              title: vm.apiData.data.AudioCodecs[i].AudioCodesEnable,
            };
            vm.audioCodecsItems.push(audioItem);
            vm.audioCodecsTargetItems.push(i.toString());
            count++;
          } else {
            vm.OPUSEnable = "OPUS";
          }
        } else if (vm.apiData.data.AudioCodecs[i].AudioCodesDisable != "OPUS") {
          let audioItem = {
            key: count.toString(),
            title: vm.apiData.data.AudioCodecs[i].AudioCodesDisable,
          };
          vm.audioCodecsItems.push(audioItem);
          count++;
        } else {
          vm.OPUSDisable = "OPUS";
        }
      }

      vm.videoCodecsItems = [];
      vm.videoCodecsTargetItems = [];
      for (var i = 0; i < vm.apiData.data.VideoCodecs.length; i++) {
        if (vm.apiData.data.VideoCodecs[i].VideoCodesEnable) {
          let videoItem = {
            key: i.toString(),
            title: vm.apiData.data.VideoCodecs[i].VideoCodesEnable,
          };
          vm.videoCodecsItems.push(videoItem);
          vm.videoCodecsTargetItems.push(i.toString());
        } else {
          let videoItem = {
            key: i.toString(),
            title: vm.apiData.data.VideoCodecs[i].VideoCodesDisable,
          };
          vm.videoCodecsItems.push(videoItem);
        }
      }

      //port端口
      vm.usedPortItems = [];
      for (var i = 0; i < vm.apiData.data.sipPorts.length; i++) {
        let item = {
          min: vm.apiData.data.sipPorts[i].min,
          max: vm.apiData.data.sipPorts[i].max,
        };
        vm.usedPortItems.push(item);
      }

      createPageData(vm);

      //VideoCodeValue
      getVideoCodecBitrateValue(vm, "videoCodec", "Config.Account" + accountId + ".Video01.MaxBR",vm.apiData.configData["Config.Account" + accountId + ".Video01.ProfileLevel"],vm.apiData.configData["Config.Account" + accountId + ".Video01.MaxBR"]);
      getVideoCodecBitrateValue(vm, "videoCodec", "Config.Account" + accountId + ".Video00.MaxBR",vm.apiData.configData["Config.Account" + accountId + ".Video00.ProfileLevel"],vm.apiData.configData["Config.Account" + accountId + ".Video00.MaxBR"]);
      getVideoCodecBitrateValue(vm, "videoCodec", "Config.Account" + accountId + ".Video03.MaxBR",vm.apiData.configData["Config.Account" + accountId + ".Video03.ProfileLevel"],vm.apiData.configData["Config.Account" + accountId + ".Video03.MaxBR"]);
    });
}

function getVideoCodecBitrateValue(vm,contentKey, itemKey, index,resolutionValue){
  let contentKeyIndex = getIndexByKey(vm.data.contents, contentKey);
  let itemKeyIndex = getIndexByKey(
    vm.data.contents[contentKeyIndex].items,
    itemKey
  );
  if(index == 0){
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].selectItems =
      vm.codeBitRateItems1;
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].value = resolutionValue.toString();
  } else if(index == 1){
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].selectItems =
      vm.codeBitRateItems2;
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].value = resolutionValue.toString();
  } else{
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].selectItems =
      vm.codeBitRateItems3;
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].value = resolutionValue.toString();
  }
}

function ChangeCodecResolutionOption(vm, contentKey, itemKey, index) {
  let contentKeyIndex = getIndexByKey(vm.data.contents, contentKey);
  let itemKeyIndex = getIndexByKey(
    vm.data.contents[contentKeyIndex].items,
    itemKey
  );
  if (index == 0) {
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].selectItems =
      vm.codeBitRateItems1;
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].value = "64";
    vm.changedCfgData[itemKey] = "64";
  } else if (index == 1) {
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].selectItems =
      vm.codeBitRateItems2;
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].value = "128";
    vm.changedCfgData[itemKey] = "128";
  } else {
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].selectItems =
      vm.codeBitRateItems3;
    vm.data.contents[contentKeyIndex].items[itemKeyIndex].value = "512";
    vm.changedCfgData[itemKey] = "512";
  }
}

function submitData(vm) {
  vm.data.submitLoading = true;

  let requestData = {
    target: "accountAdvanced",
    action: "set",
    configData: vm.submitCfgData,
    data: {
      AudioCodecsEnable: vm.audioCodecsEnableItems,
      AudioCodecsDisable: vm.audioCodecsDisableItems,
      VideoCodecsEnable: vm.videoCodecsEnableItems,
      VideoCodecsDisable: vm.videoCodecsDisableItems,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    if ("undefined" != typeof response) {
      showRequestSuccess(vm);
    }
    vm.data.submitLoading = false;
  });
}

function getCommitData(vm) {
  vm.submitCfgData = {};
  for (var changedKey in vm.changedCfgData) {
    if (vm.apiData.configData[changedKey] != vm.changedCfgData[changedKey]) {
      vm.submitCfgData[changedKey] = vm.changedCfgData[changedKey];
    }
  }
  submitCodecsItem(vm);
}

function submitCodecsItem(vm) {
  vm.audioCodecsEnableItems = [];
  vm.audioCodecsDisableItems = [];
  vm.videoCodecsEnableItems = [];
  vm.videoCodecsDisableItems = [];
  //audio
  for (var i = 0; i < vm.audioCodecsTargetItems.length; i++) {
    var enableItem = vm.audioCodecsItems[vm.audioCodecsTargetItems[i]].title;
    vm.audioCodecsEnableItems.push(enableItem);
  }
  for (var i = 0; i < vm.audioCodecsItems.length; i++) {
    if (!vm.audioCodecsTargetItems.includes(vm.audioCodecsItems[i].key)) {
      var disableItem = vm.audioCodecsItems[i].title;
      vm.audioCodecsDisableItems.push(disableItem);
    }
  }
  if (vm.OPUSEnable != "") {
    vm.audioCodecsEnableItems.push(vm.OPUSEnable);
  } else {
    vm.audioCodecsDisableItems.push(vm.OPUSDisable);
  }

  //video
  for (var i = 0; i < vm.videoCodecsTargetItems.length; i++) {
    var enableItem = vm.videoCodecsItems[vm.videoCodecsTargetItems[i]].title;
    vm.videoCodecsEnableItems.push(enableItem);
  }
  for (var i = 0; i < vm.videoCodecsItems.length; i++) {
    if (!vm.videoCodecsTargetItems.includes(vm.videoCodecsItems[i].key)) {
      var disableItem = vm.videoCodecsItems[i].title;
      vm.videoCodecsDisableItems.push(disableItem);
    }
  }
}

function createPageData(vm) {
  vm.data = {
    getDataSuccess: true,
    breadCrumb: {
      firstTitle: vm.$t("Account"),
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
      getData(vm, vm.CurrentAccount);
    },
    submitLoading: false,
    cancelLoading: false,
    contents: [],
  };
  vm.data.contents.push(createSipAccountContent(vm));
  vm.data.contents.push(createAudioCodecsContent(vm));
  vm.data.contents.push(createVideoCodecsContent(vm));
  vm.data.contents.push(createVideoCodecContent(vm));
  vm.data.contents.push(createSubscribeContent(vm));
  vm.data.contents.push(createDtmfContent(vm));
  vm.data.contents.push(createCallContent(vm));
  vm.data.contents.push(createEncryptionContent(vm));
  vm.data.contents.push(createNatContent(vm));
  vm.data.contents.push(createUserAgentContent(vm));
}

function createSipAccountContent(vm) {
  let content = {
    key: "sipAccount",
    title: vm.$t("SIPAccount"),
    titleDescription: vm.$t("AdSIPAccountDesc"),
    items: [
      {
        title: vm.$t("Account"),
        type: "select",
        key: "currentAccount",
        value: vm.CurrentAccount,
        selectItems: vm.AccountItems,
        description: vm.$t("AdAccountDesc"),
      },
    ],
  };
  return content;
}

function createAudioCodecsContent(vm) {
  let content = {
    key: "audioCodecs",
    title: vm.$t("Codecs"),
    titleDescription: vm.$t("AudioCodecsDesc"),
    items: [
      {
        type: "transfer",
        sourceTitle: vm.$t("DisabledVideoCodecs"),
        targetTitle: vm.$t("EnabledVideoCodecs"),
        key: "audioCodecsItems",
        mockItems: vm.audioCodecsItems,
        value: vm.audioCodecsTargetItems,
        selectedKeys: [],
      },
    ],
  };
  return content;
}

function createVideoCodecsContent(vm) {
  let content = {
    key: "videoCodecs",
    title: vm.$t("VideoCodecs"),
    titleDescription: vm.$t("VideoCodecsDesc"),
    items: [
      {
        type: "transfer",
        sourceTitle: vm.$t("DisabledVideoCodecs"),
        targetTitle: vm.$t("EnabledVideoCodecs"),
        key: "videoCodecsItems",
        mockItems: vm.videoCodecsItems,
        value: vm.videoCodecsTargetItems,
        selectedKeys: [],
      },
    ],
  };
  return content;
}

function createVideoCodecContent(vm) {
  let content = {
    key: "videoCodec",
    title: vm.$t("VideoCodec"),
    titleDescription: vm.$t("VideoCodeDesc"),
    items: [
      {
        title: vm.$t("Name"),
        type: "label",
        key: "H263",
        value: "H263",
        showDescription: true,
        description: vm.$t("VideoNameDesc"),
      },
      {
        title: vm.$t("Resolution"),
        type: "select",
        key: "Config.Account" + vm.CurrentAccount + ".Video01.ProfileLevel",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".Video01.ProfileLevel"
          ],
        selectItems: [
          { key: 0, label: "QCIF" },
          { key: 1, label: "CIF" },
          { key: 3, label: "4CIF" },
        ],
        description: vm.$t("ResolutionDesc"),
      },
      {
        title: vm.$t("BitrateLabel"),
        type: "select",
        key: "Config.Account" + vm.CurrentAccount + ".Video01.MaxBR",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".Video01.MaxBR"
          ],
        selectItems: [],
        description: vm.$t("BitrateDesc"),
      },
      {
        title: vm.$t("Payload"),
        type: "select",
        key: "Config.Account" + vm.CurrentAccount + ".Video01.Payload",
        disabled: true,
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".Video01.Payload"
          ],
        selectItems: vm.codePayLoadItems1,
        description: vm.$t("PayloadDesc"),
      },
      {
        title: vm.$t("Name"),
        type: "label",
        key: "H264",
        value: "H264",
        showDescription: true,
        description: vm.$t("VideoNameDesc"),
      },
      {
        title: vm.$t("Resolution"),
        type: "select",
        key: "Config.Account" + vm.CurrentAccount + ".Video00.ProfileLevel",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".Video00.ProfileLevel"
          ],
        selectItems: [
          { key: 0, label: "QCIF" },
          { key: 1, label: "CIF" },
          { key: 2, label: "VGA" },
          { key: 3, label: "4CIF" },
          { key: 4, label: "720P" },
        ],
        description: vm.$t("ResolutionDesc"),
      },
      {
        title: vm.$t("BitrateLabel"),
        type: "select",
        key: "Config.Account" + vm.CurrentAccount + ".Video00.MaxBR",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".Video00.MaxBR"
          ],
        selectItems: [],
        description: vm.$t("BitrateDesc"),
      },
      {
        title: vm.$t("Payload"),
        type: "select",
        key: "Config.Account" + vm.CurrentAccount + ".Video00.Payload",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".Video00.Payload"
          ],
        selectItems: vm.codePayLoadItems2,
        description: vm.$t("PayloadDesc"),
      },
      {
        title: vm.$t("Name"),
        type: "label",
        key: "VP8",
        value: "VP8",
        showDescription: true,
        description: vm.$t("VideoNameDesc"),
      },
      {
        title: vm.$t("Resolution"),
        type: "select",
        key: "Config.Account" + vm.CurrentAccount + ".Video03.ProfileLevel",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".Video03.ProfileLevel"
          ],
        selectItems: [
          { key: 0, label: "QCIF" },
          { key: 1, label: "CIF" },
          { key: 2, label: "VGA" },
          { key: 3, label: "4CIF" },
          { key: 4, label: "720P" },
        ],
        description: vm.$t("ResolutionDesc"),
      },
      {
        title: vm.$t("BitrateLabel"),
        type: "select",
        key: "Config.Account" + vm.CurrentAccount + ".Video03.MaxBR",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".Video03.MaxBR"
          ],
        selectItems: [],
        description: vm.$t("BitrateDesc"),
      },
      {
        title: vm.$t("Payload"),
        type: "select",
        disabled: true,
        key: "Config.Account" + vm.CurrentAccount + ".Video03.Payload",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".Video03.Payload"
          ],
        selectItems: vm.codePayLoadItems2,
        description: vm.$t("PayloadDesc"),
      },
    ],
  };
  return content;
}

function createSubscribeContent(vm) {
  let content = {
    key: "subscribe",
    title: vm.$t("Subscribe"),
    titleDescription: vm.$t("SubscribeDesc"),
    items: [
      {
        title: vm.$t("MWISubscribe"),
        type: "checkbox",
        key: "Config.Account" + vm.CurrentAccount + ".SUBSCRIBE.SubsribeMWI",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".SUBSCRIBE.SubsribeMWI"
          ],
        description: vm.$t("MWISubscribeDesc"),
      },
      {
        title: vm.$t("MWISubscribePeriod"),
        type: "input",
        showHint: true,
        isWarn: false,
        hintContent: vm.$t("(120~65535Sec)"),
        key:
          "Config.Account" +
          vm.CurrentAccount +
          ".SUBSCRIBE.SubscribeMWIExpire",
        value:
          vm.apiData.configData[
            "Config.Account" +
              vm.CurrentAccount +
              ".SUBSCRIBE.SubscribeMWIExpire"
          ],
        description: vm.$t("MWIPeriodDesc"),
      },
      {
        title: vm.$t("VoiceMailNumber"),
        type: "input",
        key: "Config.Account" + vm.CurrentAccount + ".VOICEMSG.Number",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".VOICEMSG.Number"
          ],
        description: vm.$t("VoiceMailDesc"),
      },
    ],
  };
  return content;
}

function createDtmfContent(vm) {
  let content = {
    key: "dtmf",
    title: vm.$t("DTMF"),
    titleDescription: vm.$t("DTMFDesc"),
    items: [
      {
        title: vm.$t("Type"),
        type: "select",
        key: "Config.Account" + vm.CurrentAccount + ".DTMF.Type",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".DTMF.Type"
          ],
        selectItems: [
          { key: 1, label: "Inband" },
          { key: 2, label: "RFC2833" },
          { key: 3, label: "Info" },
          { key: 4, label: "Info+Inband" },
          { key: 5, label: "Info+RFC2833" },
        ],
        description: vm.$t("DTMFTypeDesc"),
      },
      {
        title: vm.$t("HowToInfoDTMF"),
        type: "select",
        key: "Config.Account" + vm.CurrentAccount + ".DTMF.InfoType",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".DTMF.InfoType"
          ],
        selectItems: [
          { key: 0, label: "Disabled" },
          { key: 1, label: "DTMF" },
          { key: 2, label: "DTMF-Relay" },
          { key: 3, label: "Telephone-Event" },
        ],
        description: vm.$t("HowToDTMFDesc"),
      },
      {
        title: vm.$t("DTMFPayload"),
        type: "input",
        showHint: true,
        isWarn: false,
        hintContent: vm.$t("(96~127)"),
        key: "Config.Account" + vm.CurrentAccount + ".DTMF.Payload",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".DTMF.Payload"
          ],
        description: vm.$t("DTMFPayloadDesc"),
      },
    ],
  };
  return content;
}

function createCallContent(vm) {
  let content = {
    key: "call",
    title: vm.$t("Call"),
    titleDescription: vm.$t("CallDesc"),
    items: [
      {
        title: vm.$t("MaxLocalSIPPort"),
        type: "input",
        showHint: true,
        hintContent: vm.$t("(1024~65535)"),
        isWarn: false,
        key: "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
          ],
        description: vm.$t("MaxSIPPortDesc"),
      },
      {
        title: vm.$t("MinLocalSIPPort"),
        type: "input",
        showHint: true,
        isWarn: false,
        hintContent: vm.$t("(1024~65535)"),
        key: "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
          ],
        description: vm.$t("MinSIPPortDesc"),
      },
      // {
      //   title: vm.$t("PTime") + "(ms)",
      //   type: "select",
      //   key: "Config.Account" + vm.CurrentAccount + ".CALL.Ptime",
      //   value:
      //     vm.apiData.configData[
      //       "Config.Account" + vm.CurrentAccount + ".CALL.Ptime"
      //     ],
      //   selectItems: [
      //     { key: 0, label: "Disabled" },
      //     { key: 10, label: 10 },
      //     { key: 20, label: 20 },
      //     { key: 30, label: 30 },
      //     { key: 40, label: 40 },
      //     { key: 50, label: 50 },
      //     { key: 60, label: 60 },
      //   ],
      //   description: vm.$t("PTimeDesc"),
      // },
      {
        title: vm.$t("AutoAnswer"),
        type: "checkbox",
        key: "Config.Account" + vm.CurrentAccount + ".AUTO_ANSWER.Enable",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".AUTO_ANSWER.Enable"
          ],
        description: vm.$t("AutoAnswerDesc"),
      },
      {
        title: vm.$t("PreventSIPHacking"),
        type: "checkbox",
        key: "Config.Account" + vm.CurrentAccount + ".CALL.PreventSIPHacking",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".CALL.PreventSIPHacking"
          ],
        description: vm.$t("SIPHackingDesc"),
      },
    ],
  };
  return content;
}

function createEncryptionContent(vm) {
  let content = {
    key: "encryption",
    title: vm.$t("Encryption"),
    titleDescription: vm.$t("EncryptionDesc"),
    items: [
      {
        title: vm.$t("VoiceEncry"),
        type: "select",
        key:
          "Config.Account" + vm.CurrentAccount + ".ENCRYPTION.SRTPEncryption",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".ENCRYPTION.SRTPEncryption"
          ],
        selectItems: [
          { key: 0, label: vm.$t("Disabled") },
          { key: 1, label: vm.$t("SRTPCompulsory") },
          { key: 2, label: vm.$t("SRTPOptional") },
          { key: 3, label: vm.$t("ZRTPOptional") },
        ],
        description: vm.$t("VoiceEncryptionDesc"),
      },
    ],
  };
  return content;
}

function createNatContent(vm) {
  let content = {
    key: "nat",
    title: vm.$t("NAT"),
    titleDescription: vm.$t("NATDesc"),
    items: [
      {
        title: vm.$t("UDPKeepAliveMsg"),
        type: "checkbox",
        key: "Config.Account" + vm.CurrentAccount + ".NAT.UdpKeepEnable",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".NAT.UdpKeepEnable"
          ],
        description: vm.$t("UDPKeepAliveDesc"),
      },
      {
        title: vm.$t("UDPAliveMsgInterval"),
        type: "input",
        showHint: true,
        isWarn: false,
        hintContent: vm.$t("(5~60Sec)"),
        key: "Config.Account" + vm.CurrentAccount + ".NAT.UdpKeepInterval",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".NAT.UdpKeepInterval"
          ],
        description: vm.$t("UDPAliveMsgIntervalDesc"),
      },
      {
        title: vm.$t("RPortEnabled"),
        type: "checkbox",
        key: "Config.Account" + vm.CurrentAccount + ".NAT.Rport",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".NAT.Rport"
          ],
        description: vm.$t("RPortDesc"),
      },
    ],
  };
  return content;
}

function createUserAgentContent(vm) {
  let content = {
    key: "userAgent",
    title: vm.$t("UserAgent"),
    titleDescription: vm.$t("UserAgentDesc"),
    items: [
      {
        title: vm.$t("UserAgent"),
        type: "input",
        isWarn: false,
        key: "Config.Account" + vm.CurrentAccount + ".GENERAL.UserAgent",
        value:
          vm.apiData.configData[
            "Config.Account" + vm.CurrentAccount + ".GENERAL.UserAgent"
          ],
        description: vm.$t("UserAgentDesc"),
      },
    ],
  };
  return content;
}

function checkCommitData(vm) {
  let success = true;
  //audioCodecs
  if (vm.audioCodecsTargetItems.length == 0) {
    alert(vm.$t("EnabledCodecEmptyWarning"));
    success = false;
  }

  //videoCodecs
  if (vm.videoCodecsTargetItems.length == 0) {
    alert(vm.$t("EnabledCodecEmptyWarning"));
    success = false;
  }

  var maxLocalPortErrFlag = false;
  var minLocalPortErrFlag = false;
  //MaxLocalSIPPort
  if (
    !isPort(
        vm.changedCfgData[
          "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
        ]
    ) ||
    Number(
      vm.changedCfgData[
        "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
      ]
    ) < 1024
  ) {
    let item = getItemByKey(
      vm.data,
      "call",
      "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
    );
    item.isWarn = true;
    item.warnLabel = vm.$t("MaxMinSIPPortRangeError");
    maxLocalPortErrFlag = true;
    success = false;
  }

  //MinLocalSIPPort
  if (
    !isPort(
        vm.changedCfgData[
          "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
        ]
    ) ||
    Number(
      vm.changedCfgData[
        "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
      ]
    ) < 1024
  ) {
    let item = getItemByKey(
      vm.data,
      "call",
      "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
    );
    item.isWarn = true;
    item.warnLabel = vm.$t("MaxMinSIPPortRangeError");
    minLocalPortErrFlag = true;
    success = false;
  }

  //MinLocalSIPPort > MaxLocalSIPPort
  if (
    "undefined" !=
      typeof vm.submitCfgData[
        "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
      ] ||
    "undefined" !=
      typeof vm.submitCfgData[
        "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
      ]
  ) {
    if (
      Number(
        vm.changedCfgData[
          "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
        ]
      ) -
        Number(
          vm.changedCfgData[
            "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
          ]
        ) <
      0
    ) {
      if (!maxLocalPortErrFlag) {
        let item1 = getItemByKey(
          vm.data,
          "call",
          "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
        );
        item1.isWarn = true;
        item1.warnLabel = vm.$t("MaxLessMinLocalSIPPortError");
        maxLocalPortErrFlag = true;
      }
      if (!minLocalPortErrFlag) {
        let item2 = getItemByKey(
          vm.data,
          "call",
          "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
        );
        item2.isWarn = true;
        item2.warnLabel = vm.$t("MaxLessMinLocalSIPPortError");
        minLocalPortErrFlag = true;
      }
      success = false;
    }
    var isPortUsedValue = isPortUsed(
      vm.changedCfgData[
        "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
      ],
      vm.changedCfgData[
        "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
      ],
      vm.usedPortItems
    );
    if (3 == isPortUsedValue) {
      if (!maxLocalPortErrFlag) {
        let item1 = getItemByKey(
          vm.data,
          "call",
          "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
        );
        item1.isWarn = true;
        item1.warnLabel = vm.$t("WarningPortUsedAlready");
        maxLocalPortErrFlag = true;
      }
      if (!minLocalPortErrFlag) {
        let item2 = getItemByKey(
          vm.data,
          "call",
          "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
        );
        item2.isWarn = true;
        item2.warnLabel = vm.$t("WarningPortUsedAlready");
        minLocalPortErrFlag = true;
      }
      success = false;
    } else if (2 == isPortUsedValue && !maxLocalPortErrFlag) {
      let item = getItemByKey(
        vm.data,
        "call",
        "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMax"
      );
      item.warnLabel = vm.$t("WarningPortUsedAlready");
      item.isWarn = true;
      maxLocalPortErrFlag = true;
      success = false;
    } else if (1 == isPortUsedValue && !minLocalPortErrFlag) {
      let item = getItemByKey(
        vm.data,
        "call",
        "Config.Account" + vm.CurrentAccount + ".SIP.ListenPortMin"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("WarningPortUsedAlready");
      minLocalPortErrFlag = true;
      success = false;
    }
  }

  if (
    "undefined" !=
    typeof vm.submitCfgData[
      "Config.Account" + vm.CurrentAccount + ".DTMF.Payload"
    ]
  ) {
    if (
      !checkRangeOfNumber(
        vm.submitCfgData[
          "Config.Account" + vm.CurrentAccount + ".DTMF.Payload"
        ],
        96,
        127
      )
    ) {
      let item = getItemByKey(
        vm.data,
        "dtmf",
        "Config.Account" + vm.CurrentAccount + ".DTMF.Payload"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("DTMFPayloadRangeError");
      success = false;
    }
  }

  if(vm.changedCfgData["Config.Account" + vm.CurrentAccount + ".SUBSCRIBE.SubsribeMWI"] == 1){
    if (
      "undefined" !=
      typeof vm.submitCfgData[
        "Config.Account" + vm.CurrentAccount + ".SUBSCRIBE.SubscribeMWIExpire"
      ]
    ) {
      if (
        !checkRangeOfNumber(
          vm.submitCfgData[
            "Config.Account" + vm.CurrentAccount + ".SUBSCRIBE.SubscribeMWIExpire"
          ],
          120,
          65535
        )
      ) {
        let item = getItemByKey(
          vm.data,
          "subscribe",
          "Config.Account" + vm.CurrentAccount + ".SUBSCRIBE.SubscribeMWIExpire"
        );
        item.isWarn = true;
        item.warnLabel = vm.$t("SubscribePeriodRangeError");
        success = false;
      }
    }

    if("undefined" != typeof(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".VOICEMSG.Number"])){
      if(!notContainInvalid(vm.submitCfgData["Config.Account"+vm.CurrentAccount+".VOICEMSG.Number"])){
        let item = getItemByKey(
          vm.data,
          "subscribe",
          "Config.Account"+vm.CurrentAccount+".VOICEMSG.Number"
        );
        item.isWarn = true;
        item.warnLabel = vm.$t("VoiceMailNumberUnvalid");
        success = false;
      }
    }
  }

  if (
    "undefined" !=
    typeof vm.submitCfgData[
      "Config.Account" + vm.CurrentAccount + ".NAT.UdpKeepInterval"
    ]
  ) {
    if (
      !checkRangeOfNumber(
        vm.submitCfgData[
          "Config.Account" + vm.CurrentAccount + ".NAT.UdpKeepInterval"
        ],
        5,
        60
      )
    ) {
      let item = getItemByKey(
        vm.data,
        "nat",
        "Config.Account" + vm.CurrentAccount + ".NAT.UdpKeepInterval"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("UDPAliveMessageRangeError");
      success = false;
    }
  }

  if (
    "undefined" !=
    typeof vm.submitCfgData[
      "Config.Account" + vm.CurrentAccount + ".GENERAL.UserAgent"
    ]
  ) {
    if (
      !notContainInvalid(
        vm.submitCfgData[
          "Config.Account" + vm.CurrentAccount + ".GENERAL.UserAgent"
        ]
      )
    ) {
      let item = getItemByKey(
        vm.data,
        "userAgent",
        "Config.Account" + vm.CurrentAccount + ".GENERAL.UserAgent"
      );
      item.isWarn = true;
      item.warnLabel = vm.$t("UserAgentUnvalid");
      success = false;
    }
  }
  return success;
}
</script>