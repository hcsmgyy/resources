<template>
  <div>
    <a-modal
      :title="title"
      :visible="data.visible"
      :centered="true"
      :width="isCenterd == true ? 950 : 520"
      @cancel="onCancel"
    >
      <template v-for="(item, itemIndex) in modalItems">
        <div :key="item.key">
          <CommonInput
            :addOnBefore="item.addOnBefore"
            v-if="item.type == 'input'"
            :wholeStyle="inputStyle"
            :labelTitle="item.title"
            :descriptionContent="item.description"
            :hintContent="item.hintContent"
            :showHint="item.showHint"
            :disabled="item.disabled"
            :inputType="item.inputType"
            :isWarn="item.isWarn"
            :warnLabel="item.warnLabel"
            :value="item.value"
            @change="onChange($event, item, item.key, itemIndex)"
            :maxLength="item.maxLength"
            :showEmptyPwd="item.showEmptyPwd"
            :showDescription="item.showDescription"
            :onInput="item.onInput"
            :isShow="item.isShow"
          ></CommonInput>
          <CommonLabel
            v-else-if="item.type == 'label'"
            :wholeStyle="inputStyle"
            :labelTitle="item.title"
            :value="item.value"
            :showDescription="item.showDescription"
            :titleBold="item.titleBold"
          ></CommonLabel>
          <span v-else-if="item.type == 'span'" class="ak-modal-span">{{
            item.value
          }}</span>
          <label
            v-else-if="item.type == 'hint-label'"
            v-show="item.isShowDiv"
            :style="item.isTrue ? hintGreenStyle : hintRedStyle"
            >{{ item.value }}{{ item.right }}</label
          >
        </div>
      </template>
      <template slot="footer">
        <div class="ak-common-modal-footer">
          <div v-if="showFooter">
            <a-button
              @click="onCancel"
              class="ak-common-modal-footer-btn ak-common-modal-footer-cancel"
              type="danger"
              >{{ cancelBtnLabel }}</a-button
            >
            <a-button
              class="ak-common-modal-footer-btn ak-common-modal-footer-confirm"
              type="primary"
              @click="onConfirm"
              :disabled="confirmDisabled"
              >{{ submitBtnLabel }}</a-button
            >
          </div>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script>
import CommonInput from "@/components/CommonInput.vue";
import CommonLabel from "@/components/CommonLabel.vue";
import {
  deepClone,
  getIndexByKey,
  isValidLoginPsw,
  notContainInvalid_Sub,
  showRequestSuccess,
  showErrorInfo,
} from "@/js/common.js";

export default {
  components: {
    CommonInput,
    CommonLabel,
  },
  props: {
    userName: String,
    cancelBtnLabel: String,
    title: String,
    oldPswShow: { type: Boolean, default: true },
    data: Object,
    isCenterd: {type: Boolean, default: false},
  },
  data() {
    return {
      submitBtnLabel: this.$t("Change"),
      showFooter: true,
      confirmDisabled: true,
      modalItems: [
        {
          type: "span",
          value: this.$t("WebPswModifyAlert"),
        },
        {
          title: this.$t("UserName"),
          type: "label",
          key: "userName",
          value: this.userName,
          isHint: false,
        },
        {
          title: this.$t("OldPassword"),
          type: "input",
          key: "oldPassword",
          showEmptyPwd: false,
          value: "",
          inputType: "password",
          showDescription: false,
          maxlength: 20,
          isShow: this.oldPswShow,
        },
        {
          type: "hint-label",
          key: "oldPasswordhint",
          value: this.$t("OldPasswordIncorrectWarning"),
          isShowDiv: false,
          isTrue: false,
        },
        {
          title: this.$t("NewPassword"),
          type: "input",
          key: "newPassword",
          showEmptyPwd: false,
          value: "",
          inputType: "password",
          showDescription: false,
          maxlength: 20,
        },
        {
          type: "hint-label",
          key: "hint0",
          value: this.$t("UpperAlert"),
          isShowDiv: false,
          isTrue: false,
        },
        {
          type: "hint-label",
          key: "hint1",
          value: this.$t("LowerAlert"),
          isShowDiv: false,
          isTrue: false,
        },
        {
          type: "hint-label",
          key: "hint2",
          value: this.$t("DigitAlert"),
          isShowDiv: false,
          isTrue: false,
        },
        {
          type: "hint-label",
          key: "hint3",
          value: this.$t("CharLongAlert"),
          isShowDiv: false,
          isTrue: false,
        },
        {
          title: this.$t("ConfirmPassword"),
          type: "input",
          key: "confirmPassword",
          showEmptyPwd: false,
          value: "",
          inputType: "password",
          showDescription: false,
          disabled: true,
        },
        {
          type: "hint-label",
          key: "confirmPasswordhint",
          value: this.$t("MatchAlert"),
          isShowDiv: false,
          isTrue: false,
        },
      ],
      inputStyle: {
        paddingLeft: "130px",
        fontSize: "16px",
        marginTop: "16px",
        display: "flex",
      },
      hintRedStyle: {
        paddingLeft: "420px",
        fontSize: "14px",
        color: "#fa4747",
        marginTop: "16px",
        display: "flex",
      },
      hintGreenStyle: {
        paddingLeft: "420px",
        fontSize: "14px",
        color: "#35a404",
        marginTop: "16px",
        display: "flex",
      },
    };
  },
  methods: {
    onConfirm: function () {
      onModifyPageClickChangeButton(this);
    },
    onCancel: function () {
      this.data.visible = false;
      modalChangeCancel(this);
    },
    onChange: function (data, item, itemKey, itemIndex) {
      let oldVal = item.value;
      let newVal = data;

      item.value = data;

      let result = {
        oldVal: oldVal,
        newVal: newVal,
        itemKey: itemKey,
        itemIndex: itemIndex,
      };

      if ("newPassword" == itemKey) {
        onModifyPageNewPswChange(this, newVal);
      }

      if ("confirmPassword" == itemKey) {
        onModifyPageConfirmNewPswChange(this, newVal);
      }
    },
  },
  watch: {
    userName(newVal) {
      let itemIndex = getIndexByKey(this.modalItems, "userName");
      this.modalItems[itemIndex].value = newVal;
    },
    oldPswShow(newVal) {
      let itemIndex = getIndexByKey(this.modalItems, "oldPassword");
      this.modalItems[itemIndex].isShow = newVal;
    },
  },
};

