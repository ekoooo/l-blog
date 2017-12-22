const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let DbUtil = require('../../utils/db_util');
let Misc = require('../../utils/misc');

class PostVote {
    constructor() {
    
    }
    
    /**
     * 获取投票列表
     * @param formInfo
     * @return {Promise.<void>}
     */
    async getVoteList(formInfo) {
        formInfo.pageId = formInfo.pageId || 0;
        formInfo.pageSize = formInfo.pageSize || 12;
    
        let pagerSql = DbUtil.getPagerSqlStr(formInfo);
    
        if(pagerSql === null) {
            return Promise.reject({
                code: CODE.ERROR,
                message: '分页参数错误'
            })
        }
    
        let sql = `select pv.post_id, pv.type, pv.create_ip,
                    pv.create_time, pv.user_agent,
                    p.title, u.username, u.nickname
                        from post_votes pv
                        left join posts p on p.id = pv.post_id
                        left join users u on u.id = p.user_id
                    where 1 = 1 `;
        
        let conditionSql = ``;
        let orderBySql = ` order by pv.create_time desc `;
        let params = [];
        let searchParams = formInfo.q;
    
        if(searchParams) {
            let index = 0;
            
            // 标题
            if(!Misc.isNullStr(searchParams.title)) {
                conditionSql += ` and p.title like $${ ++index } `;
                params.push(`%${ searchParams.title }%`);
            }
            
            // 类型
            if(!Misc.isNullStr(searchParams.type)) {
                conditionSql += ` and pv.type = $${ ++index } `;
                params.push(searchParams.type);
            }
        }
    
        // 分页
        const dataSql = sql + conditionSql + orderBySql + pagerSql;
    
        Logger.info(`get vote list form info =>`, formInfo);
        Logger.info(`get vote list sql info =>`, `sql => ${ dataSql }`, `params =>`, params);
    
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
                message: '获取投票列表失败'
            });
        }finally {
            client.release();
        }
    }
}

module.exports = PostVote;
