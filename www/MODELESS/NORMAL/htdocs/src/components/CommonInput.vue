<template>
  <div :style="wholeStyle" v-show="isShow">
    <label class="ak-common-input-title-label">{{labelTitle}}</label>
    <a-tooltip
      :trigger="isWarn ? 'hover' : 'none'"
      :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
    >
      <span slot="title" :style="{display:'flex'}">
        <MyIcon type="iconerror" class="ak-tooltips-icon"></MyIcon>
        <span class="ak-tooltips-label">{{warnLabel}}</span>
      </span>
      <a-input
        :style="isWarn? warnInputStyle : commonInputStyle"
        :maxLength="maxLength"
        :disabled="disabled"
        :type="inputType"
        @change="onChange"
        :value="inputValue"
        :addon-before="addOnBefore"
        :placeholder="placeholder"
      />
    </a-tooltip>
    <div :style="{display:'inline-block',marginLeft:'16px'}" v-if="showBtn">
      <a-button type="primary" class="ak-common-input-btn" @click="onClickSearch">
        <MyIcon type="iconsearch" :style="{fontSize:'14px'}"></MyIcon>
        {{$t("Search")}}
      </a-button>
      <a-button type="primary" class="ak-common-input-btn" @click="onClickReset">
        <MyIcon type="iconreset" :style="{fontSize:'14px'}"></MyIcon>
        {{$t("Reset")}}
      </a-button>
    </div>

    <div :style="{display:'inline-block',marginLeft:'16px'}" v-if="showBtn2">
      <a-button type="primary" class="ak-common-input-btn" @click="onClickPing"
        :loading="pingLoading">
        {{$t("PingLabel")}}
      </a-button>
    </div>

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
    showDescription: { type: Boolean, default: true },
    descriptionContent: String,
    labelTitle: String,
    maxLength: { type: Number, default: 63 },
    value: { type: [String, Number], default: "" },
    inputType: { type: String, defalue: "" },
    disabled: { type: Boolean, default: false },
    isWarn: { type: Boolean, default: false },
    isShow: { type: Boolean, default: true },
    pingLoading: { type: Boolean, default: false },
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
    addOnBefore: { type: String, default: "" },
    showBtn: { type: Boolean, default: false },
    showBtn2: { type: Boolean, default: false },
    onClick: Function,
    onSearch: Function,
    onReset: Function,
    showEmptyPwd: { type: Boolean, default: true },
    placeholder: String,
  },
  methods: {
    onChange: function (e) {
      //隐藏tips，待优化，这个写法不好
      let tipsArr = document.getElementsByClassName("ant-tooltip");
      for (let i = 0; i < tipsArr.length; i++) {
        tipsArr[i].style.display = "none";
      }
      this.$emit("change", e.target.value);
    },
    onClickSearch: function () {
      this.onSearch(this.inputValue);
    },
    onClickReset: function () {
      this.onReset();
    },
    onClickPing: function () {
      this.onClick();
    }
  },
  computed: {
    inputValue: function () {
      if (
        this.inputType == "password" &&
        this.value == "" &&
        this.firstTime &&
        this.showEmptyPwd
      ) {
        this.firstTime = false;
        return "******";
      }
      this.firstTime = false;
      return this.value;
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
      firstTime: true,
      commonInputStyle: {
        fontSize: "16px",
        textAlign: "center",
        width: "380px",
      },
      warnInputStyle: {
        fontSize: "16px",
        textAlign: "center",
        width: "380px",
        border: "1px solid rgba(255,86,96,1)",
        color: "#FF5660",
        borderRadius: "4px",
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
  font-size: 14px;
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

/deep/.ant-input-group-addon + input {
  text-indent: -61px;
}
/deep/.ant-input {
  color: #000000a6;
}

.ak-common-input-btn {
  width: 110px;
  margin-left: 20px;
  font-size: 16px;
}
</style>