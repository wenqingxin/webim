<!-- 最小化框 -->
<template>
    <transition name="fade">
        <div class="minimize-bar" v-show="minimizeOps.show">
            <i class="msg-icon">
                <Bubble :unread="getInfo.unread"></Bubble>
            </i>
            <span class="message" v-if="getInfo.unread>0">
                <span class="unread" v-text="getInfo.msg"></span>
            </span>
            <span class="no-message" v-if="getInfo.unread<=0" v-text="'你还没有未读消息哦~'"></span>
            <i class="max-icon on-hand" @click="beMax"></i>
        </div>
    </transition>
</template>

<script>
    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    import {mapActions} from 'vuex'
    import Bubble from '../components/Bubble.vue'
    import {WebChatConst} from '../util/Constant.js'
    export default {
        name: 'minimizeBar',
        data () {
            return {
                unreadNum: 0,
                targetId:''
            }
        },
        computed: {
            ...mapState([
                'minimizeOps',
                'historyGroupConList',
                'userInfo',
                'historyConList',
                'flightGroupConList',
                'groundGroupConList',
                'userGroupConList',
                'messageNotifyList',
                'historyGroupConList',
                'curReceiveMessage',
                'conversationList',
                'curChatWindowView',
                'rightWindowData'
            ]),
            getInfo(){
                return this.computedNum([
                    ...this.flightGroupConList,
                    ...this.groundGroupConList,
                    ...this.userGroupConList,
                    ...this.messageNotifyList,
                    ...this.historyGroupConList,
                    ...this.historyConList
                ])
            }
        },
        methods: {
            ...mapMutations(['minimize']),
            ...mapActions(['getConversationList']),
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
                let lastestTime = 0;
                let lastestNews = '';
                for (let con of list){
                    sum+=Number(con.unread);
                    if (!this.isForbid(con.targetId)){
                        if (con.millisecond > lastestTime && con.unread>0){
                            lastestTime = con.millisecond;
                            lastestNews=con.targetName+' '+con.msg;
                            this.targetId=con.targetId;
                        }
                        sumUnforbid+=Number(con.unread);
                    }
                }
                if (sumUnforbid==0 && sum>0){
                    return {unread:-1,msg:''};
                }
                return  {unread:sumUnforbid,msg:lastestNews};
            },
            beMax(){
                this.minimize({show:false});
                if (this.curChatWindowView == WebChatConst.frameChatBody &&
                    this.rightWindowData.targetId == this.targetId && !this.minimizeOps.show){
                    RongIMLib.RongIMClient.getInstance().getConversationList({
                        onSuccess:  ()=> {
                            //清消息前需要查询列表
                            RongIMLib.RongIMClient.getInstance().clearUnreadCount(this.rightWindowData.conversationType,this.rightWindowData.targetId,{
                                onSuccess:()=>{
                                    this.getConversationList();
                                }
                            });
                        },
                        onError: function (error) {
                        }
                    }, null);
                }else{
                    setTimeout(()=> {
                        this.getConversationList();
                    },100);
                }
            }
        },
        components:{
            Bubble
        },
        watch:{
            'minimizeOps.show':{
                handler:function (val) {
                    if (val){
                        //this.unreadNum = ;
                    }

                },
                deep:true
            }
        }
    }


</script>

<style lang="less" scoped>
    @import "../styles/common.less";

    .minimize-bar {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 200px;
        height: 50px;
        background: #ffffff;
        font-size: 14px;
        font-family: "Microsoft YaHei";
        color: rgb(51, 51, 51);
        border-radius: 3px;
        line-height: 50px;
        padding: 0px 20px;
        overflow: hidden;

        .msg-icon {
            display: inline-block;
            width: 19px;
            height: 18px;
            background: url("../images/minibar_msg_icon.png") center no-repeat;
            background-size: 19px 18px;
            vertical-align: middle;
            position: relative;
        }
        .max-icon {
            display: inline-block;
            width: 16px;
            height: 16px;
            background: url("../images/minibar_max_icon.png") center no-repeat;
            background-size: 16px 16px;
            position: absolute;
            top: 17px;
            right: 15px;
        }
        .no-message {
            color: rgb(153, 153, 153);

        }
        .message {
            color: #333;
            white-space: nowrap;
            width: 178px;
            display: inline-block;
            overflow: hidden;
            height: 50px;
            position: absolute;
            left: 30px;
            .unread {
                color: #316db6;
                position: absolute;
                top: 0;
                left: 50px;
                animation: marquee 5s linear infinite;
            }
        }
        @keyframes marquee {
            from {
                left:100%;
            }
            to{
                left:-100%;
            }
        }


    }
</style>
