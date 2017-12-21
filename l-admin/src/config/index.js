const HOST = process.env['NODE_ENV'] === 'development' ?
    'http://localhost:10002' :
    'http://blog.lwl.tech';

const API_URL_RPEFIX = HOST + '/';
const QINIU_UPLOAD_URL = 'http://up-z2.qiniu.com'; // 七牛云上传接口地址
const QINIU_IMAGE_DOMAIN = 'http://img.lwl.tech/'; // 七牛云配置的域名


export {
    HOST,
    API_URL_RPEFIX,
    QINIU_UPLOAD_URL,
    QINIU_IMAGE_DOMAIN,
};
