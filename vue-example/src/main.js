import Vue from 'vue'
import App from './App.vue'

// 注意：暂未提供npm包，目前仅支持通过script引入
// const TOPON_H5_SDK = require('@topon/h5-sdk')
import TOPON_H5_SDK from '@topon/h5-sdk'

// SDK挂载至全局
Vue.prototype.$TOPON_H5_SDK = TOPON_H5_SDK

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
