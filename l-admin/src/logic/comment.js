import requester from '../utils/requester';

const Comment = {
    PAGE_SIZE: 10,
    
    COMMENT_LIST_SEARCH_PARAMS: {
        postId: undefined,
        status: undefined,
        mail: undefined,
        authorSite: undefined,
    },
    
    // 文章评论列表
    getCommentList(searchParams) {
        let defaultParams = {
            pageId: 0,
            pageSize: Comment.PAGE_SIZE
        };
        
        return requester.post('/admin/comment/list',
            Object.assign({}, defaultParams, searchParams));
    },
    
    // 更新状态
    updateStatus(id, status) {
        return requester.post(`/admin/comment/post/${ id }/status/${ status }`);
    },
    
    // 获取一条留言记录
    getCommentById(id) {
        return requester.get(`/admin/comment/${ id }`);
    }
};

export default Comment;