import requester from '../utils/requester';

const PostAccess = {
  PAGE_SIZE: 10,
  
  ACCESS_LIST_SEARCH_PARAMS: {
    title: undefined, // 文章标题
    postId: undefined, // 文章ID
  },
  
  // 文章投票列表
  getAccessList(searchParams) {
    let defaultParams = {
      pageId: 0,
      pageSize: PostAccess.PAGE_SIZE
    };
    
    return requester.post('/admin/post/access/list', Object.assign({}, defaultParams, searchParams));
  }
};

export default PostAccess;