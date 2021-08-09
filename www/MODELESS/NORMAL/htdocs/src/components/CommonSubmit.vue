<template>
  <div class="ak-common-submit" v-if="isShow">
    <a-button
      type="danger"
      :disabled="cancelDisabled"
      @click="onCancel"
      :loading="cancelLoading"
      class="ak-common-modal-footer-btn ak-common-modal-footer-cancel"
    >{{ $t("Cancel") }}</a-button>
    <a-button
      type="primary"
      :style="{marginLeft:'300px',width:'120px'}"
      :disabled="confirmDisabled"
      @click="onSubmit"
      :loading="submitLoading"
    >{{ $t("SubmitLabel") }}</a-button>
  </div>
</template>

<script>
export default {
  props: {
    cancelDisabled: { type: Boolean, default: false },
    confirmDisabled: { type: Boolean, default: false },
    isShow: { type: Boolean, default: true },
    onCancel: {
      type: Function,
      default: function () {
        console.log("click cancel");
      },
    },
    onSubmit: {
      type: Function,
      default: function () {
        console.log("click confirm");
      },
    },
    cancelLoading: {
      type: Boolean,
      default: false,
    },
    submitLoading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="less" scoped>
.ak-common-submit {
  min-width: 1591px;
  position:sticky;
  overflow: hidden;
  bottom: 0;
  background: #ffffff;
  height: 75px;
  padding-left: 567px;
  display: flex;
  align-items: center;
  box-shadow: 1px 2px 6px 0px rgba(0, 0, 0, 0.1);
}

/deep/.ant-btn {
  font-size: 16px;
}
/deep/.ant-btn[disabled] {
  color: rgba(102, 102, 102, 1);
}

.ak-common-modal-footer-btn {
  width: 120px;
  font-size: 16px;
  border-radius: 5px;
  background: #f1f1f1;
  color: #666666;
  border: unset;
}

.ak-common-modal-footer-cancel{
  background: #ffffff;
  border: 1px solid #d9d9d9;
}

/deep/.ant-btn-danger:hover,
/deep/ .ant-btn-danger:focus {
  color: #666666;
  background-color: #f6f6f6;
  border: 1px solid #d9d9d9;
}
</style>