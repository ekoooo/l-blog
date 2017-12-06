<template>
    <div class="box">
        <markdown-editor
            :onchange="onchange"
        />
    </div>
</template>

<script>
    import markdownEditor from '../components/operation/markdown-editor';

    export default {
        methods: {
            onchange: function (info) {
                console.log(info);
            }
        },
        computed: {
            title: function() {
                return this.$route.meta.title;
            }
        },
        components: {
            markdownEditor,
        },
    }
</script>
