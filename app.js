let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let router = require('./routes/index');
let Logger = require('./common/logger');

let app = express();

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
app.use('/static', express.static(path.join(__dirname, 'l-admin/static')));
app.use('/manager', express.static(path.join(__dirname, 'l-admin/dist'))); // 后台前端

// 注册路由
router(app);

module.exports = app;
