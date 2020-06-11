import requester from '../utils/requester';

const PostAccess = {
  PAGE_SIZE: 10,
  
  ACCESS_LIST_SEARCH_PARAMS: {
    title: undefined, // 文章标题
    postId: undefined, // 文章ID
    createIp: undefined, // IP
    userAgent: undefined, // UA
  },
  
  // 文章访问列表
  getAccessList(searchParams) {
    let defaultParams = {
      pageId: 0,
      pageSize: PostAccess.PAGE_SIZE
    };
    
    return requester.post('/admin/post/access/list', Object.assign({}, defaultParams, searchParams));
  },

  // 文章访问次数报表数据
  getAccessChartData(postId, day) {
    return requester.post('/admin/post/access/chart', { postId, day });
  }
};

export default PostAccess;