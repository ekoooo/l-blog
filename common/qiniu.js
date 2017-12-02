let qiniu = require('qiniu');
let Config = require('../config/');

qiniu.conf.ACCESS_KEY = Config.qiniuAK;
qiniu.conf.SECRET_KEY = Config.qiniuSK;

let mac = new qiniu.auth.digest.Mac();
let config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z2;
let bucketManager = new qiniu.rs.BucketManager(mac, config);

/**
 * 七牛存储 图片处理
 */
let Qiniu = {
    /**
     * 用于客户端上传
     * 获取上传 Token
     */
    getUploadToken() {
        let options = {
            scope: Config.qiniuBucket,
            expires: 7200, // 自定义凭证有效期单位秒，2小时，默认为一个小时
        };
        let putPolicy = new qiniu.rs.PutPolicy(options);
        
        return putPolicy.uploadToken(mac);
    },
    
    /**
     * 获取 AccessToken，用于客户端 API
     * @param requestURI https://developer.qiniu.com/kodo/api/1731/api-overview
     * @param reqBody 请求Body，仅当请求的 ContentType 为
     *                application/x-www-form-urlencoded时才需要传入该参数
     */
    getAccessToken(requestURI, reqBody) {
        return qiniu.util.generateAccessToken(mac, requestURI, reqBody);
    },
    
    /**
     * 获取 bucketManager 对象
     */
    getBucketManager() {
        return bucketManager;
    },
};

module.exports = Qiniu;