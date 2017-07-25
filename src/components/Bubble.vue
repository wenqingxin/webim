<!-- 头像消息气泡提示
     props:
        unread(Number):未读消息数
                   <-1:是一个小圆点
                   =0 :不显示
                   >=99:显示99+样式
        headImg(String):气泡大小

-->
<template>
    <i :class="getStyle.style" v-text="getStyle.unread">

    </i>
</template>

<script>
    export default {
        name: 'bubble',
        data () {
            return {
            }
        },
        props:['unread','headImg'],
        methods: {},
        computed:{
            getStyle(){
                let bubbleStyle = this.headImg ? 'bubble-thin-head' : 'bubble-thin';
                let unreadMsg = this.unread;
                if(Number(this.unread) >= 99){
                    bubbleStyle = this.headImg ? 'bubble-wide-head' : 'bubble-wide';
                    unreadMsg = '99+';
                }
                if(Number(this.unread < 0) || !this.unread){
                    bubbleStyle = this.headImg ? 'bubble-small-head' : 'bubble-small';
                    unreadMsg = '';
                }
                if(Number(this.unread == 0)){
                    bubbleStyle = 'bubble-hide';
                    unreadMsg = '';
                }
                return {
                    style:bubbleStyle,
                    unread:unreadMsg
                }
            }
        }
    }

</script>

<style lang='less' scoped>
    .bubble(){
        background-color: #ff3b3b;
        display: inline-block;
        position: absolute;
        font-size: 12px;
        font-family: "Arial";
        font-style:normal;
        color: rgb(255, 255, 255);
        line-height: 18px;
        text-align: center;
    }
    .bubble-wide{
        .bubble();
        width: 25px;
        height: 18px;
        border-radius: 7px;
        top: -10px;
        right: -18px;
    }
    .bubble-wide-head{
        .bubble-wide;
        top: -4px;
        right: -8px;
    }
    .bubble-thin{
        .bubble();
        width: 18px;
        height: 18px;
        border-radius: 50%;
        top: -12px;
        right: -12px;
    }
    .bubble-thin-head{
        .bubble-thin;
        top: -5px;
        right: -5px;
    }
    .bubble-small{
        .bubble();
        width: 10px;
        height: 10px;
        border-radius: 50%;
        top: -6px;
        right: -6px;
    }
    .bubble-small-head{
        .bubble-small;
        top: 0px;
        right: 0px;
    }
    .bubble-hide{
        display: none;
    }
</style>
