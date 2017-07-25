<!-- 消息内容里的系统推送类消息 例如 "XXX加入群聊"
    props:
        text(String):文本消息内容
        time(String):时间字符串
-->
<template>
    <div class="tip">
        <Time-tip :time="time"></Time-tip>
        <div class="content">
            <span v-text="text"></span>
        </div>
    </div>
</template>

<script>
    import TimeTip from '../common/TimeTip.vue'
    export default {
        name: 'grayMsg',
        data () {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        },
        props:['text','time'],
        methods: {},
        components:{
            TimeTip
        }
    }


</script>

<style lang="less" scoped>
    .tip{
        text-align: center;
        margin-top: 18px;
        .content{
            span{
                //height: 26px;
                display: inline-block;
                background-color: #e4e8ef;
                line-height: 26px;
                padding: 0px 25px;
                font-size: 12px;
                font-family: "SimSun";
                color: rgb(102, 102, 102);
                border-radius: 2px;
            }

        }
    }
</style>
