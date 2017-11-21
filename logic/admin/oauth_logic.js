const { pool } = require('../../common/pgsql');
const CODE = require('../../common/code');

var Logger = require('../../common/logger');
var UserLogic = require('../../logic/admin/users_logic');
var Pwd = require('../../common/pwd');

/**
 * 登录权限验证
 */
var OauthLogic = {
    /**
     * 验证登录用户名和密码
     * @param username 用户名
     * @param password 密码
     */
    validAdmin: (username, password) => new Promise((resolve, reject) => {
        UserLogic.getInfoByUserName(username).then(rows => {
            if(rows.length !== 1) {
                reject({
                    code: CODE.UNAUTHORIZED,
                    message: '用户名或密码错误！',
                });
            }else {
                Pwd.valid(password, rows[0].password).then(rs => {
                    if(rs) {
                        // 删除敏感信息
                        delete rows[0].password;
                        delete rows[0].id;
                        delete rows[0].user_profile_id;
                        delete rows[0].salt;
                        
                        // 返回需要的用户信息
                        resolve({
                            code: CODE.SUCCESS,
                            message: '验证成功！',
                            info: {
                                ...rows[0],
                                // TOTO 带回 token 信息
                            },
                        });
                    }else {
                        reject({
                            code: CODE.UNAUTHORIZED,
                            message: '用户名或密码错误！',
                        });
                    }
                });

                if(rows[0].status != 1) {
                    reject({
                        code: CODE.UNAUTHORIZED,
                        message: '账号被冻结！',
                    });
                }

                if(rows[0]['is_admin'] != 1) {
                    reject({
                        code: CODE.UNAUTHORIZED,
                        message: '非管理员账号！',
                    });
                }
            }
        }).catch(error => {
            reject({errorInfo});
            Logger.warn('OauthLogic isLogin error', error);
        });
    }),
};

module.exports = OauthLogic;