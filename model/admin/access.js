const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let DbUtil = require('../../utils/db_util');
let Misc = require('../../utils/misc');
let moment = require('moment');

class Access {
  constructor() {
  
  }
  
  /**
   * admin/post/access/list
   * 获取文章访问记录
   * @param formInfo
   * @returns {Promise<*>}
   */
  async getPostAccessList(formInfo) {
    formInfo.pageId = formInfo.pageId || 0;
    formInfo.pageSize = formInfo.pageSize || 12;

    let pagerSql = DbUtil.getPagerSqlStr(formInfo);

    if(pagerSql === null) {
      return Promise.reject({
        code: CODE.ERROR,
        message: '分页参数错误'
      })
    }
    
    let sql = `select pa.id, pa.post_id, pa.create_ip, pa.user_agent, pa.create_time,
        p.title, u.username, u.nickname
      from post_access pa
        left join posts p on p.id = pa.post_id
        left join users u on u.id = p.user_id
      where 1 = 1 `;

    let conditionSql = ``;
    let orderBySql = ` order by pa.create_time desc `;
    let params = [];
    let searchParams = formInfo.q;

    if(searchParams) {
      let index = 0;
  
      // 标题
      if(!Misc.isNullStr(searchParams.title)) {
        conditionSql += ` and p.title like $${ ++index } `;
        params.push(`%${ searchParams.title }%`);
      }
      
      if(!Misc.isNullStr(searchParams.postId)) {
        conditionSql += ` and pa.post_id = $${ ++index } `;
        params.push(searchParams.postId);
      }
      if(!Misc.isNullStr(searchParams.createIp)) {
        conditionSql += ` and pa.create_ip = $${ ++index } `;
        params.push(searchParams.createIp);
      }
      if(!Misc.isNullStr(searchParams.userAgent)) {
        conditionSql += ` and pa.user_agent ilike $${ ++index } `;
        params.push(`%${ searchParams.userAgent }%`);
      }
    }

    // 分页
    const dataSql = sql + conditionSql + orderBySql + pagerSql;

    Logger.info(`get post access list form info =>`, formInfo);
    Logger.info(`get post access list sql info =>`, `sql => ${ dataSql }`, `params =>`, params);

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
      Logger.error(`get user list on error => `, e);
  
      return Promise.reject({
        code: CODE.ERROR,
        message: '获取文章访问列表失败'
      });
    }finally {
      client.release();
    }
  }


  /**
   * 格式化 获取文章访问记录统计 数据
   */
  formatPostAccessChartData(list, day) {
    let currentDate = moment();
    let ret = [];
    let listMap = {};
    let itemDay;

    for(let i = 0; i < list.length; i++) {
      let temp = moment(list[i].day).format('YYYY-MM-DD');
      
      listMap[temp] = {
        day: temp,
        num: list[i].num,
      }
    }

    for(let i = 0; i < day; i++) {
      itemDay = currentDate.format('YYYY-MM-DD');

      if(listMap[itemDay]) {
        ret.push(listMap[itemDay]);
      }else {
        ret.push({
          day: itemDay,
          num: 0,
        });
      }

      currentDate.subtract(1, 'day');
    }

    return ret;
  }

  /**
   * admin/post/access/chart
   * 获取文章访问记录统计
   * @param postId
   * @param day 最近几天
   */
  async getPostAccessChartData({ postId, day }) {
    if(Misc.isNullStr(postId) || Misc.isNullStr(day)) {
      return Promise.reject({
        code: CODE.ERROR,
        message: '参数错误'
      });
    }

    if(!Misc.validInt(day, 1)) {
      return Promise.reject({
        code: CODE.ERROR,
        message: '请传入正确的统计天数'
      });
    }

    day = parseInt(day);

    const sql = `SELECT 
        date_trunc('day', pa.create_time) as "day", count(pa.id)::int as num 
      from post_access pa 
      where 
        pa.create_time between (current_date - interval '${ day - 1 } day') and CURRENT_TIMESTAMP and
        pa.post_id = $1
      GROUP BY "day"
      ORDER BY "day" desc`;

    const params = [postId];

    const client = await Pgsql.pool.connect();

    try {
      let rs = await client.query(sql, params);
      
      return Promise.resolve({
        code: CODE.SUCCESS,
        list: this.formatPostAccessChartData(rs.rows, day),
      });
    }catch (e) {
      Logger.error(`get post access chart data on error => `, e);

      return Promise.reject({
        code: CODE.ERROR,
        message: '获取文章访问统计失败'
      });
    }finally {
      client.release();
    }
  }
}

module.exports = Access;