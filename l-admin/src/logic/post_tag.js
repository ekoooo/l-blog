import requester from '../utils/requester';

const PostTag = {
    /**
     * 文章分类下拉
     */
    getPostTagSelector() {
        return requester.get('/admin/post/tag');
    }
};

export default PostTag;
