<!-- 会话
        props:
            isSearchRes(Boolean):是否是航班群搜索结果的展示,如果是的话就不打开聊天窗口
            src(String):头像名称
            targetId(String):对方Id
            targetName(String):对方名称
            gender(Number):性别
            msg(String):最新的消息
            time(String):最新消息的时间字符串
            showJoin(Boolean):是否显示加入按钮,用于搜索后台群
            unread(Number):未读消息数
            type(Number):会话类型 讨论组 私聊 群聊
            childType(Number):子会话类型,用于判断系统推送类消息
            flightTime(String):航班时间,用于判断历史航班群
            groupType(Number):群类型
            draft(String):草稿内容
            isTop(Boolean):是否置顶显示
-->
<template>
    <transition name="fade">
        <!-- 有名字的才显示 有些会话可能名称都没有,比如讨论组,再收到消息后需要主动去查一次信息-->
        <div class="wrapper" v-show="targetName!=''">
            <Check-box class="con-check" v-if="batchDelete.show && curMiddleView==constance.menuHistoryGroup" :selected="isSelected" @select="selectToDelete"></Check-box>
            <div class="conversation" :class="{'left-box':batchDelete.show && curMiddleView==constance.menuHistoryGroup}" @click="openChatWindow" @contextmenu.stop.prevent="showMenu($event)">
                <!-- 私聊头像 -->
                <Head-photo class="photo" :src="src"
                            v-if="type==getTYPE.PRIVATE && !groupType">
                    <Bubble :unread="unread" headImg="true"></Bubble>
                </Head-photo>
                <!-- 讨论组头像 -->
                <Icon-head-photo class="photo"
                                 :src="groupSrc.group_user"
                                 v-if="type==getTYPE.DISCUSSION"
                                 bg-color="#55ce3d"
                                 img-width="24"
                                 img-height="24">
                    <Bubble :unread="filterUnread" headImg="true"></Bubble>
                </Icon-head-photo>
                <!-- 航班群头像 -->
                <Icon-head-photo class="photo"
                                 :src="groupSrc.group_flight"
                                 v-if="type==getTYPE.GROUP && groupType==0"
                                 bg-color="#81aeff"
                                 img-width="26"
                                 img-height="25">
                    <Bubble :unread="filterUnread" headImg="true"></Bubble>
                </Icon-head-photo>
                <!-- 地服群头像 -->
                <Icon-head-photo class="photo"
                                 :src="groupSrc.group_ground"
                                 v-if="type==getTYPE.GROUP && groupType==2"
                                 bg-color="#af88e9"
                                 img-width="24"
                                 img-height="26">
                    <Bubble :unread="filterUnread" headImg="true"></Bubble>
                </Icon-head-photo>
                <!-- 用户群头像 -->
                <Icon-head-photo class="photo"
                                 :src="groupSrc.group_user"
                                 v-if="type==getTYPE.GROUP && groupType==1"
                                 bg-color="#ecd04d"
                                 img-width="24"
                                 img-height="24">
                    <Bubble :unread="filterUnread" headImg="true"></Bubble>
                </Icon-head-photo>
                <!-- 系统消息提醒头像 -->
                <Icon-head-photo class="photo"
                                 :src="groupSrc.system_notify"
                                 v-if="type==getTYPE.PRIVATE && childType=='system'"
                                 bg-color="#55ce3d"
                                 img-width="26"
                                 img-height="26">
                    <Bubble :unread="unread" headImg="true"></Bubble>
                </Icon-head-photo>
                <!-- 办公类消息 -->
                <Icon-head-photo class="photo"
                                 :src="groupSrc.office_notify"
                                 v-if="type==getTYPE.PRIVATE && childType=='office'"
                                 bg-color="#f2c118"
                                 img-width="26"
                                 img-height="25">
                    <Bubble :unread="unread" headImg="true"></Bubble>
                </Icon-head-photo>
                <!-- 订阅类消息 -->
                <Icon-head-photo class="photo"
                                 :src="groupSrc.subscribe_notify"
                                 v-if="type==getTYPE.PRIVATE && childType=='subscription'"
                                 bg-color="#f17d55"
                                 img-width="21"
                                 img-height="28">
                    <Bubble :unread="unread" headImg="true"></Bubble>
                </Icon-head-photo>
                <!-- 航班类消息 -->
                <Icon-head-photo class="photo"
                                 :src="groupSrc.flight_notify"
                                 v-if="type==getTYPE.PRIVATE && childType=='flight'"
                                 bg-color="#549cf2"
                                 img-width="27"
                                 img-height="26">
                    <Bubble :unread="unread" headImg="true"></Bubble>
                </Icon-head-photo>
                <div class="text">
                    <span class="name" :style="time && {width: '110px'}" v-text="targetName" :title="targetName"></span>
                    <span class="last-news" v-if="draft">
                        <span style="color: red">[草稿]</span><span v-text="draft"></span>
                    </span>
                    <span class="last-news" v-else  :style="getMsgWidth" v-text="msg" :title="msg"></span>

                </div>
                <div class="tip">
                    <span class="time" v-text="time"></span>
                    <i class="notify" v-show="showNotify"></i>
                    <span class="join on-hand" v-show="showJoin || showJoin == 'true'" @click="join">加入</span>
                </div>

            </div>
        </div>
    </transition>

