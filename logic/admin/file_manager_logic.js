const CODE = require('../../common/code');
let Logger = require('../../common/logger');
let Qiniu = require('../../common/qiniu');
let Config = require('../../config/');

/**
 * 文件处理
 */
let FileManagerLogic = {
    /**
     * 获取文件列表
     */
    getFileList: (pageSize = 20, nextMarker) => new Promise((resolve, reject) => {
        let options = {
            marker: nextMarker,
            limit: pageSize, // 最多 1000
        };
    
        Qiniu.getBucketManager().listPrefix(Config.qiniuBucket, options, (err, respBody, respInfo) => {
            if(err) {
                Logger.warn(`获取文件列表失败`, err);
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
                Logger.warn(`获取文件列表失败, ${ respInfo.data.error }`);
                
                reject({
                    code: CODE.ERROR,
                    message: respInfo.data.error,
                });
            }
        });
    }),
    
    /**
     * 删除一张图片
     * @param key
     */
    deleteImage: (key) => new Promise((resolve, reject) => {
        Qiniu.getBucketManager().delete(Config.qiniuBucket, key, (err, respBody, respInfo) => {
            if (err) {
                Logger.warn(`删除图片失败`, err);
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
                    Logger.warn(`删除图片失败, ${ respInfo.data.error }`);
    
                    reject({
                        code: CODE.ERROR,
                        message: respInfo.data.error,
                    });
                }
            }
        });
    }),
    
    /**
     * 获取上传 Token
     */
    getUploadToken: () => new Promise((resolve, reject) => {
        try {
            resolve({
                code: CODE.SUCCESS,
                info: Qiniu.getUploadToken(),
            });
        }catch(e) {
            Logger.warn('获取 upload token 失败！');
            
            reject({
                code: CODE.ERROR,
                message: '获取失败！',
            });
        }
    }),
};

module.exports = FileManagerLogic;