/**
 * 配置文件主入口，根据开发环境和生产环境引入对应的配置文件
 * 开发环境文件 filename.dev.js
 * 生产环境文件 filename.prod.js （.gitignore 中已忽略，需要自己建立）
 */
const SUFFIX = process.env.NODE_ENV === 'development' ? '.dev' : '.prod';

module.exports = {
    ...require('./db' + SUFFIX), // 数据库配置文件
    ...require('./redis' + SUFFIX), // redis 配置文件
};