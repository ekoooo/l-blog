import requester from '../utils/requester';

const PostCategory = {
  PAGE_SIZE: 10,
  
  // 文章分类列表搜索条件
  POST_CATEGORY_LIST_SEARCHPARAMS: {
    postCategoryName: undefined,
  },
  
  /**
   * 获取文章分类列表
   */
  getPostCategoryList(searchParams) {
    let defaultParams = {
      pageId: 0,
      pageSize: PostCategory.PAGE_SIZE
    };

    return requester.post('/admin/post/category/list', Object.assign({}, defaultParams, searchParams));
  },
  
  /**
   * 添加文章分类
   * @param formInfo
   */
  addPostCategory(formInfo) {
    return requester.post('/admin/post/category', formInfo);
  },
  
  /**
   * 编辑文章分类
   * @param formInfo
   */
  editPostCategory(formInfo) {
    return requester.put('/admin/post/category/' + formInfo.postCategoryId, formInfo);
  },
  
  /**
   * 删除文章分类
   * @param id
   */
  deletePostCategory(id) {
    return requester.delete('/admin/post/category/' + id);
  },
  
  /**
   * 文章分类下拉
   */
  getPostCategorySelector() {
    return requester.get('/admin/post/category');
  }
};

export default PostCategory;
