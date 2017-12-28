const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');

let Misc = require('../../utils/misc');
let Logger = require('../../common/logger');
let DbUtil = require('../../utils/db_util');
let moment = require('moment');

class Comment {
    constructor() {
    
    }
    
    // 两次评论最短时间间隔，单位秒
    static get COMMENT_TIME_DIFF() {
        return 60;
    };
    
    // 评论列表 pagesize
    static get COMMENT_LIST_PAGE_SIZE() {
        return 10;
    };
    
    /**
     * 获取评论列表
     * @param postId
     * @param pageId
     * @return {Promise.<void>}
     */
    async getCommentList(postId, pageId) {
        if(!Misc.validInt(pageId, 4)) {
            // 默认
            pageId = 0;
        }
    
        let pagerSql = DbUtil.getPagerSqlStr({
            pageId: pageId,
            pageSize: Comment.COMMENT_LIST_PAGE_SIZE
        });
        
        let sql = `select id, post_id, author, author_site,
            mail, content, create_time
            from post_comments
            where 1 = 1 `;
        
        let conditionSql = ` and status = 1 and parent_id is null and post_id = $1 `;
        let orderBySql = ` order by create_time desc `;
        let params = [postId];
        
        // 分页
        const dataSql = sql + conditionSql + orderBySql + pagerSql;
    
        Logger.info(`get comment list =>`, `sql => ${ dataSql }`, `params =>`, params);
    
        const client = await Pgsql.pool.connect();
        
        try {
            let rsPromise = client.query(dataSql, params);
            let countPromise = client.query(`select count(1)::int as num from (${ sql + conditionSql }) as tmp`, params);
        
            let rs = await rsPromise;
            let count = await countPromise;
            
            // 格式化时间
            rs.rows.map(item => {
                if(item['create_time']) {
                    item['create_time'] = moment(item['create_time']).format('YYYY-MM-DD HH:mm:ss');
                }
            });
        
            return Promise.resolve({
                code: CODE.SUCCESS,
                list: rs.rows,
                pageId: Number(pageId),
                pageSize: Comment.COMMENT_LIST_PAGE_SIZE,
                totalCount: count.rows[0]['num']
            });
        }catch(e) {
            Logger.error(`get comment list on error => `, e);
        
            return Promise.reject({
                code: CODE.ERROR,
                message: '获取留言列表失败'
            });
        }finally {
            client.release();
        }
    }
    
    /**
     * 验证留言表单
     */
    static validCommentForm(formInfo) {
        if(Misc.isNullStr(formInfo.postId)) {
            return '参数错误';
        }
        if(Misc.isNullStr(formInfo.name)) {
            return '请输入昵称';
        }
        if(Misc.isNullStr(formInfo.mail)) {
            return '请输入邮箱';
        }
        if(Misc.isNullStr(formInfo.content)) {
            return '请输入内容';
        }
    
        // 昵称 2 ~ 16
        if(formInfo.name.length < 2 || formInfo.name.length > 16) {
            return '昵称必须 2 到 16 位';
        }
        if(!Misc.isNullStr(formInfo.mail) && !Misc.validEmail(formInfo.mail)) {
            return '邮箱格式不正确';
        }
        if(!Misc.isNullStr(formInfo.site) && !Misc.validUrl(formInfo.site)) {
            return '网址格式不正确';
        }
        
        if(formInfo.content.length > 10240) {
            return '内容过长';
        }
    
        return false;
    }
    
    /**
     *
     * @return {Promise.<void>}
     */
    async addComment(formInfo, ip) {
        let errMsg = Comment.validCommentForm(formInfo);
        
        if(errMsg) {
            return Promise.reject({
                code: CODE.ERROR,
                message: errMsg
            });
        }
        
        const client = await Pgsql.pool.connect();
        
        try {
            let commentCheck;
            
            // 验证 postId 是否存在
            let rs = await client.query(`select comment_check::int from posts
                where status = 1 and id = $1`, [formInfo.postId]);
            if(rs.rowCount !== 1) {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: '评论文章不存在'
                });
            }else {
                commentCheck = rs.rows[0]['comment_check'];
            }
            
            // 验证引用的 parentId 是否存在
            if(!Misc.isNullStr(formInfo.parentId)) {
                rs = await client.query(`select count(1)::int as num from
                        post_comments where
                        status = 1 and id = $1 and post_id = $2`,
                    [formInfo.parentId, formInfo.postId]);
                
                if(rs.rows[0].num !== 1) {
                    return Promise.reject({
                        code: CODE.ERROR,
                        message: '引用评论不存在'
                    });
                }
            }
            
            // 限制一个 IP 一分钟之内只能评论一次
            rs = await client.query(`select count(1)::int as num
                from post_comments
                where extract(epoch FROM (now() - create_time)) <= $1
                and create_ip = $2 `, [Comment.COMMENT_TIME_DIFF, ip]);
    
            if(rs.rows[0].num >= 1) {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: Comment.COMMENT_TIME_DIFF + '秒内只能评论一条记录'
                });
            }
            
            // 添加评论记录
            const sql = `insert into post_comments (
                    post_id,
                    parent_id,
                    author,
                    author_site,
                    mail,
                    content,
                    create_ip,
                    status
                ) values (
                    $1, $2, $3, $4, $5, $6, $7, $8
                ) returning id`;
            
            const params = [
                formInfo.postId,
                formInfo.parentId || null,
                formInfo.name,
                formInfo.site,
                formInfo.mail,
                formInfo.content,
                ip,
                commentCheck ? 0 : 1
            ];
            
            rs = await client.query(sql, params);
            
            return Promise.resolve({
                code: CODE.SUCCESS,
                info: {
                    id: rs.rows[0].id,
                    commentCheck: commentCheck,
                }
            });
        }catch(e) {
            Logger.error(`comment on error => `, e);
        
            return Promise.reject({
                code: CODE.ERROR,
                message: '留言失败'
            });
        }finally {
            client.release();
        }
    }
}

module.exports = Comment;