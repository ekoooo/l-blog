const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');

let Misc = require('../../utils/misc');
let Logger = require('../../common/logger');
let DbUtil = require('../../utils/db_util');
let moment = require('moment');
var xss = require("xss");

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
     * 格式化评论列表
     * @param dataList
     */
    formatCommentList(list) {
        let ids = [];
        let item;

        for(let i = 0; i < list.length; i++) {
            item = Misc.cloneObj(list[i]);
            ids.push(item['id']);

            list[i] = {
                id: item['id'],
                post_id: item['post_id'],
                author: item['author'],
                author_site: item['author_site'],
                mail: item['mail'],
                content: item['content'],
                create_time: moment(item['create_time']).format('YYYY-MM-DD HH:mm'),
                childList: [],
            };

            if(item['c_id'] != null) {
                let firstIndex = ids.indexOf(item['id']);

                list[firstIndex === i ? i : firstIndex]['childList'].push({
                    id: item['c_id'],
                    parent_id: item['c_parent_id'],
                    reply_id: item['c_reply_id'],
                    post_id: item['c_post_id'],
                    author: item['c_author'],
                    author_site: item['c_author_site'],
                    mail: item['c_mail'],
                    content: item['c_content'],
                    create_time: moment(item['c_create_time']).format('YYYY-MM-DD HH:mm'),
                    reply_to_author: item['c_reply_to_author'],
                    reply_to_author_site: item['c_reply_to_author_site'],
                });

                if(firstIndex !== i) {
                    ids.splice(i, 1);
                    list.splice(i--, 1);
                }
            }
        }

        return list;
    }
    
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
        
        const childSetSql = sql + conditionSql + orderBySql + pagerSql;

        // 二级评论
        const dataSql = `SELECT
                pp.*,
                p.id as c_id, p.parent_id as c_parent_id, p.reply_id  as c_reply_id, p.post_id as c_post_id,
                p.author as c_author, p.author_site as c_author_site, p.mail as c_mail, p.content as c_content, p.create_time as c_create_time,
                p2.author as c_reply_to_author, p2.author_site as c_reply_to_author_site
            from (${ childSetSql }) pp
            left join post_comments p on pp.id = p.parent_id and status = 1
            left join post_comments p2 on p2.id = p.reply_id
            order by pp.create_time desc, c_create_time asc`;
    
        Logger.info(`get comment list =>`, `sql => ${ dataSql }`, `params =>`, params);
    
        const client = await Pgsql.pool.connect();
        
        try {
            let rsPromise = client.query(dataSql, params);
            let countPromise = client.query(`select count(1)::int as num from (${ sql + conditionSql }) as tmp`, params);
        
            let rs = await rsPromise;
            let count = await countPromise;

            return Promise.resolve({
                code: CODE.SUCCESS,
                list: this.formatCommentList(rs.rows),
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
     * 发表评论
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
            
            // 验证回复的 parentId 是否存在
            if(!Misc.isNullStr(formInfo.parentId)) {
                rs = await client.query(`select count(1)::int as num from
                        post_comments where
                        parent_id is null and status = 1 and id = $1 and post_id = $2`,
                    [formInfo.parentId, formInfo.postId]);
                
                if(rs.rows[0].num !== 1) {
                    return Promise.reject({
                        code: CODE.ERROR,
                        message: '回复评论不存在'
                    });
                }
            }

            // 验证 replyId 合法性
            if(!Misc.isNullStr(formInfo.replyId)) {
                rs = await client.query(`select count(1)::int as num from
                        post_comments where status = 1 
                        and id = $1 and post_id = $2`,
                    [formInfo.replyId, formInfo.postId]);
                
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
                    reply_id,
                    author,
                    author_site,
                    mail,
                    content,
                    create_ip,
                    status
                ) values (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9
                ) returning id`;
            
            const params = [
                formInfo.postId,
                formInfo.parentId || null,
                formInfo.replyId || null,
                formInfo.name,
                formInfo.site,
                formInfo.mail,
                xss(formInfo.content),
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