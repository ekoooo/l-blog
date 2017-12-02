const { pool } = require('../common/pgsql');
const Misc = require('../utils/misc');

let Logger = require('../common/logger');
let Pwd = require('../common/pwd');
let redisClient = require('../common/redis');

class User {
    constructor() {
    
    }
    
    /**
     * 初始化一个管理员
     * 账号密码什么的可以搞到配置文件中
     */
    static initAdmin() {
        let username = 'admin';
        let pwd = '123456';
        let age = 24;
        let phone = '15727781885';
        let mail = '954408050@qq.com';
        let desc = '管理员账号';
        
        new User().getInfoByUserName(username).then(rs => {
            if(rs.length === 0) {
                Pwd.hash(pwd).then(hash => {
                    (async () => {
                        const client = await pool.connect();
            
                        const usersSqlStr = `insert into users (username, password, is_admin)
                        values ($1, $2, $3) returning id`;
                        const userProfileSqlStr = `insert into user_profile
                        (user_id, gender, age, phone, mail, description)
                        values ($1, $2, $3, $4, $5, $6)`;
            
                        try {
                            await client.query('BEGIN');
                
                            const rs = await client.query(usersSqlStr, [username, hash, 1]);
                
                            await client.query(userProfileSqlStr, [rs.rows[0].id, 1, age, phone, mail, desc]);
                
                            await client.query('COMMIT');
                
                            Logger.debug('测试用户插入完成！');
                        } catch (e) {
                            await client.query('ROLLBACK');
                            throw e;
                        } finally {
                            client.release();
                        }
                    })().catch(e => Logger.error(e.stack));
                });
            }else {
                Logger.info('已存在一个超级管理员，无需创建！');
            }
        });
    }
    
    // 密码最长长度
    static get PWD_MAX_LEN() { return 16; }
    // 密码最短长度
    static get PWD_MIN_LEN() { return 6; }
    // 用户名最长长度
    static get USERNAME_MAX_LEN() { return 9; }
    // 用户名最短长度
    static get USERNAME_MIN_LEN() { return 3; }
    // redis 表名
    static get REIDS_TABLE_NAME() { return 'users:'; }
    // 获取全部用户信息的 SQL 语句
    static get GET_ALL_SQL() {
        return `select u.id as user_id, up.id as user_profile_id, * from users u
            left join user_profile up on u.id = up.user_id `;
    }
    
    /**
     * 获取安全的用户信息
     */
    static getSafeUserInfo(data) {
        let info = Misc.cloneObj(data);
    
        info.password !== undefined && delete info.password;
        info.id !== undefined && delete info.id;
        info['user_profile_id'] !== undefined && delete info['user_profile_id'];
        info.salt !== undefined && delete info.salt;
    
        return info;
    }
    
    /**
     * 根据 users 表 username 获取信息
     * @param username 用户名
     */
    getInfoByUserName(username) {
        return new Promise((resolve, reject) => {
            pool.connect().then(client => {
                client.query(`${ User.GET_ALL_SQL } where u.username = $1`, [username]).then(rs => {
                    client.release();
                    resolve(rs.rows);
                }).catch(error => {
                    client.release();
                    Logger.warn(`getInfoByUserName(${ username }) error!`, error);
                    reject(error);
                });
            });
        });
    }

    /**
     * 根据 users 表 id 获取信息
     * @param id
     */
    getInfoById(id) {
        return new Promise((resolve, reject) => {
            pool.connect().then(client => {
                client.query(`${ User.GET_ALL_SQL } where u.id = $1`, [id]).then(rs => {
                    client.release();
                    resolve(rs.rows);
                }).catch(error => {
                    client.release();
                    Logger.warn(`getInfoById(${ id }) error!`, error);
                    reject(error)
                });
            });
        });
    }
    
    /**
     * 缓存用户信息到 redis 中，如果已经缓存则不操作
     * 如果存在 id 参数则取数据库的数据缓存到 redis 中，否则存入 info
     * @param id users 表 ID
     * @param info 要缓存的数据，必须有 user_id 字段
     * 成功则返回缓存的信息
     */
    cacheUserInfo(id, info) {
        return new Promise((resolve, reject) => {
            if(Misc.isNullStr(id)) {
                if(Misc.isNullStr(info['user_id'])) {
                    reject('cacheUserInfo user_id is undefined!');
                }else {
                    let key = User.REIDS_TABLE_NAME + info['user_id'];
                    // 缓存
                    redisClient.hgetall(key, (err, res) => {
                        if(!res) {
                            redisClient.hmset(key, info, (err, res) => {
                                if(err) {
                                    reject('cacheUserInfo error: ' + err);
                                }else {
                                    resolve(info);
                                }
                            });
                        }else {
                            Logger.debug('already exists in redis =>', res);
                            resolve(res);
                        }
                    });
                }
            }else {
                let key = User.REIDS_TABLE_NAME + id;
                // 缓存
                redisClient.hgetall(key, (err, res) => {
                    if(!res) {
                        this.getInfoById(id).then(rows => {
                            if(rows.length !== 1) {
                                reject('cacheUserInfo getInfoById(${ id }) is null data!');
                            }else {
                                redisClient.hmset(key, rows[0], (err, res) => {
                                    if(err) {
                                        reject('cacheUserInfo error: ' + err);
                                    }else {
                                        resolve(rows[0]);
                                    }
                                });
                            }
                        });
                    }else {
                        Logger.debug('already exists in redis =>', res);
                        resolve(res);
                    }
                });
            }
        });
    }
    
    /**
     * 获取用户缓存信息
     */
    getCacheUserInfo(id) {
        return this.cacheUserInfo(id);
    }
}

// 初始化一个超级管理员
User.initAdmin();

module.exports = User;