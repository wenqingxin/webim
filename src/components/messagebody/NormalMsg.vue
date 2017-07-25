<!-- 普通文本消息
        isOther(Boolean):是否是对方发送的消息
        text(String)
        name(String):发送人名字
        time(String):消息发送时间
        headSrc(String):头像的icon名称
        failed(Boolean):是否失败的标识
        messageId(String):messageId用于重发时删除该消息
 -->
<template>
    <div class="normal-msg-wrapper">
        <Time-tip :time="time"></Time-tip>
        <div class="normal-msg" :class="{me:!isOther,other:isOther}">
            <Icon-head-photo v-if="issys" class="hp" style="height: 36px;width: 36px;"
                             :src="headSrc.img"
                             :bg-color="headSrc.color"
                             img-width="20"
                             img-height="20">
            </Icon-head-photo>
            <Head-photo v-else class="hp on-hand" size="36" @h-click="clickHead" :src="headSrc"></Head-photo>
            <div class="name" v-show="isOther && showName" v-text="name"></div>
            <Chat-bubble class="chat-box"
                         :is-right="!isOther"
                         :failed="failed"
                         @refresh="resend"
                         :arr-top="isOther && showName"
            >
                <span class="txt-msg" v-if="issys" v-html="text"></span>
                <span class="txt-msg" v-else v-html="transEmo"></span>
            </Chat-bubble>
        </div>
    </div>
</template>

<script>
    import HeadPhoto from '../common/HeadPhoto.vue'
    import ChatBubble from '../common/ChatBubble.vue'
    import TimeTip from '../common/TimeTip.vue'
    import IconHeadPhoto from '../common/IconHeadPhoto.vue'
    export default {
        name: 'normalMsg',
        data () {
            return {
                emojiList:require('../../images/emotion/emotion.json'),
            }
        },
        props: ['isOther', 'text', 'name', 'time', 'headSrc','failed','messageId','issys','showName'],
        components: {
            HeadPhoto,
            ChatBubble,
            TimeTip,
            IconHeadPhoto
        },
        computed: {
            //文字表情转换
            transEmo()
            {

                let emojiReg = /\[(.*?)\]/gm;//表情转义符
                let linkReg = /\b((https|http|ftp|rtsp|mms)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+:)?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/[0-9a-z_!~*'();?:@.&=+$,%#-]+)+\/?|(\/?))\b/g;
                return this.text
                    //脚本过滤
                    .replace(new RegExp("<","g"),"&lt;").replace(new RegExp(">","g"),"&gt;")
                    //换行替换
                    .replace(new RegExp("\n","g"),"<br>").replace(new RegExp("\r\n","g"),"<br>")
                    //空格替换
                    .replace(new RegExp(" ","g"),"&nbsp;")
                    //链接样式过滤
                    .replace(linkReg,match=> {
                        let arr = match.split(':');
                        let url = match;
                        if (arr && (arr[0]!='http' && arr[0]!='https'
                            && arr[0]!='ftp' && arr[0]!='file')){
                            url = "http://"+url;
                        }
                        return '<a href="javascript:window.open('+"'"+url+"'"+');">'+match+'</a>';
                    })
                    //表情样式过滤
                    .replace(emojiReg, match=> {
                        let res = this.emojiList.find(value=> {
                            return value.text == match;
                        });
                        if(res){
                            return "<img style='"+this.imgStyle+"' src='"+require('../../images/emotion/'+res.name+'.png')+"'/>";
                        }else{
                            return match;
                        }
                });
            },
            imgStyle(){
                return  'line-height: 36px;'+
                        'vertical-align: -7px;'+
                        'height: 26px;'+
                        'width: 26px;'
            }
        },
        methods:{
            resend(){
                this.$emit('resend',{isTxt:true,text:this.text,messageId:this.messageId});
            },
            clickHead(){
                this.$emit('click-head');
            }
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
                //line-height: 36px;
                line-height: 22px;
                vertical-align: middle;
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
