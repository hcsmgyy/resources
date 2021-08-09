<template>
  <div class="ak-common-radiogroup-div">
    <label class="ak-common-radiogroup-title-label">{{labelTitle}}</label>
    <a-radio-group class="ak-common-radiogroup" v-model="transValue" @change="onChange">
      <template v-for="item in itemData">
        <a-radio :value="item.key" :style="{paddingLeft:'15px',paddingRight:'15px'}">{{item.label}}</a-radio>
      </template>
    </a-radio-group>
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
    itemData: Array,
    value: { type: String, default: 0 },
    labelTitle: String,
    showDescription: {type: Boolean, default: true},
    descriptionContent: String,
  },
  data() {
    return {
      transValue: this.value,
    };
  },
  methods: {
    onChange: function (e) {
      this.transValue = e.target.value;
      this.$emit("change", e.target.value);
    },
  },
  watch: {
    value(newVal, oldVal) {
      this.transValue = newVal;
    },
  },
};
</script>

<style lang="less" scoped>
.ak-common-radiogroup-div {
  padding-left: 400px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
  position: relative;
}

.ak-common-radiogroup-title-label {
  width: 290px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
  color: #343434;
}

.ak-common-radiogroup {
  width: 380px;
  text-align: center;
  
}

/deep/.ant-radio-wrapper {
  font-size: 16px;
}
</style>