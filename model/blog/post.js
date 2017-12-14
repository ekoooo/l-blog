const { pool } = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Misc = require('../../utils/misc');

class Post {
    constructor() {
    
    }
    
    /**
     * 根据ID获取一篇文章
     * @param id
     * @returns {Promise<void>}
     */
    async getPostById(id) {
        if(Misc.isNullStr(id) || !Misc.validInt(id, 1)) {
            return Promise.reject({
                code: CODE.ERROR,
                message: '参数错误'
            });
        }
    
        const sql = `select
                        p.title,
                        p.content,
                        p.content_desc_plain_text,
                        p.key_words,
                        p.up_vote,
                        p.down_vote,
                        p.access_count,
                        p.update_time,
                        pc.name as post_category_name,
                        pt.tags
                    from posts p
                        left join post_category pc on pc.id = p.post_category_id
                        left join (select post_id, string_agg(name, ',') as tags from post_tags group by post_id) pt on pt.post_id = p.id
                    where p.status = 1 and p.id = $1`;
    
        let client = await pool.connect();
    
        try {
            let rs = await client.query(sql, [id]);
        
            if(rs.rowCount === 0) {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: '文章不存在'
                });
            }
        
            let info = rs.rows[0];
        
            return Promise.resolve({
                code: CODE.SUCCESS,
                info: {
                    title: info['title'],
                    content: info['content'],
                    descText: info['content_desc_plain_text'],
                    keyWords: info['key_words'],
                    upVote: info['up_vote'],
                    downVote: info['down_vote'],
                    accessCount: info['access_count'],
                    updateTime: info['update_time'],
                    postCategoryName: info['post_category_name'],
                    tags: info['tags'],
                }
            });
        }catch (e) {
            Logger.error(`get post by id on error => `, e);
        
            return Promise.reject({
                code: CODE.ERROR,
                message: '获取文章列表失败'
            });
        }finally {
            client.release();
        }
    }
}

module.exports = Post;
