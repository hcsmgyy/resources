<template>
  <div class="ak-login-div">
    <div class="ak-login-logo">
      <img src="../Image/logo.png" 
      :style="hiddenArr.isShowLogoLabel != 1 ? {visibility:'hidden'} : {visibility:'visible'}"/>
    </div>
    <div class="ak-login-modal">
      <div class="ak-login-modal-img"></div>
      <div class="ak-login-modal-div">
        <a-input size="large" :placeholder="userNamePlaceHolder" v-model="userName" ref="userName">
          <div class="ak-homepage-input-prefix" slot="prefix">
            <MyIcon type="iconadmin" class="ak-homepage-input-prefix-icon"></MyIcon>
          </div>
        </a-input>
        <a-input
          size="large"
          :placeholder="passwordPlaceHolder"
          :style="{marginTop:'40px'}"
          v-model="password"
          type="password"
          @change="onPwdChange"
          @keyup.delete="onPwdDel"
        >
          <div class="ak-homepage-input-prefix" slot="prefix">
            <MyIcon type="iconpassword" class="ak-homepage-input-prefix-icon"></MyIcon>
          </div>
        </a-input>
        <a-checkbox
          class="ak-homepage-checkbox"
          v-model="remember"
          @change="onRemChange"
        >{{$t("SaveUserNamePwd")}}</a-checkbox>
        <button class="ak-homepage-btn" @click="onLogin">{{$t("LoginLabel")}}</button>
      </div>
    </div>
  </div>
</template>


<script>
import Vue from "vue";
import iconFront from "../js/iconfont";
import { Icon } from "ant-design-vue";
import { getCookie, delCookie, setCookie, } from "@/js/cookieProcess.js";
import { showErrorInfo,setExitBySessionTimeOut,isExitBySessionTimeOut } from "@/js/common.js";

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: iconFront,
});
Vue.component("MyIcon", IconFont);

export default {
  data() {
    return {
      userNamePlaceHolder: this.$t("UserName"),
      passwordPlaceHolder: this.$t("WebRelayPwd"),
      userName: "",
      password: "",
      remember: false,
      pwdChange: false,
      hiddenArr: divHidden,
    };
  },
  mounted() {
    this.$refs.userName.focus();
  },
  created() {
    //cookie
    let onRemCookieSt = getCookie("onRemCookie");
    if (onRemCookieSt == "true") {
      this.remember = true;
      this.userName = getCookie("UserName");
      this.password = "********";
      if (getCookie("token") != "") {
        //自动登陆
        let requestData = {
          target: "login",
          action: "login",
        };
        this.$axios.post("api", requestData).then((response) => {
          let retcode = response.data.retcode;
          if (retcode == 0) {
            setCookie("token", response.data.data.token, "s360000");
            this.$router.push("/Homepage");
          }
        });
      }
    } else {
      this.remember = false;
      this.userName = "";
      this.password = "";
    }
    let vm = this;

    document.onkeydown = function (e) {
      if (e.code == "Enter" && vm.$router.history.current.name == "Login") {
        onLogin(vm);
      }
    };
  },
  methods: {
    onRemChange: function (e) {
      let checked = e.target.checked;
      if (checked) {
        let data = {
          password: this.password,
        };
        let requestData = {
          target: "login",
          action: "set",
          data: data,
        };
        this.$axios.post("api", requestData).then((response) => {
          setCookie("UserName", StripTailSpace(this.userName), "s360000");
          setCookie("Password", response.data.data.encrypt, "s360000");
        });
      } else {
        delCookie("UserName");
        delCookie("Password");
        this.password = "";
      }
      setCookie("onRemCookie", this.remember, "s360000");
    },
    onPwdChange: function (e) {
      if (!this.pwdChange) {
        if (e.target.value == "") {
          this.password = "";
        } else if (e.target.value.indexOf("********") >= 0) {
          this.password = e.target.value.replace("********","");
        } else {
          this.password = e.target.value;
        }
        this.pwdChange = true;
      }
    },
    onPwdDel: function () {
      this.password = "";
    },
    onLogin: function () {
      onLogin(this);
    },
  },
};

