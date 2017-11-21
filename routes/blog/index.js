var express = require('express');
var router = express.Router();
var Logger = require('../../common/logger');

router.get('/', function (req, res, next) {
    res.send('blog index！');
});

module.exports = router;