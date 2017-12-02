const { pool } = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Misc = require('../../utils/misc');
let DbUtil = require('../../utils/db_util');

class PostCategory {
    constructor() {
    
    }
    
    /**
     * 获取文章分类列表
     * @returns {Promise<list>}
     */
    getPostCategory(formInfo) {
        return new Promise((resolve, reject) => {
            formInfo.pageId = formInfo.pageId || 0;
            formInfo.pageSize = formInfo.pageSize || 12;
    
            let sql = ` select * from post_category where 1 = 1 `;
            let conditionSql = ` and status = 1 `;
            let pagerSql = DbUtil.getPagerSqlStr(formInfo);
    
            let params = [];
    
            // 搜索参数
            if(formInfo.q) {
                if(!Misc.isNullStr(formInfo.q.postCategoryName)) {
                    conditionSql += `and name like $1 `;
                    params.push(`%${ formInfo.q.postCategoryName }%`);
                }
            }
    
            // 分页
            sql = sql + conditionSql + pagerSql;
    
            Logger.info(`getPostCategory()`, formInfo, `sql: `, sql, 'params: ', params);
    
            Promise.all([
                new Promise(function (resolve) {
                    pool.connect().then(client => {
                        client.query(sql, params).then(rs => {
                            client.release();
                            resolve(rs.rows);
                        }).catch(error => {
                            client.release();
                            Logger.warn(`getPostCategory() error!`, error);
                            resolve();
                        });
                    });
                }),
                DbUtil.getTotalCount('post_category', conditionSql, params),
            ]).then((result) => {
                resolve({
                    code: CODE.SUCCESS,
                    list: result[0],
                    pageId: formInfo.pageId,
                    pageSize: formInfo.pageSize,
                    totalCount: result[1],
                });
            }).catch(() => {
                reject({
                    code: CODE.ERROR,
                    message: '获取分类列表失败'
                })
            });
        });
    }
    
    /**
     * 文章分类
     * @param formInfo
     * @returns {Promise<id>}
     */
    addPostCategory(formInfo) {
        return new Promise((resolve, reject) => {
            // 验证
            if(Misc.isNullStr(formInfo.postCategoryName)) {
                resolve({
                    code: CODE.ERROR,
                    message: '分类名称不能为空'
                });
            }
    
            if(formInfo.postCategoryName.length > 32) {
                resolve({
                    code: CODE.ERROR,
                    message: '分类名称不能超过 32 字符'
                });
            }
    
            // 添加到数据库
            pool.connect().then(client => {
                const sql = `insert into post_category (name) values ($1) returning id`;
                const params = [formInfo.postCategoryName];
        
                client.query(sql, params).then(rs => {
                    client.release();
            
                    resolve({
                        code: CODE.SUCCESS,
                        info: rs.rows[0].id,
                    });
                }).catch(error => {
                    client.release();
                    Logger.warn(`addPostCategory() error!`, formInfo, error);
                    reject({
                        code: CODE.ERROR,
                        message: '添加分类名称失败'
                    })
                });
            });
        });
    }
}

module.exports = PostCategory;