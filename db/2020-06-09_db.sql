-- sys_config id 设为主键
alter table sys_config add primary key(id);

-- 增加“关于”页面地址配置
insert into sys_config
(
    key,
    val,
    description
)
values
(
    'ABOUT_PAGE_URL',
    '#',
    '“关于”页面地址'
);