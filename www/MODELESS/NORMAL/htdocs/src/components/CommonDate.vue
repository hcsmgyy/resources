<template>
  <div class="ak-common-input-div">
    <label class="ak-common-input-title-label">{{labelTitle}}</label>
    <a-date-picker 
      :style="{width:'380px',textAlign:'center',fontSize:'16px'}"
      :disabled="disabled"
      :format="dateFormat"
      :value="value"
      @change="onChange"
      :allowClear="false"
    />
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
    hintContent:String,
    showHint: { type: Boolean, default: false },
    showDescription: { type: Boolean, default: true },
    descriptionContent: String,
    labelTitle: String,
    maxLength: { type: Number, default: 63 },
    value: { type: Object, default: "" },
    disabled: { type: Boolean, default: false},
    dateFormat: String,
  },
  data() {
    return {
      dateValue : new Date(),
    };
  },
  methods: {
    onChange(value) {
      this.dateValue = value.toDate();
      this.$emit("change",this.dateValue);
    },
  },
};
</script>

<style lang="less" scoped>
.ak-common-input-div {
  padding-left: 400px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
  position: relative;
}

/deep/.ant-calendar-picker-icon{
  color: #40a9ff;
}
/deep/.ant-input-disabled + .ant-calendar-picker-icon{
  color: rgba(0, 0, 0, 0.25) ;
}

.ak-common-input-title-label {
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

/deep/.ant-calendar-picker-input {
    text-align: center;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.65);
}

</style>

<style lang="less" >
.ant-calendar {
    width: 380px !important;
}
</style>