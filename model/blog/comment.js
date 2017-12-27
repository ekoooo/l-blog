const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');

let Misc = require('../../utils/misc');
let Logger = require('../../common/logger');

class Comment {
    constructor() {
    
    }
    
    // 两次评论最短时间间隔，单位秒
    static get COMMENT_TIME_DIFF() {
        return 60;
    };
    
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
    
        // 昵称 4 ~ 16
        if(formInfo.name.length < 4 || formInfo.name.length > 16) {
            return '昵称必须 4 到 16 位';
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
                    message: '一分钟内只能评论一条记录'
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
                info: rs.rows[0].id
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