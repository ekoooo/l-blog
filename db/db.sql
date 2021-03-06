-- ----------------------------------------------------------------------------
-- 创建数据库
-- ----------------------------------------------------------------------------
-- CREATE DATABASE lblog
--     WITH
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'zh_CN.UTF-8'
--     LC_CTYPE = 'zh_CN.UTF-8'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1;

-- COMMENT ON DATABASE lblog IS 'l-blog 数据库';

--添加字段语句
--ALTER TABLE posts ADD content_desc_plain_text character varying(1024) default null;
--comment on column public.posts.content_desc_plain_text is '内容简述纯文本';


-- ----------------------------------------------------------------------------
-- 用户表以及序列
-- ----------------------------------------------------------------------------
-- drop sequence if exists seq_users_id;
create sequence seq_users_id
    increment by 1
    minvalue 1
    no maxvalue
    start with 1;
-- drop table if exists users;
create table users (
    id int not null default nextval('seq_users_id'),
    username character varying(32) unique not null,
    nickname character varying(32) not null,
    password character varying(128) not null,
    salt character varying(128),
    avatar_url character varying(256) default null,
    status smallint default 1,
    is_admin smallint default 0,
    create_time timestamp with time zone default current_timestamp,
    create_ip character varying(39) default null,
    PRIMARY KEY (id)
) WITH (
    OIDS = FALSE
) TABLESPACE pg_default;

comment on table public.users is '用户表';
comment on column public.users.id is '主键id';
comment on column public.users.username is '用户名';
comment on column public.users.nickname is '昵称';
comment on column public.users.password is '密码';
comment on column public.users.salt is '密码盐';
comment on column public.users.avatar_url is '头像地址';
comment on column public.users.status is '状态 1正常 0停用';
comment on column public.users.is_admin is '是否超级管理员 1是 0否';
comment on column public.users.create_time is '创建时间';
comment on column public.users.create_ip is '创建IP';


-- ----------------------------------------------------------------------------
-- 用户表信息表及序列
-- ----------------------------------------------------------------------------
-- drop sequence if exists seq_user_profile_id;
create sequence seq_user_profile_id
    increment by 1
    minvalue 1
    no maxvalue
    start with 1;
-- drop table if exists user_profile;
create table user_profile (
    id int not null default nextval('seq_user_profile_id'),
    user_id int not null,
    gender smallint default null,
    age smallint default null,
    phone character varying(32) default null,
    mail character varying(64) default null,
    description character varying(128) default null,
    PRIMARY KEY (id)
) WITH (
    OIDS = FALSE
) TABLESPACE pg_default;

comment on table public.user_profile is '用户表信息表';
comment on column public.user_profile.id is '主键id';
comment on column public.user_profile.user_id is '用户表ID';
comment on column public.user_profile.gender is '性别 1男 2女';
comment on column public.user_profile.age is '年龄';
comment on column public.user_profile.phone is '手机号码';
comment on column public.user_profile.mail is '邮箱地址';
comment on column public.user_profile.description is '描述';


-- ----------------------------------------------------------------------------
-- 文章表及序列
-- ----------------------------------------------------------------------------
-- drop sequence if exists seq_posts_id;
create sequence seq_posts_id
    increment by 1
    minvalue 1
    no maxvalue
    start with 1;
-- drop table if exists posts;
create table posts (
    id int not null default nextval('seq_posts_id'),
    user_id int not null,
    post_category_id int not null,
    title character varying(64) not null,
    content text default null,
    markdown text default null,
    plain_text text default null,
    content_desc character varying(1024) default null,
    content_desc_markdown character varying(1024) default null,
    content_desc_plain_text character varying(1024) default null,
    key_words character varying(128) default null,
    up_vote int default 0,
    down_vote int default 0,
    access_count int default 0,
    comment_check smallint default 0,
    create_time timestamp with time zone default current_timestamp,
    update_time timestamp with time zone default current_timestamp,
    status smallint default 0,
    PRIMARY KEY (id)
) WITH (
    OIDS = FALSE
) TABLESPACE pg_default;

comment on table public.posts is '文章表';
comment on column public.posts.id is '主键id';
comment on column public.posts.user_id is '用户表ID';
comment on column public.posts.post_category_id is '文章分类表ID';
comment on column public.posts.title is '标题';
comment on column public.posts.content is '内容 HTML';
comment on column public.posts.markdown is '内容 Markdown';
comment on column public.posts.plain_text is '内容纯文本，用于搜索';
comment on column public.posts.content_desc is '内容简述 HTML';
comment on column public.posts.content_desc_markdown is '内容简述 Markdown';
comment on column public.posts.content_desc_plain_text is '内容简述纯文本';
comment on column public.posts.key_words is '关键字';
comment on column public.posts.up_vote is '点赞数量';
comment on column public.posts.down_vote is '反对数量';
comment on column public.posts.access_count is '访问量';
comment on column public.posts.comment_check is '评论是否需审核 0不需要 1需要';
comment on column public.posts.create_time is '创建时间';
comment on column public.posts.update_time is '更新时间';
comment on column public.posts.status is '状态 1正常 0草稿 -1删除';

