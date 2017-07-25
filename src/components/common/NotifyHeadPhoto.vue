<!-- 系统推送类消息头像
    props:
        childType(Number):
             1: '系统消息'
             2: '航班类消息'
             3: '办公类消息'
             4: '订阅类消息'
-->
<template>
    <div class="head-photo" :style="{'background-color':getContent.bgColor}">
        <span v-text="getContent.text"></span>
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'notifyHeadPhoto',
        data () {
            return {

            }
        },
        computed:{
            getContent(){
                let content = {
                    text:'系统消息',
                    bgColor:'#74ca56'
                };

                switch (this.childType){
                    case 1:
                        content.text = '系统消息';
                        break;
                    case 2:
                        content.text = '航班类消息';
                        break;
                    case 3:
                        content.text = '办公类消息';
                        break;
                    case 4:
                        content.text = '订阅类消息';
                        break;

                }
                return content;
            }
        },
        props:['childType'],
    }

</script>

<style lang='less' scoped>
    .head-photo{
        text-align: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        position: relative;
        span{
            font-size: 30px;
            font-family: "FZDHTJW";
            color: rgb(255, 255, 255);
            line-height: 50px;
            vertical-align: middle;
        }

    }
</style>
