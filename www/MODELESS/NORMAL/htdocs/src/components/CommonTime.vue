<template>
  <div class="ak-common-input-div">
    <label class="ak-common-input-title-label">{{labelTitle}}</label>
    <a-time-picker
      :style="{width:'380px',textAlign:'center',fontSize:'16px'}"
      :popupStyle="{textAlign:'center',fontSize:'16px',margin:'0 auto'}"
      :format="timeFormat"
      :use12Hours="use12Hours"
      :disabled="disabled"
      :value="value"
      :allowClear="false"
      :placeholder="placeholder"
      @change="onChange"
      :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
      @openChange="openChange"
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
import moment from "moment";
export default {
  components: {
    Popover,
  },
  props: {
    hintContent: String,
    showHint: { type: Boolean, default: false },
    showDescription: { type: Boolean, default: true },
    descriptionContent: String,
    labelTitle: String,
    maxLength: { type: Number, default: 63 },
    value: { type: moment, default: "" },
    disabled: { type: Boolean, default: false },
    timeFormat: { type: String, default: "" },
    use12Hours: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
  },
  methods: {
    onChange: function (value) {
      let date = value;
      this.$emit("change", date);
    },
    openChange: function () {
      //自动铺满弹出框，暂时先用这种写法
      let interval = setInterval(function () {
        let itemArr = document.getElementsByClassName(
          "ant-time-picker-panel-combobox"
        );
        if (itemArr.length != 0) {
          for (let i = 0; i < itemArr.length; i++) {
            for (let j = 0; j < itemArr[i].childNodes.length; j++) {
              itemArr[i].childNodes[j].style.width =
                (1 / itemArr[0].childNodes.length) * 100 + "%";
            }
          }
          clearInterval(interval);
        }
      }, 100);
    },
  },
};
</script>

<style lang="less" scoped>
/deep/.ant-time-picker-clock-icon {
  color: #40a9ff !important;
}

/deep/.ant-time-picker-input[disabled]
  + .ant-time-picker-icon
  > .ant-time-picker-clock-icon {
  color: rgba(0, 0, 0, 0.25) !important;
}

.ak-common-input-div {
  padding-left: 400px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
  position: relative;
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
  font-size: 14px;
}

/deep/.ant-time-picker-input {
  text-align: center;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
}

/deep/.ant-time-picker-panel {
  width: 382px;
}

/deep/.ant-time-picker-panel-input {
  max-width: 380px;
  text-align: center;
}
/deep/.ant-time-picker-panel-input-wrap {
  padding-left: 0px;
  max-width: 380px !important;
}

/deep/.ant-time-picker-panel-select {
  width: 33.3%;
}
/deep/.ant-time-picker-panel-select > ul {
  width: 100%;
}
/deep/.ant-time-picker-panel-select > ul > li {
  text-align: center;
  padding-left: 0px;
}

/deep/.ant-time-picker-panel-select ul{
  padding: 0 0 0;
}
</style>
