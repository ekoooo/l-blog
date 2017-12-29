import moment from 'moment';

const ColumnFormatter = {
    /**
     * 文章状态
     */
    postStatusFormatter(row, column, cellValue) {
        const map = {
            "0": "草稿",
            "1": "发布",
            "-1": "删除"
        };
        
        return map[cellValue];
    },
    
    // 用户性别
    userGenderFormatter(row, column, cellValue) {
        const map = {
            "1": "男",
            "2": "女",
        };
        return map[cellValue];
    },
    
    // 用户状态
    userStatusFormatter(row, column, cellValue) {
        const map = {
            "1": "正常",
            "0": "停用",
        };
        return map[cellValue];
    },
    
    // 配置状态
    configStatusFormatter(row, column, cellValue) {
        const map = {
            "1": "正常",
            "0": "禁用",
            "-1": "删除",
        };
        return map[cellValue];
    },
    
    // 评论状态
    commentStatusFormatter(row, column, cellValue) {
        const map = {
            "1": "正常",
            "0": "未审核",
            "-1": "删除",
        };
        return map[cellValue];
    },
    
    // 投票类型
    voteTypeFormatter(row, column, cellValue) {
        const map = {
            "1": "Like",
            "-1": "Unlike",
        };
        return map[cellValue];
    },
    
    // 时间之类格式化
    timeFormatter(row, column, cellValue) {
        return moment(cellValue).format('YYYY-MM-DD HH:mm:ss')
    }
};

export default ColumnFormatter;