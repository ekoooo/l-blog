let sm = require('sitemap');

const Config = require('../config/index');

module.exports = function(app) {
    let sitemap = sm.createSitemap ({
        hostname: Config.serverDomain,
        cacheTime: 600000, // 600 sec - cache purge period
        urls: [
            { url: '/', changefreq: 'daily', priority: 1 },
            { url: '/?page=0', changefreq: 'monthly',  priority: 0.8 },
            { url: '/post/1', changefreq: 'weekly',  priority: 0.7 },
            { url: '/post/2', changefreq: 'weekly',  priority: 0.7 },
        ]
    });
    
    app.get('/sitemap.xml', function(req, res) {
        res.header('Content-Type', 'application/xml');
        res.send(sitemap.toString());
    });
};