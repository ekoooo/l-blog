const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');

class Common {
  constructor() {
  
  }
  
  /**
   * 日志数量
   * 分类数量
   * 标签数量
   * // 下面先写死，之后写到数据库中
   * 中文名
   * 英文名
   * 我的链接
   * 友情链接
   * /sidebar
   * 获取 sidebar 中的信息
   * @return {Promise.<void>}
   */
  async getSidebarInfo() {
    let client = await Pgsql.pool.connect();
    
    try {
      const countSlq = `select
        (select count(1) from posts where status = 1)::int as post_num,
        (select count(1) from post_category where status = 1)::int as post_category_num,
        (select count(distinct name) from post_tags)::int as post_tag_num`;

      const countInfo = await client.query(countSlq);
      
      return Promise.resolve({
        code: CODE.SUCCESS,
        info: {
          ...countInfo.rows[0],
          en_name: 'liuwanlin',
          ch_name: '刘万林',
          links: [{
            label: 'Github',
            href: 'https://github.com/ekoooo',
          }, {
            label: 'Weibo',
            href: 'https://weibo.com/ssycssj',
          }],
          friends_links: [{
            label: 'Baidu',
            href: 'https://www.baidu.com/',
          }, {
            label: 'Google',
            href: 'https://www.google.com/',
          }, {
            label: 'Gov',
            href: 'http://www.gov.cn/',
          }],
        }
      })
    }catch(e) {
      Logger.error(`get sidebar info on error => `, e);

      return Promise.reject({
        code: CODE.ERROR,
        message: '获取信息失败'
      });
    }finally {
      client.release();
    }
  }
}

module.exports = Common;