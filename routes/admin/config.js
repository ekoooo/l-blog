let express = require('express');
let router = express.Router();
let Filter = require('../../middlewares/filter');
let Sender = require('../../common/sender');
let ConfigModel = require('../../model/admin/config');

// 获取配置列表
router.post('/list', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new ConfigModel().getSysConfigList(req.body));
});
// 添加配置
router.post('/', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new ConfigModel().addSysConfig(req.body));
});
// 编辑配置
router.put('/:id', Filter.filtAdminHttpLogin, function (req, res) {
  Sender.send(res, new ConfigModel().editSysConfig(req['params']['id'], req.body));
});

module.exports = router;