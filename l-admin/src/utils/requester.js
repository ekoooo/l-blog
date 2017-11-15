import axios from 'axios';
import Vue from 'vue';
import store from '../store/';
import { API_URL_RPEFIX } from '../config/config';

const Requester = {

    _axios(url, data = {}, method) {

        const isGet = method === 'get';
        const isFormDataType = data instanceof FormData;

        return Vue.http({
            baseURL: API_URL_RPEFIX,
            method: method,
            url: url,
            data: isGet ? null : data,
            params: Object.assign({}, {t: +new Date}, isGet ? data : {}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': isFormDataType ? 'multipart/form-data' : 'application/json',
                'X-ACCESS-TOKEN': store.state.userInfo.token
            }
        }).then((response) => {
            return response.data;
        });
    },

    post(url, data) {
        return this._axios(url, data, 'post');
    },

    delete(url, data) {
        return this._axios(url, data, 'delete');
    },

    put(url, data) {
        return this._axios(url, data, 'put');
    },

    get(url, data) {
        return this._axios(url, data, 'get');
    },

    patch(url, data) {
        return this._axios(url, data, 'patch');
    },
};

export default Requester;