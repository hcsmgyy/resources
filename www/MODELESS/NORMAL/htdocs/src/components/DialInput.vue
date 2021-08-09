<template>
  <div class="ak-dial-input" :style="{position: 'relative'}">
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
        v-model="value"
        @change="onChange"
        :placeholder="placeholder"
      />
    </a-tooltip>

    <a-tooltip
      :style="{marginLeft:'30px'}"
      :trigger="isSelectWarn ? 'hover' : 'none'"
      :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
    >
      <span slot="title" :style="{display:'flex'}">
        <MyIcon type="iconerror" class="ak-tooltips-icon"></MyIcon>
        <span class="ak-tooltips-label">{{warnLabel}}</span>
      </span>
      <a-select
        defaultValue="0"
        v-model="selectValue"
        :style="isSelectWarn? warnStyle : commonStyle"
        dropdownClassName="ak-select-item"
        :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
      >
        <a-icon
          slot="suffixIcon"
          type="caret-down"
          theme="filled"
          :style="isSelectWarn? warnIconStyle : commonIconStyle"
        />
        <a-select-option v-for="item in itemData" :key="item.key.toString()">{{ item.label }}</a-select-option>
      </a-select>
    </a-tooltip>

    <a-button type="primary" class="ak-common-input-btn" @click="onDial()" :disabled="dialDisabled">
      <MyIcon type="icondial" :style="{fontSize:'14px'}"></MyIcon>
      {{$t("Dial")}}
    </a-button>
    <a-button
      type="primary"
      class="ak-common-input-btn"
      @click="onHangUp()"
      :disabled="hangupDisabled"
    >
      <MyIcon type="iconhangup" :style="{fontSize:'14px'}"></MyIcon>
      {{$t("HangUpText")}}
    </a-button>

    <Popover
      :showDescription="showDescription"
      :descriptionContent="descriptionContent"
      :style="{paddingLeft:'15px'}"
    ></Popover>
  </div>
</template>

<script>
import Popover from "@/components/Popover.vue";
import {
  checkIpAddr,
  showRequestSuccessWithInfo,
  showErrorInfo,
  onWebHangup,
  onWebDial,
} from "@/js/common.js";
export default {
  components: {
    Popover,
  },
  props: {
    showDescription: { type: Boolean, default: true },
    descriptionContent: String,
    maxLength: { type: Number, default: 63 },
    isSelectWarn: { type: Boolean, default: false },
    itemData: Array,
  },
  data() {
    return {
      firstTime: true,
      commonInputStyle: {
        fontSize: "16px",
        textAlign: "center",
        width: "200px",
      },
      warnInputStyle: {
        fontSize: "16px",
        textAlign: "center",
        width: "200px",
        border: "1px solid rgba(255,86,96,1)",
        color: "#FF5660",
        borderRadius: "4px",
      },
      commonStyle: {
        width: "200px",
      },
      warnStyle: {
        width: "200px",
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
      placeholder: this.$t("DialNumber"),
      isWarn: false,
      warnLabel: this.$t("NumberEmptyWarning"),
      value: "",
      selectValue: "0",
      interObj: Object,
      dialDisabled: false,
      hangupDisabled: true,
    };
  },
  methods: {
    onChange: function (e) {
      //隐藏tips，待优化，这个写法不好
      this.isWarn = false;
      let tipsArr = document.getElementsByClassName("ant-tooltip");
      for (let i = 0; i < tipsArr.length; i++) {
        tipsArr[i].style.display = "none";
      }
    },
    onDial: function () {
      if (this.value == "") {
        this.isWarn = true;
        return;
      }
      if (confirm(this.$t("MakeCallWarn"))) {
        onWebDial(this,this.value,this.selectValue,false);
      }
    },
    onHangUp: function () {
      onWebHangup(this);
    },
  },
  created() {
    this.interObj = setInterval(() => {
      getPhoneStatus(this);
    }, 1000);
  },
  destroyed() {
    clearInterval(this.interObj);
  },
};

function getPhoneStatus(vm) {
  vm.$axios.get("api/status/get").then((response) => {
    let status = response.data.data.PhoneStatus;
    //1-ready,2-talking
    if (status == 2) {
      vm.hangupDisabled = false;
      vm.dialDisabled = true;
    } else {
      vm.hangupDisabled = true;
      vm.dialDisabled = false;
    }
  });
}
</script>


<style lang="less" scoped>
.ak-dial-input {
  padding-left: 434px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
}

/deep/.ant-select-arrow {
  top: 40%;
}

.ak-common-input-btn {
  width: 110px;
  margin-left: 20px;
  font-size: 16px;
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

/deep/.ant-select-selection {
  text-align: center;
}
/deep/.ant-select-selection-selected-value {
  width: 100%;
  font-size: 16px;
  padding-left: 12px;
}

.ak-common-select-hint-label {
  color: #9a9a9a;
  margin-left: 10px;
  padding-top: 4px;
}
</style>