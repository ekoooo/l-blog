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
};

export default ColumnFormatter;