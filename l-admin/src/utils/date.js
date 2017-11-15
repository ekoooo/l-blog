var DateUtil = {
    isDate: function(d) {
        return Object.prototype.toString.call(d) === '[object Date]';
    },
    
    parseStr: function(d) {
        function format(i) {
            return i >= 10 ? i : '0' + i;
        }

        var O = {};
        var date = DateUtil.isDate(d) ? d : new Date(d);

        O.year = date.getFullYear();
        O.month = format(date.getMonth() + 1);
        O.day = format(date.getDate());

        O.h = format(date.getHours());
        O.m = format(date.getMinutes());
        O.s = format(date.getSeconds());

        return O;
    },

    // 2017/02/25 09:30:05
    format: function(d) {
        if(!d) return '';

        var {
            year,
            month,
            day,
            h,
            m,
            s
        } = DateUtil.parseStr(d);

        return year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
    },

    // 2017/02/25
    formatDay: function(d) {
        if(!d) return '';

        var {
            year,
            month,
            day
        } = DateUtil.parseStr(d);

        return year + '-' + month + '-' + day;
    },

    // 2017/02/25 00:00:00 -> 时间戳
    getDayTimestamp: function(d) {
        if(!d) return '';
        
        return new Date(DateUtil.formatDay(d) + ' 00:00:00.000').getTime();
    },
    
    // 两个日期相隔天数
    dayDiff: function(beginDate, endDate) {

        var year = beginDate.getFullYear();
        var month = beginDate.getMonth() + 1;
        var day = beginDate.getDate();

        var d1 = new Date(year + '-' + month + '-' + day).getTime();

        year = endDate.getFullYear();
        month = endDate.getMonth() + 1;
        day = endDate.getDate();

        var d2 = new Date(year + '-' + month + '-' + day).getTime();

        return parseInt((d2 - d1) / (1000 * 60 * 60 * 24));
    },

    // 两个日期相隔月数
    monthDiff: function(beginDate, endDate) {
        var beginYear = beginDate.getFullYear();
        var beginMonth = beginDate.getMonth() + 1; // 和下面 endMonth 可以不加1，习惯从 1 开始
        var endYear = endDate.getFullYear();
        var endMonth = endDate.getMonth() + 1;

        if(beginYear > endYear) {
            return 0;
        }
        if(beginYear === endYear && beginMonth >= endMonth) {
            return 0;
        }

        var m = (endYear - beginYear) * 12;

        return m += (endMonth - beginMonth);
    }
};

export default DateUtil;