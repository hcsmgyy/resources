<template>
  <div class="ak-common-transfer-div">
    <a-transfer
      :data-source="mockData"
      :titles="[sourceTitle, targetTitle]"
      :target-keys="targetKeys"
      :selected-keys="selectedKeys"
      :render="item => item.title"
      :showSelectAll="false"
      @change="handleChange"
      @selectChange="handleSelectChange"
    />
    <div class="ak-common-transfer-button">
      <a-button
        class="ak-common-transfer-button-up"
        type="primary"
        icon="up"
        @click="ItemUp()"
        size="small"
      />
      <a-button
        class="ak-common-transfer-button-dowm"
        type="primary"
        icon="down"
        @click="ItemDown()"
        size="small"
      />
    </div>
  </div>
</template>

<script>
import Popover from "@/components/Popover.vue";
import { deepClone } from "@/js/common.js";
export default {
  components: {
    Popover,
  },
  props: {
    mockData: Array,
    targetKeys: Array,
    selectedKeys: Array,
    sourceTitle: String,
    targetTitle: String,
    disabled: false,
  },
  data() {
    return {
      mockValue: this.mockData,
      targetKeyValue: this.targetKeys,
      sourceSelectValue: this.selectedKeys,
    };
  },
  methods: {
    handleChange(nextTargetKeys, direction, moveKeys) {
      this.targetKeyValue = nextTargetKeys;
      this.onChange(this.targetKeyValue);
    },
    handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
      this.sourceSelectValue = [...sourceSelectedKeys, ...targetSelectedKeys];
      this.$emit("selectChange", this.sourceSelectValue);
    },
    ItemUp() {
      let deepCloneTarget = deepClone(this.targetKeys);
      for (var i = 0; i < deepCloneTarget.length; i++) {
        if (this.sourceSelectValue.includes(deepCloneTarget[i]) && i != 0) {
          var tmptargetValue = deepCloneTarget[i];
          deepCloneTarget[i] = deepCloneTarget[i - 1];
          deepCloneTarget[i - 1] = tmptargetValue;
          break;
        }
      }
      this.onChange(deepCloneTarget);
    },
    ItemDown() {
      let deepCloneTarget = deepClone(this.targetKeys);
      for (var i = 0; i < deepCloneTarget.length; i++) {
        if (
          this.sourceSelectValue.includes(deepCloneTarget[i]) &&
          i != deepCloneTarget.length - 1
        ) {
          var tmptargetValue = deepCloneTarget[i];
          deepCloneTarget[i] = deepCloneTarget[i + 1];
          deepCloneTarget[i + 1] = tmptargetValue;
          break;
        }
      }
      this.onChange(deepCloneTarget);
    },
    onChange: function (value) {
      this.$emit("change", value);
    },
  },
};
</script>

<style lang="less" scoped>
.ak-common-transfer-div {
  padding-left: 434px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
}
/deep/.ant-transfer-list-header {
  background: #e6f3fe;
}

.ak-common-transfer-button {
  margin-top: 74px;
  height: 200px;
  width: 30px;
  margin-left: 40px;
}

.ak-common-transfer-button-up {
  margin-bottom: 4px;
}

/deep/.ant-transfer-list {
  width: 260px;
}

/deep/.ant-transfer-operation {
  margin: 0 40px;
}
</style>