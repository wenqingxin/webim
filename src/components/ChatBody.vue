<!-- 聊天消息框 -->
<template>
    <transition name="fade">

        <div class="chat-body">
            <div class="chat-content"  :style='getInputHeight' id="chatContentBox" @click="showAsideBar(false);">
                <div class="warapper" v-for="(message,index) in parse">
                    <!-- FOC航班提醒 -->
                    <Notify-msg v-if="message.objectName == 'RC:CmdNtf'
                                 &&message.messageDirection== 2
                                 &&message.content.name == 'notice'"
                                title="FOC航班提醒"
                                :time="formatTime(message.sentTime)"
                                :content="message.cmdDataContent"
                                :show-btn="false">
                    </Notify-msg>
                    <!-- 系统消息 -->
                    <Gray-msg v-else-if="message.objectName == 'RC:CmdNtf'
                                 &&message.messageDirection== 2
                                 &&message.content.name == 'sysmessage'"
                              :text="message.cmdDataContent"
                              :time="message.messageTime"
                    ></Gray-msg>
                    <!-- 讨论组消息 -->
                    <Gray-msg v-else-if="message.objectName == 'RC:DizNtf'"
                              :text="message.text"
                              :time="message.messageTime"
                    ></Gray-msg>
                    <!-- 航班调配 -->
                    <Notify-msg v-else-if="message.objectName == 'RC:TxtMsg'
                             && JSON.parse(message.content.extra).type
                             && (JSON.parse(message.content.extra).type==2)"
                                title="航班调配信息"
                                :time="formatTime(message.sentTime)"
                                :show-btn="JSON.parse(message.content.extra).isFeedback == '1'"
                                :done="message.extra && JSON.parse(message.extra) && JSON.parse(message.extra).mcMageRead == '1'"
                                :message-id="message.messageId"
                                :msg-id="JSON.parse(message.content.extra).msgId"
                                :msg-type="JSON.parse(message.content.extra).msgType"
                                :messageUId="message.messageUId">
                        <p><label v-text="JSON.parse(message.content.extra).msgTypeName"></label><label>【变更】</label>提醒
                        <p/>
                        <p><label>航班日期:</label><span v-text="JSON.parse(message.content.extra).flightTime"></span></p>
                        <p><label>发布人:</label><span v-text="JSON.parse(message.content.extra).senderName"></span></p>
                        <p><label>发布时间:</label><span v-text="JSON.parse(message.content.extra).sendTime"></span></p>
                        <p style='padding: 20px 0;' v-text="JSON.parse(message.content.extra).content"></p>
                    </Notify-msg>

                    <!-- MIS消息提醒 -->
                    <Notify-msg v-else-if="message.objectName == 'RC:TxtMsg'
                             && JSON.parse(message.content.extra).type
                             && (JSON.parse(message.content.extra).type==3)"
                                title="MIS航班提醒"
                                :time="formatTime(message.sentTime)"
                                :show-btn="false">
                        <p><label v-text="JSON.parse(message.content.extra).msgTypeName"></label><label>【变更】</label>提醒
                        </p>
                        <p><label>航班日期:</label><span v-text="JSON.parse(message.content.extra).flightTime"></span></p>
                        <p><label>发布人:</label><span v-text="JSON.parse(message.content.extra).senderName"></span></p>
                        <p><label>发布时间</label><span v-text="JSON.parse(message.content.extra).sendTime"></span></p>
                        <p style='padding: 20px 0;' v-text="JSON.parse(message.content.extra).content"></p>
                    </Notify-msg>
                    <!-- 普通文本的系统提醒 -->
                    <Normal-msg :isOther="true"
                                v-else-if="message.objectName == 'RC:TxtMsg'&&
                                (message.senderUserId == 'system'
                                                           || message.senderUserId == 'office'
                                                           || message.senderUserId == 'subscription'
                                                           || message.senderUserId == 'flight')"
                                :text="message.content.content"
                                :head-src="getSysHeadSrc(message)"
                                :name="message.sendUserName"
                                :time="message.messageTime"
                                :message-id="message.messageId"
                                :issys="true"
                                :show-name="true"
                    ></Normal-msg>
                    <!-- 普通文本消息 -->
                    <Normal-msg :isOther="message.messageDirection==2"
                                v-else-if="message.objectName == 'RC:TxtMsg'"
                                :text="message.content.content"
                                :head-src="getHeadSrc(message)"
                                :name="message.sendUserName"
                                :time="message.messageTime"
                                :message-id="message.messageId"
                                :failed="message.sentStatus==rongSentStatus.FAILED"
                                @resend="resend"
                                @click-head="checkStaffDetail(message.senderUserId)"
                                :show-name="message.conversationType != rongConversationType.PRIVATE"
                    ></Normal-msg>
                    <!-- 图片消息 -->
                    <Image-msg :isOther="message.messageDirection==2"
                               v-else-if="message.objectName == 'RC:ImgMsg'"
                               :head-src="getHeadSrc(message)"
                               :imageUri="message.content.imageUri"
                               :name="message.sendUserName"
                               :time="message.messageTime"
                               :data-url="message.content.content"
                               :message-id="message.messageId"
                               :failed="message.sentStatus==rongSentStatus.FAILED"
                               @resend="resend"
                               @click-head="checkStaffDetail(message.senderUserId)"
                               :show-name="message.conversationType != rongConversationType.PRIVATE"

                    ></Image-msg>
                </div>

            </div>
            <Rich-edit @send="sendChatMessage" @upload-done="sendImageMessage"
                       v-if="!rightWindowData.childType"></Rich-edit>
            <div class="right-bar">
                <Aside-bar v-show="asideBar"></Aside-bar>
            </div>
        </div>
    </transition>
