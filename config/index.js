/**
 * 生产环境私有文件需要分开
 * 配置文件主入口，根据开发环境和生产环境引入对应的配置文件
 * 开发环境文件 filename.dev.js
 * 生产环境文件 filename.prod.js （.gitignore 中已忽略，需要自己建立）
 */
const SUFFIX = process.env['NODE_ENV'] === 'development' ? '.dev' : '.prod';

module.exports = {
  ...require('./db' + SUFFIX), // 数据库配置文件
  ...require('./redis' + SUFFIX), // redis 配置文件
  ...require('./qiniu' + SUFFIX), // 七牛存储云配置文件
  
  // 网站配置
  blogInfo: {
    author: '刘万林,liuwanlin',
    title: '刘万林的博客',
    description: '刘万林的博客,记录工作或者学习中所遇到的问题和有趣的知识点',
    keywords: '刘万林,个人博客,个人网站,liuwanlin,lwl,web前端,react-native',
    metas: [{ // 自定义 meta
      name: 'google-site-verification',
      content: 'i9SpFYSwMTUHZZSWjj5vIB1EJW7BcnjBnUrJGFh8kqY',
    }],
    scripts: [], // 需要加载的脚本，比如网站统计
    adminAddress: 'http://admin.lwl.tech', // 后台管理域名
    
    siteName: '刘万林的博客',
    recordCode: '粤ICP备17137964号-1',
  },
  
  // 初始化第一个管理员的信息
  initAdminInfo: {
    username: 'admin',
    nickname: '一生好吃没钱酒',
    pwd: '123456',
    age: 24,
    phone: '15727781885',
    mail: '954408050@qq.com',
    desc: '管理员账号',
  },
  
  // 服务器端口
  serverPort: 10002,
  // 域名
  serverDomain: 'http://www.lwl.tech',
};