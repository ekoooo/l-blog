const { pool } = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');

class PostTag {
    constructor() {
    
    }
    
    /**
     * 获取标签下拉数据
     * @return {Promise.<void>}
     */
    async getTagSelector() {
        let client = null;
        try {
            client = await pool.connect();
            let rs = await client.query(`select distinct name from post_tags order by name`);
            
            return Promise.resolve({
                code: CODE.SUCCESS,
                info: rs.rows,
            });
        }catch(e) {
            Logger.error(`get post tag selector data on error => `, e);
        
            return Promise.reject({
                code: CODE.ERROR,
                message: '文章标签拉数据失败'
            });
        }finally {
            client && client.release();
        }
    }
}

module.exports = PostTag;
