let sm = require('sitemap');
let Post = require('../model/blog/post');

const Config = require('../config/index');

module.exports = function(app) {
  app.get('/sitemap.xml', async function(req, res) {
    res.header('Content-Type', 'application/xml');
    
    let rs = await new Post().getPostIdInfo();
    let info = rs.info;
    
    let urls = [];

    // 文章详情页面
    for(let i = 0; i < info.list.length; i++) {
      urls.push({
        url: '/post/' + info.list[i]['id'],
        lastmod: info.list[i]['update_time'],
        changefreq: 'daily',
        priority: 1
      });
    }
    
    // 首页列表（翻页）
    for(let i = 0; i < info.totalPage; i++) {
      urls.push({
        url: '/?page=' + i,
        changefreq: 'daily',
        priority: 0.8
      });
    }
    
    res.send(sm.createSitemap({
      hostname: Config.serverDomain,
      urls: [
        { url: '/', changefreq: 'daily', priority: 1 }, // 主页
        { url: '/category', changefreq: 'weekly', priority: 0.9 }, // 文章分类、标签页面
        ...urls
      ]
    }).toString());
  });
};