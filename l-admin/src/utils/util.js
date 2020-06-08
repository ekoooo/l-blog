const Util = {
  // 克隆一个对象
  cloneObj: function(obj) {
    var str, newobj = obj.constructor === Array ? [] : {};
    if (typeof obj !== 'object') {
      return;
    } else if (window.JSON) {
      str = JSON.stringify(obj), //系列化对象
      newobj = JSON.parse(str); //还原
    } else {
      for (var i in obj) {
        newobj[i] = typeof obj[i] === 'object' ? Util.cloneObj(obj[i]) : obj[i];
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
  
  // 验证数字（精确到 .00）
  validateNum: function(val) {
    return /(^-?(([1-9]\d*)|0)(\.\d{1,2})?$)/.test(val);
  },

  // 验证手机号码
  validatePhone: function(number) {
    return /^1[34578]\d{9}$/.test(number);
  },

  // 验证身份证号码
  validateIdCard: function(no) {
    return /[1-9]\d{16}[a-zA-Z0-9]{1}/.test(no);
  },
  
  /**
   * 格式化金钱
   * price
   * n 保留几位小数（四舍五入）
   * x 隔几位分割
   */
  formatCurrency: function(price, n = 2, x = 3) {
    const re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return Number(price).toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
  },

  /**
   * 打开子窗口
   */
  popupCenter: function(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' 
        + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
      newWindow.focus();
    }

    return newWindow;
  },
};

export default Util;