<template>
    <div class="box">
        <div class="box-header">
            <h2 class="title">{{ title }}</h2>
        </div>
        <div class="box-content"></div>
    </div>
</template>

<script>
    export default {
        computed: {
            title: function() {
                return this.$route.meta.title;
            }
        },
    }
</script>
