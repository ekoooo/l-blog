const { pool } = require('../common/pgsql');
let Logger = require('../common/logger');

let DBUtil = {
    /**
     * 获取序列的下一个值
     * @param name 如果是 isTableName = true, 则自动拼接成 seq_表名_id
     * @param isTableName 参数 name 是否为表名
     */
    getNextVal: (name, isTableName = true) => new Promise((resolve, reject) => {
        let seqName = isTableName ? `seq_${name}_id` : name;

        pool.connect().then(client => {
            client.query(`select nextval($1::text) as seq`, [seqName]).then(rs => {
                client.release();
                Logger.info(`getNextVal('${ name }', '${ isTableName }') successed`, seqName, rs.rows[0].seq);

                resolve(rs.rows[0].seq);
            }).catch(e => {
                client.release();
                Logger.warn(`getNextVal('${ name }', '${ isTableName }') error`, e.message, e.stack);
                
                reject(e.message);
            });
        });
    }),
    
    /**
     * 获取一张表的记录条数
     * @param tableName 表名
     * @param condition 条件 Sql String
     * @param params 参数
     */
    getTotalCount: (tableName, condition = '', params = []) => new Promise((resolve, reject) => {
        let sql = ` select count(1) as num from ${ tableName } where 1 = 1 ${ condition } `;
        
        pool.connect().then(client => {
            client.query(sql, params).then(rs => {
                client.release();
                Logger.info(`getTotalCount('${ tableName }') successed`, rs.rows[0]['num']);
                
                resolve(parseInt(rs.rows[0]['num']));
            }).catch(e => {
                client.release();
                Logger.warn(`getTotalCount('${ tableName }') error`, e.message, e.stack);
            
                reject(e.message);
            });
        });
    }),
    
    /**
     * 获取分页语句
     * @param pageId 第几页，从 0 开始数
     * @param pageSize 一页显示多少条数据
     */
    getPagerSqlStr: ({ pageId, pageSize }) => {
        return ` limit ${pageSize} offset ${ pageId * pageSize } `;
    }
};

module.exports = DBUtil;