</template>

<script>
    import HeadPhoto from './common/HeadPhoto.vue'
    import IconHeadPhoto from './common/IconHeadPhoto.vue'
    import Bubble from './Bubble.vue'
    import {Service} from '../util/Utils.js'
    import SpringLib from '../libs/SpringLib.js'
    import {mapMutations} from 'vuex'
    import {mapActions} from 'vuex'
    import {mapState} from 'vuex'
    import {WebChatConst} from '../util/Constant.js'
    const lastNewWidth = ['164px', '135px', '112px'];
    import CheckBox from './common/CheckBox.vue'
    export default {
        name: 'conversation',
        data () {
            return {
                groupSrc: {
                    group_flight: require('../images/flight_group_con_icon.png'),
                    group_ground: require('../images/gound_group_con_icon.png'),
                    group_user: require('../images/user_group_con_icon.png'),
                    system_notify: require('../images/system_noti_icon.png'),
                    office_notify: require('../images/office_noti_icon.png'),
                    subscribe_notify: require('../images/subscribe_noti_icon.png'),
                    flight_notify: require('../images/flight_noti_icon.png'),
                },
                conSel:false,
                constance:WebChatConst
            }
        },
        //type:private group discuss
        props: [
            'isSearchRes',//是否是航班群搜索结果的展示,如果是的话就不打开聊天窗口
            'src',
            'targetId',
            'targetName',
            'gender',
            'msg',
            'time',
            'showJoin',
            'unread',
            'type',
            'childType',
            'flightTime',
            'groupType',
            'draft',
            'isTop'
        ],
        computed: {
            getMsgWidth(){
                let width = lastNewWidth[0];
                if (this.showNotify || this.showNotify == 'true') {
                    width = lastNewWidth[1]
                }
                if (this.showJoin || this.showJoin == 'true') {
                    width = lastNewWidth[2]
                }
                return {width: width};
            },
            showNotify(){
                if (this.userInfo && this.userInfo[WebChatConst.webChatForbidGroup]){
                    return this.userInfo[WebChatConst.webChatForbidGroup].find(item => {
                        return this.targetId == item;
                    })
                }else{
                    return false;
                }
            },
            filterUnread(){
                return (this.showNotify && this.unread>0) ? -1 : this.unread;
            },
            //RongIMLib直接在模板里会报错,因为RongIMlib没有模块化引入,是直接引的js,用computed的方式才能获取到
            getTYPE(){
                return RongIMLib.ConversationType;
            },
            ...mapState([
                'conversationList',
                'rightWindowData',
                'userInfo',
                'remoteGroupListNotIn',
                'curMiddleView',
                'batchDelete'
            ]),
            isSelected(){
                let res;
                if (this.batchDelete.deleteData){
                    res = this.batchDelete.deleteData.find(item =>{
                        return item.targetId == this.targetId;
                    });
                }
                return res && this.curMiddleView==WebChatConst.menuHistoryGroup;
            }
        },
        methods: {
            ...mapMutations([
                'showChatWindowView',
                'setRightWindowData',
                'refreshConversationList',
                'showMessageBox',
                'showAsideBar',
                'showContextMenu',
                'showBatchDelete',
                'showContactProfile',
                'showWaitingBox'
            ]),
            selectToDelete(){
                if (this.isSelected){
                    //从删除列表移除
                    let index = this.batchDelete.deleteData.findIndex(item =>{
                        return item.targetId == this.targetId;
                    });
                    if (index!=undefined){
                        this.batchDelete.deleteData.splice(index, 1);
                    }
                }else{
                    //增加到删除列表
                    if (this.batchDelete.deleteData){
                        this.batchDelete.deleteData.push({targetId:this.targetId,type:this.type})
                    }else{
                        let tempArr = [];
                        tempArr.push({targetId:this.targetId,type:this.type});
                        this.showBatchDelete({show:this.batchDelete.show,deleteData:tempArr});
                    }

                }
            },
            showMenu(e){
                let event = e || window.event;
                let clientX = event.clientX;
                let clientY = event.clientY;
                console.log('clienX:' + clientX + ' clientY:' + clientY);

                let appBox = document.getElementById('index');
                let appTop = appBox.getBoundingClientRect().top;
                let appLeft = appBox.getBoundingClientRect().left;
                console.log('appTop:' + appTop + ' appLeft:' + appLeft);

                let position = {
                    top: Number(clientY) - Number(appTop) + 'px',
                    left: Number(clientX) - Number(appLeft) + 'px'
                    /*top:clientY+'px',
                     left:clientX+'px'*/
                };
                console.log(JSON.stringify(position));
                let data = {
                    targetId:this.targetId,
                    type:this.type,
                    targetName:this.targetName,
                    isTop:this.isTop
                }
                let item = {};
                if (this.type==this.getTYPE.PRIVATE){
                    item = {
                        makeTop:true,
                        delete:true
                    }
                }else if (this.type==this.getTYPE.GROUP){
                    item = {
                        makeTop:true,
                        noNotify:true,
                        //delete:true
                    }
                    if (this.curMiddleView==WebChatConst.menuHistoryGroup){
                        item.batchDelete = true;
                        item.delete = true;
                    }
                }else if (this.type==this.getTYPE.DISCUSSION){
                    item = {
                        makeTop:true,
                        modifyName:true,
                        noNotify:true,
                        delete:true
                    }
                }

                if (this.curMiddleView==WebChatConst.menuNotice){
                    item.noSysNotify = true;
                }
                this.showContextMenu({show: true, position: position,item,data});
            },
            ...mapActions(['getConversationList','sortConversationList','openConversation']),
            openChatWindow: function () {
                this.showContactProfile(false);
                //是否是航班群搜索结果的展示,如果是的话就不打开聊天窗口
                if (this.isSearchRes){
                    return;
                }
                this.$emit('pick-conversation');
                this.openConversation({
                    targetId: this.targetId,
                    conversationType: this.type,
                    icon: this.src,
                    gender: this.gender,
                    targetName: this.targetName,
                    groupType:this.groupType,
                    flightTime:this.flightTime,
                    childType:this.childType//系统退送消息的子类别
                })
            },
            join(){
                this.showMessageBox({
                    show:true,
                    title:'提示',
                    content:this.targetName+' 确定加入该群组?',
                    showCancel:true,
                    confirm:()=>{
                        this.showWaitingBox(true);
                        Service.getInstance().post(SpringLib.Config.smpJoinGroupUrl, {
                            chatGroupId:this.targetId,
                            chatGroupName:this.targetName,
                            staffId:this.userInfo.staffId
                        }).then((res) => {
                            this.showWaitingBox(false);
                            console.log('加入群组接口返回:', res);
                            if (res && res.data && res.data.isSuccess) {
                                let index = this.remoteGroupListNotIn.findIndex( item=> {
                                    return item.chatGroupId === this.targetId;
                                });
                                this.remoteGroupListNotIn.splice(index,1);
                                this.$emit('joined');
                            }
                        }).catch((reason) => {
                            console.log('加入群组接口异常:', reason);
                            this.showWaitingBox(false);
                            this.showMessageBox({
                                show:true,
                                title:'提示',
                                content:'加入群组失败'
                            });
                        });
                    }
                })

            }
        },

        components: {
            HeadPhoto,
            IconHeadPhoto,
            Bubble,
            CheckBox
        }
    }