-- ----------------------------------------------------------------------------
-- 文章分类表及序列
-- ----------------------------------------------------------------------------
-- drop sequence if exists seq_post_category_id;
create sequence seq_post_category_id
    increment by 1
    minvalue 1
    no maxvalue
    start with 1;
-- drop table if exists post_category;
create table post_category (
    id int not null default nextval('seq_post_category_id'),
    name character varying(32) not null,
    create_time timestamp with time zone default current_timestamp,
    order_by int default 0,
    status smallint default 1,
    PRIMARY KEY (id)
) WITH (
    OIDS = FALSE
) TABLESPACE pg_default;

comment on table public.post_category is '文章分类表';
comment on column public.post_category.id is '主键id';
comment on column public.post_category.name is '分类名';
comment on column public.post_category.create_time is '创建时间';
comment on column public.post_category.order_by is '排序';
comment on column public.post_category.status is '状态 1正常 0删除';


-- ----------------------------------------------------------------------------
-- 文章标签表及序列
-- ----------------------------------------------------------------------------
-- drop sequence if exists seq_post_tags_id;
create sequence seq_post_tags_id
    increment by 1
    minvalue 1
    no maxvalue
    start with 1;
-- drop table if exists post_tags;
create table post_tags (
    id int not null default nextval('seq_post_tags_id'),
    post_id int not null,
    name character varying(16) not null,
    PRIMARY KEY (id)
) WITH (
    OIDS = FALSE
) TABLESPACE pg_default;

comment on table public.post_tags is '文章标签表';
comment on column public.post_tags.id is '主键id';
comment on column public.post_tags.post_id is '文章表ID';
comment on column public.post_tags.name is '标签名';


-- ----------------------------------------------------------------------------
-- 文章点赞表及序列
-- ----------------------------------------------------------------------------
-- drop sequence if exists seq_post_votes_id;
create sequence seq_post_votes_id
    increment by 1
    minvalue 1
    no maxvalue
    start with 1;
-- drop table if exists post_votes;
create table post_votes (
    id int not null default nextval('seq_post_votes_id'),
    post_id int not null,
    type smallint default 1,
    user_agent character varying(256),
    create_ip character varying(39) not null,
    create_time timestamp with time zone default current_timestamp,
    PRIMARY KEY (id)
) WITH (
    OIDS = FALSE
) TABLESPACE pg_default;

comment on table public.post_votes is '文章点赞表';
comment on column public.post_votes.id is '主键id';
comment on column public.post_votes.post_id is '文章表ID';
comment on column public.post_votes.type is '类型 1点赞 -1踩';
comment on column public.post_votes.user_agent is 'User Agent';
comment on column public.post_votes.create_ip is 'ip';
comment on column public.post_votes.create_time is '创建时间';

-- ----------------------------------------------------------------------------
-- 文章访问表及序列
-- ----------------------------------------------------------------------------
-- drop sequence if exists seq_post_access_id;
create sequence seq_post_access_id
    increment by 1
    minvalue 1
    no maxvalue
    start with 1;
-- drop table if exists post_access;
create table post_access (
    id int not null default nextval('seq_post_access_id'),
    post_id int not null,
    create_ip character varying(39) not null,
    user_agent character varying(256),
    create_time timestamp with time zone default current_timestamp,
    PRIMARY KEY (id)
) WITH (
    OIDS = FALSE
) TABLESPACE pg_default;

comment on table public.post_access is '文章访问表';
comment on column public.post_access.id is '主键id';
comment on column public.post_access.post_id is '文章表ID';
comment on column public.post_access.create_ip is 'ip';
comment on column public.post_access.user_agent is 'User Agent';
comment on column public.post_access.create_time is '创建时间';


-- ----------------------------------------------------------------------------
-- 文章评论表及序列
-- ----------------------------------------------------------------------------
-- drop sequence if exists seq_post_comments_id;
create sequence seq_post_comments_id
    increment by 1
    minvalue 1
    no maxvalue
    start with 1;
-- drop table if exists post_comments;
create table post_comments (
    id int not null default nextval('seq_post_comments_id'),
    post_id int not null,
    user_id int,
    parent_id int,
    author character varying(64) default null,
    avatar_url character varying(256) default null,
    mail character varying(64) default null,
    content text default null,
    create_ip character varying(39) not null,
    create_time timestamp with time zone default current_timestamp,
    status smallint default 1,
    PRIMARY KEY (id)
) WITH (
    OIDS = FALSE
) TABLESPACE pg_default;

comment on table public.post_comments is '文章评论表';
comment on column public.post_comments.id is '主键id';
comment on column public.post_comments.post_id is '文章表ID';
comment on column public.post_comments.user_id is '评论作者ID';
comment on column public.post_comments.parent_id is '引用 ID';
comment on column public.post_comments.author is '评论作者';
comment on column public.post_comments.avatar_url is '头像地址';
comment on column public.post_comments.mail is '邮箱地址';
comment on column public.post_comments.content is '评论内容';
comment on column public.post_comments.create_ip is 'ip';
comment on column public.post_comments.create_time is '创建时间';
comment on column public.post_comments.status is '状态 1正常 0待审核 -1 已删除';

