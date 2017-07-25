<!-- 右侧窗口 -->
<template>
    <div class="right-window" :style="getRightWindowWidth"
         :class="{'show-msg':curChatWindowView == curView.frameChatBody,'no-msg':curChatWindowView != curView.frameChatBody}">
        <div class="chat-header">
            <Head-photo class="header-photo on-hand"
                        @h-click="checkStaffDetail(rightWindowData.targetId)"
                        v-if="showHeaderLeft && rightWindowData.conversationType==1 && !isSystemPush"
                        :src="rightWindowData.icon" :alt="rightWindowData.targetName"
                        size="36">
            </Head-photo>
            <Icon-head-photo class="header-photo"
                             :src="getGroupIcon.icon"
                             v-if="showHeaderLeft && (rightWindowData.conversationType!=1 ||isSystemPush)"
                             :bg-color="getGroupIcon.color"
                             img-width="20"
                             img-height="21">
            </Icon-head-photo>
            <span class="name on-hand"
                  v-if="showHeaderLeft"
                  @click="showMemberList" v-text="rightWindowData.targetName" :title="rightWindowData.targetName">
            </span><span class="memNum" v-show="showHeaderLeft && showMemNum" v-text="getMemNum"></span>
            <i class="arr-dn on-hand"
               :class="{'point-right':asideBar}"
               v-if="showHeaderLeft && !isSystemPush"
               @click="showMemberList">
            </i>
            <!--<span class="go-back on-hand" v-show="contactProfile" @click="showContactProfile(false)">返回</span>-->
            <i class="minimize on-hand" @click="minimize({show:true})"><i></i></i>
            <i class="on-hand" :class="{toggleMax:maximize,maximize:!maximize}" @click="beMaximize(!maximize)">
                <i class="arr1"></i>
                <i class="arr2"></i>
            </i>
            <i class="close-window on-hand" @click="closeChatWindow"><i></i></i>
        </div>
        <transition name="fade">
            <Chat-body class="display-position" v-if="curChatWindowView === curView.frameChatBody"></Chat-body>
        </transition>
        <transition name="fade">
            <Profile-panel class="display-position" v-if="contactProfile"></Profile-panel>
        </transition>

    </div>
</template>

<script>
    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    import {mapGetters} from 'vuex'
    import {mapActions} from 'vuex'
    import {WebChatConst} from '../../util/Constant.js'
    import HeadPhoto from '../../components/common/HeadPhoto.vue'
    import IconHeadPhoto from '../../components/common/IconHeadPhoto.vue'
    import ProfilePanel from '../../components/ProfilePanel.vue'
    import ChatBody from '../../components/ChatBody.vue'

    export default {
        name: 'rightWindow',
        data () {
            return {
                src: require('../../images/head_photo.png'),
                curView: WebChatConst
            }
        },
        methods: {
            ...mapMutations([
                'setRightWindowData',
                'showChatWindowView',
                'showAsideBar',
                'minimize',
                'setStaffProfileDetail',
                'showContactProfile',
                'beMaximize']),
            ...mapActions(['checkStaffDetail']),
            closeChatWindow(){
                if (this.contactProfile){
                    this.showContactProfile(false);
                }else{
                    this.showChatWindowView(WebChatConst.framePlaceHolder);
                    this.setRightWindowData({});
                }
            },
            showMemberList(){
                !this.isSystemPush && this.showAsideBar(!this.asideBar);
            }
        },
        computed:{
            ...mapState(['curChatWindowView','asideBar','rightWindowData','contactProfile','maximize']),
            ...mapGetters(['getGroupIcon','isSystemPush']),
            showHeaderLeft(){
                return (this.curChatWindowView == this.curView.frameChatBody) && !this.contactProfile
            },
            isSystemPush(){
                let targetId = this.rightWindowData.targetId;
              return  targetId=='system' || targetId=='office' || targetId=='subscription'|| targetId=='flight';
            },
            showMemNum(){
                return this.rightWindowData.conversationType == RongIMLib.ConversationType.DISCUSSION
                    ||this.rightWindowData.conversationType == RongIMLib.ConversationType.GROUP;
            },
            getMemNum(){
                if (this.rightWindowData.targetMemNum &&　this.rightWindowData.targetMemNum>2){
                    return '('+this.rightWindowData.targetMemNum+')';
                }
            },
            getRightWindowWidth(){
                let width = document.body.clientWidth;
                if (this.maximize){
                    return {
                        width:(Number(width)-320)+'px',
                        position:'fixed !important',
                        left:'320px',
                        top:'0px',
                        height:'100%'
                    }
                }else{
                    return '';
                }
            }
        },
        components: {
            ChatBody,
            HeadPhoto,
            ProfilePanel,
            IconHeadPhoto
        },
        watch:{
            contactProfile:{
                handler:function (val) {
                    if (!val){
                        this.setStaffProfileDetail({});
                    }
                }
            }
        }
    }

