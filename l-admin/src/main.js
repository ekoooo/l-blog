import 'normalize.css';
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/scss/font-awesome.scss';

import Vue from 'vue';
import ElementUI from 'element-ui';
import App from './App';
import router from './router';
import store from './store/';
import NProgress from 'vue-nprogress';
import axios from './plugins/axios/';
import log from './plugins/log/';
import cookies from './plugins/cookies/';
import MSG from './utils/message';

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(NProgress, {
    latencyThreshold: 100,
    router: true,
    http: false
});
Vue.use(axios);
Vue.use(log);
Vue.use(cookies);

const nprogress = new NProgress({parent: '.nprogress-container'});

// 调整到 new Vue 前面，防止在特殊情形下没来得及执行这个方法已近出现登录失效的情况
Vue.http.interceptors.request.use(function(config) {
    Vue.log('[HttpRequest][url, method, data, params]', config.url, config.method, config.data, config.params);

    return config;
}, function(error) {
    MSG.error(error.message);
    return Promise.reject(error);
});

Vue.http.interceptors.response.use(function(response) {
    Vue.log('[HttpResponse][status, data]', response.status, response.data);

    // validate login

    return response;
}, function(error) {
    MSG.error(error.message);
    return Promise.reject(error);
});

new Vue({
    el: '#app',
    router,
    store,
    nprogress,
    ...App,
});
