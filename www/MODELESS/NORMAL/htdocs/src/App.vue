<template>
  <div id="app">
    <div v-if="showLeft">
      <div v-if="getDataSuccess">
      <a-layout style="min-height: 100vh">
        <a-layout-sider :style="{width:'325px',flex:'0 0 325px',maxWidth:'325px',minWidth:'325px'}">
          <Left :model="model"></Left>
        </a-layout-sider>
        <a-layout class="ak-content-layout-div">
          <a-layout-header :style="{height:'75px',paddingRight:'30px'}">
            <Top :webLang="webLang"></Top>
          </a-layout-header>
          <a-layout-content :style="{paddingTop:'30px'}">
            <router-view />
          </a-layout-content>
        </a-layout>
      </a-layout>
      <a-back-top :target="backTopTarget"/>
      </div>
    </div>
    <div v-else>
      <router-view />
    </div>
  </div>
</template>


<script>
var vm;
// @ is an alias to /src
import Top from "@/components/Top.vue";
import Left from "@/components/Left.vue";
import { langMap, setDataChanged } from "@/js/common.js";

export default {
  name: "App",
  components: {
    Top,
    Left,
  },
  data() {
    return {
      model: "C317",
      showLeft: true,
      webLang: 0,
      getDataSuccess: false,
    };
  },
  created() {
    setDataChanged(false);
    this.$axios.get("api/status/get").then((response) => {
      this.model = response.data.data.ProductName;
      this.webLang = Number(response.data.data.WebLang);
      localStorage.setItem("webLang", this.webLang);
      this.$i18n.locale = langMap.get(this.webLang);
      this.getDataSuccess = true;
    });
  },
  watch: {
    $route(to, from) {
      //监听路由是否变化
      if (to.name == "Homepage" || to.name == "Login") {
        this.showLeft = false;
      } else {
        this.showLeft = true;
      }
    },
  },
  mounted() {
    if (this.$route.name == "Homepage" || this.$route.name == "Login") {
      this.showLeft = false;
    } else {
      this.showLeft = true;
    }

    window.onbeforeunload = function (e) {
      setDataChanged(false);
    };
  },
  methods:{
    backTopTarget:function(){
      return document.querySelector(".ak-content-layout-div");
    },
  }
};
</script>

<style lang="less">
.ak-content {
  background: #ffffff;
  width: 1511px;
  padding-bottom: 30px;
  border-radius: 10px;
  margin-bottom: 20px;
}
.ant-layout.ant-layout-has-sider > .ant-layout {
  overflow-x: unset !important;
}

body {
  font-family: Arial !important;
}
.ak-content-layout-div {
  overflow-y: scroll;
  overflow-y: overlay;
  height: 100vh;
}


</style>

<style lang="less" scoped>
/deep/.ant-layout-header{
  padding: 0px;
}
</style>