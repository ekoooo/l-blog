const Config = require('../config/index');

let Logger = require('../common/logger');
let redis = require("redis");

let client = redis.createClient({
    host: Config.redisHost,
    port: Config.redisPort,
    db: Config.redisDb,
});

client.on('error', function (error) {
    Logger.error('redis client on error', error);
});

module.exports = client;