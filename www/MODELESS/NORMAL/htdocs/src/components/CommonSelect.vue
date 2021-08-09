<template>
  <div :style="wholeStyle">
    <label class="ak-common-select-title-label">{{labelTitle}}</label>
    <a-tooltip
      :trigger="isWarn ? 'hover' : 'none'"
      :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
    >
      <span slot="title" :style="{display:'flex'}">
        <MyIcon type="iconerror" class="ak-tooltips-icon"></MyIcon>
        <span class="ak-tooltips-label">{{warnLabel}}</span>
      </span>
      <a-select
        :value="typeof value === 'number'?value.toString():value "
        :style="isWarn? warnStyle : commonStyle"
        :disabled="disabled"
        :mode="mode"
        @change="onChange"
        dropdownClassName="ak-select-item"
        :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
      >
        <a-icon
          slot="suffixIcon"
          type="caret-down"
          theme="filled"
          :style="isWarn? warnIconStyle : commonIconStyle"
        />
        <a-select-option v-for="item in itemData" :key="item.key.toString()">{{ item.label }}</a-select-option>
      </a-select>
    </a-tooltip>

    <label class="ak-common-select-hint-label" v-if="showHint">{{hintContent}}</label>
    <a-button
      type="danger"
      class="ak-common-select-danger-btn"
      v-if="showBtn"
      @click="onClickDel"
      :loading="loading"
      :disabled="delDisabled"
    >
      <MyIcon type="icondelete" :style="{fontSize:'16px',paddingRight:'6px'}"></MyIcon>
      {{$t("DeleteLabel")}}
    </a-button>
    <a-button
      type="primary"
      class="ak-common-select-primary-btn"
      v-if="showChangeBtn"
      @click="onClickChange"
      :disabled="delDisabled"
    >
      <MyIcon type="iconpassword1" :style="{fontSize:'16px',paddingRight:'6px'}"></MyIcon>
      {{ChangeLabel}}
    </a-button>
    <div v-if="showCallLogBtn">
      <a-button type="primary" class="ak-common-input-btn" @click="onExport">
        <MyIcon type="iconexport" :style="{fontSize:'14px',paddingRight:'6px'}"></MyIcon>
        {{$t("Export")}}
      </a-button>
      <a-button
        type="primary"
        class="ak-common-input-btn"
        @click="onHangup"
        :disabled="hangupDisabled"
      >
        <MyIcon type="iconhangup" :style="{fontSize:'14px'}"></MyIcon>
        {{$t("HangUpText")}}
      </a-button>
    </div>
    <Popover
      :showDescription="showDescription"
      :descriptionContent="descriptionContent"
      :style="{paddingLeft:'15px'}"
    ></Popover>
  </div>
</template>

<script>
import Vue from "vue";
import { Icon } from "ant-design-vue";
import Popover from "@/components/Popover.vue";
import iconFront from "../js/iconfont";

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: iconFront,
});

Vue.component("MyIcon", IconFont);

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
    mode: String,
    itemData: Array,
    value: { type: [String, Number, Array], default: "" },
    isWarn: { type: Boolean, default: false },
    warnLabel: String,
    disabled: { type: Boolean, default: false },
    showBtn: { type: Boolean, default: false },
    onDel: Function,
    loading: { type: Boolean, default: false },
    delDisabled: { type: Boolean, default: false },
    showCallLogBtn: { type: Boolean, default: false },
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
    onHangup: Function,
    onExport: Function,
    showChangeBtn: { type: Boolean, default: false },
    ChangeLabel: String,
    onClickChange: {
      type: Function,
      default: function () {
        console.log("onClick");
      },
    },
  },
  methods: {
    onChange(value) {
      //隐藏tips，待优化，这个写法不好
      let tipsArr = document.getElementsByClassName("ant-tooltip");
      for (let i = 0; i < tipsArr.length; i++) {
        tipsArr[i].style.display = "none";
      }
      //传输数据
      this.$emit("change", value);
    },
    onClickDel() {
      this.onDel(this.value);
    },
  },
  watch: {
    isWarn(newVal, oldVal) {
      if (newVal) {
        document.getElementById(this.$el.id).scrollIntoView();
      }
    },
  },
  data() {
    return {
      commonStyle: {
        width: "380px",
      },
      warnStyle: {
        width: "380px",
        border: "1px solid #F29293",
        borderRadius: "4px",
        color: "#F29293",
      },
      warnIconStyle: {
        color: "#F29293",
        fontSize: "20px",
      },
      commonIconStyle: {
        color: "#666666",
        fontSize: "20px",
      },
      hangupDisabled: true,
    };
  },
  created() {
    if (this.showCallLogBtn) {
      this.interObj = setInterval(() => {
        getPhoneStatus(this);
      }, 1000);
    }
  },
  destroyed() {
    clearInterval(this.interObj);
  },
};

function getPhoneStatus(vm) {
  vm.$axios.get("api/status/get").then((response) => {
    let status = response.data.data.PhoneStatus;
    //1-ready,2-talking
    vm.hangupDisabled = status != 2;
  });
}
</script>
 
<style lang="less" scoped>
.ak-common-select-div {
  padding-left: 434px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
}
/deep/.ant-select-open,
/deep/.ant-select-focused {
  color: #40a9ff;
}

.ak-common-select-title-label {
  width: 290px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
  color: #343434;
}

.ak-common-select-hint-label {
  color: #9a9a9a;
  margin-left: 10px;
  padding-top: 4px;
  font-size: 14px;
}

/deep/.ant-select-arrow {
  top: 40%;
}

/deep/.ant-select-selection {
  text-align: center;
}
/deep/.ant-select-selection-selected-value {
  float: none;
  font-size: 16px;
  padding-left: 12px;
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

.ak-common-select-danger-btn {
  width: 120px;
  background: rgba(255, 243, 243, 1);
  border: 1px solid rgba(255, 99, 101, 1);
  border-radius: 5px;
  color: #f55b5f;
  font-size: 16px;
  margin-left: 30px;
}

.ak-common-select-primary-btn {
  width: 200px;
  border-radius: 5px;
  color: white;
  font-size: 16px;
  margin-left: 30px;
}

.ak-common-input-btn {
  width: 110px;
  margin-left: 20px;
  font-size: 16px;
}
</style>

<style lang="less" >
.ak-select-item {
  float: none;
  text-align: center;
}
.ant-select-dropdown-menu {
  overflow-y: overlay !important;
}
</style>
