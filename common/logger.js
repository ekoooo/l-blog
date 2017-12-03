let morgan = require('morgan');
let winston = require('winston');

let path = require('path');
let fs = require('fs');
let moment = require('moment');
let stackTrace = require('stack-trace');

require('winston-daily-rotate-file');

const LOGS_DIR = path.join(__dirname, '../logs');

/**
 * info 级别以上日志记录到文件中，每天生成一个日志文件，一个文件最大 10M
 * error 级别日志单独记录到另一个文件中 
 * debug 输出到控制台，不记录到文件中
 */
let logger = new winston.Logger({
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

/**
 * 打印 Access Log 使用
 */
let accessLogger = new winston.Logger({
    transports: [
        new (winston.transports.DailyRotateFile) ({
            name: 'access',
            level: 'info',
            filename: LOGS_DIR + '/access.log.txt',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss:SSS'),
            prepend: true,
            datePattern:'yyyy-MM-dd.',
            maxsize: 1024 * 1024 * 10,
            colorize: false,
            json: false,
        }),
        
        // 不输出到控制台中
        // new winston.transports.Console({
        //     name: 'debug',
        //     level: 'debug',
        //     handleExceptions: true,
        //     json: false,
        //     colorize: true
        // }),
    ],
    
    exitOnError: false,
});

// 提供 morgan 使用
logger.stream = {
    write: function(message) {
        accessLogger.info(message);
    }
};

/**
 * 日志处理对象
 */
let Logger = {
    // 初始化 morgan 记录请求记录
    initRequestLogger: function(app) {
        app.use(
            morgan('combined', {
                'stream': logger.stream,
                // OPTIONS 类型请求不记录在日志中
                'skip': (req, res) => req.method === 'OPTIONS'
            })
        );
    },

    // 开发模式才开启
    debug: function() {
        if(process.env.NODE_ENV === 'development') {
            let cellSite = stackTrace.get()[1];
    
            logger.debug.apply(
                logger,
                [
                    arguments[0],
                    {
                        FilePath: cellSite.getFileName(),
                        LineNumber: cellSite.getLineNumber(),
                    }
                ]
            );
        }
    },

    info: function() {
        let cellSite = stackTrace.get()[1];
        
        logger.info.apply(
            logger,
            [
                arguments[0],
                {
                    FilePath: cellSite.getFileName(),
                    LineNumber: cellSite.getLineNumber(),
                }
            ]
        );
    },

    warn: function() {
        let cellSite = stackTrace.get()[1];
    
        logger.warn.apply(
            logger,
            [
                arguments[0],
                {
                    FilePath: cellSite.getFileName(),
                    LineNumber: cellSite.getLineNumber(),
                }
            ]
        );
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
