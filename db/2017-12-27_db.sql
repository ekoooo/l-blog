-- 修改评论表头像地址为评论人网站地址
alter table post_comments rename column avatar_url to author_site;
comment on column public.post_comments.author_site is '评论者网站地址';