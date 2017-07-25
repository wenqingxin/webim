<template>
    <div class="conversations" :class="{max:maximize}" oncontextmenu="return false">
        <div class="search">
            <Search-input class="search-input"
                          :size="showAdd||showSearchRes || showSearchBtn?188:210"
                          @search-input="searchLocalContent"
                          @enter="dealEnter"
                          ref="search"
                          ></Search-input>
            <i class="createBtn on-hand" @click="add" v-if="showAdd"></i>
            <span class="queryBtn on-hand" v-if="showSearchRes" @click="cancelSearch">取消</span>
            <span class="queryBtn on-hand" v-else-if="showSearchBtn" @click="searchRemote">查询</span>
        </div>
        <div class="loading-box on-hand" :style="showLoading" @click="clickHandler">
            <span class="loading-wrapper">
                <i class="loading" v-if="connectInfo.loading"></i>
                <span v-text="connectInfo.msg">连接中...</span>
            </span>
        </div>
        <div id="conContainer" class="con-list" :style="maximize&&{height:'100%'}" @contextmenu="showMenu($event)">
            <transition name="fade">
                <div class="empty-show" v-show="emptyTip" v-text="emptyTip"></div>
            </transition>
            <Accordion v-if="curMiddleView == constant.menuContact" @item-click="selectStaff" :show-check="false"></Accordion>
            <Conversation v-if="curMiddleView != constant.menuContact"
                          v-for="(conversation,index) in searchContent"
                          @joined="showSearchRes=false"
                          :class="{selected:conversation.targetId==rightWindowData.targetId,conversation_top:(conversation.isTop=='true')}"
                          :key="index"
                          :isSearchRes="showSearchRes"

                          :src="conversation.src"
                          :name="conversation.name"
                          :msg="conversation.msg"
                          :time="conversation.time"
                          :show-join="conversation.showJoin"
                          :unread="conversation.unread"
                          :type="conversation.type"
                          :child-type="conversation.childType"
                          :targetId="conversation.targetId"
                          :targetName="conversation.targetName"
                          :gender="conversation.gender"
                          :groupType="conversation.groupType"
                          :flightTime="conversation.flightTime"
                          :draft="conversation.draft"
                          :isTop=conversation.isTop
                          >
            </Conversation>
<!--            <div class="load-more" v-show="showLoadMore">
                <span>加载更多</span>
            </div>-->
        </div>
        <div class="bottom-btn" v-if="batchDelete.show">
            <span class="cancel-delete" @click="cancelDelete">取消</span>
            <span class="do-delete" @click="doBatchDelete">删除</span>
        </div>
        <Waiting-mask :show-waiting="waitingBox"></Waiting-mask>
    </div>
</template>

