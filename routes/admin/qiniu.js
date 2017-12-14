let express = require('express');
let router = express.Router();
let Filter = require('../../middlewares/filter');
let Sender = require('../../common/sender');
let FileManager = require('../../model/admin/file_manager');

// 获取文件列表 => /files?size=<size>&mark=[mark]
router.get('/files', Filter.filtAdminHttpLogin, function (req, res) {
    Sender.send(res, new FileManager().getFileList(req.query.size, req.query.mark));
});

// 获取上传 Token
router.get('/uploadToken', Filter.filtAdminHttpLogin, function (req, res) {
    Sender.send(res, new FileManager().getUploadToken());
});

// 删除图片
router.delete('/:key', Filter.filtAdminHttpLogin, function (req, res) {
    Sender.send(res, new FileManager().deleteImage(req['params']['key']));
});

module.exports = router;