</script>

<style lang='less' scoped>
    @import "../styles/common.less";
    .conversation_top {
        background-color: #F6FEF1;
    }
    .left-box{
        left:24px;
    }
    .wrapper{
        position: relative;
        .con-check{
           position: absolute;
            left:10px;
            top:50%;
            margin-top: -8px;
        }
        .conversation {
            height: 78px;
            border-bottom: 1px solid @common_border_color;
            position: relative;
            transition: left 0.3s cubic-bezier(.55, 0, .1, 1);

            .photo {
                width: 50px;
                height: 50px;
                position: absolute;
                top: 13px;
                left: 14px;
            }
            .text {
                .name {
                    position: absolute;
                    top: 18px;
                    left: 72px;
                    font-size: 14px;
                    font-family: "Microsoft YaHei";
                    color: rgb(69, 75, 85);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .last-news {
                    position: absolute;
                    top: 46px;
                    left: 72px;
                    font-size: 12px;
                    font-family: "SimSun";
                    color: rgb(135, 135, 135);
                    display: inline-block;
                    width: 150px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
            }
            .tip {
                .time {
                    position: absolute;
                    top: 22px;
                    right: 10px;
                    font-size: 12px;
                    font-family: "Arial";
                    color: rgb(135, 135, 135);
                }
                .notify {
                    position: absolute;
                    display: inline-block;
                    width: 18px;
                    height: 16px;
                    background: url("../images/fobi_noti.png") center no-repeat;
                    background-size: 18px 16px;
                    right: 17px;
                    bottom: 21px;
                }
                .join {
                    width: 36px;
                    height: 20px;
                    position: absolute;
                    display: inline-block;
                    font-size: 12px;
                    font-family: "SimSun";
                    right: 10px;
                    bottom: 15px;
                    line-height: 20px;
                    text-align: center;
                    border-radius: 3px;
                    border: 1px solid #cccccc;
                    background-color: #ffffff;
                    color: rgb(49, 109, 182);
                    &:hover{
                        background-color: #316db6 !important;
                        color:#fff !important;
                        line-height: 20px!important;
                        width: 38px!important;
                        height: 22px!important;
                        border: none!important;
                    }
                }

            }
        }
    }

</style>
