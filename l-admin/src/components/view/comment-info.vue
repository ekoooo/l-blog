<template>
    <div class="view-item-table-container" v-loading="loading">
        <link rel="stylesheet" href="/static/editor.md/css/editormd.preview.css">
        <link rel="stylesheet" href="/static/editor.md/css/google_code_prettify_themes/vibrant-ink.min.css">

        <table class="view-item-table" border="1">
            <tr>
                <th>文章标题</th>
                <td>{{ data['post_title'] }}</td>
            </tr>
            <tr>
                <th>作者</th>
                <td>{{ data['author'] }}</td>
            </tr>
            <tr>
                <th>作者邮箱</th>
                <td>{{ data['mail'] }}</td>
            </tr>
            <tr>
                <th>作者网址</th>
                <td>{{ data['author_site'] }}</td>
            </tr>
            <tr>
                <th>回复 IP</th>
                <td>{{ data['create_ip'] }}</td>
            </tr>
            <tr>
                <th>回复时间</th>
                <td>{{ data['create_time'] }}</td>
            </tr>
            <tr>
                <th>回复内容</th>
                <td>
                    <div class="markdown-body" v-html="data['content']"></div>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    export default {
        props: {
            loading: {
                type: Boolean,
                "default": false,
            },
            data: {
                type: Object,
            }
        },
    }
</script>