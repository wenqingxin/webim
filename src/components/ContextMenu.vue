<!-- 右键菜单 -->
<template>
    <div class="menus">
        <div class="context-menu" :style="contextMenu.position">
            <span class="item" v-show="contextMenu.item.makeTop" @click="topIt">
                <span class="firstStep" v-if="contextMenu.data.isTop=='true'">
                    取消置顶
                </span>
                <span class="firstStep" v-else>
                    置顶对话
                </span>
            </span>
            <span class="item" @click="showModifyBox" v-show="contextMenu.item.modifyName">
                 <span class="firstStep ">
                    修改群名称
                </span>
            </span>
            <span class="item trangle" v-show="contextMenu.item.noNotify" >
                <span class="firstStep">
                    群消息设置
                </span>
                <span class="secondStep">
                        <span class="item" :class="{hook:!isInLocalIgnoreList}" @click="forbidMessage(0)">接收并提醒消息</span>
                        <span class="item" :class="{hook:isInLocalIgnoreList}" @click="forbidMessage(1)">屏蔽消息</span>
                 </span>
            </span>
            <span class="item trangle" v-show="contextMenu.item.noSysNotify" >
                <span class="firstStep">
                    推送消息设置
                </span>
                <span class="secondStep">
                        <span class="item" :class="{hook:!isInIgnoreList(0)}" @click="forbidMessageRemote(0)">系统消息</span>
                        <span class="item" :class="{hook:!isInIgnoreList(6)}" @click="forbidMessageRemote(6)">意见反馈回复</span>
                        <span class="item" :class="{hook:!isInIgnoreList(7)}" @click="forbidMessageRemote(7)">资质到期提醒</span>
                        <span class="item" :class="{hook:!isInIgnoreList(2)}" @click="forbidMessageRemote(2)">航班调配消息</span>
                        <span class="item" :class="{hook:!isInIgnoreList(3)}" @click="forbidMessageRemote(3)">MIS的航班调配消息</span>
                        <span class="item" :class="{hook:!isInIgnoreList(5)}" @click="forbidMessageRemote(5)">FOC的航班消息</span>
                        <span class="item" :class="{hook:!isInIgnoreList(1)}" @click="forbidMessageRemote(1)">文件通知</span>
                        <span class="item" :class="{hook:!isInIgnoreList(4)}" @click="forbidMessageRemote(4)">OA消息</span>
                 </span>
            </span>
            <span class="item" v-show="contextMenu.item.delete" @click="deleteConversation">
                <span class="firstStep">
                删除会话
                </span>
            </span>
            <span class="item" v-show="contextMenu.item.batchDelete" @click="batchDeleteConversation">
                <span class="firstStep">
                批量删除
                </span>
            </span>
        </div>
    </div>

</template>

