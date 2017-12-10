import requester from '../utils/requester';

const PostLogic = {
    PAGE_SIZE: 10,
    
    POST_LIST_SEARCHPARAMS: {
        title: undefined, // 标题
        categoryName: undefined, // 分类名
        categoryId: undefined, // 分类ID
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
    
    /**
     * 更新状态
     * @param id
     * @param status 1发布 0撤回 -1删除
     */
    updateStatus(id, status) {
        if(status === 1) {
            return requester.put('/admin/post/publish/' + id);
        }else if(status === 0) {
            return requester.put('/admin/post/unpublish/' + id);
        }else if(status === -1) {
            return requester.delete('/admin/post/' + id);
        }
    },
};

export default PostLogic;