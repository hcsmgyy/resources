<template>
  <div class="ak-common-textarea-div">
    <a-textarea class="ak-common-textarea"
      :rows="8"
      :disabled="disabled"
      :readonly="readonly"
      :value="value"/>
  </div>
</template>

<script>
export default {
  props: {
    value: String,
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
  },
};
</script>

<style lang="less" scoped>
.ak-common-textarea-div {
  padding-left: 400px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
}

.ak-common-textarea {
  padding-top: 4px;
  color: #343434;
}

/deep/.ant-input {
  width: 73%;
}
</style>