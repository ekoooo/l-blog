const Pgsql = require('../../common/pgsql');
const Misc = require('../../utils/misc');
const Config = require('../../config/index');

let Logger = require('../../common/logger');
let Pwd = require('../../common/pwd');
let redisClient = require('../../common/redis');

class UserBase {
  constructor() {
  
  }
  
  /**
   * 初始化一个管理员
   * @return {Promise.<void>}
   */
  async _initAdmin() {
    let { username, nickname, pwd, age, phone, mail, desc } = Config.initAdminInfo;
    
    let userInfo = await this.getInfoByUsername(username);
    let pwdHash = await Pwd.hash(pwd);
    
    if(userInfo.length === 0) {
      const client = await Pgsql.pool.connect();
      const usersSqlStr = `insert into users (username, password, is_admin, nickname) values ($1, $2, $3, $4) returning id`;
      const userProfileSqlStr = `insert into user_profile (user_id, gender, age, phone, mail, description) values ($1, $2, $3, $4, $5, $6)`;

      try {
        await client.query('BEGIN');

        const rs = await client.query(usersSqlStr, [username, pwdHash, 1, nickname]);

        await client.query(userProfileSqlStr, [rs.rows[0].id, 1, age, phone, mail, desc]);

        await client.query('COMMIT');

        Logger.info('first admin user init successed =>', `username => ${ username }`);
      } catch (e) {
        await client.query('ROLLBACK');
        Logger.error(`init first admin user on error =>`, e.stack);
        
        return Promise.resolve(false);
      } finally {
        client.release();
      }
    }else {
      Logger.info('exist admin user =>', `username => ${ username }`);
    }
    
    return Promise.resolve(true);
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
  getInfoByUsername(username) {
    return new Promise((resolve, reject) => {
      Pgsql.pool.connect().then(client => {
        client.query(`${ UserBase.GET_ALL_SQL } where u.username = $1`, [username]).then(rs => {
          client.release();
          resolve(rs.rows);
        }).catch(error => {
          client.release();
          Logger.error(`get info by username on error =>`, error, `username => ${ username }`);
          
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
      Pgsql.pool.connect().then(client => {
        client.query(`${ UserBase.GET_ALL_SQL } where u.id = $1`, [id]).then(rs => {
          client.release();
          resolve(rs.rows);
        }).catch(error => {
          Logger.error(`get info by id on error =>`, error, `id => ${ id }`);
          
          client.release();
          reject(error)
        });
      });
    });
  }
  
  /**
   * 缓存用户信息到 redis 中，默认已经缓存则不操作
   * 如果存在 id 参数则取数据库的数据缓存到 redis 中，否则存入 info
   * @param id users 表 ID
   * @param info 要缓存的数据，必须有 user_id 字段
   * @param rewrite 是否需要覆盖
   * 成功则返回缓存的信息
   */
  cacheUserinfo(id, info, rewrite = false) {
    return new Promise((resolve, reject) => {
      if(Misc.isNullStr(id)) {
        if(Misc.isNullStr(info['user_id'])) {
          reject('cacheUserInfo user_id is undefined!');
        }else {
          let key = UserBase.REIDS_TABLE_NAME + info['user_id'];
          // 缓存
          redisClient['hgetall'](key, (err, res) => {
            if(rewrite || !res) {
              redisClient.hmset(key, info, (err) => {
                if(err) {
                  reject('cache userinfo on error: ' + err);
                }else {
                  resolve(info);
                }
              });
            }else {
              Logger.info('cache userinfo already exists in redis =>', res);
              resolve(res);
            }
          });
        }
      }else {
        let key = UserBase.REIDS_TABLE_NAME + id;
        // 缓存
        redisClient['hgetall'](key, (err, res) => {
          if(rewrite || !res) {
            this.getInfoById(id).then(rows => {
              if(rows.length !== 1) {
                reject('cacheUserInfo getInfoById(${ id }) is null data!');
              }else {
                redisClient.hmset(key, rows[0], (err) => {
                  if(err) {
                    reject('cacheUserInfo error: ' + err);
                  }else {
                    resolve(rows[0]);
                  }
                });
              }
            });
          }else {
            Logger.info('cache userinfo already already exists in redis =>',
              `user id => ${ res['user_id'] }, username => ${ res['username'] }`);
            
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
    return this.cacheUserinfo(id);
  }
}


module.exports = UserBase;