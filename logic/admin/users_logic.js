const { pool } = require('../../common/pgsql');
var Logger = require('../../common/logger');
var Token = require('../../common/token');
var Pwd = require('../../common/pwd');
var DbUtil = require('../../utils/db_util');

var UsersLogic = {
    /**
     * 添加测试管理员
     */
    _addTestAdmin () {
        Pwd.hash('123456').then(hash => {
            (async () => {
                const client = await pool.connect();

                const usersSqlStr = `insert into users (username, password, is_admin) 
                        values ($1, $2, $3) returning id`;
                const userProfileSqlStr = `insert into user_profile 
                        (user_id, gender, age, phone, mail, description) 
                        values ($1, $2, $3, $4, $5, $6)`;

                try {
                    await client.query('BEGIN');

                    const rs = await client.query(usersSqlStr, ['lwl', hash, 1]);

                    await client.query(userProfileSqlStr, [rs.rows[0].id, 1, 24, '15727781885', '954408050@qq.com', '测试账号，密码 123456'])

                    await client.query('COMMIT');

                    Logger.debug('测试用户插入完成！');
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    client.release();
                }
            })().catch(e => Logger.error(e.stack));
        });
    },

    /**
     * 获取全部用户信息的 SQL 语句
     */
    GET_ALL_SQL: `select u.id as user_id, up.id as user_profile_id, * from users u
            left join user_profile up on u.id = up.user_id `,

    /**
     * 根据 users 表 id 获取信息
     */
    getInfoById: (id) => new Promise((resolve, reject) => {
        pool.connect().then(client => {
            client.query(`${ UsersLogic.GET_ALL_SQL } where u.id = $1`, [id]).then(rs => {
                resolve(rs.rows);
            }).catch(error => reject(error));
        });
    }),

    /**
     * 根据 users 表 username 获取信息
     */
    getInfoByUserName: (username) => new Promise((resolve, reject) => {
        pool.connect().then(client => {
            client.query(`${ UsersLogic.GET_ALL_SQL } where u.username = $1`, [username]).then(rs => {
                resolve(rs.rows);
            }).catch(error => reject(error));
        });
    }),
};

module.exports = UsersLogic;