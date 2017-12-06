import Vue from 'vue';
import MSG from '../utils/message';
import requester from '../utils/requester';
import store from '../store/';
import router from '../router/';
import { SET_USER_INFO } from '../store/types';

const TOKEN_KEY = 't';
const USERINFO_KEY = 'u';
const LOGIN_EXPIRES = 1;

const Oauth = {
    /**
     * 管理员登录
     * @param formInfo => { username: 'str', password: 'str' }
     */
    loginAdmin(formInfo) {
        return requester.post('/admin/login', formInfo).then(data => {
            if(data.code === 200) {
                // 保存登录信息
                Oauth.saveLoginData(data);
            }
            return data;
        });
    },
    
    /**
     * 退出登陆
     */
    logout() {
        MSG.warningConfirm('是否退出登陆？').then(() => {
            requester.post('/admin/logout');
            // 返回到登陆界面
            router.replace({ name: 'login' });
        });
    },
    
    /**
     * 根据返回登录信息返回需要保存的信息结构
     * @param info
     * @param isClear 是否清空
     */
    getSaveInfo(info, isClear = false) {
        let saveInfo = {
            userId: undefined,
            username: undefined,
            status: undefined,
            gender: undefined,
            age: undefined,
            phone: undefined,
            token: undefined,
        };
        
        if(!isClear) {
            saveInfo = {
                userId: info['user_id'] || info['userId'],
                username: info['username'],
                status: info['status'],
                gender: info['gender'],
                age: info['age'],
                phone: info['phone'],
                token: info['token'],
            };
        }
        
        return saveInfo;
    },
    
    /**
     * 判断是否登陆，并且如果刷新页面则把登陆信息缓存到 Vuex 中去
     */
    isLogin() {
        if(!store.state.userInfo.token) {
            let token = Vue.cookies.get(TOKEN_KEY);
        
            if(!token) {
                return false;
            }else {
                store.commit(SET_USER_INFO, Oauth.getSaveInfo(Vue.cookies.getJSON(USERINFO_KEY)));
            }
        }
        return true;
    },
    
    /**
     * 保存登录信息
     */
    saveLoginData(data) {
        let info = data.info;
        let token = data.token;
        let saveInfo = Oauth.getSaveInfo({ token, ...info });
        
        // 保存到 Cookie 中
        Vue.cookies.set(TOKEN_KEY, token, { expires: LOGIN_EXPIRES });
        Vue.cookies.set(USERINFO_KEY, saveInfo, { expires: LOGIN_EXPIRES });
        
        // 保存到 Vuex 中
        store.commit(SET_USER_INFO, saveInfo);
    },
    
    /**
     * 清空登录缓存信息
     */
    clearLoginData() {
        // 清空 Cookie 中信息
        Vue.cookies.remove(TOKEN_KEY);
        Vue.cookies.remove(USERINFO_KEY);
        
        // 清空 Vuex 中信息
        store.commit(SET_USER_INFO, Oauth.getSaveInfo(null, true));
    },
};

export default Oauth;
