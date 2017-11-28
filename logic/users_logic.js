const { pool } = require('../common/pgsql');
const Misc = require('../utils/misc');

let Logger = require('../common/logger');
let Token = require('../common/token');
let Pwd = require('../common/pwd');
let redisClient = require('../common/redis');
let DbUtil = require('../utils/db_util');

let UsersLogic = {
    // 用户先关校验配置
    VALID_CONFIG: {
        // 密码最长长度
        PASSWORD_MAX_LENGTH: 16,
        // 密码最短长度
        PASSWORD_MIN_LENGTH: 6,
        // 用户名最长长度
        USERNAME_MAX_LENGTH: 9,
        // 用户名最短长度
        USERNAME_MIN_LENGTH: 3,
        // redis 表名
        REIDS_TABLE_NAME: 'users:',
    },

    /**
     * 添加测试管理员
     */
    _addTestAdmin () {
        Pwd.hash('123456').then(hash => {
            (async () => {
                const client = await pool.connect();

                const usersSqlStr = `insert into users (username, password, is_admin) 
                        values ($1, $2, $3) returning id`;
                const userProfileSqlStr = `insert into user_profile 
                        (user_id, gender, age, phone, mail, description) 
                        values ($1, $2, $3, $4, $5, $6)`;

                try {
                    await client.query('BEGIN');

                    const rs = await client.query(usersSqlStr, ['lwl', hash, 1]);

                    await client.query(userProfileSqlStr, [rs.rows[0].id, 1, 24, '15727781885', '954408050@qq.com', '测试账号，密码 123456']);

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
    },

    /**
     * 获取全部用户信息的 SQL 语句
     */
    GET_ALL_SQL: `select u.id as user_id, up.id as user_profile_id, * from users u
            left join user_profile up on u.id = up.user_id `,

    /**
     * 根据 users 表 id 获取信息
     */
    getInfoById: (id) => new Promise((resolve, reject) => {
        pool.connect().then(client => {
            client.query(`${ UsersLogic.GET_ALL_SQL } where u.id = $1`, [id]).then(rs => {
                client.release();
                resolve(rs.rows);
            }).catch(error => {
                client.release();
                Logger.warn(`getInfoById(${ id }) error!`, error);
                reject(error)
            });
        });
    }),

    /**
     * 根据 users 表 username 获取信息
     */
    getInfoByUserName: (username) => new Promise((resolve, reject) => {
        pool.connect().then(client => {
            client.query(`${ UsersLogic.GET_ALL_SQL } where u.username = $1`, [username]).then(rs => {
                client.release();
                resolve(rs.rows);
            }).catch(error => {
                client.release();
                Logger.warn(`getInfoByUserName(${ username }) error!`, error);
                reject(error)
            });
        });
    }),

    /**
     * 获取安全的用户信息
     */
    getSafeUserInfo: (data) => {
        let info = Misc.cloneObj(data);

        info.password !== undefined && delete info.password;
        info.id !== undefined && delete info.id;
        info['user_profile_id'] !== undefined && delete info['user_profile_id'];
        info.salt !== undefined && delete info.salt;

        return info;
    },

    /**
     * 缓存用户信息到 redis 中，如果已经缓存则不操作
     * 如果存在 id 参数则取数据库的数据缓存到 redis 中，否则存入 info
     * @param id users 表 ID
     * @param info 要缓存的数据，必须有 user_id 字段
     * @return 成功则返回缓存的信息
     */
    cacheUserInfo: (id, info) => new Promise((resolve, reject) => {
        if(Misc.isNullStr(id)) {
            if(Misc.isNullStr(info['user_id'])) {
                reject('cacheUserInfo user_id is undefined!');
            }else {
                let key = UsersLogic.VALID_CONFIG.REIDS_TABLE_NAME + info['user_id'];
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
            let key = UsersLogic.VALID_CONFIG.REIDS_TABLE_NAME + id;
            // 缓存
            redisClient.hgetall(key, (err, res) => {
                if(!res) {
                    UsersLogic.getInfoById(id).then(rows => {
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
    }),

    /**
     * 获取用户缓存信息
     */
    getCacheUserInfo: (id) => {
        return UsersLogic.cacheUserInfo(id);
    },
};

module.exports = UsersLogic;