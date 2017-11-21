/**
 * 配置文件主入口，根据开发环境和生产环境引入对应的配置文件
 * 开发环境文件 xxx_dev.js
 */
const SUFFIX = process.env.NODE_ENV === 'development' ? '.dev' : '.prod';

module.exports = {
    ...require('./db' + SUFFIX), // 数据库配置文件
};