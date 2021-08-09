<template>
  <div class="ak-popover">
    <a-popover
      trigger="click"
      placement="bottom"
      v-if="showDescription"
      :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
    >
      <template slot="content">
        <div class="ak-popover-div">{{descriptionContent}}</div>
      </template>
      <MyIcon type="iconexplain" :style="{cursor:'pointer',fontSize:'20px',color:'#999999'}"></MyIcon>
    </a-popover>
  </div>
</template>

<script>
import Vue from "vue";
import { Icon } from "ant-design-vue";
import iconFront from "../js/iconfont";
const IconFont = Icon.createFromIconfontCN({
  scriptUrl: iconFront,
});

Vue.component("MyIcon", IconFont);

export default {
  props: {
    showDescription: { type: Boolean, default: true },
    descriptionContent: String,
  },
};
</script>

<style lang="less" scoped>
.ak-popover {
  display: flex;
  align-items: center;
}

.ak-popover-div {
  max-width: 300px;
  min-width: 100px;
  text-align: center;
}

/deep/.ant-popover-inner-content {
  color: #656565;
}
</style>