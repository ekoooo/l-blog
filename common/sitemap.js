let sm = require('sitemap');
let Post = require('../model/blog/post');

const Config = require('../config/index');

module.exports = function(app) {
    app.get('/sitemap.xml', async function(req, res) {
        res.header('Content-Type', 'application/xml');
        
        let rs = await new Post().getPostIdInfo();
        let info = rs.info;
        
        let urls = [];
    
        for(let i = 0; i < info.ids.length; i++) {
            urls.push({
                url: '/post/' + info.ids[i]['id'],
                changefreq: 'weekly',
                priority: 0.9
            });
        }
        
        for(let i = 0; i < info.totalPage; i++) {
            urls.push({
                url: '/?page=' + i,
                changefreq: 'monthly',
                priority: 0.8
            });
        }
        
        res.send(sm.createSitemap ({
            hostname: Config.serverDomain,
            urls: [
                { url: '/', changefreq: 'daily', priority: 1 },
                ...urls
            ]
        }).toString());
    });
};