<!-- 消息发送框 -->
<template>
    <div class="input-text" @click="inputClick" v-show="!isSystemPush" :style="maximize?'height:176px':''">
        <div class="txt-area-wrapper">
            <textarea class="input-area" :style="maximize?'height:112px':''" id="inputTxt"
                      :placeholder="enterSend?'按Enter发送消息':'按Ctrl+Enter发送消息'"
                      v-model="inputMsg">
            </textarea>
        </div>
        <div class="input-bar" id="chatBodyChoosePhotoWrapper">
            <i class="face on-hand" @click.stop="showEmojiPanel(!emojiPanel)"></i>
            <span class="on-hand" ><i class="image" style="display: none" :style="imageViewer.show&&{'z-index':'auto'}" id="chatBodyChoosePhoto"></i></span>
            <transition name="fade">
                 <span class="option-box" v-show="optionBox">
                    <span class="op-wrapper">
                          <span class="op1" :class="{hook:!enterSend}" @click="beCtrlEnter">按Ctrl+Enter发送消息</span>
                    </span>
                     <span class="op-wrapper">
                          <span class="op2" :class="{hook:enterSend}" @click="beEnter">按Enter发送消息</span>
                     </span>
                </span>
            </transition>
            <span class="send-btn on-hand" @click="sendChatMessage">发送</span>
            <i class="arr-dn on-hand" @click.stop="optionBox=!optionBox"></i>
        </div>
        <Emoji-panel class="emoji-box" @select-emoji="getEmoji">
        </Emoji-panel>
    </div>
</template>

