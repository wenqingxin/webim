<!-- 聊天框右侧成员列表框 -->
<template>
    <transition name="slide-fade">
        <div class="aside-bar" :style="getHeight" >
            <div class="loading-box">
                <span class="loading-wrapper" v-show="showLoading.show">
                    <i class="loading" v-show="showLoading.loading"></i>
                    <span v-text="showLoading.text"></span>
                </span>
            </div>
            <div class="add-member">
                <i class="add-icon on-hand" @click="addMember"></i>
                <span class="on-hand" @click="addMember">添加成员</span>
            </div>
            <div id="memberList" class="member-list" :style="getListHeight">
                <div class="member" v-for="member in members">
                    <Head-photo size="25" type="aside" :src="member.icon" class="mem-head-photo on-hand" @h-click="checkStaffDetail(member.staffId)"></Head-photo>
                    <span class="name" v-text="member.staffName" :title="member.staffName"></span>
                </div>
            </div>
            <div class="exit-group" v-show="members.length>0">
                <span class="on-hand" @click="exitGroup">退出群聊</span>
            </div>
        </div>
    </transition>
</template>

<script>

    import HeadPhoto from './common/HeadPhoto.vue'
    import {WebChatConst} from '../util/Constant.js'
    import SpringLib from '../libs/SpringLib.js'
    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    import {mapActions} from 'vuex'
    import {dataAccess, Service} from '../util/Utils.js'

    let container;
    export default {
        name: 'asideBar',
        data () {
            return {
                members: [],
                staffIds:[],
                showLoading:{
                    show:false,
                    text:'加载中...',
                    loading:true
                }
            }
        },
        mounted(){
            this.$nextTick(function () {
                container = document.getElementById('memberList');

                $(container).niceScroll({
                    cursorcolor:"#aaa",
                    cursoropacitymin: 0, // change opacity when cursor is inactive (scrollabar "hidden" state), range from 1 to 0
                    cursoropacitymax: 1,
                    scrollspeed: 90, // scrolling speed
                });
            })
        },

        methods: {
            ...mapMutations(['showGroupMessageBox', 'showContactLayer', 'showMessageBox','showChatWindowView','setRightWindowData']),
            ...mapActions(['getLocalDbDepartment','checkStaffDetail','getConversationList','openConversation']),
            exitGroup(){
                this.showGroupMessageBox({
                    show: true,
                    title: this.rightWindowData.targetName,
                    msg:'退出群组后，你将不会收到来自该群组的任何消息，确定退出群组？',
                    confirm: () => {
                        if (RongIMLib.ConversationType.GROUP == this.rightWindowData.conversationType){
                            console.log('调用退出群接口');
                            Service.getInstance().post(
                                SpringLib.Config.smpQuitGroupUrl,
                                {staffId: this.userInfo.staffId, chatGroupId: this.rightWindowData.targetId})
                                .then(res => {
                                    console.log('调用退出群接口返回', res);
                                    if (res && res.data && res.data.isSuccess) {
                                        this.getMembers();
                                        this.showChatWindowView(WebChatConst.framePlaceHolder);
                                        this.setRightWindowData({});
                                        RongIMLib.RongIMClient.getInstance().removeConversation(this.rightWindowData.conversationType, this.rightWindowData.targetId,{
                                            onSuccess: bool => {
                                                //bool 是否删除
                                                console.log('删除会话:'+bool);
                                                if (bool){
                                                    setTimeout(()=>{
                                                        this.getConversationList();
                                                    },300)
                                                }
                                            },
                                            onError: (error)=> {
                                                console.log('删除会话失败',error);
                                            }
                                        });
                                    }else{
                                         this.showMessageBox({show: true, title: '提示', content: (res.data.message||'退出群组失败'), showCancel: false});
                                    }
                                });
                        }else if (RongIMLib.ConversationType.DISCUSSION == this.rightWindowData.conversationType){
                            RongIMLib.RongIMClient.getInstance().quitDiscussion(this.rightWindowData.targetId, {
                                onSuccess: ()=> {
                                    console.log("QuitDiscussion Successfully");
                                    RongIMLib.RongIMClient.getInstance().removeConversation(this.rightWindowData.conversationType, this.rightWindowData.targetId,{
                                        onSuccess: bool => {
                                            //bool 是否删除
                                            console.log('删除会话:'+bool);
                                            if (bool){
                                                this.getConversationList();
                                            }
                                        },
                                        onError: (error)=> {
                                            console.log('删除会话失败',error);
                                        }
                                    });
                                    this.showChatWindowView(WebChatConst.framePlaceHolder);
                                    this.setRightWindowData({});
                                },
                                onError: (error)=> {
                                    console.log("QuitDiscussion:errorcode:" + error);
                                    this.showMessageBox({show: true, title: '提示', content: '退出讨论组失败', showCancel: false});
                                }
                            });
                        }
                    }
                });

            },
            setLoading(show,text,loading){
                this.showLoading.show = show;
                this.showLoading.text = text;
                this.showLoading.loading = loading;
            },
            addMember(){
                this.showContactLayer({
                    show: true,
                    existMembers:this.staffIds,
                    confirm: items => {
                        let userIdList = [];
                        let defaultName='';
                        for (let item of items) {
                            userIdList.push(item.id);
                            defaultName += (item.text||item.staffName)+'、';
                        }
                        defaultName+=this.rightWindowData.targetName;
                        if (userIdList.length == 0) {
                            this.showMessageBox({show: true, title: '提示', content: '请选择用户', showCancel: false});
                        } else {
                            if (RongIMLib.ConversationType.GROUP == this.rightWindowData.conversationType) {
                                this.setLoading(true,'邀请中...',true);
                                Service.getInstance().post(SpringLib.Config.smpJoinGroupBatchUrl, {
                                    chatGroupId: this.rightWindowData.targetId,
                                    chatGroupName: this.rightWindowData.targetName,
                                    staffId: this.userInfo.staffId,
                                    listStaffId:','+userIdList.join(',')+','
                                }).then(res => {
                                    this.setLoading(false);
                                    if (res && res.data && res.data.isSuccess){
                                        console.log('邀请成功!',res);
                                        this.getMembers();
                                    }else{
                                        this.showMessageBox({show: true, title: '提示', content: '邀请成员失败', showCancel: false});
                                    }
                                }).catch(error=>{
                                    this.setLoading(false);
                                    console.log('邀请失败!',error);
                                    this.showMessageBox({show: true, title: '提示', content: '邀请成员失败', showCancel: false});
                                });
                                this.showContactLayer({show: false});
                            } else if (RongIMLib.ConversationType.DISCUSSION == this.rightWindowData.conversationType) {
                                RongIMLib.RongIMClient.getInstance().addMemberToDiscussion(this.rightWindowData.targetId, userIdList, {
                                    onSuccess: () => {
                                        //加入成功
                                        console.log('邀请成功!');
                                        //this.getMembers();
                                        this.showContactLayer({show: false});
                                    },
                                    onError:  (error)=> {
                                        //加入失败
                                        console.log('邀请失败', error);
                                        this.showMessageBox({show: true, title: '提示',content:'邀请成员失败'});
                                    }
                                })
                            }else if (RongIMLib.ConversationType.PRIVATE == this.rightWindowData.conversationType){
                                userIdList.push(this.rightWindowData.targetId);
                                RongIMLib.RongIMClient.getInstance().createDiscussion (defaultName, userIdList, {
                                    onSuccess: discussId=> {
                                        // 创建成功 discussId为讨论组id
                                        console.log('创建讨论组成功!discussId:',discussId);
                                        this.showContactLayer({show:false});
                                        setTimeout(()=>{
                                            this.openConversation({
                                                targetId: discussId,
                                                conversationType: RongIMLib.ConversationType.DISCUSSION,
                                                icon: '',
                                                gender: '',
                                                targetName: defaultName,
                                                groupType:'',
                                                targetMemNum:(userIdList.length+1),
                                                flightTime:'',
                                                childType:''//系统退送消息的子类别
                                            });
                                        },500);
                                    },
                                    onError: error=> {
                                        // 创建失败
                                        this.showMessageBox({show: true, title: '提示',content:'邀请成员失败',showCancel:false});
                                        console.log('创建讨论组失败!err:',error);
                                        this.showContactLayer({show:false})
                                    }
                                })

                                /*let option = {show: true, title: '请输入群聊名称', showCancel:true,isInput: true,confirm:(newName)=>{
                                    if (newName==undefined || newName==''){
                                        newName = defaultName+' '+this.rightWindowData.targetName;//加上私聊的人
                                    }
                                    //创建讨论组
                                }};
                                this.showMessageBox(option);*/
                            }

                        }
                    }
                });
                this.getLocalDbDepartment({deptId: 1000001});

            },
            getMembersDetail(staffIds,callback){
                this.staffIds = staffIds;
                let remoteQuery =  ()=> {
                    Service.getInstance().post(
                        SpringLib.Config.smpGetStaffArrUrl,
                        {ids:staffIds.join(','),jobcode:this.userInfo.jobcode }).then(res =>{
                        if (res && res.data && res.data.isSuccess){
                            console.log('查询远程员工列表',res);
                            this.members = res.data.data;
                            this.setLoading(false);
                            callback && callback();
                        }
                    })
                };
                if (this.hasUpdateContact){
                    dataAccess.queryStaffByStaffId(staffIds, ret => {
                        console.log('获取群成员成员信息结果:', ret);
                        if (!ret || ret.length != staffIds.length){
                            console.log('本地未查询到所有群成员信息,调用远程接口');
                            remoteQuery();
                        }else{
                            this.setLoading(false);
                            this.members = ret;
                            callback && callback();
                        }
                    })
                }else{
                    remoteQuery();
                }
            },
            getMembers(){
                return new Promise( (resolve,reject) => {
                    this.setLoading(true,'加载中...',true);
                    if (RongIMLib.ConversationType.GROUP == this.rightWindowData.conversationType) {
                        console.log('调用查询群成员接口');
                        Service.getInstance().post(
                            SpringLib.Config.smpGetGroupStaffUrl,
                            {groupId: this.rightWindowData.targetId})
                            .then(res => {
                                console.log('查询群成员接口返回', res);
                                if (res && res.data && res.data.isSuccess) {
                                    let tempMebers = res.data.data;
                                    let staffIds = [];
                                    for (let i = 0; i < tempMebers.length; i++) {
                                        if (tempMebers[i].status != 1){
                                            staffIds.push(tempMebers[i].staffId);
                                        }
                                    }

                                    this.getMembersDetail(staffIds,function () {
                                        resolve();
                                    });
                                    this.rightWindowData.targetMemNum = staffIds.length;
                                }
                            }).catch((reason) => {
                            this.setLoading(true,'加载失败',false);
                            console.log('调用查询群成员接口异常',reason);
                        });
                    } else if (RongIMLib.ConversationType.DISCUSSION == this.rightWindowData.conversationType) {
                        RongIMLib.RongIMClient.getInstance().getDiscussion(this.rightWindowData.targetId, {
                            onSuccess: discussion => {
                                this.getMembersDetail(discussion.memberIdList,function () {
                                    resolve();
                                });
                                this.rightWindowData.targetMemNum = discussion.memberIdList.length;
                            },
                            onError: error => {
                                this.setLoading(true,'加载失败',false);
                                switch (error) {
                                    case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                                        console.log('获取讨论组信息,当前用户不在:' + this.rightWindowData.targetId + '组内');
                                        break;
                                    case RongIMLib.ErrorCode.RC_DISCUSSION_GROUP_ID_INVALID:
                                        console.log('获取讨论组信息,讨论组:' + this.rightWindowData.targetId + '无效');
                                        break;
                                    default:
                                        console.log(this.rightWindowData.targetId + '获取讨论组信息失败,错误码:' + error);
                                }
                            }
                        });

                    }else{
                        this.staffIds = [];
                        this.setLoading(false);
                    }
                });
            }
        },
        computed: {
            ...mapState(['curReceiveMessage','asideBar', 'rightWindowData', 'userInfo','maximize','hasUpdateContact','conversationList','remoteGroupList']),
            getHeight(){
                let height = document.body.clientHeight;
                if (this.maximize){
                    return {
                        height:(height-50)+'px'
                    }
                }
            },
            getListHeight(){
                let height = document.body.clientHeight;
                if (this.maximize){
                    return {
                        height:(height-50-97)+'px'
                    }
                }
            }
        },
        components: {
            HeadPhoto
        },
        watch: {
            asideBar(val){
                if(val){
                    this.members=[];
                    this.getMembers();
                }
            },
            curReceiveMessage:{
                handler:function (val) {
                    if (val && val.content){
                        if (RongIMLib.ConversationType.DISCUSSION == this.rightWindowData.conversationType && val.content.type==1 || val.content.type==2){//添加或者成员退出
                            this.getMembers();
                        }else if(RongIMLib.ConversationType.GROUP == this.rightWindowData.conversationType
                            && val.objectName == "RC:CmdNtf"
                            && val.senderUserId=='system'
                            && val.content.data
                            && val.content.data.content){
                            this.getMembers();
                        }
                    }
                },
                deep:true
            }
        }
    }