function StripTailSpace(desStr) {
  return desStr.replace(/\s+$/g, "");
}

function onLogin(vm) {
  let userName = "";
  let pwd = "";

  if (!vm.remember) {
    userName = vm.userName;
    pwd = vm.password;
    let requestData = {
      target: "login",
      action: "set",
      data: { password: vm.password },
    };
    vm.$axios.post("api", requestData).then((response) => {
      pwd = response.data.data.encrypt;
      doLogin(vm, userName, pwd);
    });
  } else {
    userName = vm.userName;
    if (vm.pwdChange) {
      let requestData = {
        target: "login",
        action: "set",
        data: { password: vm.password },
      };
      vm.$axios.post("api", requestData).then((response) => {
        pwd = response.data.data.encrypt;
        doLogin(vm, userName, pwd);
      });
    } else {
      pwd = getCookie("Password");
      doLogin(vm, userName, pwd);
    }
  }
}

function doLogin(vm, userName, pwd) {
  let requestData = {
    target: "login",
    action: "login",
    data: { userName: userName, password: pwd },
  };
  vm.$axios.post("api", requestData).then((response) => {
    let retcode = response.data.retcode;
    if (retcode == 0) {
      setCookie("token", response.data.data.token, "s360000");
      localStorage.setItem("userType",response.data.data.userType);
      if(isExitBySessionTimeOut() && response.data.data.isFirstLogin != 3){
        vm.$router.go(-1)
        setExitBySessionTimeOut(false);
      }else{
        vm.$router.push("/Homepage");
      }
    } else if (retcode == -3) {
      showErrorInfo(vm, vm.$t("LoginLimitedWarning"));
    } else {
      showErrorInfo(vm, vm.$t("LoginFailedWarning"));
    }
  });

  setCookie("UserName", StripTailSpace(userName), "s360000");
  setCookie("Password", pwd, "s360000");
}
</script>


<style lang="less" scoped>
.ak-login-div {
  margin: 0 auto;
  min-height: 100vh;
  min-width: 100vw;
  background: url(../Image/loginBg.png) 0 0 no-repeat;
  background-position: center top;
  padding-top: 110px;
  background-size: 100%;
}
.ak-login-logo {
  display: flex;
  justify-content: center;
}
.ak-login-modal {
  width: 900px;
  height: 406px;
  background: #ffffff;
  margin: 0 auto;
  margin-top: 50px;
  border-radius: 10px;
  display: flex;
}
.ak-login-modal-img {
  height: 100%;
  width: 497px;
  background: url(../Image/loginImg.png) 0 0 no-repeat;
  border-right-style: solid;
  border-right-width: 2px;
  border-right-color: #9a9a9a;
}
.ak-login-modal-div {
  padding-top: 76px;
  padding-left: 50px;
  padding-right: 50px;
  height: 100%;
  width: 100%;
  width: 403px;
}

.ak-homepage-input-prefix {
  padding-right: 10px;
  border-right-style: solid;
  border-right-width: 2px;
  border-right-color: #999999;
}
.ak-homepage-input-prefix-icon {
  font-size: 25px;
  color: #666666;
}

/deep/.ant-input {
  padding-left: 60px !important;
}

.ak-homepage-checkbox {
  margin-top: 20px;
  color: #999999;
  display: block;
}
.ak-homepage-btn {
  width: 300px;
  margin-top: 60px;
  background: linear-gradient(90deg, #086cca 0%, #5fffff 100%);
  height: 44px;
  font-size: 20px;
  color: #ffffff;
  cursor: pointer;
  border-radius: 5px;
  border: none;
}

.ak-homepage-btn:active {
  background: linear-gradient(90deg, #075cac 0%, #51d9d9 100%);
  outline: 0;
}

.ak-homepage-btn:focus {
  outline: 0;
}
</style>