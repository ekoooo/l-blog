/**
 * 自用
 */
let express = require('express');
let router = express.Router();
let Config = require('../../model/admin/config');
let Sender = require('../../common/sender');

// 获取《知乎日报》赞助人名单
router.get('/zhihudaily/sponsor', function (req, res) {
  Sender.sendApp(req, res, new Config().getSysConfigByKey('ZHIHUDAILY_SPONSOR'), 'ZHIHUDAILY_SPONSOR');
});
// 获取《知乎日报》最新消息
router.get('/zhihudaily/message', function (req, res) {
  Sender.sendApp(req, res, new Config().getSysConfigByKey('ZHIHUDAILY_MSG'), 'ZHIHUDAILY_MSG');
});
// 获取《喜马拉雅》最新消息
router.get('/ximalaya/message', function (req, res) {
  Sender.sendApp(req, res, new Config().getSysConfigByKey('XIMALAYA_MSG'), 'XIMALAYA_MSG');
});

module.exports = router;