</script>

<style lang='less' scoped>
    @import "../../styles/common.less";
    .point-right{
        transform: rotate(-90deg);
    }
    .show-msg {
        background-color: #f4f6fa;
    }

    .no-msg {
        background: #f4f6fa url("../../images/chat_win_placeholder.png") center no-repeat;
    }
    .right-window {
        width: 580px;
        height: 100%;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        position: relative;
        .go-back{
            display: inline-block;
            position: absolute;
            left: 20px;
            top: 18px;
            font-size: 14px;
            color: blue;
        }
        .display-position{
            position: absolute;
            left: 0;
            top: 49px;
            width: 100%;
        }
        .chat-header {
            height: 49px;
            border-bottom: 1px solid @common_border_color;
            border-top-right-radius: 5px;
            background-color: #ffffff;
            position: relative;
            .header-photo {
                position: absolute;
                left: 20px;
                top: 7px;
                width: 36px !important;
                height: 36px!important;
            }
            .name {
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(69, 75, 85);
                line-height: 49px;
                margin-left: 65px;
                max-width: 300px;
                display: inline-block;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            .memNum{
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(69, 75, 85);
                line-height: 49px;
                display: inline-block;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            .arr-dn {
                display: inline-block;
                border: 5px solid transparent;
                border-top: 5px solid #a9a9a9;
                transition:transform 0.3s  cubic-bezier(.55, 0, .1, 1);
                transform-origin: center 25%;
                position: relative;
                top: -16px;
            }
            .arr-up {
                display: inline-block;
                border: 5px solid transparent;
                border-bottom: 5px solid #a9a9a9;
                vertical-align: text-bottom;
            }
            @window_op_color: #a9a9a9;
            .minimize {
                position: absolute;
                top: 16px;
                right: 92px;
                display: inline-block;
                width: 18px;
                height: 18px;

                i{
                    content: '';
                    display: inline-block;
                    width: 18px;
                    height: 2px;
                    background-color: @window_op_color;
                    position: absolute;
                    top: 7px;
                    left: 0;
                    &:hover{
                        background-color: #306db6 !important;
                    }
                }

            }
            .toggleMax{
                background: url("../../images/be_origin.png") center no-repeat;
                background-size: contain;
                &:hover{
                    background: url("../../images/be_origin_b.png") center no-repeat !important;
                    background-size: 16px 16px !important;
                }
                top: 16px;
                right: 54px;
                display: inline-block;
                width: 16px;
                height: 16px;
                position: absolute;
            }
            .maximize {
                position: absolute;
                top: 16px;
                right: 54px;
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 1px solid @window_op_color;
                &:hover{
                    border: 1px solid #306db6 !important;
                    .arr1{
                        border-bottom: 2px solid #306db6 !important;
                        border-left: 2px solid #306db6 !important;
                    }
                    .arr2{
                        border-right: 2px solid #306db6 !important;
                        border-top: 2px solid #306db6 !important;
                    }
                }
                border-radius: 1px;
                .inside-icon() {
                    content: '';
                    display: inline-block;
                    position: absolute;
                    width: 6px;
                    height: 6px;

                }
                .arr1 {
                    .inside-icon();
                    border-bottom: 2px solid @window_op_color;
                    border-left: 2px solid @window_op_color;
                    left: 1px;
                    bottom: 1px;
                }
                .arr2 {
                    .inside-icon();
                    border-right: 2px solid @window_op_color;
                    border-top: 2px solid @window_op_color;
                    top: 1px;
                    right: 1px;
                }
            }
            .close-window {
                display: inline-block;
                position: absolute;
                width: 16px;
                height: 16px;
                background: url("../../images/login_close_icon.png") center no-repeat;
                background-size: 16px 16px;
                top: 16px;
                right: 19px;
                &:hover{
                    background: url("../../images/login_close_icon_b.png") center no-repeat;
                }
            }

        }
    }

</style>