<script>
    import {mapMutations} from 'vuex'
    import {mapActions} from 'vuex'
    import {mapState} from 'vuex'
    import {mapGetters} from 'vuex'
    import {uploadFile} from '../../util/RongUpload.js'
    import {debounce} from '../../util/Utils.js'
    import {WebChatConst} from '../../util/Constant.js'
    import EmojiPanel from '../EmojiPanel.vue'
    export default {
        name: 'richEdit',
        data () {
            return {
                inputMsg: '',
                optionBox:false
            }
        },
        computed:{
            ...mapState([
                'maximize',
                'emojiPanel',
                'imageViewer',
                'rightWindowData',
                'conversationList',
                'remoteGroupList',
                'qiniuFileToken',
                'userInfo',
                'maximize'
            ]),
            ...mapGetters([
                'isSystemPush'
            ]),
            enterSend(){
                return this.userInfo[WebChatConst.webChatSendMsgWay];
            }
        },
        methods: {
            ...mapMutations(['showEmojiPanel','showAsideBar','setUserInfo']),
            sendChatMessage(){
                if(this.inputMsg!=undefined && this.inputMsg.trim()!=''){
                    this.$emit('send',this.inputMsg);
                    this.inputMsg="";
                }
            },
            getEmoji(emojiTxt){
                this.inputMsg = this.inputMsg || '';
                this.inputMsg+=emojiTxt;
                document.getElementById('inputTxt').focus();
            },
            inputClick(){
                this.showAsideBar(false);
                this.optionBox = false;
            },
            beEnter(){
                this.$set(this.userInfo,WebChatConst.webChatSendMsgWay,true);
                this.setUserInfo(this.userInfo);
                this.optionBox = false;
            },
            beCtrlEnter(){
                this.$set(this.userInfo,WebChatConst.webChatSendMsgWay,false);
                this.optionBox = false;
                this.setUserInfo(this.userInfo);
            },
        },
        mounted(){
            //初始化上传插件
            this.$nextTick(function () {
                $(document.getElementById('inputTxt')).niceScroll({
                    cursorcolor:"#aaa",
                    cursoropacitymin: 0, // change opacity when cursor is inactive (scrollabar "hidden" state), range from 1 to 0
                    cursoropacitymax: 1,
                    scrollspeed: 90, // scrolling speed
                });
                uploadFile({
                    //token:1,
                    token:this.qiniuFileToken||'livk5rb3__JZjCtEiMxXpQ8QscLxbNLehwhHySnX:86usHdzpNS_-QXcM7EJrB0CCZF4=:eyJzY29wZSI6InJvbmdjbG91ZC1pbWFnZSIsInJldHVybkJvZHkiOiJ7XCJuYW1lXCI6ICQoZm5hbWUpLFwic2l6ZVwiOiAkKGZzaXplKSxcIndcIjogJChpbWFnZUluZm8ud2lkdGgpLFwiaFwiOiAkKGltYWdlSW5mby5oZWlnaHQpLFwiaGFzaFwiOiAkKGV0YWcpfSIsImRlYWRsaW5lIjoxNDk4MTI3MDc0fQ==',
                    updaloadBtn: 'chatBodyChoosePhoto',
                    dropEleId: 'chatBodyChoosePhotoWrapper',
                    conEleId: 'chatBodyChoosePhotoWrapper',
                    onSuccess:({data,downloadUrl})=>{
                        this.$emit('upload-done',{data,downloadUrl});
                    },
                    onError:({data})=>{
                        if (data){
                            this.$emit('upload-done',{data});
                        }
                    },
                    onPrepare:(data)=>{
                        //this.$emit('upload-done',{data});
                    }
                });
                let _this = this;
                $('#inputTxt').keydown(function (e) {
                    if (_this.enterSend){
                        if (e.keyCode == 13){
                            //e.metaKey苹果command键
                            if (e.ctrlKey||e.metaKey) {
                                var val = this.value;
                                if (typeof this.selectionStart == "number" && typeof this.selectionEnd == "number") {
                                    var start = this.selectionStart;
                                    this.value = val.slice(0, start) + "\n" + val.slice(this.selectionEnd);
                                    this.selectionStart = this.selectionEnd = start + 1;
                                } else if (document.selection && document.selection.createRange) {
                                    this.focus();
                                    var range = document.selection.createRange();
                                    range.text = "\r\n";
                                    range.collapse(false);
                                    range.select();
                                }
                            }else{
                                _this.sendChatMessage();
                            }
                            return false;
                        }
                    }else{
                        if (e.keyCode == 13){
                            if (e.ctrlKey||e.metaKey){
                                _this.sendChatMessage();
                                return false;
                            }
                        }
                    }
                });
            })
        },
        components:{
            EmojiPanel
        },
        watch:{
            //监听聊天窗口切换来保存草稿
            'rightWindowData.targetId':{
                handler:function (newTargetId,oldTargetId) {
                    //默认是群,因为群消息可能直接从后台查出来,没有会话
                    let newConType = RongIMLib.ConversationType.GROUP;
                    let oldConType = RongIMLib.ConversationType.GROUP;

                    for (let i = 0;i<this.conversationList.length;i++){
                        let temp = this.conversationList[i];
                        if (temp.targetId == newTargetId ){
                            newConType = temp.conversationType;
                        }
                        if (temp.targetId == oldTargetId ){
                            oldConType= temp.conversationType;
                        }
                    }
                    if (oldTargetId){
                        if (this.inputMsg=='' || this.inputMsg == undefined){
                            RongIMLib.RongIMClient.getInstance().clearTextMessageDraft(oldConType,oldTargetId);
                        }else{
                            RongIMLib.RongIMClient.getInstance().saveTextMessageDraft(oldConType,oldTargetId,this.inputMsg);
                        }
                        let index = this.remoteGroupList.findIndex(item =>{
                            return item.chatGroupId==oldTargetId;
                        });
                        if (index != -1){
                            this.$set(this.remoteGroupList[index],'draft',this.inputMsg);
                        }
                    }
                    if(newTargetId){
                        let res = RongIMLib.RongIMClient.getInstance().getTextMessageDraft(newConType,newTargetId);
                        //alert('获取草稿:'+res);
                        this.inputMsg = res;
                    }else{
                        this.inputMsg = '';
                    }

                    document.getElementById('inputTxt').focus();
                },
                deep:true
            }
        }
    }

</script>

