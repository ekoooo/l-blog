let format = require('pg-format');
const { pool } = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Misc = require('../../utils/misc');

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
        
        return false;
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
