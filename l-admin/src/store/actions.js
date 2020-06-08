import * as types from './types';

export default {
  setUserInfo: ({ commit }, data) => {
    commit(types.SET_USER_INFO, data);
  },
  setOpenMenu: ({ commit }, data) => {
    commit(types.SET_OPEN_MENU, data);
  },
}