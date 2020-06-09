let express = require('express');
let router = express.Router();
let Post = require('../../model/blog/post');
let Sender = require('../../common/sender');
let CODE = require('../../common/code');

router.get('/', function (req, res, next) {
  const query = req['query'];

  let promise = null;

  if(query['do'] == 1) {
    const keyWord = query['keyWord'];
    const tag = query['tag'];
    const categoryName = query['categoryName'];

    promise = new Post().getPostList(query['page'] || 0, {
      keyWord: keyWord != undefined ? unescape(keyWord) : undefined,
      tag: tag != undefined ? unescape(tag) : undefined,
      categoryName: categoryName != undefined ? unescape(categoryName) : undefined,
      categoryId: query['categoryId'],
    })
  }else {
    promise = Promise.resolve({
      code: CODE.SUCCESS,
      list: [],
      pageId: 0,
      pageSize: Post.POST_LIST_PAGE_SIZE,
      totalCount: 0,
      q: {},
      noSearch: true,
    })
  }

  Sender.sendSearchPage(res, next, promise);
});

module.exports = router;