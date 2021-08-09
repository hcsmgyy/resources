<template>
  <div class="ak-common-del-button">
    <a-button
      type="danger"
      :disabled="delDisabled"
      @click="onDel"
      :loading="delLoading"
      class="ak-common-modal-footer-btn"
    >{{ $t("DeleteLabel") }}</a-button>
    <a-button
      type="danger"
      :style="{marginLeft:'300px',width:'120px'}"
      :disabled="delAllDisabled"
      @click="onDelAll"
      :loading="delAllLoading"
      class="ak-common-modal-footer-btn"
    >{{ $t("DeleteAllLabel") }}</a-button>
  </div>
</template>

<script>
export default {
  props: {
    delDisabled: { type: Boolean, default: false },
    delAllDisabled: { type: Boolean, default: false },
    onDel: {
      type: Function,
      default: function () {
        console.log("click delete");
      },
    },
    onDelAll: {
      type: Function,
      default: function () {
        console.log("click delete all");
      },
    },
    delLoading: {
      type: Boolean,
      default: false,
    },
    delAllLoading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="less" scoped>
.ak-common-del-button {
  margin-top: 22px;
  padding-left: 537px;
}

.ak-common-modal-footer-btn {
  width: 120px;
  background: rgba(255, 243, 243, 1);
  border: 1px solid rgba(255, 99, 101, 1);
  border-radius: 5px;
  color: #f55b5f;
  font-size: 16px;  
}


/deep/.ant-btn {
  font-size: 16px;
}
/deep/.ant-btn[disabled] {
  color: rgba(102, 102, 102, 1);
}
</style>