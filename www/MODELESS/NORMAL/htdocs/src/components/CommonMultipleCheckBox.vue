<template>
  <div class="ak-common-checkbox-div" v-show="isShow">
    <label class="ak-common-checkbox-title-label">{{labelTitle}}</label>
    <div class="ak-common-checkboxMulti-div">
      <a-checkbox-group class="ak-common-checkboxgroup" v-model="transValue" @change="onChange">
        <template v-for="item in itemData">
          <a-checkbox
            :value="item.key"
            :style="itemData.length > 4 ? MultiStyle : SingleStyle"
          >{{item.label}}</a-checkbox>
        </template>
      </a-checkbox-group>
      <Popover
        :descriptionContent="descriptionContent"
        :style="{paddingLeft:'25px'}"
        v-if="isShowPopover"
      ></Popover>
    </div>
  </div>
</template>

<script>
import Popover from "@/components/Popover.vue";
import { getIndexByKey, deepClone } from "@/js/common.js";
export default {
  components: {
    Popover,
  },
  props: {
    showHint: { type: Boolean, default: true },
    isShow: { type: Boolean, default: true },
    isShowPopover: { type: Boolean, default: true },
    descriptionContent: String,
    labelTitle: String,
    label: String,
    disabled: { type: Boolean, default: false },
    itemData: Array,
    value: Array,
  },
  data() {
    return {
      transValue: this.value,
      SingleStyle: {
        marginRight: "20px",
      },
      MultiStyle: {
        width: "150px",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    };
  },
  methods: {
    onChange: function (checkedValues) {
      this.transValue = checkedValues;
      this.$emit("change", checkedValues);
    },
  },
};
</script>

<style lang="less" scoped>
.ak-common-checkbox-div {
  padding-left: 400px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
  position: relative;
}

.ak-common-checkboxMulti-div {
  display: flex;
  width: 500px;
}

.ak-common-checkboxgroup {
  font-size: 16px;
}

/deep/.ant-checkbox-wrapper + .ant-checkbox-wrapper {
  margin-left: 0px;
}

.ak-common-checkbox-title-label {
  width: 290px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
  color: #343434;
}
</style>