let User = require('../model/admin/user');
let Logger = require('../common/logger');

/**
 * 初始化文件
 */
const Init = {
    async initAdmin() {
        // 初始化一个管理员
        Logger.info('init admin start =>');
        await new User()._initAdmin();
        Logger.info('init admin end <=');
    },
    
    async init() {
        await Init.initAdmin();
    }
};

module.exports = Init;