</template>

<script>
    import GrayMsg from './messagebody/GrayMsg.vue'
    import NormalMsg from './messagebody/NormalMsg.vue'
    import NotifyMsg from './messagebody/NotifyMsg.vue'
    import ImageMsg from './messagebody/ImageMsg.vue'
    import AsideBar from './AsideBar.vue'
    import EmojiPanel from './EmojiPanel.vue'
    import {mapMutations} from 'vuex'
    import {mapActions} from 'vuex'
    import {mapState} from 'vuex'
    import {parseMessageList, DateDiff, formatDate, convert_message_timestamp, parseExtra,isInvalidObject,dataAccess} from '../util/Utils.js'
    import RichEdit from './common/RichEdit.vue'
    import {WebChatConst} from '../util/Constant.js'
    import SpringLib from '../libs/SpringLib.js'
    import {debounce,Service} from '../util/Utils.js'
    let container;

    export default {
        name: 'chatBody',
        data () {
            return {
                src: require('../images/head_photo.png'),
                showMsg: true,
                WebChatConst: WebChatConst,
                curScrollHeight: 0,
                rongSentStatus: RongIMLib.SentStatus,
                rongConversationType:RongIMLib.ConversationType,
            }
        },
        computed: {
            ...mapState([
                'rightWindowData',
                'userInfo',
                'curReceiveMessage',
                'emojiPanel',
                'imageViewer',
                'curMiddleView',
                'curChatWindowView',
                'asideBar',
                'hasUpdateContact',
                'maximize',
                'minimizeOps',
            ]),
            getInputHeight(){
                if (this.maximize){
                    let height = document.body.clientHeight;
                    return {
                        height:(height-220)+'px'
                    }
                }
            },
            parse(){
                let messageList = JSON.parse(JSON.stringify(this.rightWindowData.chatBodyData));
                let res = parseMessageList(messageList, this.userInfo);
                for (let i = 0;i<this.rightWindowData.chatBodyData.length;i++){
                    let message = this.rightWindowData.chatBodyData[i];
                    if (message.text){
                        continue;
                    }
                    if (message.objectName == 'RC:DizNtf'){
                        let msg = '';
                        let ids = '';
                        let describe = '';
                        let beforeDes='';
                        if (message.content.type==1){//添加成员
                            ids= message.senderUserId+','+message.content.extension;
                            beforeDes=message.senderUserId;
                            describe='加入讨论组';
                            res[i].text = describe;
                        }else if (message.content.type==2){//退出讨论组
                            ids= message.content.extension;
                            describe='退出讨论组';
                            res[i].text = describe;
                        }else if (message.content.type==3){//修改名字
                            //message.text = message.content.extension + ' 退出讨论组';
                            ids=message.senderUserId;
                            describe = '修改讨论组名称为 '+message.content.extension;
                            res[i].text = describe;
                        }
                        let getNameFun;
                        let remoteFun = (ids,cb)=> {
                            let _ids =ids.join(',');
                            Service.getInstance().post(
                                SpringLib.Config.smpGetStaffArrUrl,
                                {ids:_ids,jobcode:this.userInfo.jobcode }).then(res =>{
                                if (res && res.data && res.data.isSuccess){
                                    console.log('查询远程员工列表',res);
                                    cb(res.data.data)
                                }else{
                                    cb();
                                }
                            }).catch(()=>{
                                cb();
                            })
                        };
                        if (this.hasUpdateContact){
                            getNameFun=(ids, cb)=>{
                                dataAccess.queryStaffByStaffId(ids,  (ret)=> {
                                    if (!ret || ret.length!=ids.length){
                                        remoteFun(ids,(remoteRet)=>{
                                            cb(remoteRet);
                                        })
                                    }else{
                                        cb(ret);
                                    }
                                });
                            }
                        }else{
                            getNameFun=remoteFun;
                        }
                        if (ids){
                            getNameFun.call(dataAccess,ids.split(','),  (ret)=> {
                                console.log('获取讨论组成员信息结果:'+JSON.stringify(ret));
                                //alert('参数:'+ids+'结果:'+JSON.stringify(ret))
                                if (!ret) return;
                                for (let j = 0; j < ret.length; j++) {
                                    if (beforeDes == ret[j].staffId){
                                        beforeDes = ret[j].text||ret[j].staffName;
                                        continue;
                                    }
/*                                    if (j == ret.length - 1) {
                                        msg = msg+(ret[j].text||ret[j].staffName);
                                        break;
                                    }*/
                                    msg += (ret[j].text||ret[j].staffName) + ' ';
                                }
                                if (message.content.type==1){
                                    msg=beforeDes+' 邀请 '+msg;
                                }
                                this.$set(message,'text',msg+describe);
                            })
                        }
                    }
                }
                //alert('外:'+this.rightWindowData.chatBodyData.length);
                //console.log(JSON.stringify(this.rightWindowData.chatBodyData))
                return res;
            },
        },
        watch: {
            //刷新窗口消息
            curReceiveMessage: {
                handler: function (val,oldval) {
                    //let newMsg = parseMessageList([val],this.userInfo);
                    //console.log('newMsg',newMsg)
                    if (this.rightWindowData.targetId == val.targetId){
                        let temp = JSON.parse(JSON.stringify(val));
                        this.$set(this.rightWindowData.chatBodyData, this.rightWindowData.chatBodyData.length, temp);
                        this.scrollToEnd();
                    }
                },
                deep:true
            },
            asideBar:function (val) {
                if(val){
                    $(container).getNiceScroll().hide();
                }
            },
            'rightWindowData.targetId':function () {
                this.showAsideBar(false);
            },
            'minimizeOps.show':{
                handler:function (val) {
                    if (!val){
                        this.scrollToEnd();
                    }

                },
                deep:true
            }

        },
        methods: {
            ...mapMutations(['showEmojiPanel','setRightWindowData','showContactProfile', 'showAsideBar','showChatWindowView','setStaffProfileDetail']),
            ...mapActions(['sendMsg', 'getConversationList', 'getHistoryMessages','getLocalDbUserDetail','checkStaffDetail']),
            sendChatMessage(sendMsg){
                RongIMLib.RongIMClient.getInstance().
                clearTextMessageDraft(this.rightWindowData.conversationType,this.rightWindowData.targetId);
                let param = {
                    conType: this.rightWindowData.conversationType,
                    targetId: this.rightWindowData.targetId,
                    msg: sendMsg,
                    gender: this.rightWindowData.gender,
                    icon: this.rightWindowData.icon,
                    targetName: this.rightWindowData.targetName,
                };
                if (param.conType != RongIMLib.ConversationType.PRIVATE){
                    param.flightTime = this.rightWindowData.flightTime;
                    param.groupType = this.rightWindowData.groupType;
                }
                this.sendMsg({
                    ...param,
                    onPrepare:message=>{
                        this.$set(this.rightWindowData.chatBodyData, this.rightWindowData.chatBodyData.length, message);
                        this.scrollToEnd();
                    },
                    onSuccess: ()=>{
                        this.getConversationList();
                    },
                    onError:(message,errorCode)=>{
                        console.log('发送失败',errorCode);
                    }
                });
            },
            sendImageMessage({data, downloadUrl}){
                console.log('上传完成,开始发送消息');
                RongIMLib.RongIMClient.getInstance().
                clearTextMessageDraft(this.rightWindowData.conversationType,this.rightWindowData.targetId);
                let param = {
                    conType: this.rightWindowData.conversationType,
                    targetId: this.rightWindowData.targetId,
                    gender: this.rightWindowData.gender,
                    icon: this.rightWindowData.icon,
                    targetName: this.rightWindowData.targetName,
                    image: true,
                    data,
                    downloadUrl
                };
                if (param.conType != RongIMLib.ConversationType.PRIVATE) {
                    param.flightTime = this.rightWindowData.flightTime;
                    param.groupType = this.rightWindowData.groupType;
                }
                this.sendMsg({
                    ...param,
                    onPrepare:message=>{
                        this.$set(this.rightWindowData.chatBodyData, this.rightWindowData.chatBodyData.length, message);
                        this.scrollToEnd();
                    },
                    onSuccess: ()=>{
                        this.getConversationList();
                    },
                    onError:(message,errorCode)=>{
                        console.log('发送失败',errorCode);
                    }
                });
            },
            resend(payload){
                RongIMLib.RongIMClient.getInstance().deleteLocalMessages(
                    this.rightWindowData.conversationType, this.rightWindowData.targetId, [payload.messageId], {
                        onSuccess: () => {
                            console.log('删除发送失败的消息成功!');
                            for (let i = 0; i < this.rightWindowData.chatBodyData.length; i++) {
                                if (payload.messageId == this.rightWindowData.chatBodyData[i].messageId) {
                                    this.rightWindowData.chatBodyData.splice(i, 1);
                                    if (payload.isTxt) {
                                        this.sendChatMessage(payload.text);
                                    } else {
                                        this.sendImageMessage({data: payload.data, downloadUrl: payload.downloadUrl});
                                    }
                                    break;
                                }
                            }
                        },
                        onError: function () {
                            console.log('删除发送失败的消息失败!');
                        }
                    });
            },
            scrollToEnd(){
                setTimeout( ()=>{
                    container.scrollTop = container.scrollHeight-container.clientHeight;
                },50);

            },
            getHeadSrc(message){
                let res='';
                if(message.conversationType == RongIMLib.ConversationType.PRIVATE){
                    res = message.messageDirection == 2 ? parseExtra(message).src : this.userInfo.icon;
                }else {
                    if (message.content.extra){
                        let extraJSON = JSON.parse(message.content.extra);
                        if (!isInvalidObject(extraJSON)){
                            let sender = extraJSON['id' + message.senderUserId];
                            if(!isInvalidObject(sender)){
                                res = sender.icon;
                            }
                        }
                    }
                }
                return res;
            },
            getSysHeadSrc(message){
                let res = {img:'',color:''};
                if (message.senderUserId == 'system'){
                    res.img = require('../images/system_noti_icon.png');
                    res.color='#55ce3d';
                }else if (message.senderUserId == 'office'){
                    res.img = require('../images/office_noti_icon.png');
                    res.color='#f2c118';

                }else if (message.senderUserId == 'subscription'){
                    res.img =  require('../images/subscribe_noti_icon.png');
                    res.color='#f17d55';

                }else if (message.senderUserId == 'flight'){
                    res.img = require('../images/flight_noti_icon.png');
                    res.color='#549cf2';
                }
                return res;
            },
            formatTime(time){
                return formatDate(time, 1)
            },
        },
        mounted(){
            this.$nextTick(function () {
                container = document.getElementById('chatContentBox');
                $(container).niceScroll({
                    cursorcolor:"#aaa",
                    cursoropacitymin: 0, // change opacity when cursor is inactive (scrollabar "hidden" state), range from 1 to 0
                    cursoropacitymax: 1,
                    scrollspeed: 90, // scrolling speed
                });
                let getHisByDbc = debounce((targetId, type) => {
                    //this.getHistoryMessages(targetId,type);
                    if (targetId && type) {
                        RongIMLib.RongIMClient.getInstance().getHistoryMessages(type, targetId, null, WebChatConst.chatMsgNumPerPage, {
                            onSuccess:  (list, hasMsg)=> {
                                // hasMsg为boolean值，如果为true则表示还有剩余历史消息可拉取，为false的话表示没有剩余历史消息可供拉取。
                                // list 为拉取到的历史消息列表
                                if (hasMsg) {
                                    console.log('获取聊天记录成功!', list);
                                    this.rightWindowData.chatBodyData = list.concat(this.rightWindowData.chatBodyData);
                                    setTimeout(()=>{
                                        container.scrollTop = container.scrollHeight - this.curScrollHeight;
                                    },0);
                                    //$(container).getNiceScroll()[0].doScrollTop(container.scrollHeight - this.curScrollHeight, 0.1);
                                    this.curScrollHeight = container.scrollHeight;
                                } else {
                                    console.log('没有更多消息了!');
                                }
                            },
                            onError: function (error) {
                                // APP未开启消息漫游或处理异常
                                // throw new ERROR ......

                            }
                        });
                    }
                }, 500);
                $(container).on('scroll', () => {
                    if (container.scrollTop < 50 && container.scrollTop>0){
                        getHisByDbc(this.rightWindowData.targetId, this.rightWindowData.conversationType);
                    }

                });
                //this.scrollToEnd();
            })
        },
        updated(){
            if (this.rightWindowData.chatBodyData.length <= WebChatConst.chatMsgNumPerPage) {
                setTimeout( ()=>{
                    this.scrollToEnd();
                },50);
                //this.curScrollHeight = container.scrollHeight;
            }
        },
        components: {
            GrayMsg,
            NormalMsg,
            NotifyMsg,
            AsideBar,
            EmojiPanel,
            ImageMsg,
            RichEdit
        }
    }
