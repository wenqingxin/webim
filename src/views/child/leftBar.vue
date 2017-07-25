<!-- 左侧菜单栏 -->
<template>
    <div class="left-bar" :class="{max:maximize}">
        <div @click.stop="showProfileLayer(true)">
            <Head-photo :src="userInfo.icon" class="head on-hand" type="left-bar"></Head-photo>
        </div>
        <ul class="bar">
            <li class="item" v-for="(bar,index) in bars" :key="index">
                <i :class="curSelectedTabIndex == bar.class ? bar.class+'-active' : bar.class"
                   @click="switchTab(bar.class)" class="on-hand" :title="bar.text">
                    <Bubble :unread="getConUnreadNum(bar.class)"></Bubble>
                </i>
            </li>
            <li class="item">
                <i :class="curSelectedTabIndex == 8 ? 'sort-icon-active' : 'sort-icon'" title="界面管理"
                   @click="switchTab('sort_bar_icon')" class="on-hand">
                </i>
            </li>
        </ul>
    </div>
</template>

<script>
    import Bubble from '../../components/Bubble.vue'
    import HeadPhoto from '../../components/common/HeadPhoto.vue'
    import {mapMutations} from 'vuex'
    import {mapState} from 'vuex'
    import {mapGetters} from 'vuex'
    import {mapActions} from 'vuex'
    import {WebChatConst} from '../../util/Constant.js'
    import {SpringLib} from '../../libs/SpringLib.js'
    import {dataAccess} from '../../util/Utils.js'
    export default {
        name: 'leftBar',
        data(){
            return {
                curSelectedTabIndex:'history-con-icon',
            }
        },

        computed:{
            ...mapState({
                userInfo: state => state.userInfo || {},
                bars:state => {
                    if (state.userInfo && state.userInfo[WebChatConst.webChatBarOrder]){
                        return state.userInfo[WebChatConst.webChatBarOrder];
                    }else{
                        return WebChatConst.BarOrderList;
                    }
                },
                curMiddleView:state => state.curMiddleView,
                historyConList:state => state.historyConList,
                historyGroupConList:state => state.historyGroupConList,
                flightGroupConList:state => state.flightGroupConList,
                groundGroupConList:state => state.groundGroupConList,
                userGroupConList:state => state.userGroupConList,
                messageNotifyList:state => state.messageNotifyList,
                maximize:state => state.maximize
            }),
        },
        methods: {
            getConUnreadNum(curTab){
                if (curTab == 'history-con-icon'){
                    return this.computedNum(this.historyConList);
                }
                if (curTab == 'history-group-icon'){
                    return this.computedNum(this.historyGroupConList);
                }
                if (curTab == 'flight-group-icon'){
                    return this.computedNum(this.flightGroupConList);
                }
                if (curTab == 'ground-group-icon'){
                    return this.computedNum(this.groundGroupConList);
                }
                if (curTab == 'user-group-icon'){
                    return this.computedNum(this.userGroupConList);
                }
                if (curTab == 'notice-icon'){
                    return this.computedNum(this.messageNotifyList);
                }
                return '';
            },
            isForbid(targetId){
                if (this.userInfo[WebChatConst.webChatForbidGroup]){
                    return this.userInfo[WebChatConst.webChatForbidGroup].find(item => {
                        return targetId == item;
                    })
                }else{
                    return false;
                }
            },
            computedNum(list){
                let sumUnforbid = 0 ;
                let sum = 0 ;
                for (let con of list){
                    sum+=Number(con.unread);
                    if (!this.isForbid(con.targetId)){
                        sumUnforbid+=Number(con.unread);
                    }
                }
                if (sumUnforbid==0 && sum>0){
                    return -1;
                }
                return sumUnforbid;
            },
            switchTab(index){
                this.curSelectedTabIndex = index;
                switch(index){
                    case 'history-con-icon':
                        this.showMiddleView(WebChatConst.menuHistoryCon);
                        break;
                    case 'flight-group-icon':
                        this.showMiddleView(WebChatConst.menuFlightGroup);
                        break;
                    case 'ground-group-icon':
                        this.showMiddleView(WebChatConst.menuGroundService);
                        break;
                    case 'notice-icon':
                        this.showMiddleView(WebChatConst.menuNotice);
                        break;
                    case 'user-group-icon':
                        this.showMiddleView(WebChatConst.menuUserGroup);
                        break;
                    case 'contact-icon':
/*                        this.showConnectInfo({msg:'正在更新本地通讯录',show:true,loading:true});
                        dataAccess.getDeptAndStaff(1000101,function (res) {
                            alert(res);
                        })*/
                        this.getLocalDbDepartment({deptId:1000001});
                        this.showMiddleView(WebChatConst.menuContact);
                        break;
                    case 'history-group-icon':
                        this.showMiddleView(WebChatConst.menuHistoryGroup);
                        break;
                    case 'sort_bar_icon':
                        this.showBarManager(true);
                        break;

                }
            },
            ...mapMutations([
                'showContactLayer',
                'showBarManager',
                'showMiddleView',
                'showProfileLayer',
                'showConnectInfo',
                'toForBiddenSendMsg',
                'showChatWindowView',
                'setRightWindowData',
                'showContactProfile'
            ]),
            ...mapActions(['getLocalDbDepartment','getConversationList'])
        },
        watch:{
            //当前展示视图一切换就更新到相应界面的数据
            curMiddleView:function () {
                this.getConversationList();
                this.showChatWindowView(WebChatConst.framePlaceHolder);
                this.setRightWindowData({});
                this.showContactProfile(false);
            }
        },
        components:{
            Bubble,
            HeadPhoto
        }
    }

