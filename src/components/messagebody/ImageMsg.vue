<!-- 图片消息内容
      props:
        isOther(Boolean):是否是对方发送的消息
        name(String):发送人名字
        time(String):消息发送时间
        headSrc(String):头像的icon名称
        imageUri(String):图片的链接地址
        dataUrl(String):图片的base64编码
        failed(Boolean):是否失败的标识
        messageId(String):messageId用于重发时删除该消息
-->
<template>
    <div class="normal-msg-wrapper">
        <Time-tip :time="time"></Time-tip>
        <div class="normal-msg" :class="{me:!isOther,other:isOther}">
            <Head-photo class="hp on-hand" size="36" :src="headSrc" @h-click="clickHead"></Head-photo>
            <div class="name" v-show="isOther && showName" v-text="name"></div>
            <Chat-bubble
                    :is-img='true'
                    class="chat-box"
                    :is-right="!isOther"
                    :failed="failed"
                    :arr-top="isOther && showName"
                    @refresh="resend">
                <img class="img-msg on-hand" :src="imageData" alt="" @click="viewImage">
            </Chat-bubble>
        </div>
    </div>
</template>

<script>
    import HeadPhoto from '../common/HeadPhoto.vue'
    import ChatBubble from '../common/ChatBubble.vue'
    import TimeTip from '../common/TimeTip.vue'
    import {mapMutations} from 'vuex'
    export default {
        name: 'imageMsg',
        data () {
            return {
                viewSrc:''
            }
        },
        props: ['isOther', 'name', 'time', 'headSrc', 'imageUri', 'dataUrl','failed','messageId','showName'],
        computed:{
            imageData(){
                return "data:image/png;base64," + this.dataUrl;
            }
        },
/*        watch:{
            dataUrl:{
                handler: function () {
                    let img = new Image();//预加载图片
                    img.onload =  () => {
                        this.viewSrc = this.imageUri;
                    };
                    img.src = this.imageUri;
                }
            }
        },*/
        methods:{
            ...mapMutations(['showImageViewer']),
            viewImage(){
                //let finalData = this.viewSrc || this.imageData;
                let finalData = this.imageUri||this.imageData;
                this.showImageViewer({show:true,src:finalData})
            },
            resend(){
                this.$emit('resend',{isTxt:false,data:this.dataUrl,downloadUrl:this.imageUri,messageId:this.messageId})
            },
            clickHead(){
                this.$emit('click-head');
            }
        },
        components: {
            HeadPhoto,
            ChatBubble,
            TimeTip
        }
    }


</script>

<style lang="less" scoped>
    @import "../../styles/common.less";

    .normal-msg-wrapper {
        margin-top: 18px;
        .normal-msg {
            position: relative;
            .clearfix;
            .txt-msg {
                line-height: 36px;
            }
            .img-msg {
                display: inline-block;
                /*/margin-top: 8px;*/
                //margin-bottom: 5px;
                padding: 0 0px;
                margin-bottom: -3px;
                position: relative;
                z-index: 1;
            }
            .hp {
                position: absolute;
                top: 0;

            }
            .name {
                margin-left: 75px;
                font-size: 12px;
                font-family: "SimSun";
                color: rgb(142, 146, 153);
                padding-bottom: 3px;
            }
        }

    }

    .other {
        .hp {
            left: 20px;
        }
        .chat-box {
            margin-left: 75px;
        }

    }

    .me {
        .hp {
            right: 20px;
        }
        .chat-box {
            margin-right: 75px;
            float: right;
        }
        .name {
            text-align: right;
            margin-right: 75px;

        }

    }

</style>