</script>

<style lang="less" scoped>
    @import '../styles/common.less';

    .slide-fade-enter-active, .slide-fade-leave-active {
        transition: all .5s cubic-bezier(.55, 0, .1, 1);
    }

    .slide-fade-enter, .slide-fade-leave-active {
        transform: translate(159px);
        opacity: 0;
    }
    .aside-bar {
        width: 159px;
        border-left: 1px solid @common_border_color;
        height: 550px;
        background-color: #ffffff;
        position: relative;
        border-bottom-right-radius: 5px;
        .loading-box {
            font-size: 12px;
            font-family: "SimSun";
            text-align: center;
            transition: height .3s linear;
            position: absolute;
            left: 52px;
            top: 60px;
            color: rgb(69, 75, 85);
            .loading-wrapper {
                position: relative;
                .loading {
                    position: absolute;
                    top: 0;
                    left: -18px !important;
                    .loading(0px, 0px);
                    width: 12px;
                    height: 12px;
                }
            }
        }
        .add-member {
            height: 55px;
            border-bottom: 1px solid @common_border_color;
            width: 120px;
            margin: 0 auto;
            .add-icon {
                display: inline-block;
                background: url("../images/add_member_icon.png") center no-repeat;
                width: 19px;
                height: 19px;
                background-size: 19px 19px;
                position: absolute;
                top: 18px;
                &:hover{
                    background: url("../images/add_member_icon_b.png") center no-repeat;
                }
            }
            span {
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(69, 75, 85);
                line-height: 55px;
                margin-left: 28px;
            }
        }
        .member-list {
            padding-top: 9px;
            height: 445px;
            position: relative;
            overflow: hidden;
            .member {
                margin: 7px 20px;
                height: 25px;
                position: relative;
                .mem-head-photo {
                    vertical-align: middle;
                }
                .name {
                    font-size: 14px;
                    font-family: Microsoft YaHei;
                    color: #454b55;
                    overflow: hidden;
                    width: 105px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    position: absolute;
                    top: 5px;
                    left: 34px;
                }

            }
        }
        .exit-group {
            text-align: center;
            border-top: 1px solid @common_border_color;
            border-bottom-right-radius: 5px;
            span {
                line-height: 40px;
                height: 39px;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(252, 60, 60);
                &:hover{
                    text-decoration: underline;
                }
            }
        }
    }
</style>
