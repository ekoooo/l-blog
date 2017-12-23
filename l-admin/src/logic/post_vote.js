import requester from '../utils/requester';

const PostVote = {
    PAGE_SIZE: 10,
    
    VOTE_LIST_SEARCH_PARAMS: {
        title: undefined, // 文章标题
        type: undefined, // 投票类型
    },
    
    // 投票列表
    getVoteList(searchParams) {
        let defaultParams = {
            pageId: 0,
            pageSize: PostVote.PAGE_SIZE
        };
    
        return requester.post('/admin/post/vote/list',
            Object.assign({}, defaultParams, searchParams));
    }
};

export default PostVote;