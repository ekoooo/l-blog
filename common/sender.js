let Logger = require('./logger');
let Config = require('../config/index');
let AdminConfig = require('../model/admin/config');
let Misc = require('../utils/misc');
let moment = require('moment');
let Access = require('../model/blog/access');

const CODE = require('./code');

const Sender = {
  async mergeBlogInfo(info) {
    let config = Misc.cloneObj(Config.blogInfo);

    // 获取 关于页面 地址
    let aboutPage = await new AdminConfig().getSysConfigByKey('ABOUT_PAGE_URL');
    if(aboutPage.code === CODE.SUCCESS) {
      config.aboutPageUrl = aboutPage.info.val;
    }

    if(info) {
      if(info.title) {
        config.title = info.title + ' - ' + config.title;
      }
      if(info.description) {
        config.description = info.description;
      }
      if(info.keywords) {
        config.keywords = info.keywords;
      }
    }
    
    return config;
  },
  
  /**
   * 返回请求结果
   * @param res
   * @param promise
   */
  send(res, promise) {
    promise.then(rs => {
      res.send(rs);
    }).catch(err => {
      if(err.code !== CODE.ERROR) {
        Logger.error(err);
      }
      res.send(err);
    });
  },
  
  /**
   * 文章页面返回
   * @param req
   * @param res
   * @param next
   * @param promise
   */
  sendPostPage(req, res, next, promise) {
    promise.then(async data => {
      // add access log
      new Access().addPostAccess(req['params']['id'], req).then(() => {}).catch(() => {});
      
      data.info['create_time'] = moment(data.info['create_time']).format('YYYY-MM-DD HH:mm');
      data.info['update_time'] = moment(data.info['update_time']).format('YYYY-MM-DD HH:mm');
      
      res.render('post', {
        ...data,
        ...(await Sender.mergeBlogInfo({
          title: data.info['title'],
          keywords: data.info['key_words'],
          description: data.info['content_desc_plain_text']
        })),
      });
    }).catch(err => {
      if(err.code !== CODE.ERROR) {
        Logger.error(err);
      }else {
        Logger.warn(err);
      }
      next();
    });
  },

  /**
   * 搜索页面
   */
  sendSearchPage(res, next, promise) {
    promise.then(async data => {
      data.list.map(item => {
        if(item['create_time']) {
          item['create_time'] = moment(item['create_time']).format('YYYY-MM-DD HH:mm');
        }
      });
      
      res.render('search', {
        ...data,
        ...(await Sender.mergeBlogInfo()),
      });
    }).catch(err => {
      if(err.code !== CODE.ERROR) {
        Logger.error(err);
      }else {
        Logger.warn(err);
      }
      next();
    });
  },
  
  /**
   * 主页
   * @param res
   * @param next
   * @param promise
   */
  sendIndexPage(res, next, promise) {
    promise.then(async data => {
      data.list.map(item => {
        if(item['create_time']) {
          item['create_time'] = moment(item['create_time']).format('YYYY-MM-DD HH:mm');
        }
      });
      
      res.render('index', {
        ...data,
        ...(await Sender.mergeBlogInfo()),
      });
    }).catch(err => {
      if(err.code !== CODE.ERROR) {
        Logger.error(err);
      }else {
        Logger.warn(err);
      }
      next();
    });
  },

  /**
   * 分类、标签页面
   */
  sendCategoryPage(res, next, promise) {
    promise.then(async data => {
      res.render('category', {
        ...data,
        ...(await Sender.mergeBlogInfo()),
      });
    }).catch(err => {
      if(err.code !== CODE.ERROR) {
        Logger.error(err);
      }else {
        Logger.warn(err);
      }
      next();
    });
  },
  
  /**
   * 自用
   */
  sendMe(req, res, type) {
    req.headers['user-agent'] = type + ' <==> ' + req.headers['user-agent'];
    
    new Access().addPostAccess(-520, req).then(() => {}).catch(() => {});
    
    res.send({
      code: CODE.SUCCESS
    });
  },
  
  /**
   * App 自用返回请求结果
   * @param req
   * @param res
   * @param promise
   * @param type
   */
  sendApp(req, res, promise, type) {
    let t;
    if(type === 'ZHIHUDAILY_SPONSOR') {
      t = -1;
    }else if(type === 'ZHIHUDAILY_MSG') {
      t = -2;
    }else if(type === 'XIMALAYA_MSG') {
      t = -3;
    }
    
    promise.then(rs => {
      // 添加记录
      req.headers['appinfo'] = type + ' <==> ' + (req.headers['appinfo'] || req.headers['user-agent']);
      
      new Access().addPostAccess(t, req, true, 'appinfo').then(() => {});
      
      res.send({
        code: rs.code,
        info: JSON.parse(rs.info.val)
      });
    }).catch(err => {
      if(err.code !== CODE.ERROR) {
        Logger.error(err);
      }
      res.send(err);
    });
  },
};

module.exports = Sender;