function modalChangeCancel(vm) {
  let itemIndex1 = getIndexByKey(vm.modalItems, "oldPassword");
  let itemIndex2 = getIndexByKey(vm.modalItems, "newPassword");
  let itemIndex3 = getIndexByKey(vm.modalItems, "confirmPassword");
  vm.modalItems[itemIndex1].value = "";
  vm.modalItems[itemIndex2].value = "";
  vm.modalItems[itemIndex3].value = "";

  for (var i = 0; i < 4; i++) {
    let hintIndex = getIndexByKey(vm.modalItems, "hint" + i);
    vm.modalItems[hintIndex].isShowDiv = false;
  }

  let hintIndex = getIndexByKey(vm.modalItems, "confirmPasswordhint");
  vm.modalItems[hintIndex].isShowDiv = false;

  let requestData = {
    target: "securityBasic",
    action: "set",
    data: {
      firstCancel: 1,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {});
}

function onModifyPageClickChangeButton(vm) {
  var nIsValidNew, nIsValidConfirm;
  var strOldPsw, strNewPsw, strUserName;
  var bIsFirstTime;
  var request;
  var errFlag = false;

  let oldPwdItemIndex = getIndexByKey(vm.modalItems, "oldPassword");
  let newPwdItemIndex = getIndexByKey(vm.modalItems, "newPassword");
  let userNameItemIndex = getIndexByKey(vm.modalItems, "userName");
  strUserName = vm.modalItems[userNameItemIndex].value;
  strOldPsw = vm.modalItems[oldPwdItemIndex].value;
  strNewPsw = vm.modalItems[newPwdItemIndex].value;

  if (false == vm.modalItems[oldPwdItemIndex].isShow) {
    let requestData = {
      target: "securityBasic",
      action: "set",
      data: {
        userName: strUserName,
        firstLogin: 1,
        newPassword: strNewPsw,
      },
    };
    vm.$axios.post("api", requestData).then((response) => {
      if ("undefined" != typeof response) {
        showRequestSuccess(vm, vm.$t("PasswordChangedSuccess"));
      }
      vm.data.visible = false;
    });
    return;
  }

  if (!notContainInvalid_Sub(strNewPsw)) {
    showErrorInfo(vm, vm.$t("LoginPasswordFormatAlert"));
    return;
  }

  if (strNewPsw == strOldPsw) {
    showErrorInfo(vm, vm.$t("LoginOldPasswordSameAlert"));
    return;
  }

  // vm.data.submitLoading = true;

  let requestData = {
    target: "securityBasic",
    action: "set",
    data: {
      userName: strUserName,
      oldPassword: strOldPsw,
      newPassword: strNewPsw,
    },
  };
  vm.$axios.post("api", requestData).then((response) => {
    if (response.data.retcode == -1) {
      showErrorInfo(vm, vm.$t("OldPasswordIncorrectWarning"));
    } else if (response.data.retcode == 0) {
      if ("undefined" != typeof response) {
        showRequestSuccess(vm, vm.$t("PasswordChangedSuccess"));
        modalChangeCancel(vm);
      }
      vm.data.visible = false;
    }
    // vm.data.submitLoading = false;
  });
}

function onModifyPageNewPswChange(vm, value) {
  var nFlag = 0;
  var strFlag;
  if (value.length != 0) {
    for (var i = 0; i < 4; i++) {
      let hintIndex = getIndexByKey(vm.modalItems, "hint" + i);
      vm.modalItems[hintIndex].isShowDiv = true;
    }
  } else {
    for (var i = 0; i < 4; i++) {
      let hintIndex = getIndexByKey(vm.modalItems, "hint" + i);
      vm.modalItems[hintIndex].isShowDiv = false;
    }
  }
  nFlag = isValidLoginPsw(value);
  strFlag = nFlag.toString(2);
  strFlag = (Array(4).join(0) + strFlag).slice(-4);

  for (var i = 0; i < strFlag.length; i++) {
    let hintIndex = getIndexByKey(vm.modalItems, "hint" + i);
    if (strFlag.charAt(i) == 1) {
      vm.modalItems[hintIndex].right = " √";
      vm.modalItems[hintIndex].isTrue = true;
    } else {
      vm.modalItems[hintIndex].right = " ×";
      vm.modalItems[hintIndex].isTrue = false;
    }
  }

  let hint3Index = getIndexByKey(vm.modalItems, "hint3");
  if (value.length > 20) {
    vm.modalItems[hint3Index].value = vm.$t("CharTooLongAlert");
  } else {
    vm.modalItems[hint3Index].value = vm.$t("CharLongAlert");
  }

  if (15 != nFlag) {
    let itemIndex = getIndexByKey(vm.modalItems, "confirmPassword");
    vm.modalItems[itemIndex].value = "";
    vm.modalItems[itemIndex].disabled = true;
  } else {
    let itemIndex = getIndexByKey(vm.modalItems, "confirmPassword");
    vm.modalItems[itemIndex].disabled = false;
    for (var i = 0; i < 4; i++) {
      let hintIndex = getIndexByKey(vm.modalItems, "hint" + i);
      vm.modalItems[hintIndex].isShowDiv = false;
    }
  }
  return nFlag;
}

function onModifyPageConfirmNewPswChange(vm, value) {
  let itemIndex = getIndexByKey(vm.modalItems, "newPassword");
  var newPsw = vm.modalItems[itemIndex].value;
  let hintIndex = getIndexByKey(vm.modalItems, "confirmPasswordhint");
  if (value.length <= 0 || newPsw.length <= 0) {
    vm.modalItems[hintIndex].isShowDiv = false;
    vm.confirmDisabled = true;
    return -1;
  }
  if (value.length < 8 || value.length > newPsw.length) {
    vm.modalItems[hintIndex].isShowDiv = true;
    vm.confirmDisabled = true;
    return -1;
  } else if (value.length == newPsw.length && value == newPsw) {
    vm.modalItems[hintIndex].isShowDiv = false;
    vm.confirmDisabled = false;
    return 1;
  } else {
    vm.modalItems[hintIndex].isShowDiv = true;
    vm.confirmDisabled = true;
  }
  return 0;
}
</script>

<style lang="less" scoped>
/deep/.ant-modal-content {
  width: 950px;
  border-radius: 10px;
}

/deep/.ant-modal-footer {
  padding-top: 0px;
  border-top: unset;
}

.ak-common-modal-footer {
  margin-bottom: 40px;
  margin-right: 34px;
}

.ak-common-modal-footer > div {
  padding-top: 60px;
}

.ak-common-modal-footer-btn {
  width: 120px;
  font-size: 16px;
  border-radius: 5px;
  margin-left: 30px;
}
.ak-common-modal-footer-cancel {
  background: rgba(241, 241, 241, 1);
  color: #656565;
  border: unset;
}
.ak-common-modal-footer-confirm {
  background: rgba(0, 135, 247, 1);
  color: #ffffff;
  border: unset;
}
/deep/.ant-modal-title {
  font-size: 20px;
  color: #333333;
  font-weight: bold;
  min-height: 22px;
}
/deep/.ant-modal-header {
  margin: 15px;
  padding: 15px 15px;
  border-bottom-color: #d3dbe1;
}

/deep/.ant-modal-body {
  padding-top: 0px;
  padding-bottom: 0px;
}

/deep/.ant-btn-danger:hover,
/deep/ .ant-btn-danger:focus {
  color: #656565;
  background-color: #f9f9f9;
}

.ak-modal-span {
  margin-left: 35px;
  margin-right: 35px;
  font-size: 16px;
  float: left;
  margin-bottom: 40px;
  width: 95%;
}
</style>