<script>
    import SearchInput from '../../components/SearchInput.vue'
    import Conversation from '../../components/Conversation.vue'
    import Accordion from '../../components/Accordion.vue'
    import WaitingMask from '../../components/common/WaitingMask.vue'

    import {WebChatConst} from '../../util/Constant'
    import {debounce,Service,transRemote2local} from '../../util/Utils.js'
    import SpringLib from '../../libs/SpringLib.js'
    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    import {mapGetters} from 'vuex'
    import {mapActions} from 'vuex'


    let container;
    export default {
        name: 'middleBox',
        data () {
            return {
                constant: WebChatConst,
                showSearchRes: false,//是否是显示搜索结果
                queryCondition: '',
                queryStaffStart:0,
                emptyTip:'',
            }
        },
        mounted(){
            this.$nextTick(function () {
                container = document.getElementById('conContainer');
                $(container).niceScroll({
                    cursorcolor:"#aaa",
                    cursoropacitymin: 0, // change opacity when cursor is inactive (scrollabar "hidden" state), range from 1 to 0
                    cursoropacitymax: 1,
                    scrollspeed: 90, // scrolling speed
                });
                let scrollDownFunc = debounce( () => {
                    let conWidth = document.getElementById('conContainer').clientHeight || 550;
                    if (container.scrollTop+Number(conWidth)+10 > container.scrollHeight){
                        //每次触底起始位置加50,再查询50条
                        this.queryStaffStart+=SpringLib.Config.staffLimit;
                        if (this.hasUpdateContact){
                            this.getLocalDbUserLike({filter:this.queryCondition,start:this.queryStaffStart,isAppend:true});
                        }else{
                            Service.getInstance().post(SpringLib.Config.smpGetStaffListByConUrl, {
                                searchInfo:this.queryCondition,
                                start:this.queryStaffStart,
                                limit:SpringLib.Config.staffLimit,
                                jobcode:this.userInfo.jobcode
                            }).then(res => {
                                if (res && res.data && res.data.isSuccess){
                                    console.log('查询后台通讯录结果返回:',res.data.data);
                                    let resItems = res.data.data || [];
                                    let transItems = transRemote2local(resItems.result);
                                    transItems = this.localDbDepAndStuff.concat(transItems);
                                    this.setLocalDbDepAndStuff(transItems);
                                }
                            });
                        }
                    }
                },300);
                container.addEventListener('scroll', () => {
                    this.queryCondition && scrollDownFunc();
                });
/*                container.scrollTop = 0;
                Ps.update(container);*/
            })
        },
        computed: {
            ...mapState([
                'curMiddleView',
                'connectInfo',
                'updatingContact',
                'historyConList',
                'historyGroupConList',
                'flightGroupConList',
                'groundGroupConList',
                'userGroupConList',
                'messageNotifyList',
                'localDbDepAndStuff',
                'userInfo',
                'hasUpdateContact',
                'batchDelete',
                'imageViewer',
                'maximize',
                'waitingBox',
                'rightWindowData'
            ]),
            ...mapGetters([
                'getUserGroup',
                'getUserGroupNotIn',
                'getGroundGroup',
                'getGroundGroupNotIn',
                'getFlightGroup',
                'getFlightGroupNotIn',
            ]),
            showSearchBtn(){
                return !this.hasUpdateContact && this.curMiddleView == WebChatConst.menuContact;
            },
            showLoading(){
                if (!this.hasUpdateContact && this.curMiddleView == WebChatConst.menuContact){
                    this.showConnectInfo({show:true, msg:'正在更新通讯录',loading:true});
                }
                if (this.connectInfo.show) {
                    return {
                        height: '12px'
                    }
                } else {
                    return {
                        height: '0',
                        display:'none'
                    }
                }
            },
            getCurConList(){
                this.emptyTip = '';
                switch (this.curMiddleView) {
                    case WebChatConst.menuHistoryCon:
                        if (!this.historyConList || this.historyConList.length == 0){
                            this.emptyTip = '暂未有任何消息';
                        }
                        return this.historyConList;
                    case WebChatConst.menuFlightGroup:
                        let flightGroupRes =  this.showSearchRes?
                            this.getFlightGroupNotIn :
                            this.combineConList(this.flightGroupConList, this.getFlightGroup);
                        if (!flightGroupRes || flightGroupRes.length == 0){
                            this.emptyTip = '暂未有任何航班群';
                        }
                        return flightGroupRes;
                    case WebChatConst.menuGroundService:
                        let groundGroupRes =   this.showSearchRes?
                            this.getGroundGroupNotIn :
                            this.combineConList(this.groundGroupConList, this.getGroundGroup);
                        if (!groundGroupRes || groundGroupRes.length == 0){
                            this.emptyTip = '暂未有任何地服群';
                        }
                        return groundGroupRes;
                    case WebChatConst.menuUserGroup:
                        let userGroupRes =   this.showSearchRes?
                            this.getUserGroupNotIn :
                            this.combineConList(this.userGroupConList, this.getUserGroup);
                        if (!userGroupRes || userGroupRes.length == 0){
                            this.emptyTip = '暂未有任何用户群';
                        }
                        return userGroupRes;
                    case WebChatConst.menuHistoryGroup:
                        let hisGroupRes = this.historyGroupConList;
                        if (!hisGroupRes || hisGroupRes.length == 0){
                            this.emptyTip = '暂未有任何历史航班群';
                        }
                        return hisGroupRes;
                    case WebChatConst.menuNotice:
                        let notice = this.messageNotifyList;
                        if (!notice || notice.length == 0){
                            this.emptyTip = '暂未有任何提醒';
                        }
                        return notice;
                    case WebChatConst.menuContact:
                        let contacts = this.localDbDepAndStuff;
                        if (!contacts || contacts.length == 0){
                            this.emptyTip = '暂未有任何联系人';
                        }
                        return '';
                }
            },
            showAdd(){
                return !this.showSearchRes && (
                            (this.curMiddleView == WebChatConst.menuHistoryCon)  ||
                            (this.curMiddleView == WebChatConst.menuFlightGroup) ||
                            (this.curMiddleView == WebChatConst.menuUserGroup)   ||
                            (this.curMiddleView == WebChatConst.menuGroundService)
                        );
            },
            searchContent(){
                //alert(this.queryCondition);
                let filterRes = [];
                if (this.queryCondition){
                    filterRes = this.getCurConList ?
                        this.getCurConList.filter(item => {
                            return (item.msg && (item.msg.indexOf(this.queryCondition) != -1))
                                || (item.targetName && (item.targetName.indexOf(this.queryCondition) != -1));
                        }):[];
                }else{
                    filterRes =  this.getCurConList;
                }
                return filterRes;
            }
        },

        methods: {
            ...mapMutations([
                'showContactLayer',
                'showChatWindowView',
                'showConnectInfo',
                'showMessageBox',
                'showContextMenu',
                'setLocalDbDepAndStuff',
                'setStaffProfileDetail',
                'showBatchDelete',
                'showContactProfile',
                'showWaitingBox',
            ]),
            ...mapActions([
                'sendMsg',
                'queryGroupLike',
                'getLocalDbDepartment',
                'getLocalDbUserLike',
                'openConversation',
                'getLocalDbUserDetail',
                'getConversationList',
                'checkStaffDetail'
            ]),
            clickHandler(){
                if (this.connectInfo.msg == '断开连接' || this.connectInfo.msg == '网络不可用'){
                    this.showConnectInfo({show:true,loading:true,msg:'重新连接中'});
                    RongIMLib.RongIMClient.reconnect({
                        onSuccess:()=>{
                            //重连成功
                            this.showConnectInfo({show:true,loading:false,msg:'重连成功'});
                        },
                        onError:()=>{
                            //重连失败
                            this.showConnectInfo({show:true,loading:false,msg:'重连失败'});
                        }
                    });
                    location.reload();//重新刷新页面,清除vuex缓存,断开融云连接
                }else{
                    this.showConnectInfo({show:false});
                }
            },
            cancelDelete(){
                this.showBatchDelete({show:false, deleteData:[]});
            },
            doBatchDelete(){
                //alert(JSON.stringify(this.batchDelete));
                if (!(this.batchDelete.deleteData) || this.batchDelete.deleteData.length == 0 ){
                    this.showMessageBox({show: true, title: '提示',content:'请选择要删除的会话'});
                    return;
                }
                this.showMessageBox({show: true, title: '确认',content:'确认是否删除选择的会话?',showCancel:true, confirm:()=>{
                    this.deleteConByCircle();
                }})
            },
            deleteConByCircle(){
                let con = this.batchDelete.deleteData.pop();
                if (!con) {
                     setTimeout(()=>{
                        this.getConversationList();
                     },100);
                    this.showBatchDelete({show:false, deleteData:[]});
                    return;
                };
                RongIMLib.RongIMClient.getInstance().removeConversation(
                    con.type, con.targetId, {
                        onSuccess: () => {
                            console.log('删除会话:'+ con.targetId+' 成功');
                            this.deleteConByCircle();
                        },
                        onError:()=>{
                            console.log('删除会话:'+ con.targetId+' 失败');
                        }

                    });
            },
            combineConList(target, src){
                for (let group of src) {
                    //会话列表里是否包含当前循环的用户群
                    let res = target.find((con) => {
                        return con.targetId == group.targetId;
                    });
                    let inHis = this.historyGroupConList.find((con) => {
                        return con.targetId == group.targetId;
                    });
                    //群会话没有该群且不在历史航班群就push进去
                    if (!res && !inHis) {
                        target.push(group);
                    }
                }
                return target;
            },
            cancelSearch(){
                this.$refs.search.focusInput();
                this.$refs.search.$data.searchTxt='';
                this.queryCondition = '';
                this.showSearchRes = false;

                container.scrollTop = 0;
                this.showWaitingBox(false);

            },
            add(){
                if (this.curMiddleView === WebChatConst.menuHistoryCon) {
                    this.showContactLayer({
                        show:true,
                        confirm:(items)=>{
                            //alert(JSON.stringify(items))
                            if (!items || items.length == 0){
                                this.showMessageBox({show: true, title: '提示',content:'请选择用户',showCancel:false});
                                return;
                            }
                            if (items.length == 1){
                                let targetId = items[0].id;
                                let targetName = (items[0].text||items[0].staffName);
                                let icon = items[0].icon || '';
                                let sex = items[0].sex || 0;
                                //alert(JSON.stringify(items[0]));
                                this.showContactLayer({show:false})
                                this.openConversation({
                                    targetId: targetId,
                                    conversationType: RongIMLib.ConversationType.PRIVATE,
                                    icon: icon,
                                    gender: sex,
                                    targetName: targetName,
                                    groupType:'',
                                    flightTime:'',
                                    targetMemNum:'',
                                    childType:''//系统退送消息的子类别
                                });
                                return;
                            }

                            let userIdList = [];
                            let defaultName='';
                            for (let i=0;i<items.length;i++){
                                let item = items[i];
                                if (i == items.length-1){
                                    defaultName += (item.text||item.staffName);
                                }else{
                                    defaultName += (item.text||item.staffName)+'、';
                                }
                                userIdList.push(item.id);
                            }
                            //讨论组要加上自己
                            userIdList.push(this.userInfo.staffId);
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
                                            flightTime:'',
                                            targetMemNum:'('+userIdList.length+')',
                                            childType:''//系统退送消息的子类别
                                        });
                                    },500);
                                    container.scrollTop = 0;
                                },
                                onError: error=> {
                                    // 创建失败
                                    console.log('创建讨论组失败!err:',error);
                                    this.showMessageBox({show: true, title: '提示',content:'讨论组创建失败',showCancel:false});
                                    this.showContactLayer({show:false})
                                }
                            });