<style lang='less' scoped>
    @import "../../styles/common.less";
    .input-text {
        position: relative;
        height: 31px;
        padding-left: 21px;
        .txt-area-wrapper{
            overflow: hidden;
        }
        .input-bar {
            height: 31px;
            position: relative;
            .face {
                display: inline-block;
                background: url("../../images/face_icon.png") center no-repeat;
                width: 20px;
                height: 20px;
                background-size: 20px 20px;
                position: absolute;
                top:50%;
                margin-top: -10px;
                left:0px;
                &:hover{
                    background: url("../../images/face_icon_b.png") center no-repeat;
                }
            }
            .image {
                display: inline-block;
                background: url("../../images/image_icon.png") center no-repeat;
                width: 20px;
                height: 18px;
                background-size: 20px 18px;
                position: absolute;
                bottom: 12px;
                left: 39px;
                top:50%;
                margin-top: -9px;
                &:hover{
                    background: url("../../images/image_icon_b.png") center no-repeat;
                }
            }
        }
        .input-area {
            height: 86px;
            margin-top:12px;
            //height: 54px;
            resize: none;
            border: none;
            background-color: #f4f6fa;
            outline: none;
            width: 99%;
            font-size: 14px;
            font-family: "Microsoft YaHei";
            color: rgb(51, 51, 51);
            //display: block;
            //overflow: hidden;
            position: relative;
            line-height: 22px;
            &::placeholder {
                color: rgb(153, 153, 153);
            }
            &::-moz-placeholder {
                color: rgb(153, 153, 153);
            }

        }
        .hook {
            &:before {
                content: '';
                position: absolute;
                display: inline-block;
                background: url("../../images/select_hook_icon.png") center no-repeat;
                background-size: 23px 17px;
                width: 23px;
                height: 17px;
                top:50%;
                margin-top:-8px ;
                right: 19px;
            }
        }
        .send-btn{
            position: absolute;
            top:50%;
            margin-top: -16px;
            right: 34px;
            display: inline-block;
            width: 78px;
            border: 1px solid #d1d1d1;
            border-radius: 2px;
            height: 30px;
            line-height: 30px;
            background-color: #ffffff;
            font-size: 14px;
            font-family: "Microsoft YaHei";
            color: rgb(51, 51, 51);
            text-align: center;
            &:hover{
                background-color: #f7f7f7;
            }
        }
        i{
            position: absolute;
            right: 18px;
            top:50%;
            margin-top: -2.5px;
            background: url(../../images/send_arr_dn.png) center no-repeat;
            display: inline-block;
            background-size: 9px 5px;
            width: 9px;
            height: 5px;
            &:hover{
                background: url(../../images/send_arr_dn_b.png) center no-repeat;
            }
        }
        .option-box{
            position: absolute;
            height: 80px;
            width: 250px;
            display: inline-block;
            right: 10px;
            background-color: #fff;
            .box-shadow;
            border-radius: 4px;
            top: -90px;
            .op-wrapper{
                height: 39px;
                display: block;
                position: relative;
                border-bottom: 1px solid @common_border_color;

                .op(){
                    font-size: 14px;
                    font-family: "Microsoft YaHei";
                    color: rgb(69, 75, 85);
                    line-height: 40px;
                    padding-left: 20px;
                    display: block;
                    height: 28px;
                    line-height: 28px;
                    position: absolute;
                    width: 230px;
                    top: 5px;
                    &:hover{
                        background-color: #f2f2f2;
                    }
                }
                .op1{
                    .op();
                }
                .op2{
                    .op();
                }
            }


            &:after{
                content: "";
                display: inline-block;
                width: 6px;
                height: 6px;
                position: absolute;
                top: 77px;
                right: 10px;
                background-color: #fff;
                -webkit-transform: scaleX(1.4) rotate(225deg);
                transform: scaleX(1.4) rotate(315deg);
            }
        }

        .emoji-box {
            position: absolute;
            top: -133px;
            left: -172px;
        }
    }
</style>
