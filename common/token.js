let jwt = require('jwt-simple');
let UserBase =  require('../model/admin/user_base');
let Logger = require('./logger');
let redisClient = require('./redis');

class Token {
    constructor() {
    
    }
    
    // token 有效时间
    // 12h
    static get TOKEN_EXPIRE_TIME() { return 12 * 60 * 60 * 1000; }
    // redis key 前缀
    static get REIDS_TABLE_NAME() { return 'token_expire_time:'; }
    
    /**
     * 获取加密 secret
     * @param id
     * @param password
     */
    static getSecret(id, password) {
        return id + '*' + password;
    }
    
    /**
     * 更新 Token 失效时间到 redis
     * @param id user_id
     * @param iat
     * @param clear true => 退出登录时设置过期时间为 0
     */
    updateExpireTime(id, iat, clear = false) {
        let key = Token.REIDS_TABLE_NAME + id + '#' + iat;
        let time = clear ? 0 : Token.TOKEN_EXPIRE_TIME + new Date().getTime();
        let expireTime = clear ? 1 : Token.TOKEN_EXPIRE_TIME / 1000; // 失效时间至少 1 秒
        
        // 设置过期时间
        redisClient.set(key, time, 'EX', expireTime, (err) => {
            if(err) {
                Logger.error('token expire time save on error =>', err);
            }else {
                Logger.debug('token expire time save successed =>', `key => ${ key }, time => ${ time }`);
            }
        });
    }
    
    
    /**
     * 生成 JWT Token
     */
    jwtEncode(info) {
        let payload = {
            user_id: info.user_id,
            username: info.username,
            is_admin: info.is_admin,
            iss: 'liuwanlin',
            iat: +new Date(),
        };
        
        let id = info['user_id'];
        let password = info['password'];
        let token = jwt.encode(payload, Token.getSecret(id, password));
        
        // 缓存过期时间
        this.updateExpireTime(id, payload.iat);
        
        return token;
    }
    
    /**
     * 验证 JWT Token
     * @param token
     * @param isValid 是否验证正确性
     */
    validToken(token, isValid = true) {
        return new Promise((resolve, reject) => {
            let payload = {};
            
            try {
                payload = jwt.decode(token, null, true, null);
                
                if(!isValid) {
                    resolve(payload);
                }
            } catch(e) {
                reject(false);
            }
            
            new UserBase().getCacheUserInfo(payload['user_id']).then(data => {
                let id = data['user_id'];
                let password = data['password'];
                
                try {
                    // 验证 JWT Token 是否合法
                    jwt.decode(token, Token.getSecret(id, password));
                    // 验证是否过期
                    redisClient.get(Token.REIDS_TABLE_NAME + id + '#' + payload.iat, (err, res) => {
                        if(err) {
                            Logger.error('get token expire time on error =>', err);
                            reject(false);
                        }else {
                            if(Number(res || 0) > (+new Date())) {
                                // 刷新 Token 有效时间
                                this.updateExpireTime(id, payload.iat);
                                
                                resolve(payload);
                            }else {
                                reject(false);
                            }
                        }
                    });
                } catch (error) {
                    reject(false);
                }
                
            }).catch(error => { reject(error); });
        });
    }
    
    
    /**
     * 清理多余登录 Token
     * @param id userId
     * @param maxLen 最多保留几条
     * 返回清理条数
     */
    clearOldCacheToken(id, maxLen = 5) {
        return new Promise((resolve, reject) => {
            let param = `${ Token.REIDS_TABLE_NAME }${ id }#`;
            
            redisClient.send_command('keys', [param + '*'], (err, res) => {
                if(err) {
                    Logger.error(`get token keys on error =>`, err);
                    reject(0);
                }
                if(res.length > maxLen) {
                    // 去除前缀
                    res = res.map(item => {
                        return Number(item.replace(param, ''));
                    });
                    
                    // 排序
                    res = res.sort((a, b) => a - b);
                    
                    // 获取需要删除 key 值
                    res = res.slice(0, res.length - maxLen);
                    
                    let delKeys = res.map(item => {
                        return param + item;
                    });
                    
                    redisClient.send_command('del', ['key', ...delKeys], (err, res) => {
                        if(err) {
                            Logger.error(`delete tokens on error =>`, err);
                            reject(0);
                        }else {
                            Logger.info(`delete tokens =>`, `id => ${ id }, number => ${ res }`);
                            resolve(res);
                        }
                    })
                }else {
                    resolve(0);
                }
            });
        });
    }
}

module.exports = Token;