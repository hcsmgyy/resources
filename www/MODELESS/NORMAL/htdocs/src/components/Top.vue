<template>
  <div class="ak-top" :style="{position: 'relative'}">
    <a-select
      size="default"
      :defaultValue="$t('English')"
      :value="webLang"
      style="margin-right:30px;width:120px;border-radius:18px"
      @change="changeLang"
      dropdownClassName="ak-select-item"
      :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
    >
      <a-icon
        slot="suffixIcon"
        type="caret-down"
        theme="filled"
        :style="{color:'#343434',fontSize:'20px'}"
      />
      <a-select-option v-for="item in langArray" :key="item.key">{{ item.label }}</a-select-option>
    </a-select>
    <div @click="onLogOut" class="ak-logout-div">
      <my-icon type="iconlogout" :style="{ fontSize: '20px'}"></my-icon>
      <label class="ak-logout-label">{{$t("LogOut")}}</label>
    </div>
  </div>
</template>

<script>
import { langMap, getLangArray } from "@/js/common.js";
import { delCookie } from "@/js/cookieProcess.js";
export default {
  props: {
    webLang: { type: Number, default: 0 },
  },
  name: "Top",
  data() {
    return {
      langArray: getLangArray(this),
      apiData: {},
    };
  },
  methods: {
    changeLang(value, option) {
      if (langMap.has(value)) {
        let data = {
          webLang: value,
        };
        let requestData = {
          target: "status",
          action: "set",
          data: data,
        };
        this.$axios.post("api", requestData).then((response) => {
          this.$router.go(0);
        });
      }
    },
    onLogOut() {
      let requestData = {
        target: "login",
        action: "logout",
      };
      this.$axios.post("api", requestData).then((response) => {
        delCookie("token");
        this.$router.push("/");
      });
    },
  },
};
</script>


<style lang="less" scoped>
.ak-top {
  min-width: 1591px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: #ffffff;
  padding-right: 40px;
}

/deep/.ant-select-selection {
  border-radius: 22px;
}
/deep/.ant-select-selection__rendered {
  margin-left: 20px;
}
/deep/.ant-select-arrow {
  top: 40%;
}

.ak-logout-label {
  cursor: pointer;
  font-size: 14px;
  color: #333333;
  margin-left: 15px;
}

.ak-logout-div {
  cursor: pointer;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: relative;
}
</style>
