module.exports = {
    dbHost: 'localhost',
    dbUser: 'postgres',
    dbPassword: 'postgres',
    dbDatabase: 'lblog',
    dbPort: 5432,
    dbMax: 20, // 连接池最大连接数
    dbMin: 4, // 连接池最小连接数
    dbIdleTimeoutMillis: 3000, // 连接最大空闲时间
    dbConnectionTimeoutMillis: 2000, // 连接超时时间
};