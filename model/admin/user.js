const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Misc = require('../../utils/misc');
let DbUtil = require('../../utils/db_util');
let Token = require('../../common/token');
let Pwd = require('../../common/pwd');
let UserBase = require('./user_base');

class User extends UserBase {
    constructor() {
        super();
        this.tokenModel = new Token();
    }
    
    /**
     * /admin/user?admin=[1]
     * 获取账号列表
     * @param formInfo
     * @param isAdmin 是否为管理员
     * @return {Promise.<void>}
     */
    async getUserList(formInfo, isAdmin) {
        formInfo.pageId = formInfo.pageId || 0;
        formInfo.pageSize = formInfo.pageSize || 12;
        isAdmin = isAdmin ? 1 : 0;
        
        let pagerSql = DbUtil.getPagerSqlStr(formInfo);
        
        if(pagerSql === null) {
            return Promise.reject({
                code: CODE.ERROR,
                message: '分页参数错误'
            })
        }
    
        let sql = `select u.id, u.username, u.nickname, u.create_time,
                        u.create_ip, u.status, up.gender, up.age, up.phone,
                        up.mail, up.description
                            from users u
                            left join user_profile up on up.user_id = u.id
                        where 1 = 1`;
        let conditionSql = ` and u.is_admin = $1 `;
        let orderBySql = ` order by create_time desc `;
        let params = [isAdmin];
        let searchParams = formInfo.q;

        if(searchParams) {
            let index = 1;
            
            // 昵称
            if(!Misc.isNullStr(searchParams.nickname)) {
                conditionSql += ` and u.nickname like $${ ++index } `;
                params.push(`%${ searchParams.nickname }%`);
            }
            
            // 用户名
            if(!Misc.isNullStr(searchParams.username)) {
                conditionSql += ` and u.username like $${ ++index } `;
                params.push(`%${ searchParams.username }%`);
            }
        }
    
        // 分页
        const dataSql = sql + conditionSql + orderBySql + pagerSql;
    
        Logger.info(`get user list form info =>`, formInfo);
        Logger.info(`get user list sql info =>`, `sql => ${ dataSql }`, `params =>`, params);
    
        const client = await Pgsql.pool.connect();
        
        try {
            let rsPromise = client.query(dataSql, params);
            let countPromise = client.query(`select count(1)::int as num from (${ sql + conditionSql }) as tmp`, params);
            let rs = await rsPromise;
            let count = await countPromise;
    
            return Promise.resolve({
                code: CODE.SUCCESS,
                list: rs.rows,
                pageId: formInfo.pageId,
                pageSize: formInfo.pageSize,
                totalCount: count.rows[0]['num'],
            });
        }catch(e) {
            Logger.error(`get user list on error => `, e);
    
            return Promise.reject({
                code: CODE.ERROR,
                message: '获取列表数据失败'
            });
        }finally {
            client.release();
        }
    }
    
    /**
     * 修改用户密码
     * @param id
     * @param pwd
     * @return {Promise.<void>} 返回新 token
     */
    async updatePwd(id, pwd) {
        if(pwd.length < 6 || pwd.length > 16) {
            if(pwd.length < User.PWD_MIN_LEN || pwd.length > User.PWD_MAX_LEN) {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: `密码合法长度应在在${ User.PWD_MIN_LEN }至${ User.PWD_MAX_LEN }位！`,
                });
            }
        }
        if(!Misc.validInt(id, 4)) {
            return Promise.resolve({
                code: CODE.ERROR,
                message: '参数错误',
            });
        }

        const client = await Pgsql.pool.connect();

        try {
            // 进行加密
            pwd = await Pwd.hash(pwd);

            const rs = await client.query(`update users set password = $1 where id = $2`, [pwd, id]);

            if(rs.rowCount === 1) {
                // 删除旧 token
                await this.tokenModel.clearOldCacheToken(id, 0);

                // 生成新 token
                let userinfoRs = await this.getInfoById(id);
                let token = this.tokenModel.jwtEncode(userinfoRs[0]);

                // 缓存用户数据
                this.cacheUserinfo(null, userinfoRs[0], true).then(() => {
                    Logger.info(`update pwd cache user info to resdis successed =>`, `user id => ${ userinfoRs[0]['user_id'] }`);
                }).catch(error => {
                    Logger.error(`update pwd cache user info to resdis on error =>`, error);
                });

                return Promise.resolve({
                    code: CODE.SUCCESS,
                    token: token,
                });
            }else {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: '修改密码失败，未改变'
                });
            }
        }catch(e) {
            Logger.error(` user update password on error => `, e);

            return Promise.reject({
                code: CODE.ERROR,
                message: '修改密码错误'
            });
        }finally {
            client.release();
        }
    }
}

module.exports = User;
