const { Pool } = require('pg');
const Config = require('../config/index');
let Logger = require('../common/logger');

const pool = new Pool({
    host: Config.dbHost,
    user: Config.dbUser,
    database: Config.dbDatabase,
    password: Config.dbPassword,
    port: Config.dbPort,
    max: Config.dbMax,
    min: Config.dbMin,
    idleTimeoutMillis: Config.dbIdleTimeoutMillis,
    connectionTimeoutMillis: Config.dbConnectionTimeoutMillis,
});

pool.on('error', (error, client) => {
    Logger.error('database pool on error =>', error);
});

module.exports = {
    pool,
};