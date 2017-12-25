-- ----------------------------------------------------------------------------
-- 配置表以及序列
-- ----------------------------------------------------------------------------
-- drop sequence if exists seq_sys_config_id;
create sequence seq_sys_config_id
    increment by 1
    minvalue 1
    no maxvalue
    start with 1;
-- drop table if exists sys_config;
create table sys_config (
    id int not null default nextval('seq_sys_config_id'),
    key character varying(64) not null unique,
    val character varying(1024) not null,
    extra_val character varying(256),
    description character varying(128) not null,
    create_time timestamp with time zone default current_timestamp,
    status smallint default 1
) WITH (
    OIDS = FALSE
) TABLESPACE pg_default;

comment on table public.sys_config is '配置表';
comment on column public.sys_config.id is '主键id';
comment on column public.sys_config.key is '配置键';
comment on column public.sys_config.val is '配置值';
comment on column public.sys_config.extra_val is '备用值';
comment on column public.sys_config.description is '描述';
comment on column public.sys_config.create_time is '创建时间';
comment on column public.sys_config.status is '状态 1正常 0禁用 -1删除';
