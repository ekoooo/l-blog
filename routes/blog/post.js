let express = require('express');
let router = express.Router();
let Post = require('../../model/blog/post');
let PostVotes = require('../../model/blog/post_votes');
let Sender = require('../../common/sender');

// 文章详情页
router.get('/:id', function (req, res, next) {
    Sender.sendPostPage(res, next, new Post().getPostById(req['params']['id'], req.ip));
});

// 投票（like）
router.post('/like/:id', function (req, res) {
    Sender.send(res, new PostVotes().vote(req['params']['id'], req, 1));
});

// 投票（unlike）
router.post('/unlike/:id', function (req, res) {
    Sender.send(res, new PostVotes().vote(req['params']['id'], req, -1));
});

module.exports = router;