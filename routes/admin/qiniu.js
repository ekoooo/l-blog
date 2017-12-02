let express = require('express');
let router = express.Router();
let Filter = require('../../middlewares/filter');
let FileManagerLogic = require('../../logic/admin/file_manager_logic');
let Misc = require('../../utils/misc');

/**
 * 获取文件列表
 * /files?size=<size>&mark=[mark]
 */
router.get('/files', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, FileManagerLogic.getFileList(req.query.size, req.query.mark));
});

/**
 * 获取上传 Token
 */
router.get('/uploadToken', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, FileManagerLogic.getUploadToken());
});

/**
 * 删除图片
 */
router.delete('/:key', Filter.filtAdminHttpLogin, function (req, res) {
    Misc.send(res, FileManagerLogic.deleteImage(req['params']['key']));
});

module.exports = router;