<template>
  <div class="ak-common-multi-button-div">
    <label class="ak-common-multi-button-title-label">{{labelTitle}}</label>
    <a-button
      type="primary"
      class="ak-common-multi-btn"
      :style="{marginRight: '20px'}"
      :disabled="startDisabled"
      @click="onStart"
    >
      <MyIcon type="iconstart" :style="{fontSize:'14px',paddingRight:'6px'}"></MyIcon>
      {{startBtnName }}
    </a-button>
    <a-button
      type="primary"
      class="ak-common-multi-btn"
      :style="{marginRight: '20px'}"
      :disabled="stopDisabled"
      @click="onStop"
    >
      <MyIcon type="iconstop1" :style="{fontSize:'14px',paddingRight:'6px'}"></MyIcon>
      {{stopBtnName }}
    </a-button>
    <a-button
      type="primary"
      class="ak-common-multi-btn"
      :disabled="exportDisabled"
      @click="onExport"
    >
      <MyIcon type="iconexport" :style="{fontSize:'14px',paddingRight:'6px'}"></MyIcon>
      {{exportBtnName }}
    </a-button>
    <label class="ak-common-multibtn-hint-label" v-if="showHint">{{hintContent}}</label>
    <Popover
      :showDescription="showDescription"
      :descriptionContent="descriptionContent"
      :style="{paddingLeft:'15px'}"
    ></Popover>
  </div>
</template>

<script>
import Popover from "@/components/Popover.vue";
import CommonModal from "@/components/CommonModal.vue";
export default {
  components: {
    Popover,
    CommonModal,
  },
  props: {
    showDescription: { type: Boolean, default: true },
    startDisabled: { type: Boolean, default: false },
    stopDisabled: { type: Boolean, default: false },
    exportDisabled: { type: Boolean, default: false },
    descriptionContent: String,
    labelTitle: String,
    startBtnName: { type: String, default: "Start" },
    stopBtnName: { type: String, default: "Stop" },
    exportBtnName: { type: String, default: "Export" },
    onStart: {
      type: Function,
      default: function () {
        console.log("onStart");
      },
    },
    onStop: {
      type: Function,
      default: function () {
        console.log("onStop");
      },
    },
    onExport: {
      type: Function,
      default: function () {
        console.log("onExport");
      },
    },
    hintContent: String,
    showHint: { type: Boolean, default: false },
  },
};
</script>

<style lang="less" scoped>
.ak-common-multi-button-div {
  padding-left: 400px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
  position: relative;
}

.ak-common-multi-button-title-label {
  width: 290px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
  color: #343434;
}

.ak-common-multi-btn {
  text-overflow: clip;
  overflow: hidden;
  width: 120px;
}

.ak-common-multibtn-hint-label {
  color: #9a9a9a;
  margin-left: 10px;
  padding-top: 4px;
}
</style>