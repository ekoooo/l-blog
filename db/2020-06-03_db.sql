ALTER TABLE post_comments ADD COLUMN reply_id int;
comment on column public.post_comments.reply_id is '回复的评论ID';
comment on column public.post_comments.parent_id is '第一个父节点评论ID';