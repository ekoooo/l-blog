let express = require('express');
let router = express.Router();
let Post = require('../../model/blog/post');
let Sender = require('../../common/sender');

router.get('/post/:id', function (req, res, next) {
    Sender.sendPostPage(res, next, new Post().getPostById(req['params']['id']));
});

module.exports = router;