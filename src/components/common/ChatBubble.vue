<!-- 聊天气泡
    props:
        isRight(boolean):方向是否在右边
        failed(boolean):是否有发送消息失败的重发标识
-->
<template>
    <div class="chat-bubble-wrapper" :style="{'text-align': isRight?'right':'left'}">
        <div class="chat-bubble" :class="{'arr-left':!isRight,'arr-right':isRight,'modify-arr-top':arrTop}">
            <div class="text-left" :class="{'img-padding':isImg}">
                <i class="failed" v-if="isRight && failed" @click="refresh"></i>
                <slot></slot>
            </div>
        </div>
    </div>

</template>

<script>
    export default {
        name: 'chatBubble',
        data () {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        },
        props:['isRight','failed','isImg','arrTop'],
        methods:{
            refresh(){
                this.$emit('refresh')
            }
        }
    }


</script>

<style lang="less" scoped>
    @import "../../styles/common.less";
    .text-right{
        text-align: right;
    }
    .text-left{
        text-align: left;
    }
    .img-padding{
        padding: 5px 5px !important;
    }
    .chat-bubble-wrapper{
        width: 368px;
        .chat-bubble{
            border-radius: 5px;
            display: inline-block;
            vertical-align: middle;
            background-color: #ffffff;
            position: relative;
            div{
                display: inline-block;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(51, 51, 51);
                //padding: 0 8px;
                padding: 6px 10px;
                word-break: break-all ;
            }
            .failed{
                display: inline-block;
                width: 20px;
                height: 20px;
                background: url(../../images/chat_send_failed.png) no-repeat center;
                background-size: contain;
                position: absolute;
                left: -30px;
                top:8px;
                .on-hand;
            }
        }

    }
    .arr(){
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        position: absolute;
        //top:7px;
        top:13px;
    }
    .modify-arr-top{
        &:after{
            top:7px !important;
        }
    }
    .arr-left{
        border: 1px solid @common_border_color;
        &:after{
            .arr();
            border-bottom: 1px solid @common_border_color;
            border-left: 1px solid @common_border_color;
            left:-5px;
            background-color: #fff;
            transform:  scaleX(1.4) rotate(45deg);
        }
    }
    .arr-right{
        background-color: #dce8ff !important;
        border: 1px solid #d1dffa;
        &::after{
            .arr();
            border-bottom: 1px solid #d1dffa;
            border-left: 1px solid #d1dffa;
            background-color: #dce8ff !important;
            right:-5px;
            background-color: #fff;
            transform:  scaleX(1.4) rotate(225deg);
        }
    }

</style>
