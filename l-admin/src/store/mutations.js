import * as types from './types';

export default {
    [types.SET_USER_INFO]: (state, data) => {
        state.userInfo = Object.assign({}, state.userInfo, data);
    },
    [types.SET_OPEN_MENU]: (state, data = !state.openMenu) => {
        state.openMenu = data;
    },
};