/*                            let options = {show: true, showCancel:true,title: '请输入群聊名称',content:'', isInput: true,confirm:(newName)=>{
                                if (newName==undefined || newName==''){
                                    newName = defaultName;
                                }
                                //创建讨论组
                            }};
                            this.showMessageBox(options);*/
                        }
                    });
                    this.getLocalDbDepartment({deptId:1000001});

                } else if (this.curMiddleView === WebChatConst.menuFlightGroup
                    || this.curMiddleView === WebChatConst.menuUserGroup
                    || this.curMiddleView === WebChatConst.menuGroundService) {
                    this.showSearchRes = true;
                    this.$refs.search.focusInput();
                    this.queryCondition = '';
                    this.$refs.search.$data.searchTxt='';

                    //查询未加入群
                    this.queryGroup();
                }
            },
            selectStaff(staff){
                console.log('选择员工信息:',staff);
                if (this.hasUpdateContact){
/*                    this.getLocalDbUserDetail(staff.id).then(() =>{
                        this.showContactProfile(true);
                    });*/
                    this.checkStaffDetail(staff.id);
                }else{
                    this.setStaffProfileDetail(staff.origin_remote_data);
                    this.showContactProfile(true);
                }
            },
            queryGroup(){
                //判断是否查询远程接口
                this.showConnectInfo({show:true,loading:true,msg:'加载中'});
                if (this.showSearchRes) {
                    let groupType = 1;
                    switch (this.curMiddleView) {
                        case WebChatConst.menuFlightGroup:
                            groupType = WebChatConst.flightGroupType;
                            break;
                        case WebChatConst.menuGroundService:
                            groupType = WebChatConst.groundGroupType;
                            break;
                        case WebChatConst.menuUserGroup:
                            groupType = WebChatConst.userGroupType;
                            break;
                    }
                    this.queryGroupLike({
                        text: '',
                        groupType: groupType
                    }).then(res=>{
                        this.showConnectInfo({show:false});
                    }).catch(()=>{
                        this.showConnectInfo({show:true,loading:false,msg:'查询群组失败'});
                    })
                }
            },
            searchLocalContent(text){
                //每次输入将滚动条置顶,防止在最下面的时候再次触发触底查询
                container.scrollTop = 0;

                this.queryCondition = text;
                if (this.curMiddleView == this.constant.menuContact) {
                    this.queryStaffStart = 0;
                    if (this.hasUpdateContact){
                        if (text){
                            this.getLocalDbUserLike({filter:this.queryCondition,start:0});
                        }else{
                            this.getLocalDbDepartment({deptId:1000001});
                        }
                    }
                }
            },
            dealEnter(){
                if (this.showSearchBtn){
                    this.searchRemote();
                }
            },
            searchRemote(){
                if (this.queryCondition =='' || this.queryCondition==undefined) {
                    return;
                }
                this.showWaitingBox(true);
                Service.getInstance().post(SpringLib.Config.smpGetStaffListByConUrl, {
                    searchInfo:this.queryCondition,
                    start:0,
                    limit:SpringLib.Config.staffLimit,
                    jobcode:this.userInfo.jobcode
                }).then(res => {
                    this.showWaitingBox(false);
                    if (res && res.data && res.data.isSuccess){
                        console.log('查询后台通讯录结果返回:',res.data.data);
                        let resItems = res.data.data || [];
                        let transItems = transRemote2local(resItems.result);
                        this.setLocalDbDepAndStuff(transItems);
                    }
                }).catch((err)=>{
                    console.log('查询后台通讯录失败:',err);
                    this.showWaitingBox(false);
                });
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

                let item = {};

                if (this.curMiddleView==WebChatConst.menuNotice){
                    item.noSysNotify = true;
                }
                this.showContextMenu({show: true, position: position,item});
            }
        },
        components: {
            SearchInput,
            Conversation,
            Accordion,
            WaitingMask
        },

        watch: {
            curMiddleView: {
                handler: function () {
                    let container = document.getElementById('conContainer');
                    container.scrollTop = 0;
                    this.queryCondition='';
                    this.showSearchRes = false;//还原搜索结果框
                }
            },
            getCurConList:{
                handler: function () {
                    //数据刷新后滚动条需要刷新
                    let container = document.getElementById('conContainer');
/*                    setTimeout(function () {
                        Ps.update(container);
                        },50);*/
                },
                deep:true
            },
            localDbDepAndStuff:{
                handler:function () {
                    //数据刷新后滚动条需要刷新
                    let container = document.getElementById('conContainer');
/*                    setTimeout(function () {
                        Ps.update(container);
                        },50)*/
                },
                deep:true
            },
            hasUpdateContact:function (val) {
                if (val){
                    if (this.queryCondition){
                        this.getLocalDbUserLike({filter:this.queryCondition,start:0});
                    }else{
                        this.getLocalDbDepartment({deptId:1000001});
                    }
                }
            }
        }
    }

