const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Misc = require('../../utils/misc');
let DbUtil = require('../../utils/db_util');

class SysConfig {
    constructor() {
    
    }
    
    /**
     * 检验添加编辑表单
     * @param formInfo
     */
    static validAddEditForm(formInfo) {
        // 验证
        if(Misc.isNullStr(formInfo.key)
            || Misc.isNullStr(formInfo.val)
            || Misc.isNullStr(formInfo.description)) {
            return '请输入必填值！';
        }
        if(formInfo.key.length > 64) {
            return '配置键不得超过 64 位！';
        }
        if(formInfo.val.length > 1024) {
            return '配置值不得超过 1024 位！';
        }
        if(!Misc.isNullStr(formInfo.extraVal) &&
            formInfo.extraVal.length > 256) {
            return '备用值不得超过 256 位！';
        }
        if(formInfo.description.length > 128) {
            return '描述不得超过 128 位！';
        }
    
        return false;
    }
    
    /**
     * 检测是否存在 key, 当编辑时传入 id 即可, 则排除该 id 以外检测
     * @param key
     * @param id
     * @return {Promise.<boolean>}
     */
    async isExistKey(key, id) {
        let sql = `select count(1)::int as num from sys_config where key = $1 `;
        let params = [key];
        
        if(!Misc.isNullStr(id)) {
            sql += ` and id <> $2 `;
            params.push(id);
        }
        
        const client = await Pgsql.pool.connect();
        
        try {
            let { rows } = await client.query(sql, params);
    
            if(rows[0]['num'] !== 0) {
                return true;
            }
        }catch (e) {
            Logger.error(`add sys config on error => `, error, `form info =>`, formInfo);
            throw new Error(e);
        }finally {
            client.release();
        }
        return false;
    }
    
    async getSysConfigByKey(key) {
        const sql = `select * from sys_config where key = $1 `;
        let params = [key];
    
        const client = await Pgsql.pool.connect();
    
        try {
            let rs = await client.query(sql, params);
        
            if(rs.rowCount === 0) {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: '配置不存在'
                });
            }
        
            let info = rs.rows[0];
        
            return Promise.resolve({
                code: CODE.SUCCESS,
                info: info
            });
        }catch (e) {
            Logger.error(`get sysconfig by key on error => `, e);
        
            return Promise.reject({
                code: CODE.ERROR,
                message: '获取配置失败'
            });
        }finally {
            client.release();
        }
    }
    
    /**
     * 获取配置列表数据
     * @param formInfo
     * @return {Promise.<*>}
     */
    async getSysConfigList(formInfo) {
        formInfo.pageId = formInfo.pageId || 0;
        formInfo.pageSize = formInfo.pageSize || 12;
        
        let pagerSql = DbUtil.getPagerSqlStr(formInfo);
        
        if(pagerSql === null) {
            return Promise.reject({
                code: CODE.ERROR,
                message: '分页参数错误'
            })
        }
        
        let sql = `select * from sys_config where 1 = 1 `;
        let conditionSql = ``;
        let orderBySql = ` order by create_time desc `;
        let params = [];
        let searchParams = formInfo.q;
        
        if(searchParams) {
            let index = 0;
            
            // 配置键
            if(!Misc.isNullStr(searchParams.key)) {
                conditionSql += ` and key like $${ ++index } `;
                params.push(`%${ searchParams.key }%`);
            }
            
            // 配置值
            if(!Misc.isNullStr(searchParams.val)) {
                conditionSql += ` and val like $${ ++index } `;
                params.push(`%${ searchParams.val }%`);
            }
            
            // 描述
            if(!Misc.isNullStr(searchParams.description)) {
                conditionSql += ` and description like $${ ++index } `;
                params.push(`%${ searchParams.description }%`);
            }
            
            // 描述
            if(!Misc.isNullStr(searchParams.status)) {
                conditionSql += ` and status = $${ ++index } `;
                params.push(searchParams.status);
            }
        }
        
        // 分页
        const dataSql = sql + conditionSql + orderBySql + pagerSql;
        
        Logger.info(`get sys config list form info =>`, formInfo);
        Logger.info(`get sys config list sql info =>`, `sql => ${ dataSql }`, `params =>`, params);
        
        const client = await Pgsql.pool.connect();
        
        try {
            let rsPromise = client.query(dataSql, params);
            let countPromise = client.query(`select count(1)::int as num from (${ sql + conditionSql }) as tmp`, params);
            let rs = await rsPromise;
            let count = await countPromise;
            
            return Promise.resolve({
                code: CODE.SUCCESS,
                list: rs.rows,
                pageId: formInfo.pageId,
                pageSize: formInfo.pageSize,
                totalCount: count.rows[0]['num'],
            });
        }catch(e) {
            Logger.error(`get sys config list on error => `, e);
            
            return Promise.reject({
                code: CODE.ERROR,
                message: '获取系统配置列表失败'
            });
        }finally {
            client.release();
        }
    }
    
    /**
     * 添加一条配置值
     * @param formInfo
     * @return {Promise.<*>}
     */
    async addSysConfig(formInfo) {
        let errorMsg = SysConfig.validAddEditForm(formInfo);
        if(errorMsg) {
            if(errorMsg) {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: errorMsg
                });
            }
        }
        
        const client = await Pgsql.pool.connect();
        
        try {
            // 检测
            let isExist = await this.isExistKey(formInfo.key, null);
            // 验证是否存在名称
            if(isExist) {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: '配置键已存在'
                });
            }
            
            const sql = `insert into sys_config
                (key, val, extra_val, description, status) values
                ($1, $2, $3, $4, $5) returning id`;
            const params = [
                formInfo.key,
                formInfo.val,
                formInfo.extraVal,
                formInfo.description,
                formInfo.status
            ];
            
            const rs = await client.query(sql, params);
    
            return Promise.resolve({
                code: CODE.SUCCESS,
                info: rs.rows[0].id,
            });
        }catch (e) {
            Logger.error(`add sys config on error => `, error, `form info =>`, formInfo);
        
            return Promise.reject({
                code: CODE.ERROR,
                message: '添加配置失败'
            });
        }finally {
            client.release();
        }
    }
    
    /**
     * 编辑一条配置值
     * @param id
     * @param formInfo
     * @return {Promise.<void>}
     */
    async editSysConfig(id, formInfo) {
        let errorMsg = SysConfig.validAddEditForm(formInfo);
        if(errorMsg) {
            if(errorMsg) {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: errorMsg
                });
            }
        }
    
        const client = await Pgsql.pool.connect();
        
        try {
            // 检测
            let isExist = await this.isExistKey(formInfo.key, id);
            // 验证是否存在名称
            if(isExist) {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: '配置键已存在'
                });
            }
    
            let sql = `update sys_config set
                    key = $1,
                    val = $2,
                    extra_val = $3,
                    description = $4,
                    status = $5
                where id = $6`;
            const params = [
                formInfo.key,
                formInfo.val,
                formInfo.extraVal,
                formInfo.description,
                formInfo.status,
                id,
            ];
            
            let rs = await client.query(sql, params);
    
            if(rs.rowCount === 0) {
                return Promise.reject({
                    code: CODE.ERROR,
                    message: '编辑条数不存在'
                });
            }else {
                return Promise.resolve({
                    code: CODE.SUCCESS,
                    message: id
                });
            }
        }catch (e) {
            Logger.error(`edit sys config on error => `, error, `form info =>`, formInfo);
        
            return Promise.reject({
                code: CODE.ERROR,
                message: '编辑配置失败'
            });
        }finally {
            client.release();
        }
    }
}

module.exports = SysConfig;