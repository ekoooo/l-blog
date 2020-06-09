const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Misc = require('../../utils/misc');
let DbUtil = require('../../utils/db_util');

class Post {
  constructor() {
  
  }
  
  // 主页文章 pagesize
  static get POST_LIST_PAGE_SIZE() {
    return 10;
  }
  
  /**
   * 所有已发布文章的 id 以及 totalPage
   * @return {Promise.<void>}
   */
  async getPostIdInfo() {
    const client = await Pgsql.pool.connect();
    
    try {
      let rs = await client.query('select id from posts where status = 1');

      const pageSize = Post.POST_LIST_PAGE_SIZE;
      return Promise.resolve({
        code: CODE.SUCCESS,
        info: {
          ids: rs.rows,
          totalPage: parseInt((rs.rowCount + pageSize - 1) / pageSize)
        }
      });
    }catch(e) {
      Logger.error(`get post id info on error => `, e);

      return Promise.reject({
        code: CODE.ERROR,
        message: '获取文章信息数据失败'
      });
    }finally {
      client.release();
    }
  }
  
  /**
   * 获取文章列表（首页）
   * @param pageId
   * @param q 搜索参数
   * @return {Promise.<void>}
   */
  async getPostList(pageId, q) {
    if(!Misc.validInt(pageId, 4)) {
      // 默认
      pageId = 0;
    }

    const pageSize = Post.POST_LIST_PAGE_SIZE;
    
    let pagerSql = DbUtil.getPagerSqlStr({
      pageId: pageId,
      pageSize: pageSize
    });

    let sql = `select 
        p.key_words, p.id, p.title, p.create_time, pc.name as category_name, 
        p.up_vote, p.down_vote, p.access_count, pt.tags, p.content_desc,
        coalesce(pcs.comment_num, 0) as comment_num
      from posts p
        left join users u on u.id = p.user_id
        left join post_category pc on pc.id = p.post_category_id
        left join (select post_id, string_agg(name, ',') as tags from post_tags group by post_id) pt on pt.post_id = p.id
        left join (select post_id, count(id) as comment_num from post_comments where status = 1 group by post_id) pcs on pcs.post_id = p.id
      where 1 = 1 `;

    let conditionSql = ` and p.status = 1 and p.id > 0 `;
    let orderBySql = ` order by create_time desc `;
    let params = [];
    
    if(q) { // 搜索参数
      let index = 0;

      // 关键字搜索：文章标题、文章内容、描述、关键字、标签
      if(!Misc.isNullStr(q.keyWord)) {
        // ilike 忽略大小写
        conditionSql += ` and (
          p.title ilike $${ ++index } or 
          p.plain_text ilike $${ ++index } or 
          p.content_desc_plain_text ilike $${ ++index } or 
          p.key_words ilike $${ ++index } or
          pt.tags ilike $${ ++index }
        ) `;

        let likeKeyWord = `%${q.keyWord}%`;

        params.push(likeKeyWord, likeKeyWord, likeKeyWord, likeKeyWord, likeKeyWord);
      }

      // 标签精确搜索
      if(!Misc.isNullStr(q.tag)) {
        conditionSql += ` and string_to_array(pt.tags, ',') @> ARRAY [ $${ ++index } ]`;
        params.push(q.tag);
      }
      
      // 分类搜索
      if(!Misc.isNullStr(q.categoryId) && Misc.validInt(q.categoryId, 4)) {
        conditionSql += ` and pc.id = $${ ++index } `;
        params.push(q.categoryId);
      }
    }
    
    // 分页
    const dataSql = sql + conditionSql + orderBySql + pagerSql;

    Logger.info(`blog index sql info =>`, `sql => ${ dataSql }`, `params =>`, params);

    const client = await Pgsql.pool.connect();
    
    try {
      let rsPromise = client.query(dataSql, params);
      let countPromise = client.query(`select count(1)::int as num from (${ sql + conditionSql }) as tmp`, params);
  
      let rs = await rsPromise;
      let count = await countPromise;
  
      return Promise.resolve({
        code: CODE.SUCCESS,
        list: rs.rows,
        pageId: pageId,
        pageSize: pageSize,
        totalCount: count.rows[0]['num'],
        q: q,
      });
    }catch(e) {
      Logger.error(`get post list on error => `, e);
  
      return Promise.reject({
        code: CODE.ERROR,
        message: '获取文章列表失败'
      });
    }finally {
      client.release();
    }
  }
  
  /**
   * 根据ID获取一篇文章
   * @param id
   * @param ip
   * @returns {Promise<void>}
   */
  async getPostById(id, ip) {
    if(Misc.isNullStr(id) || !Misc.validInt(id, 1)) {
      return Promise.reject({
        code: CODE.ERROR,
        message: '参数错误'
      });
    }

    const sql = `select
        p.id,
        p.title,
        p.content,
        p.content_desc_plain_text,
        p.key_words,
        p.up_vote,
        p.down_vote,
        p.access_count,
        p.create_time,
        p.update_time,
        pc.name as category_name,
        pt.tags,
        pv.type as vote_type
      from posts p
        left join post_category pc on pc.id = p.post_category_id
        left join (select post_id, string_agg(name, ',') as tags from post_tags group by post_id) pt on pt.post_id = p.id
        left join post_votes pv on pv.post_id = p.id and pv.create_ip = $2
      where p.status = 1 and p.id = $1`;

    let client = await Pgsql.pool.connect();

    try {
      let rs = await client.query(sql, [id, ip]);
  
      if(rs.rowCount === 0) {
        return Promise.reject({
          code: CODE.ERROR,
          message: '文章不存在'
        });
      }
  
      let info = rs.rows[0];
  
      return Promise.resolve({
        code: CODE.SUCCESS,
        info: info
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

  /**
   * 获取 分类、标签 统计数量
   */
  async getCategoryInfo() {
    let categorySql = `select
        p.post_category_id, pc.name, p.num
      from (select post_category_id, count(id) as num from posts group by post_category_id) as p
      left join post_category pc on pc.id = p.post_category_id
      order by num desc`;

    let tagSql = `select 
        pt.name, count(id) as num 
      from post_tags pt 
      group by pt.name
      order by num desc`;

    const client = await Pgsql.pool.connect();
    
    try {
      let categoryPromise = client.query(categorySql);
      let tagPromise = client.query(tagSql);
    
      const [category, tag] = await Promise.all([
        categoryPromise, tagPromise
      ]);

      return Promise.resolve({
        code: CODE.SUCCESS,
        info: {
          category: category.rows,
          tag: tag.rows
        },
      });
    }catch(e) {
      Logger.error(`get category and tag info on error => `, e);
    
      return Promise.reject({
        code: CODE.ERROR,
        message: '获取分类、标签失败'
      });
    }finally {
      client.release();
    }
  }
}

module.exports = Post;
