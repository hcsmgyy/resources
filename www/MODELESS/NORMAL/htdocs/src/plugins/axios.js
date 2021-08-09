"use strict";

import Vue from 'vue';
import axios from "axios";
import { _ } from 'core-js';

import { getCookie } from "@/js/cookieProcess.js";
import { setExitBySessionTimeOut } from "@/js/common.js";

let config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || ""
  timeout: 3600 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
  function (config) {
    changeTypeToString(config);
    setToken(config);
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    if (response.data.retcode == -100) {
      //未登录，重定向回登陆页面
      window.location.href = '/#/';
      setExitBySessionTimeOut(true);
      return;
    } else if (response.data.retcode == -101) {
      //设备处于通话中
      window.vm.$notification["error"]({
        message: window.vm.$t("PhoneTalkingWarning"),
        duration: 3,
      });
      return;
    } else if (response.data.retcode == -102) {
      //设备处于升级或autop中
      window.vm.$root.processingVisible = true;
      return;
    }
    return response;
  },
  function (error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

Plugin.install = function (Vue, options) {
  Vue.axios = _axios;
  window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    },
  });
};

Vue.use(Plugin)

export default Plugin;


//将data对象数据全部转换为string类型
function changeTypeToString(config) {
  if (config.method != "post") {
    return;
  }
  if (config.data.hasOwnProperty('configData')) {
    for (var val in config.data.configData) {
      if (typeof config.data.configData[val] === "number") {
        config.data.configData[val] = config.data.configData[val].toString();
      }
    }
  }
  if (config.data.hasOwnProperty('data')) {
    for (var val in config.data.data) {
      if (typeof config.data.data[val] === "number") {
        config.data.data[val] = config.data.data[val].toString();
      } else if (typeof config.data.data[val] === "object") {
        setObjectToString(config.data.data[val]);
      }
    }
  }
}

function setObjectToString(object) {
  for (var val in object) {
    if (typeof object[val] === "number") {
      object[val] = object[val].toString();
    } else if (typeof object[val] === "object") {
      setObjectToString(object[val]);
    }
  }
}

//为所有请求带上token数据
function setToken(config) {
  if (config.method == "get" || (config.method == "post" && (config.url.indexOf("/upload") >= 0 || config.url.indexOf("/import") >= 0))) {
    if (config.url.indexOf("?") != -1) {
      config.url += ("&session=" + getCookie("token"));
    } else {
      config.url += ("?session=" + getCookie("token"));
    }
  } else {
    if ("undefined" == typeof (config.data)) {
      config.data = { session: getCookie("token") };
    } else {
      config.data.session = getCookie("token");
    }
  }
}

