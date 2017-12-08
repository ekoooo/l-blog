import requester from '../utils/requester';

const PostLogic = {
    PAGE_SIZE: 10,
    
    POST_LIST_SEARCHPARAMS: {
        title: undefined, // 标题
        categoryName: undefined, // 分类名
        keyWords: undefined, // 关键字
        tag: undefined, // 标签
        text: undefined, // 内容
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
    },
    
    /**
     * 添加一个文章
     * @param formInfo
     */
    addPost(formInfo) {
        return requester.post('/admin/post', formInfo);
    },
    
    /**
     * 编辑一个文章
     * @param id
     * @param formInfo
     */
    editPost(id, formInfo) {
        return requester.put('/admin/post/' + id, formInfo);
    },
    
    /**
     * 获取一个文章
     * @param id
     */
    getPost(id) {
        return requester.get('/admin/post/?id=' + id);
    },
};

export default PostLogic;