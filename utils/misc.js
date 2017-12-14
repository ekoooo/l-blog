/**
 * 工具类
 */
const Misc = {
    /**
     * 复制一个对象
     */
    cloneObj: function(obj) {
        let str, newobj = obj.constructor === Array ? [] : {};
        if (typeof obj !== 'object') {
            return;
        } else if (global.JSON) {
            str = JSON.stringify(obj); //系列化对象
            newobj = JSON.parse(str); //还原
        } else {
            for (let i in obj) {
                newobj[i] = typeof obj[i] === 'object' ? Misc.cloneObj(obj[i]) : obj[i];
            }
        }
        return newobj;
    },

    /**
     * '', null, undefined
     */
    isNullStr(str) {
        // null == undefined
        // null !== undefined
        return str === '' || str == null;
    },
    
    /**
     * 验证特定数字
     * @param val
     * @param type
                 1 => 正整数
                 2 => 负整数
                 3 => 整数
                 4 => 非负整数（正整数 + 0）
                 5 => 非正整数（负整数 + 0）
     */
    validInt(val, type) {
        let regMap = {
            1: /^[1-9]\d*$/, // 正整数
            2: /^-[1-9]\d*$/, // 负整数
            3: /^-?[1-9]\d*$/, // 整数
            4: /^([1-9]\d*|0)$/, // 非负整数（正整数 + 0）
            5: /^(-[1-9]\d*|0)$/, // 非正整数（负整数 + 0）
        };
    
        return new RegExp(regMap[type], 'g').test(val);
    }
};

module.exports = Misc;