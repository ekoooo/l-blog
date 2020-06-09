let express = require('express');
let router = express.Router();
let Post = require('../../model/blog/post');
let Sender = require('../../common/sender');

router.get('/', function (req, res, next) {
  Sender.sendCategoryPage(res, next, new Post().getCategoryInfo());
});

module.exports = router;