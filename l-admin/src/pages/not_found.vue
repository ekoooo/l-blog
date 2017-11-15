<template>
    <div class="error-page">
        <div class="error-warp">
            <div class="image">
                <img src="../assets/404_error.png" height="155" width="381"/>
            </div>
            <h2 class="title">PAGE NOT FOUND</h2>
            <h3 class="desc">WE COULDN’T FIND THIS PAGE</h3>
            <router-link to="/">
                <el-button
                    size="large"
                    :loading="loading"
                    @click="loading = !loading">返回首页</el-button>
            </router-link>
        </div>
    </div>
</template>

<script>
    export default {
        data: function() {
            return {
                loading: false
            };
        }
    }
</script>

<style lang="scss" type="text/css" rel="stylesheet/scss" scoped>
    @import '../assets/scss/const';

    .error-page {
        position: absolute;
        background: $main-color;
        left: 0;
        top: 0;
        width: 100%;
        min-height: 100%;

        .error-warp {
            width: 1000px;
            margin: 0 auto;
            margin-top: 10%;
            text-align: center;

            .title {
                color: #fff;
                font-size: 64px;
                margin-top: 50px;
                margin-bottom: 15px;
            }

            .desc {
                color: #474747;
                font-size: 32px;
            }

            .el-button {
                background-color: #02C1DE - 40;
                color: #fff;
                border: none;

                &:hover {
                    background-color: #02C1DE - 80;
                }
            }
        }
    }
</style>
