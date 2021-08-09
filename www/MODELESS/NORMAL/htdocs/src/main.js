import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import './plugins/ant-design-vue.js'

Vue.config.productionTip = false

window.vm = new Vue({
  i18n,
  router,
  render: h => h(App),
  data: function(){
    return {
      processingVisible: false,
      hiddenArr: divHidden,
    }
  },
}).$mount('#app')
