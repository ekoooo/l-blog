module.exports = function(app) {
    app.all('*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("Content-Type", "application/json;charset=utf-8");
        
        if(req.method === "OPTIONS") {
            res.send(200);
        }else {
            next();
        }
    });
    
    // blog
    app.use('/', require('./blog/index'));
    
    // admin
    app.use('/admin', require('./admin/index'));
    app.use('/admin/qiniu', require('./admin/qiniu'));
    app.use('/admin/post', require('./admin/post'));
};