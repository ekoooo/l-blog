const Pgsql = require('../../common/pgsql');
const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Misc = require('../../utils/misc');

class PostVote {
  constructor() {
  
  }
  
  /**
   * 文章投票
   * @param postId
   * @param req
   * @param type 1 like -1 unlike
   * @return {Promise.<void>}
   */
  async vote(postId, req, type) {
    if(!Misc.validInt(postId, 4)) {
      return Promise.reject({
        code: CODE.ERROR,
        message: '文章不存在'
      });
    }

    const client = await Pgsql.pool.connect();
    
    try {
      // 验证文章是否存在
      let postRs = await client.query(`select count(1)::int as num
        from posts where status = 1 and id = $1`, [postId]);
      
      if(postRs.rows[0].num !== 1) {
        return Promise.reject({
          code: CODE.ERROR,
          message: '文章不存在'
        });
      }
      // 验证是否已经投过票
      let voteRs = await client.query(`select count(1)::int as num
        from post_votes
        where post_id = $1 and create_ip = $2`, [postId, req.ip]);
      
      if(voteRs.rows[0].num > 0) {
        return Promise.reject({
          code: CODE.ERROR,
          message: '已经投过票'
        });
      }

      await client.query('BEGIN');
      // 增加投票数据
      await client.query(type === 1 ?
        `update posts set up_vote = up_vote + 1 where id = $1` :
        `update posts set down_vote = down_vote + 1 where id = $1`, [postId]);
      // 添加投票记录
      await client.query(`insert into
        post_votes (post_id, type, user_agent, create_ip)
        values ($1, $2, $3, $4)`, [postId, type, req.headers['user-agent'], req.ip]);
      await client.query('COMMIT');
      
      return Promise.resolve({
        code: CODE.SUCCESS,
        info: postId
      });
    }catch (e) {
      await client.query('ROLLBACK');

      Logger.error(`vote on error => `, e);
      return Promise.reject({
        code: CODE.ERROR,
        message: '操作失败'
      });
    }finally {
      client.release();
    }
  }
}

module.exports = PostVote;