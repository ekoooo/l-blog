const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Qiniu = require('../../common/qiniu');
let Config = require('../../config/index');

class FileManager {
    constructor() {
    
    }
    
    /**
     * 获取文件列表
     */
    getFileList(pageSize = 20, nextMarker) {
        return new Promise((resolve, reject) => {
            let options = {
                marker: nextMarker,
                limit: pageSize, // 最多 1000
            };
    
            Qiniu.getBucketManager().listPrefix(Config.qiniuBucket, options, (err, respBody, respInfo) => {
                if(err) {
                    Logger.error(`get file list on error =>`, err);
                    
                    reject({
                        code: CODE.ERROR,
                        message: err,
                    });
                }
        
                if(respInfo.statusCode === 200) {
                    resolve({
                        code: CODE.SUCCESS,
                        info: {
                            items: respBody.items,
                            nextMarker: respBody.marker,
                        },
                    });
                }else {
                    Logger.error(`get file list on erorr =>`, respInfo.data.error);
            
                    reject({
                        code: CODE.ERROR,
                        message: respInfo.data.error,
                    });
                }
            });
        });
    }
    
    /**
     * 删除一张图片
     * @param key
     */
    deleteImage(key) {
        return new Promise((resolve, reject) => {
            Qiniu.getBucketManager().delete(Config.qiniuBucket, key, (err, respBody, respInfo) => {
                if (err) {
                    Logger.error(`delete file on error =>`, err);
                    reject({
                        code: CODE.ERROR,
                        message: err,
                    });
                } else {
                    if(respInfo.statusCode === 200) {
                        resolve({
                            code: CODE.SUCCESS,
                            info: respInfo.data,
                        });
                    }else {
                        Logger.error(`delete file on error =>`, respInfo.data.error);
                
                        reject({
                            code: CODE.ERROR,
                            message: respInfo.data.error,
                        });
                    }
                }
            });
        });
    }
    
    /**
     * 获取上传 Token
     */
    getUploadToken() {
        return new Promise((resolve, reject) => {
            try {
                resolve({
                    code: CODE.SUCCESS,
                    info: Qiniu.getUploadToken(),
                });
            }catch(e) {
                Logger.error('get upload token on error =>', e);
        
                reject({
                    code: CODE.ERROR,
                    message: '获取失败！',
                });
            }
        });
    }
}

module.exports = FileManager;