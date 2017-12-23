const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');

class Access {
    constructor() {
    
    }
    
    /**
     * 增加一条文章访问记录
     * @param postId 文章 ID
     * @param req
     * @param inc 是否增加文章表访问数量
     * @returns {Promise<void>}
     */
    async addPostAccess(postId, req, inc = true) {
        const client = await Pgsql.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const sql = `insert into post_access (post_id, create_ip, user_agent) values ($1, $2, $3)`;
            const params = [postId, req.ip, req.headers['user-agent']];
            const rs = client.query(sql, params);
            
            if(inc) {
                const sql2 = `update posts set access_count = access_count + 1 where id = $1`;
                const params2 = [postId];
                const rs2 = client.query(sql2, params2);
                await rs2;
            }
    
            await rs;
            
            await client.query('COMMIT');
            
            return Promise.resolve({
                code: CODE.SUCCESS,
                message: '添加日志访问记录成功'
            });
        }catch (e) {
            await client.query('ROLLBACK');
            
            Logger.error(`add post access log on error => `, e);
            return Promise.reject({
                code: CODE.ERROR,
                message: '添加日志访问记录失败'
            });
        }finally {
            client.release();
        }
    }
}

module.exports = Access;