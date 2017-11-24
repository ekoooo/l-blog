let express = require('express');
let router = express.Router();
let Logger = require('../../common/logger');

router.get('/', function (req, res, next) {
    res.send('blog index！');
});

module.exports = router;