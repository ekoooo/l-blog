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
                Logger.info('获取下一个序列：', seqName, rs.rows[0].seq);

                resolve(rs.rows[0].seq);
            }).catch(e => {
                client.release();
                Logger.warn('获取下一个序列：', e.message, e.stack);
                
                reject(e.message);
            });
        });
    }),
};

module.exports = DBUtil;