import requester from '../utils/requester';

const UsersLogic = {
  ADMIN_LIST_PAGE_SIZE: 10,
  ADMIN_LIST_SEARCHPARAMS: {
    username: undefined, // 用户名
    nickname: undefined, // 昵称
  },
  
  // 获取管理员列表
  getAdminList(searchParams) {
    let defaultParams = {
      pageId: 0,
      pageSize: UsersLogic.ADMIN_LIST_PAGE_SIZE
    };

    return requester.post('/admin/user?admin=1', Object.assign({}, defaultParams, searchParams));
  },
  
  // 修改密码
  updatePwd(id, pwd) {
    return requester.put('/admin/user/pwd/' + id, { pwd });
  }
};

export default UsersLogic;