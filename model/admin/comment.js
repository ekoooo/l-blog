const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let DbUtil = require('../../utils/db_util');
let Misc = require('../../utils/misc');

class Comment {
    constructor() {
    
    }
    
    /**
     * 获取一条评论信息
     * @param id
     * @return {Promise.<void>}
     */
    async getCommentById(id) {
        const sql = `select pc.id, pc.author,
                pc.author_site, pc.mail, pc.create_ip,
                pc.create_time, pc.status, pc.content,
                p.title as post_title
            from post_comments pc
            left join posts p on p.id = pc.post_id
            where pc.id = $1 `;
        
        const client = await Pgsql.pool.connect();
    
        try {
            let rs = await client.query(sql, [id]);
            return Promise.resolve({
                code: CODE.SUCCESS,
                info: rs.rows[0],
            });
        }catch(e) {
            Logger.error(`get comment by id on error => `, e);
        
            return Promise.reject({
                code: CODE.ERROR,
                message: '获取留言失败'
            });
        }finally {
            client.release();
        }
    }
    
    /**
     * 删除、恢复、通过审核
     * @param id
     * @param status
     * @return {Promise.<void>}
     */
    async updateStatus(id, status) {
        const client = await Pgsql.pool.connect();
    
        try {
            await client.query(`update post_comments set status = $1 where id = $2 `, [status, id]);
            return Promise.resolve({
                code: CODE.SUCCESS,
                info: id,
            });
        }catch(e) {
            Logger.error(`update comment status on error => `, e);
        
            return Promise.reject({
                code: CODE.ERROR,
                message: '留言状态更新失败'
            });
        }finally {
            client.release();
        }
    }
    
    /**
     * admin/comment/list
     * 获取评论列表
     * @param formInfo
     * @returns {Promise<*>}
     */
    async getCommentList(formInfo) {
        formInfo.pageId = formInfo.pageId || 0;
        formInfo.pageSize = formInfo.pageSize || 12;
        
        let pagerSql = DbUtil.getPagerSqlStr(formInfo);
        
        if(pagerSql === null) {
            return Promise.reject({
                code: CODE.ERROR,
                message: '分页参数错误'
            })
        }
        
        let sql = `select pc.id, pc.post_id, pc.parent_id, pc.author,
                pc.author_site, pc.mail, pc.create_ip, pc.create_time, pc.status,
                p.title as post_title
            from post_comments pc
            left join posts p on p.id = pc.post_id
            where 1 = 1 `;
        
        let conditionSql = ``;
        let orderBySql = ` order by pc.create_time desc `;
        let params = [];
        let searchParams = formInfo.q;
        
        if(searchParams) {
            let index = 0;
            
            // 文章 ID
            if(!Misc.isNullStr(searchParams.postId)) {
                conditionSql += ` and pc.post_id = $${ ++index } `;
                params.push(searchParams.postId);
            }
            
            // 留言状态
            if(!Misc.isNullStr(searchParams.status)) {
                conditionSql += ` and pc.status = $${ ++index } `;
                params.push(searchParams.status);
            }else {
                conditionSql += ` and pc.status <> -1`;
            }

            // 邮箱
            if(!Misc.isNullStr(searchParams.mail)) {
                conditionSql += ` and pc.mail like $${ ++index } `;
                params.push(`%${ searchParams.mail }%`);
            }
            
            // 网址
            if(!Misc.isNullStr(searchParams.authorSite)) {
                conditionSql += ` and pc.author_site like $${ ++index } `;
                params.push(`%${ searchParams.authorSite }%`);
            }
        }else {
            // 如果没有选择搜索条件则默认不显示删除的
            conditionSql += ` and pc.status <> -1`;
        }
        
        // 分页
        const dataSql = sql + conditionSql + orderBySql + pagerSql;
        
        Logger.info(`get comment list form info =>`, formInfo);
        Logger.info(`get comment list sql info =>`, `sql => ${ dataSql }`, `params =>`, params);
        
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
            Logger.error(`get comment list on error => `, e);
            
            return Promise.reject({
                code: CODE.ERROR,
                message: '获取评论列表失败'
            });
        }finally {
            client.release();
        }
    }
}

module.exports = Comment;