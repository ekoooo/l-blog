import requester from '../utils/requester';

const SysConfig = {
    CONFIG_LIST_PAGE_SIZE: 10,
    CONFIG_LIST_SEARCHPARAMS: {
        key: undefined,
        val: undefined,
        description: undefined,
        status: undefined,
    },
    
    // 获取配置列表
    getSysConfigList(searchParams) {
        let defaultParams = {
            pageId: 0,
            pageSize: SysConfig.CONFIG_LIST_PAGE_SIZE
        };
        
        return requester.post('/admin/config/list',
            Object.assign({}, defaultParams, searchParams));
    },
    
    // 添加一条配置
    addSysConfig(formInfo) {
        return requester.post('/admin/config/', formInfo);
    },
    
    // 编辑一条配置
    editSysConfig(formInfo) {
        return requester.put('/admin/config/' + formInfo.id, formInfo);
    }
};

export default SysConfig;