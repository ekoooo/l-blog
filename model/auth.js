const CODE = require('../common/code');

let Logger = require('../common/logger');
let Token = require('../common/token');
let User = require('./user');
let Pwd = require('../common/pwd');

class Auth {
    constructor() {
        this.tokenModel = new Token();
        this.userModel = new User();
    }
    
    // 最多几处登录
    static get MAX_LOGIN_NUMBER() {
        return 2;
    }
    
    /**
     * 判断是否登录，如果已经登录自动刷新 Token 失效时间
     */
    static isLogin(token) {
        return new Promise((resolve, reject) => {
            new Token().validToken(token).then(info => {
                resolve(info);
            }).catch(err => {
                reject(false);
            });
        });
    }
    
    /**
     * 退出登录
     * @param token
     */
    logout(token) {
        return new Promise((resolve, reject) => {
            // 根据 Token 拿到 payload 的信息
            this.tokenModel.validToken(token, false).then(info => {
                this.tokenModel.updateExpireTime(info['user_id'], info['iat'], true);
        
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
        });
    }
    
    /**
     * 管理员登录
     * @param username 用户名
     * @param password 密码
     */
    loginAdmin(username, password) {
        return new Promise((resolve, reject) => {
            this.validAdmin(username, password).then(rs => {
                
                // 缓存到 redis 中
                this.userModel.cacheUserInfo(null, rs).then(data => {
                    Logger.info(`user info save redis successed! user id: ${ rs['user_id'] }`);
                }).catch(error => {
                    Logger.error(error);
                });
        
                // 限制一个账号只能在 N 个地方登录（Token 个数）
                this.tokenModel.clearOldCacheToken(rs['user_id'], Auth.MAX_LOGIN_NUMBER - 1);
        
                // 返回需要的用户信息
                resolve({
                    code: CODE.SUCCESS,
                    message: '验证成功！',
                    info: {
                        ...User.getSafeUserInfo(rs),
                    },
                    token: this.tokenModel.jwtEncode(rs),
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
    
    /**
     * 验证登录用户名和密码
     * @param username 用户名
     * @param password 密码
     */
    validAdmin(username, password) {
        return new Promise((resolve, reject) => {
            if(username.length < User.USERNAME_MIN_LEN
                    || username.length > User.USERNAME_MAX_LEN) {
                reject({
                    code: CODE.UNAUTHORIZED,
                    message: `用户名合法长度应在在${ User.USERNAME_MIN_LEN }至${ User.USERNAME_MAX_LEN }位！`,
                });
            }
    
            if(password.length < User.PWD_MIN_LEN || password.length > User.PWD_MAX_LEN) {
                reject({
                    code: CODE.UNAUTHORIZED,
                    message: `密码合法长度应在在${ User.PWD_MIN_LEN }至${ User.PWD_MAX_LEN }位！`,
                });
            }
    
            this.userModel.getInfoByUserName(username).then(rows => {
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
        });
    }
}

module.exports = Auth;