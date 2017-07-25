import {WebChatConst} from'../util/Constant.js'
import {} from'../util/Utils.js'
/**
 * 分别群组
 */
function sortGroupList(ret, groupType) {
    //区分航班群与用户群
    var gruops = [];
    if (groupType == 'user' && ret) {
        //用户群
        for (var i = 0; i < ret.length; i++) {
            var item = ret[i];
            if (item && item.chatGroupType == '1') {
                gruops.push(item);
            }
        }
    } else if (groupType == 'flight' && ret) {
        //航班群
        for (var i = 0; i < ret.length; i++) {
            var item = ret[i];
            if (item && item.chatGroupType == '0') {
                gruops.push(item);
            }
        }
    } else if (groupType == 'ground' && ret) {
        //航班群
        for (var i = 0; i < ret.length; i++) {
            var item = ret[i];
            if (item && item.chatGroupType == '2') {
                gruops.push(item);
            }
        }
    }
    return gruops;
}
function group2Conversation(groupList, type) {
    let groupArr = sortGroupList(groupList, type);
    let conList = [];
    if (groupArr) {
        for (let group of groupArr) {
            let con = createConversation();
            con.type = RongIMLib.ConversationType.GROUP;
            con.targetId = group.chatGroupId;
            con.targetName = group.chatGroupName;
            con.groupType = group.chatGroupType;
            con.showJoin = true;

            conList.push(con);
        }
    }
    return conList;
}

function createConversation() {
    let conversation = {
        src: '',//头像链接
        name: '',//发送人名称
        msg: '',//最后一条消息
        time: '',//最后发送消息的时间
        showJoin: false,//是否显示加入的按钮
        unread: 0,//未读消息数
        type: '',//会话类型 此处为DISCUSS或者PRIVATE
        childType: '',//子类型 只在通知消息里才有对应的类型,此处没有
        targetId: '', //发送人的stuffId
        targetName: '',
        flightTime: '',
        groupType: '',
        draft: ''
    };
    return conversation;
}
export const getters = {
        getUserGroup: state => {
            let groupArr = sortGroupList(state.remoteGroupList, 'user');
            let conList = [];
            if (groupArr) {
                for (let group of groupArr) {
                    let con = createConversation();
                    con.type = RongIMLib.ConversationType.GROUP;
                    con.targetId = group.chatGroupId;
                    con.targetName = group.chatGroupName;
                    con.groupType = group.chatGroupType;
                    //添加一个草稿进去
                    con.draft = group.draft;
                    conList.push(con);
                }
            }
            return conList;
        },
        getGroundGroup: state => {
            let groupArr = sortGroupList(state.remoteGroupList, 'ground');
            let conList = [];
            if (groupArr) {
                for (let group of groupArr) {
                    let con = createConversation();
                    con.type = RongIMLib.ConversationType.GROUP;
                    con.targetId = group.chatGroupId;
                    con.targetName = group.chatGroupName;
                    con.flightTime = group.flightTime;
                    con.groupType = group.chatGroupType;
                    //添加一个草稿进去
                    con.draft = group.draft;
                    conList.push(con);
                }
            }
            return conList;
        },
        getFlightGroup: state => {
            let groupArr = sortGroupList(state.remoteGroupList, 'flight');
            let conList = [];
            if (groupArr) {
                for (let group of groupArr) {
                    let con = createConversation();
                    con.type = RongIMLib.ConversationType.GROUP;
                    con.targetId = group.chatGroupId;
                    con.targetName = group.chatGroupName;
                    con.flightTime = group.flightTime;
                    con.groupType = group.chatGroupType;
                    //添加一个草稿进去
                    con.draft = group.draft;
                    conList.push(con);
                }
            }
            return conList;
        },
        getFlightGroupNotIn: state => {
            return group2Conversation(state.remoteGroupListNotIn, 'flight');
        },
        getGroundGroupNotIn: state => {
            return group2Conversation(state.remoteGroupListNotIn, 'ground');
        },
        getUserGroupNotIn: state => {
            return group2Conversation(state.remoteGroupListNotIn, 'user');
        },
        getGroupIcon(state){
            let icon;
            let color;
            if (state.rightWindowData.conversationType == RongIMLib.ConversationType.DISCUSSION) {
                icon = require('../images/user_group_con_icon.png');
                color = '#55ce3d';
            }else if (state.rightWindowData.conversationType == RongIMLib.ConversationType.GROUP) {
                if (state.rightWindowData.groupType == WebChatConst.flightGroupType) {
                    icon = require('../images/flight_group_con_icon.png');
                    color = '#81aeff';
                } else if (state.rightWindowData.groupType == WebChatConst.groundGroupType) {
                    icon = require('../images/gound_group_con_icon.png');
                    color = '#af88e9';
                } else if (state.rightWindowData.groupType == WebChatConst.userGroupType) {
                    icon = require('../images/user_group_con_icon.png');
                    color = '#ecd04d';
                }
            }else if (state.rightWindowData.conversationType == RongIMLib.ConversationType.PRIVATE){
                if (state.rightWindowData.targetId == 'system'){
                    icon = require('../images/system_noti_icon.png');
                    color='#55ce3d';
                }else if (state.rightWindowData.targetId == 'office'){
                    icon = require('../images/office_noti_icon.png');
                    color='#f2c118';

                }else if (state.rightWindowData.targetId == 'subscription'){
                    icon =  require('../images/subscribe_noti_icon.png');
                    color='#f17d55';

                }else if (state.rightWindowData.targetId == 'flight'){
                    icon = require('../images/flight_noti_icon.png');
                    color='#549cf2';
                }
            }
            return {icon, color};

        },
        isSystemPush: state =>
            (state.rightWindowData.targetId == 'system' ||
             state.rightWindowData.targetId == 'office'||
             state.rightWindowData.targetId == 'subscription'||
             state.rightWindowData.targetId == 'flight')
}