<script>
    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    import {mapActions} from 'vuex'
    import {Service} from '../util/Utils.js'
    import {WebChatConst} from '../util/Constant.js'
    import SpringLib from '../libs/SpringLib.js'
    export default {
        name: 'contextMenu',
        data () {
            return {
                sysForbidList:[]
            }
        },
        computed: {
            ...mapState(['contextMenu','userInfo','rightWindowData']),
            isInLocalIgnoreList(){
                if (this.userInfo[WebChatConst.webChatForbidGroup]){
                    return this.userInfo[WebChatConst.webChatForbidGroup].find(item => {
                        return this.contextMenu.data.targetId == item;
                    })
                }else{
                    return false;
                }
            }
        },
        mounted(){
            this.$nextTick(function () {
                Service.getInstance().post(SpringLib.Config.getIgnoreMsgTypeUrl, {
                    psnCode:this.userInfo.staffCode,//员工号
                }).then(res =>{

                    console.log('查询屏蔽消息结果',res);
                    if (res && res.data && res.data.isSuccess) {
                        this.sysForbidList = res.data.data;
                    }
                })
            });
        },
        methods: {
            ...mapMutations(['showMessageBox','showBatchDelete','setUserInfo','showChatWindowView','setRightWindowData']),
            ...mapActions(['getConversationList']),
            showModifyBox(){
                let ops = {show: true, title: '修改群名称', value:this.contextMenu.data.targetName,showCancel:true, isInput: true,confirm:(newName)=>{
                    if (newName==''){
                        this.showMessageBox(ops);
                        return;
                    }
                    if(newName==this.contextMenu.data.targetName){
                        this.showMessageBox({show:false});
                        return;
                    }
                    RongIMLib.RongIMClient.getInstance().setDiscussionName (this.contextMenu.data.targetId, newName, {
                        onSuccess:  ()=> {
                            console.log('修改讨论组名称成功');
                            setTimeout(()=> {
                                this.getConversationList();
                            },250)
                        },
                        onError: function (errcode) {
                            console.log('修改讨论组名称失败',errcode);
                        }
                    })
                }};
                this.showMessageBox(ops);
            },
            topIt(){
                RongIMLib.RongIMClient.getInstance().setConversationToTop(
                    this.contextMenu.data.type, this.contextMenu.data.targetId, !(this.contextMenu.data.isTop=='true'), {
                        onSuccess: () => {
                            this.getConversationList();
                        }
                    });
            },
            deleteConversation(){
                this.showMessageBox({show: true, title: '确认',showCancel:true, content:'是否确认删除会话?',confirm:()=>{
                    RongIMLib.RongIMClient.getInstance().removeConversation(
                        this.contextMenu.data.type, this.contextMenu.data.targetId, {
                            onSuccess: (bool) => {
                                console.log('删除会话结果',bool);
                                if (this.rightWindowData.targetId == this.contextMenu.data.targetId){
                                    this.showChatWindowView(WebChatConst.framePlaceHolder);
                                    this.setRightWindowData({});
                                }
                                setTimeout(()=>{
                                    this.getConversationList();
                                },300);
                            },
                            onError:()=>{
                                console.log('删除会话失败');
                            }

                        });
                }})
            },
            batchDeleteConversation(){
                this.showBatchDelete({show:true});
            },
            forbidMessage(flag){
                let localForbidList = this.userInfo[WebChatConst.webChatForbidGroup]||[];
                let index = localForbidList.findIndex(item =>{
                    return item == this.contextMenu.data.targetId;
                });
                if (flag == 1){
                    if (index == -1){
                        localForbidList.push(this.contextMenu.data.targetId);
                        this.$set(this.userInfo,WebChatConst.webChatForbidGroup,localForbidList) ;
                        this.setUserInfo(this.userInfo);
                    }
                }else{
                    if(index != -1){
                        localForbidList.splice(index, 1);
                        this.$set(this.userInfo,WebChatConst.webChatForbidGroup,localForbidList) ;
                        this.setUserInfo(this.userInfo);
                    }
                }
            },
            forbidMessageRemote(flag){
                let alreadyHas = false;
                for (let i=0;i<this.sysForbidList.length;i++){
                    if(this.sysForbidList[i] == flag){
                        this.sysForbidList.splice(i, 1);
                        alreadyHas=true;
                        break;
                    }
                }
                !alreadyHas && this.sysForbidList.push(flag);
                //alert(JSON.stringify(this.sysForbidList))
                Service.getInstance().post(SpringLib.Config.saveIgnoreMsgTypeUrl,{
                    psnCode:this.userInfo.staffCode,//员工号
                    msgTypes:this.sysForbidList.join(',')
                }).then(res =>{
                    console.log('查询屏蔽消息结果',res);
                })
            },
            isInIgnoreList(flag){
                let res = this.sysForbidList.find(item => {
                    return flag == item;
                });
                return this.sysForbidList && res !=undefined;
            }
        }
    }


</script>

<style lang="less" scoped>
    @import '../styles/common.less';

    .item {
        display: inline-block;
        width: 114px;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid @common_border_color;
        padding: 0px 18px;
        font-size: 14px;
        font-family: "Microsoft YaHei";
        color: rgb(69, 75, 85);
        position: relative;
        display: inline-block;
        width: 114px;
        .firstStep,.secondStep item {
            //overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            width: 114px;
            display: inline-block;
        }

        &:last-child {
            border: none;
        }
        &:hover {
            background-color: #e9e9e9;
        }
    }

    .context-menu {
        position: absolute;
        background-color: #f5f5f5;
        border-radius: 5px;
        z-index: 100;
        .box-shadow;
        width: 150px;

    }

    .secondStep {
        .context-menu;
        display: none;
        position: absolute;
        top: 0;
        left: 150px;
        width: 180px;
        .item {
            width: 144px;
        }
    }

    .trangle {
        position: relative;
        &:after {
            content: '';
            display: inline-block;
            border: 4px solid transparent;
            border-left: 4px solid #a9a9a9;
            position: absolute;
            right: 7px;
            bottom: 15px;
        }
        &:hover > .secondStep {
            display: block;
        }

    }

    .hook {
        &:before {
            content: '';
            position: absolute;
            display: inline-block;
            background: url("../images/select_hook_icon.png") center no-repeat;
            background-size: 23px 17px;
            width: 23px;
            height: 17px;
            bottom: 12px;
            right: 10px;
        }
    }
</style>