</script>

<style lang='less' scoped>
    @import "../../styles/common.less";

    .be-wide {
        input{
            width: 210px !important;
        }
    }
    .max{
        position: fixed !important;
        left:70px;
        top:0px;
    }
    .selected {
        background-color: #eaedf3 !important;
    }
    .conversation_top {
        background-color: #F6FEF1 !important;
    }

    .conversations {
        width: 248px;
        border-right: 1px solid @common_border_color;
        border-left: 1px solid @common_border_color;
        height: 100%;
        background-color: #ffffff;
        position: relative;
        overflow: hidden;
        .empty-show{
            text-align: center;
            position: absolute;
            top:100px;
            color: #666;
            font-family: Microsoft YaHei;
            width: 100%;
            z-index: 5;
        }
        .bottom-btn{
            position: absolute;
            left:0;
            bottom:0px;
            width: 100%;
            heigth:39px;
            border-top:1px solid #d7dbe2;
            font-size: 14px;
            font-family: "Microsoft YaHei";
            color: rgb(49, 109, 182);
            line-height: 2.786;
            background-color: #f1f3f7;
            z-index: 1;
            .cancel-delete{
                .on-hand;
                display: inline-block;
                width: 121px;
                text-align: center;
                border-right: 1px solid #d7dbe2;
            }
            .do-delete{
                .on-hand;
                display: inline-block;
                width: 121px;
                text-align: center;
            }
        }
        .loading-box {
            opacity: .7;
            font-size: 12px;
            height: 12px;
            font-family: "SimSun";
            color: #666;
            text-align: center;
            background-color: #e4e8ef;
            transition: height 0.3s linear;
            overflow: hidden;
            position: absolute;
            width: 100%;
            top: 48px;
            z-index: 2;
            .loading-wrapper {
                line-height: 12px;
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
        .search {
            //margin: 12px auto 10px 12px;
            height: 49px;
            position: relative;
            .search-input{
                position: absolute;
                top:50%;
                left:18px;
                margin-top: -14px;
            }
            .createBtn {
                display: inline-block;
                width: 16px;
                height: 16px;
                background: url("../../images/add_icon.png") center no-repeat;
                background-size: 16px 16px;
                position: absolute;
                top: 50%;
                right: 14px;
                margin-top: -8px;
                &:hover{
                    background: url("../../images/add_icon_b.png") center no-repeat !important;
                }
            }
            .queryBtn {
                display: inline-block;
                position: absolute;
                top: 50%;
                right: 8px;
                margin-top: -8px;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(49, 109, 182);
                &:hover{
                  text-decoration: underline;
                }
            }
        }
        #conContainer {
            border-top: 1px solid @common_border_color;
            height: 549px;
            position: relative;
            overflow: hidden;
            z-index: 1;//谷歌45兼容问题,不加这个显示不出列表
            .load-more{
                font-size: 12px;
                font-family: "SimSun";
                text-align: center;
                transition: height .3s linear;
                height: 16px;
                color: rgb(69, 75, 85);
                .on-hand;
            }
        }
        .go-dn{
            z-index: auto;
        }

    }
</style>
