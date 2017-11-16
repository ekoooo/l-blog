var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var Logger = require('./common/logger');

var app = express();

// 模板引擎设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 图标设置
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// 请求日志记录初始化
Logger.initRequestLogger(app);

// 相关参数格式化
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// 静态资源目录
app.use(express.static(path.join(__dirname, 'public')));

// 404 错误处理
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