</script>

<style lang='less' scoped>
    @import "../../styles/common.less";
    .max{
        position: fixed;
        top: 0;
        left: 0
    }
    .left-bar{
        width: 70px;
        background-color: @common_blue;
        height: 100%;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;

        text-align: center;
        .head{
            margin-top: 20px;
            margin-left: auto;
            margin-right: auto;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            overflow: hidden;
        }
        .bar{
            list-style-type: none;
            margin-top: -5px;
            padding: 0;
            .item{
                margin-top: 36px;
                text-align: center;
                .icon(@url,@w,@h){
                    display: inline-block;
                    width: @w;
                    height: @h;
                    background: @url center no-repeat;
                    background-size: @w @h;
                    position: relative;
                }
                .history-con-icon{
                    .icon(url(../../images/history_con_bar_icon.png),24px,25px);
                    &:hover{
                        .history-con-icon-active;
                    }
                }
                .history-con-icon-active{
                    .icon(url(../../images/history_con_bar_icon_active.png),24px,25px);
                }
                .flight-group-icon{
                    &:hover{
                        .flight-group-icon-active;
                    }
                    .icon(url(../../images/flight_bar_icon.png),26px,25px);
                }
                .flight-group-icon-active{
                    .icon(url(../../images/flight_bar_icon_active.png),26px,25px);
                }
                .ground-group-icon{
                    &:hover{
                        .ground-group-icon-active;
                    }
                    .icon(url(../../images/groundserv_bar_icon.png),22px,26px);
                }
                .ground-group-icon-active{
                    .icon(url(../../images/groundserv_bar_icon_active.png),22px,26px);
                }
                .notice-icon{
                    &:hover{
                        .notice-icon-active;
                    }
                    .icon(url(../../images/notice_bar_icon.png),22px,24px);
                }
                .notice-icon-active{
                    .icon(url(../../images/notice_bar_icon_active.png),22px,24px);
                }
                .history-group-icon{
                    &:hover{
                        .history-group-icon-active;
                    }
                    .icon(url(../../images/history_flt_bar_icon.png),24px,24px);
                }
                .history-group-icon-active{
                    .icon(url(../../images/history_flt_bar_icon_active.png),24px,24px);
                }
                .user-group-icon{
                    &:hover{
                        .user-group-icon-active;
                    }
                    .icon(url(../../images/user_bar_icon.png),24px,23px);
                }
                .user-group-icon-active{
                    .icon(url(../../images/user_bar_icon_active.png),24px,23px);
                }
                .contact-icon{
                    &:hover{
                        .contact-icon-active;
                    }
                    .icon(url(../../images/contact_bar_icon.png),24px,26px);
                }
                .contact-icon-active{
                    .icon(url(../../images/contact_bar_icon_active.png),24px,26px);
                }
                .sort-icon{
                    &:hover{
                        .sort-icon-active;
                    }
                    .icon(url(../../images/sort_bar_icon.png),24px,24px);
                }
                .sort-icon-active{
                    .icon(url(../../images/sort_bar_icon_active.png),24px,24px);
                }

            }
        }

    }
</style>
