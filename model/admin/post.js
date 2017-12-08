let format = require('pg-format');
const { pool } = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Misc = require('../../utils/misc');
let DbUtil = require('../../utils/db_util');

class Post {
    constructor() {
    
    }
    
    /**
     * 验证添加编辑表单内容
     * @param formInfo
     */
    static validateAddEditForm(formInfo) {
        if(Misc.isNullStr(formInfo.categoryId)) {
            return '分类不能为空';
        }
        if(Misc.isNullStr(formInfo.title)) {
            return '标题不能为空';
        }
        if(formInfo.tags.length === 0) {
            return '标签不能为空';
        }
        if(Misc.isNullStr(formInfo.html) ||
            Misc.isNullStr(formInfo.markdown) ||
            Misc.isNullStr(formInfo.text)) {
            return '内容不能为空';
        }
        if(Misc.isNullStr(formInfo.desc)) {
            return '简述不能为空';
        }
        if(Misc.isNullStr(formInfo.keyWords)) {
            return '关键字不能为空';
        }
        
        if(formInfo.title.length > 64) {
            return '标题长度不能超过 64 字符';
        }
        if(formInfo.keyWords.length > 128) {
            return '关键字长度不能超过 128 字符';
        }
        if(formInfo.desc.length > 1024) {
            return '简述过长';
        }
        
        // 便签不能含有“,”号
        if(formInfo.tags.filter(item => item.indexOf(',') !== -1).length) {
            return '便签不能含有“,”号';
        }
        
        return false;
    }
    
    /**
     * 获取文章列表
     * @param formInfo
     * @returns {Promise<void>}
     */
    async getPostList(formInfo) {
        formInfo.pageId = formInfo.pageId || 0;
        formInfo.pageSize = formInfo.pageSize || 12;
    
        let pagerSql = DbUtil.getPagerSqlStr(formInfo);
    
        if(pagerSql === null) {
            return Promise.reject({
                code: CODE.ERROR,
                message: '分页参数错误'
            })
        }
    
        let sql = `select p.id, p.title, p.key_words, p.up_vote, p.down_vote, p.access_count,
                       p.comment_check, p.create_time, u.username,
                       pc.name as category_name, pt.tags
                   from posts p
                       left join users u on u.id = p.user_id
                       left join post_category pc on pc.id = p.post_category_id
                       left join (select post_id, string_agg(name, ',') as tags from post_tags group by post_id) pt on pt.post_id = p.id
                   where 1 = 1`;
        let conditionSql = ` and p.status != -1 `;
        let orderBySql = ` order by create_time desc `;
        let params = [];
    
        let searchParams = formInfo.q;
        // 搜索参数
        if(searchParams) {
            let index = 0;
            // title // 标题
            if(!Misc.isNullStr(searchParams.title)) {
                sql += ` and p.title like $${ ++index } `;
                params.push(`%${ searchParams.title }%`);
            }
            // categoryName // 分类名
            if(!Misc.isNullStr(searchParams.categoryName)) {
                sql += ` and pc.name like $${ ++index } `;
                params.push(`%${ searchParams.categoryName }%`);
            }
            // keyWords // 关键字
            if(!Misc.isNullStr(searchParams.keyWords)) {
                sql += ` and p.key_words like $${ ++index } `;
                params.push(`%${ searchParams.keyWords }%`);
            }
            // tag // 标签
            if(!Misc.isNullStr(searchParams.tag)) {
                sql += ` and pt.tags like $${ ++index } `;
                params.push(`%${ searchParams.tag }%`);
            }
            // text // 内容
            if(!Misc.isNullStr(searchParams.text)) {
                sql += ` and p.plain_text like $${ ++index } `;
                params.push(`%${ searchParams.text }%`);
            }
        }
        
        // 分页
        const dataSql = sql + conditionSql + orderBySql + pagerSql;
        
        Logger.info(`get post list form info =>`, formInfo);
        Logger.info(`get post list sql info =>`, `sql => ${ dataSql }`, `params =>`, params);
        
        const client = await pool.connect();
    
        try {
            let rsPromise = client.query(dataSql, params);
            let countPromise = client.query(`select count(1) as num from (${ sql + conditionSql }) as tmp`, params);
    
            let rs = await rsPromise;
            let count = await countPromise;
    
            return Promise.resolve({
                code: CODE.SUCCESS,
                list: rs.rows,
                pageId: formInfo.pageId,
                pageSize: formInfo.pageSize,
                totalCount: Number(count.rows[0]['num']),
            });
        }catch(e) {
            Logger.error(`get post list on error => `, e);
            
            return Promise.reject({
                code: CODE.ERROR,
                message: '添加文章列表失败'
            });
        }finally {
            client.release();
        }
    }
    
    /**
     * 添加一个文章
     * @param formInfo
     * @return {Promise.<void>}
     */
    async addPost(formInfo) {
        let errMsg = Post.validateAddEditForm(formInfo);
        if(errMsg) {
            return Promise.reject({
                code: CODE.ERROR,
                message: errMsg
            });
        }
        const postSql = `insert into posts (
                user_id,
                post_category_id,
                title,
                content,
                markdown,
                plain_text,
                content_desc,
                key_words,
                comment_check
            ) values (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            ) returning id`;
        
        const postParams = [
            formInfo['userId'],
            formInfo['categoryId'],
            formInfo['title'],
            formInfo['html'],
            formInfo['markdown'],
            formInfo['text'],
            formInfo['desc'],
            formInfo['keyWords'],
            formInfo['commentCheck'] ? 1 : 0,
        ];
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            // 文章
            let rs = await client.query(postSql, postParams);
            let postId = rs.rows[0].id;
            let values = [];
            
            formInfo.tags.map(item => {
                values.push([postId, item]);
            });
            
            let tagSql = format('insert into post_tags (post_id, name) values %L', values);
            await client.query(tagSql);
            // 标签
            await client.query('COMMIT');
            
            return Promise.resolve({
                code: CODE.SUCCESS,
                info: postId
            })
        }catch(e) {
            await client.query('ROLLBACK');
    
            Logger.error(`add post on error => `, e);
            return Promise.reject({
                code: CODE.ERROR,
                message: '添加文章失败'
            });
        }finally {
            client.release();
        }
    }
}

module.exports = Post;
