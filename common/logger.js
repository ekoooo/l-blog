var morgan = require('morgan');
var winston = require('winston');

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var stackTrace = require('stack-trace');

require('winston-daily-rotate-file');

const LOGS_DIR = path.join(__dirname, '../logs');

/**
 * info 级别以上日志记录到文件中，每天生成一个日志文件，一个文件最大 10M
 * error 级别日志单独记录到另一个文件中 
 * debug 输出到控制台，不记录到文件中
 */
var logger = new winston.Logger({
    transports: [
        new (winston.transports.DailyRotateFile) ({
            name: 'error',
            level: 'error',
            filename: LOGS_DIR + '/error.log.txt',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss:SSS'),
            prepend: true,
            datePattern:'yyyy-MM-dd.',
            maxsize: 1024 * 1024 * 10,
            colorize: false,
            json: false,
            handleExceptions: true,
        }),

        new (winston.transports.DailyRotateFile) ({
            name: 'normal',
            level: 'info',
            filename: LOGS_DIR + '/normal.log.txt',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss:SSS'),
            prepend: true,
            datePattern:'yyyy-MM-dd.',
            maxsize: 1024 * 1024 * 10,
            colorize: false,
            json: false,
        }),

        new winston.transports.Console({
            name: 'debug',
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        }),
    ],

    exitOnError: false,
});

// 提供 morgan 使用
logger.stream = {
    write: function(message){
        Logger.info(message);
    }
};

/**
 * 日志处理对象
 */
var Logger = {
    // 初始化 morgan 记录请求记录
    initRequestLogger: function(app) {
        app.use(morgan('combined', { 'stream': logger.stream }));
    },

    debug: function() {
        logger.debug.apply(logger, arguments);
    },

    info: function() {
        logger.info.apply(logger, arguments);
    },

    warn: function() {
        logger.warn.apply(logger, arguments);
    },

    // 错误日志并记录行号
    error: function() {
        let cellSite = stackTrace.get()[1];
        
        logger.error.apply(
            logger,
            [
                arguments[0],
                {
                    filePath: cellSite.getFileName(),
                    lineNumber: cellSite.getLineNumber(),
                }
            ]
        );
    },
};

module.exports = Logger;
