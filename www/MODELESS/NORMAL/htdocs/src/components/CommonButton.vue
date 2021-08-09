<template>
  <div class="ak-common-button-div">
    <label class="ak-common-button-title-label">{{labelTitle}}</label>
    <a-button
      :style="widthStyle ? styleLong : styleShort"
      type="primary"
      :disabled="disabled"
      @click="onClick"
    >
      <MyIcon :type="buttonIcon" :style="{fontSize:'15px',paddingRight:widthStyle?'15px':'6px'}"></MyIcon>
      {{ buttonName }}
    </a-button>
    <Popover
      :descriptionContent="descriptionContent"
      :style="{paddingLeft:'15px'}"
      v-if="isShowPopover"
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
    descriptionContent: String,
    labelTitle: String,
    buttonName: String,
    buttonIcon: String,
    disabled: { type: Boolean, default: false },
    isShowPopover: { type: Boolean, default: true },
    widthStyle: { type: Boolean, default: true },
    onClick: {
      type: Function,
      default: function () {
        console.log("click");
      },
    },
  },
  data() {
    return {
      transValue: this.value,
      styleLong: {
        width: "380px",
      },
      styleShort: {
        width: "120px",
      },
    };
  },
  computed: {
    checked: function () {
      if (typeof this.transValue === "string") {
        return this.transValue == "1";
      } else if (typeof this.transValue === "number") {
        return this.transValue == 1;
      }
      return this.transValue;
    },
  },
  methods: {
    onChange: function (e) {
      this.transValue = e.target.checked;
      this.$emit("change", e.target.checked ? "1" : "0");
    },
  },
  watch: {
    value(newval, oldval) {
      this.transValue = newval;
    },
  },
};
</script>

<style scoped>
.ak-common-button-div {
  padding-left: 400px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
  position: relative;
}

.ak-common-button-title-label {
  width: 290px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
  color: #343434;
}
</style>