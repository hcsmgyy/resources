<template>
  <div :style="wholeStyle">
    <label class="ak-common-label-title-label" :style="titleStyle">{{labelTitle}}</label>
    <label :style="{width:valueWidth,textAlign:textAlign,paddingTop:'4px'}">{{value}}</label>
    <label class="ak-common-input-hint-label" v-if="showHint">{{hintContent}}</label>
    <Popover
      :showDescription="showDescription"
      :descriptionContent="descriptionContent"
      :style="{paddingLeft:'15px'}"
    ></Popover>
  </div>
</template>

<script>
import Popover from "@/components/Popover.vue";
export default {
  components: {
    Popover,
  },
  props: {
    hintContent: String,
    showHint: { type: Boolean, default: false },
    showDescription: { type: Boolean, default: false },
    descriptionContent: String,
    labelTitle: String,
    value: String,
    titleBold: { type: Boolean, default: false },
    wholeStyle: {
      type: Object,
      default: function () {
        return {
          paddingLeft: "400px",
          fontSize: "16px",
          marginTop: "22px",
          display: "flex",
          position: "relative",
        };
      },
    },
    textAlign: { type: String, default: "center" },
  },
  computed: {
    titleStyle: function () {
      if (this.titleBold) {
        return { fontWeight: "bold" };
      }
      return {};
    },
    valueWidth: function () {
      if (this.textAlign == "center") {
        return "380px";
      } else if (this.textAlign == "left") {
        return "120px";
      } else {
        return "280px";
      }
    },
  },
};
</script>

<style>
.ak-common-label-div {
  padding-left: 434px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
}

.ak-common-label-title-label {
  width: 290px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
  color: #343434;
}

.ak-common-input-hint-label {
  color: #9a9a9a;
  margin-left: 10px;
  padding-top: 4px;
}
</style>