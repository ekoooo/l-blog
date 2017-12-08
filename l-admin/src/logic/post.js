import requester from '../utils/requester';

const PostLogic = {
    PAGE_SIZE: 10,
    
    POST_LIST_SEARCHPARAMS: {
    
    },
    
    /**
     * 获取文章列表
     * @param searchParams
     * @return {*}
     */
    getPostList(searchParams) {
        let defaultParams = {
            pageId: 0,
            pageSize: PostLogic.PAGE_SIZE
        };
    
        return requester.post('/admin/post/list',
            Object.assign({}, defaultParams, searchParams));
    }
};

export default PostLogic;