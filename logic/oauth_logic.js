const { pool } = require('../common/pgsql');
const CODE = require('../common/code');

let Logger = require('../common/logger');
let Token = require('../common/token');
let UsersLogic = require('./users_logic');
let Pwd = require('../common/pwd');

const USERNAME_MIN_LEN = UsersLogic.VALID_CONFIG.USERNAME_MIN_LENGTH;
const USERNAME_MAX_LEN = UsersLogic.VALID_CONFIG.USERNAME_MAX_LENGTH;
const PWD_MIN_LEN = UsersLogic.VALID_CONFIG.PASSWORD_MIN_LENGTH;
const PWD_MAX_LEN = UsersLogic.VALID_CONFIG.PASSWORD_MAX_LENGTH;
const MAX_LOGIN_NUMBER = 2; // 最多几处登录

/**
 * 登录权限验证
 */
let OauthLogic = {
    /**
     * 判断是否登录，如果已经登录自动刷新 Token 失效时间
     */
    isLogin: (token) => new Promise((resolve, reject) => {
        Token.validToken(token).then(info => {
            resolve(info);
        }).catch(err => {
            reject(false);
        });
    }),
    
    /**
     * 退出登录
     * @param token
     */
    logout: (token) => new Promise((resolve, reject) => {
        // 根据 Token 拿到 payload 的信息
        Token.validToken(token, false).then(info => {
            Token.updateExpireTime(info['user_id'], info['iat'], true);
    
            resolve({
                code: CODE.SUCCESS,
                message: '退出成功！',
            });
        }).catch(err => {
            reject({
                code: CODE.TOKEN_NON_VERIFIED,
                message: 'Token 验证失败！',
            });
        });
    }),

    /**
     * 管理员登录
     * @param username 用户名
     * @param password 密码
     */
    loginAdmin: (username, password) => new Promise((resolve, reject) => {
        OauthLogic.validAdmin(username, password).then(rs => {
            // 缓存到 redis 中
            UsersLogic.cacheUserInfo(null, rs).then(data => {
                Logger.info(`user info save redis successed! user id: ${ rs['user_id'] }`);
            }).catch(error => {
                Logger.error(error);
            });

            // 限制一个账号只能在 N 个地方登录（Token 个数）
            Token.clearOldCacheToken(rs['user_id'], MAX_LOGIN_NUMBER - 1);
            
            // 返回需要的用户信息
            resolve({
                code: CODE.SUCCESS,
                message: '验证成功！',
                info: {
                    ...UsersLogic.getSafeUserInfo(rs),
                },
                token: Token.jwtEncode(rs),
            });
        }).catch(error => {
            reject(error);
        });
    }),

    /**
     * 验证登录用户名和密码
     * @param username 用户名
     * @param password 密码
     */
    validAdmin: (username, password) => new Promise((resolve, reject) => {
        if(username.length < USERNAME_MIN_LEN || username.length > USERNAME_MAX_LEN) {
            reject({
                code: CODE.UNAUTHORIZED,
                message: `用户名合法长度应在在${ USERNAME_MIN_LEN }至${ USERNAME_MAX_LEN }位！`,
            });
        }

        if(password.length < PWD_MIN_LEN || password.length > PWD_MAX_LEN) {
            reject({
                code: CODE.UNAUTHORIZED,
                message: `密码合法长度应在在${ PWD_MIN_LEN }至${ PWD_MAX_LEN }位！`,
            });
        }

        UsersLogic.getInfoByUserName(username).then(rows => {
            if(rows.length !== 1) {
                reject({
                    code: CODE.UNAUTHORIZED,
                    message: '用户名或密码错误！',
                });
            }else {
                Pwd.valid(password, rows[0].password).then(rs => {
                    if(rs) {
                        if(rows[0].status !== 1) {
                            reject({
                                code: CODE.UNAUTHORIZED,
                                message: '账号被冻结！',
                            });
                        }

                        if(rows[0]['is_admin'] !== 1) {
                            reject({
                                code: CODE.UNAUTHORIZED,
                                message: '非管理员账号！',
                            });
                        }

                        resolve(rows[0]);
                    }else {
                        reject({
                            code: CODE.UNAUTHORIZED,
                            message: '用户名或密码错误！',
                        });
                    }
                });
            }
        });
    }),
};

module.exports = OauthLogic;