<template>
  <div :style="wholeStyle">
    <label class="ak-common-input-title-label">{{labelTitle}}</label>
    <template v-for="item in itemData">
      <div :key="item.key">
        <a-tooltip
          :trigger="item.isWarn ? 'hover' : 'none'"
          :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
        >
          <span slot="title" :style="{display:'flex'}">
            <MyIcon type="iconerror" class="ak-tooltips-icon"></MyIcon>
            <span class="ak-tooltips-label">{{item.warnLabel}}</span>
          </span>
          <a-input
            :style="item.isWarn? warnInputStyle : commonInputStyle"
            :maxLength="maxLength"
            :disabled="disabled"
            :type="inputType"
            @change="onChange($event, item.key)"
            :value="item.label"
          />
        </a-tooltip>
      </div>
    </template>

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
import { getIndexByKey } from "@/js/common.js";
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
    value: { type: [String, Number], default: "" },
    inputType: String,
    disabled: { type: Boolean, default: false },
    warnLabel: String,
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
    itemData: Array,
  },
  data() {
    return {
      commonInputStyle: {
        fontSize: "16px",
        textAlign: "center",
        width: "100px",
        marginRight: "10px",
      },
      warnInputStyle: {
        fontSize: "16px",
        textAlign: "center",
        width: "100px",
        marginRight: "10px",
        border: "1px solid rgba(255,86,96,1)",
        color: "#FF5660",
      },
    };
  },
  methods: {
    onChange: function (e, key) {
      //隐藏tips，待优化，这个写法不好
      let tipsArr = document.getElementsByClassName("ant-tooltip");
      for (let i = 0; i < tipsArr.length; i++) {
        tipsArr[i].style.display = "none";
      }

      let keyIndex = getIndexByKey(this.itemData, key);
      this.itemData[keyIndex].label = e.target.value;
      this.itemData[keyIndex].isWarn = false;
      this.$emit("change", this.itemData);
    },
  },
  data() {
    return {
      commonInputStyle: {
        fontSize: "16px",
        textAlign: "center",
        width: "100px",
        marginRight: "10px",
      },
      warnInputStyle: {
        fontSize: "16px",
        textAlign: "center",
        width: "100px",
        marginRight: "10px",
        border: "1px solid rgba(255,86,96,1)",
        color: "#FF5660",
      },
    };
  },
};
</script>

<style lang="less" scoped>
.ak-common-input-div {
  padding-left: 434px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
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

.ak-tooltips-icon {
  font-size: 16px;
  color: #f75f61;
  align-items: center;
  justify-content: center;
  display: flex;
}

.ak-tooltips-label {
  max-width: 340px;
  text-indent: 5px;
  margin-left: 10px;
}

/deep/.ant-tooltip-arrow {
  display: none;
}

/deep/.ant-tooltip {
  max-width: 380px;
}
/deep/.ant-tooltip-inner {
  background: rgba(251, 239, 239, 1);
  color: #656565;
  font-size: 14px;
  border: 1px solid rgba(242, 146, 147, 1);
  border-radius: 3px;
}

/deep/.ant-tooltip-placement-top {
  padding-bottom: 3px;
}
</style>