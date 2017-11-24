let bcrypt = require('bcrypt');

/**
 * 密码加密和验证
 */
let Pwd = {
    /**
     * 验证明文密码是否和加密后的密码是一致的
     * @param plaintextPassword 明文密码
     * @param hash 获取加密后的 hash
     */
    valid: function(plaintextPassword, hash) {
        return bcrypt.compare(plaintextPassword, hash);
    },

    /**
     * 获取加密后的 hash
     * @param plaintextPassword 明文密码
     * @param saltRounds 加密强度，默认最高级
     */
    hash: function(plaintextPassword, saltRounds = 10) {
        return bcrypt.hash(plaintextPassword, saltRounds);
    },
};

module.exports = Pwd;