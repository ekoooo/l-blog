const Config = require('../config/');

var Logger = require('../common/logger');
var redis = require("redis");

var client = redis.createClient({
    host: Config.redisHost,
    port: Config.redisPort,
    db: Config.redisDb,
});

client.on('error', function (error) {
    Logger.error('redis client on error', error);
});

module.exports = client;