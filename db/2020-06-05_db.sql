-- 修改标签文字长度至 32 个字符
ALTER TABLE post_tags alter COLUMN "name" type character varying(32);