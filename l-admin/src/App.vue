<template>
    <div id="app">
        <nprogress-container />
        <router-view />
    </div>
</template>

<script>
    import NprogressContainer from 'vue-nprogress/src/NprogressContainer';
    export default {
        name: 'app',
        components: {
            NprogressContainer
        }
    }
</script>

<style lang="scss">
    @import "./assets/scss/main";
</style>