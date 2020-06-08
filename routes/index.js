let Sender = require('../common/sender');

module.exports = function(app) {
  //
  app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    
    next();
  });
  
  // blog
  app.use('/', require('./blog/index'));
  app.use('/post', require('./blog/post'));
  
  // app
  app.use('/app', require('./blog/app'));
  
  // admin header
  app.all('/admin/*', function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    
    if(req.method === "OPTIONS") {
      res.send(200);
    }else {
      next();
    }
  });
  
  // admin router
  app.use('/admin', require('./admin/index'));
  app.use('/admin/qiniu', require('./admin/qiniu'));
  app.use('/admin/post', require('./admin/post'));
  app.use('/admin/user', require('./admin/user'));
  app.use('/admin/config', require('./admin/config'));
  app.use('/admin/comment', require('./admin/comment'));
  
  // admin 404
  app.use('/admin/*', function(req, res) {
    res.send({
      code: 404,
      message: 'Not Found'
    });
  });
  
  // blog 404
  app.use(function(req, res) {
    res.render('404', {
      ...Sender.mergeBlogInfo()
    });
  });
};