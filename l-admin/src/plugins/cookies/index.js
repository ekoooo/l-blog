import axios from 'axios';
import Cookies from 'js-cookie';

export default {
  install(Vue, option = {}) {
    // 1.通过 Vue.cookies 调用
    Vue.cookies = Cookies;
    // 2.通过 this.$cookies 调用
    Vue.prototype.$cookies = Cookies;
  }
}