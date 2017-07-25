/**
 * Created by Administrator on 2017/5/31.
 */
import {WebChatConst} from '../util/Constant.js'
import {getLocalUserArr} from '../util/Utils.js'
import Vue from 'vue';

export var mutations = {
    showMiddleView(state, viewName){
        state.curMiddleView = viewName;
    },
    beMaximize(state, flag){
        state.maximize = flag;
    },
    showChatWindowView(state, viewName){
        state.curChatWindowView = viewName;
    },
    showContactLayer(state, options){
        if (options){
            if (options.show != undefined){
                state.contactLayer.show = options.show;
            }
            if (!options.show){
                state.contactLayer.existMembers=[];
            }
            if (options.existMembers){
                state.contactLayer.existMembers = options.existMembers
            }
            state.contactLayer.confirm = function() {
                //state.contactLayer.show = false;
                //state.maskLayer.show = false;
                options.confirm && options.confirm.apply(this,arguments);
            };
            state.contactLayer.cancel = function() {
                state.contactLayer.show = false;
                state.maskLayer.show = false;
                state.contactLayer.existMembers=[];
                options.cancel && options.cancel.apply(this,arguments);
            };
        }
        state.contactLayer.show ? state.maskLayer.show = true : state.maskLayer.show = false;
    },
    showContactProfile(state,flag){
        state.contactProfile = flag;
    },
    showImageViewer(state, prop){
        if (prop) {
            if (prop.src) {
                state.imageViewer.src = prop.src
            }
            if (prop.show != undefined) {
                state.imageViewer.show = prop.show;
            }
        }
    },
    showBarManager(state, flag){
        state.barManager = flag;
        flag ? state.maskLayer.show = true : state.maskLayer.show = false;
    },
    showProfileLayer(state, flag){
        state.profileLayer = flag;
        flag ? state.maskLayer.show = true : state.maskLayer.show = false;
    },
    showAsideBar(state, flag){
        state.asideBar = flag;
    },
    showGroupMessageBox(state, options){
        if (options.show != undefined){
            state.groupMessageBox.show = options.show;
        }
        if (options.msg){
            state.groupMessageBox.msg = options.msg;
        }
        if (options.title){
            state.groupMessageBox.title = options.title;
        }
        if (options.icon){
            state.groupMessageBox.icon = options.icon;
        }
        state.groupMessageBox.cancel = () => {
            state.groupMessageBox.show = false;
            state.maskLayer.show = false;
            options.cancel && options.cancel();
        };
        state.groupMessageBox.confirm = () => {
            state.groupMessageBox.show = false;
            state.maskLayer.show = false;
            options.confirm && options.confirm();
        };
        state.groupMessageBox.show ? state.maskLayer.show = true : state.maskLayer.show = false;
    },
    showMessageBox(state, options){
        if (options) {
            //if (options.isInput != undefined) {
                state.messageBox.isInput = options.isInput;
           // }
            //if (options.show != undefined) {
                state.messageBox.show = options.show;
            //}
            //if (options.title) {
                state.messageBox.title = options.title;
            //}
            //if (options.content) {
            //vm.$set(state.messageBox,'content', options.content)
                state.messageBox.content = options.content;
            //}
            //if (options.showCancel != undefined) {
                state.messageBox.showCancel = options.showCancel;
           // }
            state.messageBox.value = options.value;
            state.messageBox.cancel = () => {
                state.messageBox.show = false;
                state.maskLayer.show = false;
                state.maskLayer.zIndex = 25;

                options.cancel && options.cancel();
            };
            state.messageBox.confirm = (value) => {
                state.messageBox.show = false;
                state.maskLayer.show = false;
                state.maskLayer.zIndex = 25;

                options.confirm && options.confirm(value);
            };
        }
        if (state.messageBox.show){
            state.maskLayer.show = true;
            state.maskLayer.zIndex = 100;
        }else{
            state.maskLayer.show = false;
            state.maskLayer.zIndex = 25;
        }
    },
    showContextMenu(state, options){
        if (options) {
            if (options.item != undefined) {
                state.contextMenu.item = options.item;
            }
            if (options.show != undefined) {
                state.contextMenu.show = options.show;
            }
            if (options.position != undefined) {
                state.contextMenu.position = options.position;
            }
            if (options.data != undefined) {
                state.contextMenu.data = options.data;
            }

        }
    },
    minimize(state, ops){
        state.minimizeOps.show = ops.show;
        state.minimizeOps.msg = ops.msg;
    },

    showEmojiPanel(state, flag){
        state.emojiPanel = flag;
    },
    setUpdateContact(state,flag){
        state.hasUpdateContact = flag;
    },
    showBatchDelete(state,item){
        state.batchDelete = JSON.parse(JSON.stringify(item));
    },
    setUserInfo(state, userInfo){
        if (userInfo) {
            let userArr = getLocalUserArr();
            if (!(userArr instanceof Array)) userArr = [];
            console.log('当前localStorage用户信息:', userArr);
            for (let i = 0; i < userArr.length; i++) {
                if (userArr[i].userId == userInfo.userId) {
                    //保留之前的配置
                    userInfo = Object.assign({},userArr[i],userInfo);
                    console.log('localStorage已有该用户信息:', userInfo);
                    userArr.splice(i, 1);
                    break;
                }
            }
            state.userInfo = userInfo;
            userArr.push && userArr.push(userInfo);
            localStorage.setItem(WebChatConst.webChatUserInfo, JSON.stringify(userArr));
        }
    },
    deleteUser(state, staffId){
        if (staffId){
            state.userInfo = {};
            let userArr = getLocalUserArr();
            for (let i = 0; i < userArr.length; i++) {
                if (!userArr[i].staffId || userArr[i].staffId == staffId) {
                    //保留之前的配置
                    userArr.splice(i, 1);
                    break;
                }
            }
            localStorage.setItem(WebChatConst.webChatUserInfo, JSON.stringify(userArr));
        }
    },
    showConnectInfo(state, value){
        if (value) {
            if (value.show != undefined) {
                state.connectInfo.show = value.show;
            }
            if (value.loading != undefined) {
                state.connectInfo.loading = value.loading;
            }
            if (value.msg) {
                state.connectInfo.msg = value.msg;
            }
        }
    },
    showUpdatingContact(state, value){
        if (value) {
            if (value.show != undefined) {
                state.connectInfo.show = value.show;
            }
            if (value.loading != undefined) {
                state.connectInfo.loading = value.loading;
            }
            if (value.msg) {
                state.connectInfo.msg = value.msg;
            }
        }
    },
    refreshConversationList(state, conversationList){
        //alert('会话列表:'+JSON.stringify(conversationList));
        if (conversationList) {
            console.log('更新所有会话列表信息:', conversationList);
            //state.conversationList = conversationList;
            //此处要用赋值的方法,对于复杂对象的赋值,不能直接用=引用,如果被引用的对象销毁了,被赋值对象也没值了
            // (action中commit触发会有此问题,会在改变state中任意状态值的时候把conversationList置为空数组)
            // 不直接使用 `Object.assign(state.conversationList, conversationList)`,这样不会触发更新操作,getter不执行
            //注意是浅拷贝并且只会用源对象已有的属性去覆盖目标对象的对应属性
            //state.conversationList = Object.assign([], state.conversationList,conversationList);
            state.conversationList = JSON.parse(JSON.stringify(conversationList));
        }
    },
    setHistoryConList(state, conList){
        if (conList) {
            console.log('更新当前历史会话列表显示信息:', conList);
            //state.curConList = Object.assign([], state.curConList,conList);
            // 深拷贝简单粗暴
            let clone = JSON.parse(JSON.stringify(conList));
            state.historyConList = clone;
        }
    },
    setHistoryGroupConList(state, conList){
        if (conList) {
            console.log('更新当前历史航班群会话列表显示信息:', conList);
            //state.curConList = Object.assign([], state.curConList,conList);
            // 深拷贝简单粗暴
            let clone = JSON.parse(JSON.stringify(conList));
            state.historyGroupConList = clone;
        }
    },
    setFlightGroupConList(state, conList){
        if (conList) {
            console.log('更新当前航班群会话列表显示信息:', conList);
            //state.curConList = Object.assign([], state.curConList,conList);
            // 深拷贝简单粗暴
            var clone = JSON.parse(JSON.stringify(conList));
            state.flightGroupConList = clone;
        }
    },
    setGroundGroupConList(state, conList){
        if (conList) {
            console.log('更新当前地服群会话列表显示信息:', conList);
            //state.curConList = Object.assign([], state.curConList,conList);
            // 深拷贝简单粗暴
            var clone = JSON.parse(JSON.stringify(conList));
            state.groundGroupConList = clone;
        }
    },
    setUserGroupConList(state, conList){
        if (conList) {
            console.log('更新当前用户群会话列表显示信息:', conList);
            //state.curConList = Object.assign([], state.curConList,conList);
            // 深拷贝简单粗暴
            var clone = JSON.parse(JSON.stringify(conList));
            state.userGroupConList = clone;
        }
    },
    setMessageNotifyList(state, conList){
        if (conList) {
            console.log('更新当前消息提醒列表显示信息:', conList);
            //state.curConList = Object.assign([], state.curConList,conList);
            // 深拷贝简单粗暴
            var clone = JSON.parse(JSON.stringify(conList));
            state.messageNotifyList = clone;
        }
    },
    setRemoteGroupList(state, groupList){
        if (groupList) {
            console.log('更新当前加入群组信息:', groupList);
            //state.curConList = Object.assign([], state.curConList,conList);
            // 深拷贝简单粗暴
            var clone = JSON.parse(JSON.stringify(groupList));
            state.remoteGroupList = clone;
        }
    },
    setRemoteGroupNotInList(state, groupList){
        if (groupList) {
            console.log('更新当前未加入群组信息:', groupList);
            //state.curConList = Object.assign([], state.curConList,conList);
            // 深拷贝简单粗暴
            var clone = JSON.parse(JSON.stringify(groupList));
            state.remoteGroupListNotIn = clone;
        }
    },
    setRightWindowData(state, rightData){
        if (rightData) {
            let vm = new Vue();
            //vm.$set(state.rightWindowData,'title', rightData.title || '');
            vm.$set(state.rightWindowData,'chatBodyData',rightData.chatBodyData || []);
            vm.$set(state.rightWindowData,'targetId', rightData.targetId || []);
            vm.$set(state.rightWindowData,'conversationType', rightData.conversationType);
            vm.$set(state.rightWindowData,'gender',rightData.gender);
            vm.$set(state.rightWindowData,'icon', rightData.icon);
            //state.rightWindowData.targetName = rightData.targetName;
            vm.$set(state.rightWindowData,'targetName', rightData.targetName);
            vm.$set(state.rightWindowData,'flightTime', rightData.flightTime);
            vm.$set(state.rightWindowData,'groupType', rightData.groupType);
            vm.$set(state.rightWindowData,'targetMemNum', (rightData.targetMemNum||''));
            //alert(rightData.targetName+' '+state.rightWindowData.targetName)
            //state.rightWindowData = JSON.parse(JSON.stringify(state.rightWindowData))
        }
    },
    setCurReceiveMessage(state, message){
        if (message) {
            state.curReceiveMessage = message;
        }
    },
    setLocalDbDepAndStuff(state,data){
        if (data){
            state.localDbDepAndStuff = JSON.parse(JSON.stringify(data));
        }
    },
    setStaffProfileDetail(state,data){
        if (data){
            state.staffProfileDetail = JSON.parse(JSON.stringify(data));
        }
    },
    setQiniuFileToken(state,token){
        state.qiniuFileToken = token;
    },
    setDiscussCache(state,cache){
        state.discussCache = JSON.stringify(cache);
    },
    showWaitingBox(state,flag){
        state.waitingBox = flag;
    }
};