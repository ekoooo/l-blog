import requester from '../utils/requester';

const Image = {
  /**
   * 获取图片列表
   * @param nextMarker
   */
  getList(nextMarker = '') {
    return requester.get('/admin/qiniu/files?size=20&mark=' + nextMarker);
  },
  
  /**
   * 获取上传 Token
   */
  getUploadToken() {
    return requester.get('/admin/qiniu/uploadToken');
  },
  
  /**
   * 删除一张照片
   * @param key
   */
  deleteImage(key) {
    return requester.delete('/admin/qiniu/' + key);
  },
};

export default Image;