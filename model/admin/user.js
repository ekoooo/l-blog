const { pool } = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Misc = require('../../utils/misc');
let DbUtil = require('../../utils/db_util');

class User {
    constructor() {
    
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
    
        const client = await pool.connect();
        
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
}

module.exports = User;
