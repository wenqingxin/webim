<!-- 聊天框消息内容的时间头
    props:
        time(String):时间字符串
-->
<template>
    <div class="time">
        <span v-text="time">11:30</span>
    </div>
</template>

<script>
    export default {
        name: 'timeTip',
        data () {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        },
        props:['time'],
        methods: {}
    }


</script>

<style lang="less" scoped>
    .time{
        text-align: center;
        padding-bottom:8px;
        line-height: 12px;
        span{
            font-size: 12px;
            font-family: "SimSun";
            color: rgb(153, 153, 153);
        }
    }
</style>
