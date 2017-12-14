let Logger = require('./logger');
let Config = require('../config/index');
let Misc = require('../utils/misc');
const CODE = require('./code');

const Sender = {
    mergeBlogInfo: function (info) {
        let config = Misc.cloneObj(Config.blogInfo);
        
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
     * @param res
     * @param next
     * @param promise
     */
    sendPostPage(res, next, promise) {
        promise.then(data => {
            res.render('post', {
                ...data,
                ...Sender.mergeBlogInfo({
                    title: data.info.title,
                    keywords: data.info.keyWords,
                    description: data.info.descText
                }),
            });
        }).catch(err => {
            if(err.code !== CODE.ERROR) {
                Logger.error(err);
            }else {
                Logger.warn(err);
            }
            next();
        });
    }
};

module.exports = Sender;