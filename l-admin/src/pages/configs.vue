<template>
    <div class="box">
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