</script>

<style lang="less" scoped>
    @import "../styles/common.less";

    .chat-body {
        position: relative;
        .right-bar {
            position: absolute;
            top: 0;
            right: 0;
            overflow: hidden;
            z-index: 1;
        }
        .chat-content {
            height: 399px;
            border-bottom: 1px solid @common_border_color;
            overflow: hidden;
            position: relative;
            padding-bottom: 3px;

        }
        .input-text {
            height: 150px;
            .input-bar {
                height: 44px;
                position: relative;
                .face {
                    display: inline-block;
                    background: url("../images/face_icon.png") center no-repeat;
                    width: 20px;
                    height: 20px;
                    background-size: 20px 20px;
                    position: absolute;
                    bottom: 12px;
                    left: 21px;
                }
                .image {
                    display: inline-block;
                    background: url("../images/image_icon.png") center no-repeat;
                    width: 20px;
                    height: 18px;
                    background-size: 20px 18px;
                    position: absolute;
                    bottom: 12px;
                    left: 60px;
                }
            }
            .input-area {
                height: 84px;
                resize: none;
                border: none;
                background-color: #f4f6fa;
                outline: none;
                width: 555px;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(51, 51, 51);
                padding-left: 21px;
                //display: block;
                //overflow: hidden;
                position: relative;

            }
        }
    }
</style>
