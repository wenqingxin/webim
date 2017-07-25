<template>
    <div class="waiting" v-show="showWaiting">
        <span class="loading"></span>
    </div>
</template>

<script>
    import {mapState} from 'vuex'
    export default {
        name: 'waitingBox',
        data () {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        },
        props:['showWaiting'],
        methods: {}
    }


</script>

<style lang="less" scoped>
    .waiting{
        position: absolute;
        top: 50px;
        right: 0;
        left: 0;
        bottom: 0;
        //background-color: #333;
        //opacity: 0.7;
        z-index: 10;
        .loading{
            display: inline-block;
            width: 64px;
            height: 64px;
            position: absolute;
            top: 35%;
            left: 50%;
            opacity: .2;
            margin-left: -32px;
            background: url(../../images/loading_more.gif) center no-repeat;
            background-size: contain;
        }
    }
</style>
