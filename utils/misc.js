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
            str = JSON.stringify(obj), //系列化对象
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
};

module.exports = Misc;