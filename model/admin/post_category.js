const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Misc = require('../../utils/misc');
let DbUtil = require('../../utils/db_util');

class PostCategory {
  constructor() {
  
  }
  
  /**
   * 验证添加分类和编辑分类时的表单内容
   * @param formInfo
   * @return string|boolean 是否有错误，有错误则返回错误消息
   */
  static validAddEditForm(formInfo) {
    if(Misc.isNullStr(formInfo.postCategoryName)) {
      return '分类名称不能为空';
    }

    if(formInfo.postCategoryName.length > 32) {
      return '分类名称不能超过 32 字符';
    }
    
    if(!Misc.isNullStr(formInfo.orderBy) && !Misc.validInt(formInfo.orderBy, 4)) {
      return '排序必须为整数字';
    }
    
    return false;
  }
  
  /**
   * 是否存在这个名称
   * @param name
   * @param id 编辑时传入验证除这个ID之外是否有其他相同的名称
   * @returns {Promise<boolean>} 存在 true, 不存在 false
   */
  async isExistName(name, id) {
    const client = await Pgsql.pool.connect();
    
    let sql = `select count(1)::int as num from post_category where status <> 0 and name = $1 `;
    let params = [name];
    
    if(!Misc.isNullStr(id)) {
      sql += ` and id <> $2 `;
      params.push(id);
    }
    
    try {
      let { rows } = await client.query(sql, params);
      
      if(rows[0]['num'] !== 0) {
        return true;
      }
    }catch (e) {
      Logger.error(`check is exist name on error => `, e);

      throw new Error(e);
    }finally {
      client.release();
    }
    
    return false;
  }
  
  /**
   * 获取文章分类下拉数据
   */
  async getPostCategorySelector() {
    let sql = `select id, name from post_category
      where status = 1
      order by order_by asc, create_time desc`;

    const client = await Pgsql.pool.connect();

    try {
      let rs = await client.query(sql);

      return Promise.resolve({
        code: CODE.SUCCESS,
        info: rs.rows,
      });
    }catch(e) {
      Logger.error(`get post category selector data on error => `, e);

      return Promise.reject({
        code: CODE.ERROR,
        message: '文章分类下拉数据失败'
      });
    }finally {
      client.release();
    }
  }
  
  /**
   * 获取文章分类列表
   * @returns {Promise<list>}
   */
  getPostCategory(formInfo) {
    return new Promise((resolve, reject) => {
      formInfo.pageId = formInfo.pageId || 0;
      formInfo.pageSize = formInfo.pageSize || 12;

      let pagerSql = DbUtil.getPagerSqlStr(formInfo);
      
      if(pagerSql === null) {
        reject({
          code: CODE.ERROR,
          message: '分页参数错误'
        })
      }
      
      let sql = ` select * from post_category where 1 = 1 `;
      let conditionSql = ` and status = 1 `;
      let orderBySql = ` order by order_by asc, create_time desc `;

      let params = [];

      // 搜索参数
      if(formInfo.q) {
        if(!Misc.isNullStr(formInfo.q.postCategoryName)) {
          conditionSql += `and name like $1 `;
          params.push(`%${ formInfo.q.postCategoryName }%`);
        }
      }

      // 分页
      sql = sql + conditionSql + orderBySql + pagerSql;

      Logger.info(`get post category list form info =>`, formInfo);
      Logger.info(`get post category list sql info =>`, `sql => ${ sql }`, `params =>`, params);

      Promise.all([
        new Promise(function (resolve) {
          Pgsql.pool.connect().then(client => {
            client.query(sql, params).then(rs => {
              client.release();
              resolve(rs.rows);
            }).catch(error => {
              Logger.error(`get post category on error =>`, error);
              
              client.release();
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
        });
      });
    });
  }
  
  /**
   * 文章分类
   * @param formInfo
   * @returns {Promise<id>}
   */
  async addPostCategory(formInfo) {
    // 验证
    let errorMsg = PostCategory.validAddEditForm(formInfo);

    if(errorMsg) {
      return Promise.reject({
        code: CODE.ERROR,
        message: errorMsg
      });
    }
    
    const client = await Pgsql.pool.connect();
    
    try {
      let isExist = await this.isExistName(formInfo.postCategoryName);
      // 验证是否存在名称
      if(isExist) {
        return Promise.reject({
          code: CODE.ERROR,
          message: '添加分类名已存在'
        })
      }
      
      const sql = `insert into post_category (name, order_by) values ($1, $2) returning id`;
      const params = [formInfo.postCategoryName, formInfo.orderBy || 0];
      const rs = await client.query(sql, params);

      return Promise.resolve({
        code: CODE.SUCCESS,
        info: rs.rows[0].id,
      });
    }catch (e) {
      Logger.error(`add post category on error => `, error, `form info =>`, formInfo);
      
      return Promise.reject({
        code: CODE.ERROR,
        message: '添加分类名称失败'
      });
    }finally {
      client.release();
    }
  }
  
  /**
   * 编辑文章分类
   * @param id
   * @param formInfo
   * @returns {Promise.<void>}
   */
  async editPostCategory(id, formInfo) {
    if(!Misc.validInt(id, 1)) {
      return Promise.reject({
        code: CODE.ERROR,
        message: '文章分类不存在'
      });
    }

    // 验证表单
    let errorMsg = PostCategory.validAddEditForm(formInfo);

    if(errorMsg) {
      return Promise.reject({
        code: CODE.ERROR,
        message: errorMsg
      });
    }

    const client = await Pgsql.pool.connect();
    
    try {
      let isExist = await this.isExistName(formInfo.postCategoryName, id);
      // 验证是否存在名称
      if(isExist) {
        return Promise.reject({
          code: CODE.ERROR,
          message: '添加分类名已存在'
        })
      }
      
      let sql = `update post_category set name = $1, order_by = $2 where status = 1 and id = $3 `;
      let params = [formInfo.postCategoryName, formInfo.orderBy || 0, id];
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
      Logger.error(`edit post category on error => `, e, `formInfo =>`, formInfo);

      return Promise.reject({
        code: CODE.ERROR,
        message: '编辑文章分类失败'
      });
    }finally {
      client.release();
    }
  }
  
  /**
   * 根据 ID 软删除文章分类记录
   * @param id 表 ID
   */
  async delPostCategoryById(id) {
    if(Misc.isNullStr(id)) {
      return Promise.reject({
        code: CODE.ERROR,
        message: '参数不存在'
      });
    }

    const client = await Pgsql.pool.connect();
    
    try {
      // 验证是否已经被使用
      let { rows } = await client.query(`select count(1)::int as num from posts where status <> -1 and post_category_id = $1`, [id]);
      
      if(rows[0]['num'] !== 0) {
        return Promise.reject({
          code: CODE.ERROR,
          message: '该文章分类已被使用'
        });
      }
      
      let rs = await client.query(`update post_category set status = 0 where status <> 0 and id = $1 `, [id]);
      
      if(rs.rowCount === 0) {
        return Promise.reject({
          code: CODE.ERROR,
          message: '文章分类不存在'
        });
      }else {
        return Promise.resolve({
          code: CODE.SUCCESS,
          info: Number(id)
        });
      }
    }catch(e) {
      Logger.error(`delete post category on error => `, e, `id info =>`, id);
      
      return Promise.reject({
        code: CODE.ERROR,
        message: '删除文章分类失败'
      });
    }finally {
      client.release();
    }
  }
}

module.exports = PostCategory;