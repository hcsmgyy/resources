<template>
  <div class="ak-common-checkbox-div">
    <label class="ak-common-checkbox-title-label">{{labelTitle}}</label>
    <a-checkbox
      :checked="checked"
      @change="onChange"
      :style="{width:'380px',textAlign:'center',fontSize:'16px',paddingLeft:'11px'}"
      :disabled="disabled"
    >{{checkboxName}}</a-checkbox>
    <Popover :descriptionContent="descriptionContent" :style="{paddingLeft:'15px'}"></Popover>
  </div>
</template>

<script>
import Popover from "@/components/Popover.vue";
export default {
  components: {
    Popover,
  },
  props: {
    showHint: { type: Boolean, default: true },
    descriptionContent: String,
    labelTitle: String,
    checkboxName: String,
    value: { type: [String, Number, Boolean], default: false },
    disabled: { type: Boolean, default: false },
  },
  data() {
    return {
      transValue: this.value,
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
.ak-common-checkbox-div {
  padding-left: 400px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
  position: relative;
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