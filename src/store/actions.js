/**
 * Created by Administrator on 2017/6/1.
 */
import {Service, isInvalidObject, isInvalidString, formatDate, differentDays, dataAccess,transRemote2local} from '../util/Utils.js'
import {WebChatConst} from '../util/Constant.js'
import SpringLib from '../libs/SpringLib.js'
import {router} from '../main.js'
import Vue from 'vue';

export let actions = {
    /**
     * 登录
     * @param commit
     * @param loginInfo
     * @returns {Promise}
     */
    loginAction ({commit}, loginInfo) {
        return new Promise((resolve, reject) => {
            Service.getInstance().post(SpringLib.Config.smpLoginUrl, loginInfo).then(response => {
                console.log('登录接口返回:', response);
                console.log('登录接口返回:', JSON.stringify(response.data));
                if (response.data && response.data.isSuccess && response.data.data) {
                    let userInfo = response.data.data;
                    commit('setUserInfo', userInfo);
                    if (!userInfo.token){
                        resolve('无融云token');
                        console.log('登录失败,无融云token');
                    }else{
                        resolve({user : response.data.data});
                    }
                } else {
                    if (response.data.errcode) {
                        let errMsg = WebChatConst[response.data.errcode];
                        if (errMsg) {
                            resolve(errMsg);
                            console.log('登录失败:', errMsg);
                            return;
                        }
                    }
                    resolve('登录失败');
                    console.log('登录失败');
                }
            }).catch(function (response) {
                console.log('登录失败...', response);
                resolve('登录失败');
            });
        });
    },
    /**
     * 退出
     * @param commit
     * @param state
     * @returns {Promise}
     */
    logOutAction({commit, state}){
        return new Promise((resolve) => {
            if (state.userInfo && state.userInfo.stoken) {
                Service.getInstance().post(SpringLib.Config.logoutUrl, {stoken: state.userInfo.stoken}).then((res) => {
                    if (res && res.data) {
                        if (res.data.isSuccess) {
                            console.log('调用退出结果成功!', res);
                        } else {
                            console.log('调用退出结果失败!', res);
                        }
                        state.userInfo.stoken='';
                        commit('setUserInfo',state.userInfo);
                    }
                    resolve();
                }).catch((reason) => {
                    console.log('退出当前账号失败:', reason);
                    resolve('退出失败!');
                    state.userInfo.stoken='';
                    commit('setUserInfo',state.userInfo);

                });
            }
        })
    },
    /**
     * 更新个人信息
     * @param commit
     * @param state
     * @param updateInfo
     * @returns {Promise}
     */
    updateProfileAction({commit, state}, updateInfo){
        //smpUpdateUserInfoUrl
        console.log('请求更新个人信息接口...');
        return new Promise((resolve, reject) => {
            if (state.userInfo && state.userInfo.stoken) {
                Service.getInstance().post(SpringLib.Config.smpUpdateUserInfoUrl, updateInfo).then((res) => {
                    console.log('更新个人信息接口返回:', res);
                    if (res && res.data && res.data.isSuccess) {
                        Object.assign(state.userInfo, updateInfo);
                        //alert(JSON.stringify(state.userInfo));
                        commit('setUserInfo', state.userInfo);
                        resolve();
                        return;
                    }
                    reject();
                }).catch((reason) => {
                    console.log('更新个人信息接口异常:', reason);
                    reject();
                });
            }

        })
    },
    //查询已加入的群组
    queryGroupList({state, commit}){
        //smpUpdateUserInfoUrl
        console.log('请求后台查询群组接口...');
        return new Promise((resolve, reject) => {
            if (state.userInfo && state.userInfo.stoken) {
                Service.getInstance().post(SpringLib.Config.smpGetGroupListUrl, {staffId: state.userInfo.staffId}).then((res) => {
                    console.log('查询群组接口返回:', res);
                    if (res && res.data && res.data.isSuccess) {
                        commit('setRemoteGroupList', res.data.data);
                        resolve(res);
                    }
                }).catch((reason) => {
                    console.log('查询群组接口异常:', reason);
                    reject();
                });
            }

        })
    },
    //条件查询未加入群组
    async queryGroupLike({state, commit}, payload){
        let res = await Service.getInstance().post(
            SpringLib.Config.smpGetGroupByLikeNameUrl, {
                chatGroupName: payload.text,
                staffId: state.userInfo.staffId,
                chatGroupType: payload.groupType
            })
            .catch((reason) => {
                console.log('查询未加入群组接口异常:', reason);
                throw new Error();
            });
        console.log('查询未加入群组接口返回:', res);
        if (res && res.data && res.data.isSuccess) {
            commit('setRemoteGroupNotInList', res.data.data);
        }
        return res;
    },
    //融云初始化方法
    initRong({state, dispatch}){
        return new Promise(function (resolve, reject) {
            if (state.userInfo && state.userInfo.token) {
                dispatch('init');
                dispatch('setConnectionStatusListener');
                dispatch('setOnReceiveMessageListener');
                dispatch('connect');
                resolve();
                return;
            }
            reject();
            console.log('用户无token信息，无法初始化融云');
        })
    },
    init(){
        let webSQLDataProvider = new RongIMLib.WebSQLDataProvider();//会创建数据库对象但并未执行数据库的初始化方法
        RongIMLib.RongIMClient.init(SpringLib.Config.appKey, webSQLDataProvider);
    },
    setConnectionStatusListener({commit,dispatch}){
        RongIMLib.RongIMClient.setConnectionStatusListener({
            onChanged: function (status) {
                switch (status) {
                    //链接成功
                    case RongIMLib.ConnectionStatus.CONNECTED:
                        console.log('链接成功');
                        break;
                    //正在链接
                    case RongIMLib.ConnectionStatus.CONNECTING:
                        console.log('正在链接');
                        break;
                    //重新链接
                    case RongIMLib.ConnectionStatus.DISCONNECTED:
                        console.log('断开连接');
                        commit('showConnectInfo', {show: true, msg: '断开连接', loading: false});
                        break;
                    //其他设备登录
                    case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
                        console.log('其他设备登录');
                        //本机踢掉
                        commit('showMessageBox',{
                            show: true,
                            showCancel:false,
                            title: '提示',
                            content:'帐号在其他设备登录，请重新登录',
                            confirm:()=>{
                                router.replace('/login');
                                location.reload();//重新刷新页面,清除vuex缓存,断开融云连接
                                dispatch('logOutAction');
                        }});
                        commit('showConnectInfo', {show: true, msg: '其他设备登录', loading: false});
                        break;
                    //网络不可用
                    case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
                        console.log('网络不可用');
                        commit('showConnectInfo', {show: true, msg: '网络不可用', loading: false});
                        break;
                }
            }
        });
    },
    setOnReceiveMessageListener({dispatch, state,commit}){
        // 消息监听器
        RongIMLib.RongIMClient.setOnReceiveMessageListener({
            // 接收到的消息
            onReceived: function (message) {
                //1.判断聊天窗口是否打开
                //a1)如果打开刷新当前窗口消息内容
                console.log('窗口targetId:'+state.rightWindowData.targetId);
                console.log('收到消息targetId:'+message.targetId);

                console.log('收到消息' + JSON.stringify(message));
                commit('minimize', {show:state.minimizeOps.show,msg:message.content.content});
                //a2)没有打开在最小化的时候直接通知消息
                //2.刷新会话列表getConversationList
                //获取会话列表getConversationList TODO

                commit('setCurReceiveMessage', message);
                if (state.curChatWindowView == WebChatConst.frameChatBody &&
                    state.rightWindowData.targetId == message.targetId && !state.minimizeOps.show){
                    RongIMLib.RongIMClient.getInstance().getConversationList({
                        onSuccess:  ()=> {
                            //清消息前需要查询列表
                            RongIMLib.RongIMClient.getInstance().clearUnreadCount(state.rightWindowData.conversationType,message.targetId,{
                                onSuccess:()=>{
                                    setTimeout(()=> {
                                        dispatch('getConversationList');
                                    },100);
                                }
                            });
                        },
                        onError: function (error) {
                        }
                    }, null);
                }else{
                    setTimeout(()=> {
                        dispatch('getConversationList');
                    },100);
                }
            }
        });
    },
    //获取会话列表
    getConversationList({commit,state, dispatch}){
        return new Promise(function (resolve, reject) {
            RongIMLib.RongIMClient.getInstance().getConversationList({
                onSuccess: function (list) {
                    console.log('获取会话列表成功!',list);
                    commit('refreshConversationList', list);
                    //commit('showMiddleView', WebChatConst.menuHistoryCon);
                    commit('showConnectInfo', {show: false});
                    dispatch('sortConversationList');
                    dispatch('getDiscussName');
                    resolve();
                },
                onError: function (error) {
                    // do something...
                    console.log('获取会话列表失败!', error);
                    //commit('showConnectInfo', {show: true, msg: '获取会话列表失败', loading: false});
                    reject();
                }
            }, null);
        });

    },
    //连接融云
    connect({state, dispatch}){
        let token = state.userInfo.token;
        RongIMLib.RongIMClient.connect(token, {
            onSuccess: function (userId) {
                console.log("Login successfully." + userId);
                //获取会话列表getConversationList TODO
                dispatch('getConversationList');
                dispatch('getQiuNiuFileToken');
            },
            onTokenIncorrect: function () {
                console.log('token无效');
            },
            onError: function (errorCode) {
                let info = '';
                switch (errorCode) {
                    case RongIMLib.ErrorCode.TIMEOUT:
                        info = '超时';
                        break;
                    case RongIMLib.ErrorCode.UNACCEPTABLE_PROTOCOL_VERSION:
                        info = '不可接受的协议版本';
                        break;
                    case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
                        info = 'appkey不正确';
                        break;
                    case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
                        info = '服务器不可用';
                        break;
                    default:
                        info = '未知错误';
                        break;
                }
                console.log(errorCode);
            }
        });
    },
    //发送消息
    sendMsg({state}, payload){
        let extraJSON;
        if (RongIMLib.ConversationType.PRIVATE === payload.conType) {
            extraJSON = {};
            extraJSON['id' + payload.targetId] = {
                name: payload.targetName,
                gender: payload.gender,
                icon: payload.icon
            };
            extraJSON['id' + state.userInfo.staffId] = {
                name: state.userInfo.userName,
                gender: state.userInfo.sex,
                icon: state.userInfo.icon || ''
            };
        } else {
            extraJSON = {};
            extraJSON['id' + payload.targetId] = {
                name: payload.targetName,
                gender: payload.gender,
                flightTime: payload.flightTime,
                groupType: payload.groupType,
                icon: payload.icon || ''
            };
            extraJSON['id' + state.userInfo.staffId] = {
                name: state.userInfo.staffName,
                gender: state.userInfo.sex,
                flightTime: payload.flightTime,
                groupType: payload.groupType,
                icon: state.userInfo.icon
            };
        }
        let extraMessage = JSON.stringify(extraJSON) || '';
        let msg;
        if (payload.image) {
            msg = new RongIMLib.ImageMessage({
                content: payload.data,
                imageUri: payload.downloadUrl,
                extra: extraMessage
            });


        } else {
            msg = new RongIMLib.TextMessage({extra: extraMessage, content: payload.msg});
        }
        console.log('发送消息:' + msg);
        RongIMLib.RongIMClient.getInstance().sendMessage(payload.conType, payload.targetId, msg, {
                // 发送消息中
                onPrepare:function(message){
                    console.log("Prepare to send", message);
                    payload.onPrepare && payload.onPrepare(message);
                },
                // 发送消息成功
                onSuccess: function (message) {
                    //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                    console.log("Send successfully", message);
                    payload.onSuccess && payload.onSuccess(message);
                },
                onError: function (errorCode, message) {
                    let info = '';
                    switch (errorCode) {
                        case RongIMLib.ErrorCode.TIMEOUT:
                            info = '超时';
                            break;
                        case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                            info = '在黑名单中，无法向对方发送消息';
                            break;
                        case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                            info = '不在讨论组中';
                            break;
                        case RongIMLib.ErrorCode.NOT_IN_GROUP:
                            info = '不在群组中';
                            break;
                        case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                            info = '不在聊天室中';
                            break;
                        default :
                            info = '未知错误';
                            break;
                    }
                    console.log('发送失败:' + info);
                    payload.onError && payload.onError(message,errorCode);
                }
            }
        );
    },
    //打开会话
    openConversation({commit,dispatch,state},payload){
        commit('showAsideBar',false);
        commit('showChatWindowView',WebChatConst.frameChatBody);
        commit('setRightWindowData',payload);//先把数据传递到聊天框,防止回调失败后没传递数据过去
        RongIMLib.RongIMClient.getInstance().getHistoryMessages(payload.conversationType, payload.targetId,0, WebChatConst.chatMsgNumPerPage, {
            onSuccess: function (list, hasMsg) {
                // hasMsg为boolean值，如果为true则表示还有剩余历史消息可拉取，为false的话表示没有剩余历史消息可供拉取。
                // list 为拉取到的历史消息列表
                console.log('获取聊天记录成功!',list);
                payload.chatBodyData = list;
                commit('setRightWindowData',payload);
                if (payload.conversationType == RongIMLib.ConversationType.DISCUSSION){
                    RongIMLib.RongIMClient.getInstance().getDiscussion(payload.targetId, {
                        onSuccess: discussion => {
                            state.rightWindowData.targetMemNum = discussion.memberIdList.length;
                        },
                        onError: error => {
                            switch (error) {
                                default:
                                    console.log(payload.targetId + '获取讨论组信息失败,错误码:' + error);
                            }
                        }
                    });

                }else if (payload.conversationType == RongIMLib.ConversationType.GROUP){
                    Service.getInstance().post(
                        SpringLib.Config.smpGetGroupStaffUrl,
                        {groupId: state.rightWindowData.targetId})
                        .then(res => {
                            console.log('查询群成员接口返回', res);
                            if (res && res.data && res.data.isSuccess) {
                                let tempMebers = res.data.data;
                                tempMebers = tempMebers.filter(function (item) {
                                    return item.status != 1;
                                });
                                state.rightWindowData.targetMemNum = tempMebers.length;
                            }
                        }).catch((reason) => {
                            console.log('调用查询群成员接口异常',reason);
                    });
                }
                RongIMLib.RongIMClient.getInstance().clearUnreadCount(payload.conversationType, payload.targetId, {
                    onSuccess: isClear => {
                        if (isClear) {
                            console.log('清除未读消息成功!');
                            //清空缓存state中的未读数
                            dispatch('getConversationList');
                        }else{
                            //没有清空成功可能是数据库没有对应会话,这种情况可能是航班群
                            dispatch('sortConversationList');
                        }
                    },
                    onError: function () {
                        console.log('清除未读消息失败');
                        for (let item of state.conversationList){
                            if (item.targetId == payload.targetId){
                                item.unreadMessageCount = 0;
                                break;
                            }
                        }
                    }
                });
            },
            onError: function (error) {
                // APP未开启消息漫游或处理异常
                // throw new ERROR ......
                console.log('获取聊天记录失败',error);
            }
        });
    },
    //获取讨论组名字
    getDiscussName({commit, state},payload){
        for (let i =0;i<state.conversationList.length;i++){
            let con =state.conversationList[i];
            let ids;
            let describe = '';
            let beforeDes='';
            con.msg = '';
            if(con.latestMessage.objectName =='RC:DizNtf'){
                //type=3 修改名字通知 extension是名字 //type=1 邀请成员通知 extension是staffId
                if(con.latestMessage.content.type == 1){
                    ids= con.latestMessage.senderUserId+','+con.latestMessage.content.extension;
                    beforeDes=con.latestMessage.senderUserId;
                    describe=' 加入讨论组';
                }else if(con.latestMessage.content.type == 2){
                    ids =con.latestMessage.content.extension;
                    describe=' 退出讨论组';
                }else if(con.latestMessage.content.type == 3){
                    ids=con.latestMessage.senderUserId;
                    describe = '修改讨论组名称为 '+con.latestMessage.content.extension;
                }
            }
            if (con.conversationType == RongIMLib.ConversationType.DISCUSSION){
                RongIMLib.RongIMClient.getInstance().getDiscussion(con.targetId, {
                    onSuccess: discussion => {
                        // discussion => 讨论组信息。
                        con.targetName = discussion.name;
                        console.log('获取讨论组信息成功,对应讨论组名称:', con.targetName);
                        for (let hiscon of state.historyConList){
                            if (hiscon.targetId == con.targetId){
                                hiscon.targetName = con.targetName;
                                if (con.msg!=''){
                                    hiscon.msg = con.msg;
                                }
                            }
                        }
                        let getNameFun;
                        let remoteFun = (ids,cb)=> {
                            let _ids =ids.join(',');
                            Service.getInstance().post(
                                SpringLib.Config.smpGetStaffArrUrl,
                                {ids:_ids,jobcode:state.userInfo.jobcode }).then(res =>{
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
                        if (state.hasUpdateContact){
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
                            //alert('查询远程参数:'+ids)
                            getNameFun.call(dataAccess,ids.split(','), function (ret) {
                                console.log('获取讨论组 '+discussion.name+' 成员信息结果:',ret);
                                //alert('获取讨论组 '+discussion.name+' 成员信息结果:'+JSON.stringify(ret));
                                if (!ret) return;
                                for (let j = 0; j < ret.length; j++) {
                                    if (beforeDes == ret[j].staffId){
                                        beforeDes = ret[j].text||ret[j].staffName;
                                        continue;
                                    }
/*                                    if (j == ret.length - 1) {
                                        con.msg += (ret[j].text||ret[j].staffName) + describe;
                                        break;
                                    }*/
                                    con.msg += (ret[j].text||ret[j].staffName) + ' ';
                                    con.src = ret[j].icon;
                                }
                                if (con.latestMessage.content.type==1){
                                    con.msg=beforeDes+' 邀请 '+con.msg;
                                }
                                con.msg = con.msg+describe;
                                //最后在更新一把最新的缓存信息
                                for (let m=0;m<state.discussCache.length;m++){
                                    let cache = state.discussCache[m];
                                    if (cache.targetId==con.targetId){
                                        cache.targetName =  con.targetName;
                                        cache.msg =  con.msg;
                                        break;
                                    }
                                    if (m == state.discussCache.length-1){
                                        state.discussCache.push({
                                            targetId:con.targetId,
                                            targetName:con.targetName,
                                            msg:con.msg
                                        });
                                        break;
                                    }
                                }
                                for (let hiscon of state.historyConList){
                                    if (hiscon.targetId == con.targetId){
                                        hiscon.msg = con.msg;
                                        hiscon.targetName = con.targetName;
                                    }
                                }
                                //commit('setHistoryConList', conList);
                                if (state.rightWindowData.targetId == con.targetId){
                                    commit('setRightWindowData',Object.assign(state.rightWindowData,{
                                        targetName: con.targetName,
                                        icon:con.src
                                    }));
                                }

                            })
                        }
                        //先存一把缓存,防止讨论组会话闪动
                        for (let m=0;m<state.discussCache.length;m++){
                            let cache = state.discussCache[m];
                            if (cache.targetId==con.targetId){
                                cache.targetName =  con.targetName;
                                if (con.msg!=''){
                                    cache.msg =  con.msg;
                                }
                                break;
                            }
                            if (m == state.discussCache.length-1){
                                let ca = {
                                    targetId:con.targetId,
                                    targetName:con.targetName,
                                }
                                if (con.msg!=''){
                                    ca.msg =  con.msg;
                                }
                                state.discussCache.push(ca);
                                break;
                            }
                        }
                        for (let hiscon of state.historyConList){
                            if (hiscon.targetId == con.targetId){
                                hiscon.targetName = con.targetName;
                                if (con.msg!=''){
                                    hiscon.msg = con.msg;
                                }
                            }
                        }
                        //commit('setHistoryConList', conList);
                        if (state.rightWindowData.targetId == con.targetId){
                            commit('setRightWindowData',Object.assign(state.rightWindowData,{
                                targetName: con.targetName,
                            }));
                        }
                    },
                    onError: error => {
                        switch (error) {
                            case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                                console.log('获取讨论组信息,当前用户不在:' + con.targetId + '组内');
                                break;
                            case RongIMLib.ErrorCode.RC_DISCUSSION_GROUP_ID_INVALID:
                                console.log('获取讨论组信息,讨论组:' + con.targetId + '无效');
                                break;
                            default:
                                console.log(con.targetId + '获取讨论组信息失败,错误码:' + error);
                        }
                        //commit('setHistoryConList', conList);
                    }
                });

            }

        }


    },    //对会话进行分类
    sortConversationList({state, commit,dispatch}){
        let conversationFronRong = state.conversationList;
        //alert('conversationList数据变化,getter:'+JSON.stringify(oriList))
        if (!conversationFronRong) return;
        let historyConList = [];//历史会话 包括讨论组和私聊
        let historyGroupConList = [];//历史航班群
        let userGroupConList = [];//用户群
        let flightGroupConList = [];//航班群
        let groundGroupConList = [];//地服群
        let messageConList = [];//消息通知
        for (let i = conversationFronRong.length - 1; i >= 0; i--) {
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
                targetName: '',//对方名字
                flightTime: '',//航班时间 地服群 航班群才有
                groupType: '',//群类型
                draft:''//草稿信息
            };
            let staffId = conversationFronRong[i].targetId;
            let type = conversationFronRong[i].conversationType;
            let objectName = conversationFronRong[i].latestMessage.objectName;
            let extraJSON;
            let discussCache = state.discussCache;
            //if (type != RongIMLib.ConversationType.DISCUSSION && type != RongIMLib.ConversationType.PRIVATE)continue;
            if (!conversationFronRong[i].targetId) continue;//对方Id没有不显示
            if (conversationFronRong[i].targetId == state.userInfo.staffId) continue;//不显示自己跟自己聊天

            conversation.targetId = conversationFronRong[i].targetId;
            conversation.unread = conversationFronRong[i].unreadMessageCount;
            conversation.time = formatDate(conversationFronRong[i].sentTime);//TODO
            conversation.type = type;
            conversation.millisecond = conversationFronRong[i].sentTime;//用于计算最新的一条消息
            conversation.isTop = conversationFronRong[i].isTop;

            //草稿信息
            conversation.draft = RongIMLib.RongIMClient.getInstance().getTextMessageDraft(conversation.type,conversation.targetId);
            //conversation.draft && alert(conversation.draft)
            if (objectName == 'RC:CmdNtf') {
                //后台消息
                let cmdData = conversationFronRong[i].latestMessage.content.data;
                conversation.targetName = cmdData.groupName;
                conversation.msg = cmdData.content;
            }else if(objectName =='RC:DizNtf'){
                if (discussCache){
                    for (let d = 0;d<discussCache.length;d++){
                        if (discussCache[d] && discussCache[d].targetId == conversation.targetId && discussCache[d].targetName!=''){
                            conversation.targetName = discussCache[d].targetName;
                            conversation.msg = discussCache[d].msg;
                            break;
                        }
                    }
                }
            }else if (objectName == 'RC:TxtMsg') {
                //文本消息
                if (conversationFronRong[i].latestMessage.content && conversationFronRong[i].latestMessage.content.extra) {
                    extraJSON = JSON.parse(conversationFronRong[i].latestMessage.content.extra);
                }
                if (isInvalidString(conversationFronRong[i].conversationTitle)) {
                    if (extraJSON['id' + conversationFronRong[i].targetId] != null) {
                        conversation.targetName = extraJSON['id' + conversationFronRong[i].targetId].name;
                    }
                    //如果是航班调配消息还是重置为对应的群名
                    if (extraJSON.type && (extraJSON.type == 2 || extraJSON.type == 3)) {
                        conversation.targetName = extraJSON.groupName;

                    }
                }
                if (type == RongIMLib.ConversationType.PRIVATE) {
                    //私聊
                    conversation.msg = conversationFronRong[i].latestMessage.content.content;
                    if (!isInvalidObject(extraJSON)) {
                        let sender = extraJSON['id' + conversationFronRong[i].targetId];
                        if (!isInvalidObject(sender)) {
                            conversation.src = sender.icon;
                            //conversation.name = sender.name;
                            //conversation.gender =sender.gender;
                        }
                    }

                } else if (type == RongIMLib.ConversationType.GROUP) {
                    //群聊
                    if (!isInvalidObject(extraJSON) && !isInvalidObject(extraJSON['id' + conversationFronRong[i].latestMessage.senderUserId].name)) {
                        conversation.msg = extraJSON['id' + conversationFronRong[i].latestMessage.senderUserId].name + ':' + conversationFronRong[i].latestMessage.content.content;
                    }
                } else if (type == RongIMLib.ConversationType.DISCUSSION) {
                    //讨论组
                    if (!isInvalidObject(extraJSON) && !isInvalidObject(extraJSON['id' + conversationFronRong[i].latestMessage.senderUserId].name)) {
                        conversation.msg = extraJSON['id' + conversationFronRong[i].latestMessage.senderUserId].name + ':' + conversationFronRong[i].latestMessage.content.content;
                    }
                }
            } else if (objectName == 'RC:ImgMsg') {
                if (conversationFronRong[i].latestMessage.content && conversationFronRong[i].latestMessage.content.extra) {
                    extraJSON = JSON.parse(conversationFronRong[i].latestMessage.content.extra);
                }
                if (isInvalidString(conversationFronRong[i].conversationTitle)) {
                    if (extraJSON['id' + conversationFronRong[i].targetId] != null) {
                        conversation.targetName = extraJSON['id' + conversationFronRong[i].targetId].name;

                    }
                }
                //图片消息
                if (type == RongIMLib.ConversationType.PRIVATE) {
                    //私聊
                    conversation.msg = '【图片】';
                } else if (type == RongIMLib.ConversationType.GROUP) {
                    //群聊
                    if (!isInvalidObject(extraJSON) && !isInvalidObject(extraJSON['id' + conversationFronRong[i].latestMessage.senderUserId].name)) {
                        conversation.msg = extraJSON['id' + conversationFronRong[i].latestMessage.senderUserId].name + ':' + '【图片】';
                    }
                } else if (type == RongIMLib.ConversationType.DISCUSSION) {
                    //讨论组
                    if (!isInvalidObject(extraJSON) && !isInvalidObject(extraJSON['id' + conversationFronRong[i].latestMessage.senderUserId].name)) {
                        conversation.msg = extraJSON['id' + conversationFronRong[i].latestMessage.senderUserId].name + ':' + '【图片】';
                    }
                }
            } else if (objectName == "") {//去掉没有聊天的草稿会话
                continue;
            }


            /**
             * 处理用户性别
             */
            let extraMessage = conversationFronRong[i].latestMessage.content.extra;
            if (!isInvalidObject(extraMessage)) {
                let extra = JSON.parse(extraMessage);
                if (type == RongIMLib.ConversationType.PRIVATE) {
                    if (extra['id' + staffId] != null) {
                        conversation.gender = extra['id' + staffId].gender;
                    } else {
                        conversation.gender = 0;
                    }
                } else {
                    conversation.gender = 0;
                }
            }
            if (objectName == 'RC:CmdNtf' && type == RongIMLib.ConversationType.PRIVATE) {
                conversationFronRong[i].targetGender = 0;
            }
            //历史航班群
            if (objectName == 'RC:CmdNtf' && differentDays(conversationFronRong[i].latestMessage.content.data.flightTime) > 1 && !(type == RongIMLib.ConversationType.PRIVATE)) {
                conversation.flightTime = conversationFronRong[i].latestMessage.content.data.flightTime;
                if (conversationFronRong[i].latestMessage.content.data && conversationFronRong[i].latestMessage.content.data.groupType) {
                    conversation.groupType = conversationFronRong[i].latestMessage.content.data.groupType;
                }
                historyGroupConList.push(conversation);
            } else if (!isInvalidObject(extraMessage) && JSON.parse(extraMessage) && JSON.parse(extraMessage)['id' + staffId] && JSON.parse(extraMessage)['id' + staffId].flightTime && differentDays(JSON.parse(extraMessage)['id' + staffId].flightTime) > 1 && !((JSON.parse(extraMessage).type == 2 || JSON.parse(extraMessage).type == 3) && type == RongIMLib.ConversationType.PRIVATE)) {
                conversation.flightTime = JSON.parse(extraMessage)['id' + staffId].flightTime;
                if (JSON.parse(extraMessage)['id' + staffId].groupType) {
                    conversation.groupType = JSON.parse(extraMessage)['id' + staffId].groupType;
                }
                historyGroupConList.push(conversation);
            }
            //航班群
            else if (objectName == 'RC:CmdNtf' && conversationFronRong[i].latestMessage.content.data && conversationFronRong[i].latestMessage.content.data.groupType == "0") {
                if (conversationFronRong[i].latestMessage.content.data.flightTime) {
                    conversation.flightTime = conversationFronRong[i].latestMessage.content.data.flightTime;
                }
                conversation.groupType = conversationFronRong[i].latestMessage.content.data.groupType;
                flightGroupConList.push(conversation);
            } else if (!isInvalidObject(extraMessage) && JSON.parse(extraMessage) && JSON.parse(extraMessage)['id' + staffId] && JSON.parse(extraMessage)['id' + staffId].groupType == "0") {
                if (JSON.parse(extraMessage)['id' + staffId].flightTime) {
                    conversation.flightTime = JSON.parse(extraMessage)['id' + staffId].flightTime;
                }
                conversation.groupType = JSON.parse(extraMessage)['id' + staffId].groupType;
                flightGroupConList.push(conversation);
            }
            //地服群
            else if (objectName == 'RC:CmdNtf' && conversationFronRong[i].latestMessage.content.data && conversationFronRong[i].latestMessage.content.data.groupType == "2") {
                var today = Date.parse(new Date());//当天的时间戳
                if (conversationFronRong[i].latestMessage.content.data.flightTime) {
                    conversation.flightTime = conversationFronRong[i].latestMessage.content.data.flightTime;
                }
                //groundArr.push(conversationFronRong[i]);
                conversation.groupType = conversationFronRong[i].latestMessage.content.data.groupType;
                if (conversationFronRong[i].latestMessage.content.data.flightTime && (today - Date.parse(conversationFronRong[i].latestMessage.content.data.flightTime)) > 0) {
                    historyGroupConList.push(conversation);
                } else {
                    groundGroupConList.push(conversation);
                }
            } else if (!isInvalidObject(extraMessage) && JSON.parse(extraMessage) && JSON.parse(extraMessage)['id' + staffId] && JSON.parse(extraMessage)['id' + staffId].groupType == "2") {
                var today = Date.parse(new Date());//当天的时间戳
                if (JSON.parse(extraMessage)['id' + staffId].flightTime) {
                    conversationFronRong[i].flightTime = JSON.parse(extraMessage)['id' + staffId].flightTime;
                }
                //groundArr.push(conversationFronRong[i]);
                conversation.groupType = JSON.parse(extraMessage)['id' + staffId].groupType;
                if (JSON.parse(extraMessage)['id' + staffId].flightTime && (today - Date.parse(JSON.parse(extraMessage)['id' + staffId].flightTime)) > 0) {
                    historyGroupConList.push(conversation);
                } else {
                    groundGroupConList.push(conversation);
                }
            } else if (!isInvalidObject(extraMessage) && JSON.parse(extraMessage) && JSON.parse(extraMessage).sender && JSON.parse(extraMessage).type != ("99" && "")) {
                if (JSON.parse(extraMessage).type != '1') {//不展示文件通知类型
                    //文件通知类型
                    //fileNoticeConversation.sentTime = conversationFronRong[i].sentTime;
                    //显示对应文件title
                    //fileNoticeConversation.fileName = conversationFronRong[i].latestMessage.text;
                    conversation.childType = JSON.parse(extraMessage).sender.staffId;
                    messageConList.push(conversation);
                }
                if (conversation.targetId == 'system'){
                    conversation.targetName='系统消息';
                }else if (conversation.targetId == 'office'){
                    conversation.targetName='办公消息';
                }else if (conversation.targetId == 'subscription'){
                    conversation.targetName='订阅消息';
                }else if (conversation.targetId == 'flight'){
                    conversation.targetName='航班消息';
                }

            }//用户群
            else if (objectName == 'RC:CmdNtf' && conversationFronRong[i].latestMessage.content.data && conversationFronRong[i].latestMessage.content.data.groupType == "1") {
                conversation.groupType = conversationFronRong[i].latestMessage.content.data.groupType;
                userGroupConList.push(conversation);
            } else if (!isInvalidObject(extraMessage) && JSON.parse(extraMessage) && JSON.parse(extraMessage)['id' + staffId] && JSON.parse(extraMessage)['id' + staffId].groupType == "1") {
                conversation.groupType = JSON.parse(extraMessage)['id' + staffId].groupType;
                userGroupConList.push(conversation);
            }//讨论组、私聊
            else {
                historyConList.push(conversation);
            }
        }
        /*historyConList.length != 0 && */commit('setHistoryConList', historyConList);
        /*historyGroupConList.length != 0 && //可能是删会话*/commit('setHistoryGroupConList', historyGroupConList);
        /* userGroupConList.length != 0 && */commit('setUserGroupConList', userGroupConList);
        /*flightGroupConList.length != 0 && */commit('setFlightGroupConList', flightGroupConList);
        /*groundGroupConList.length != 0 && */commit('setGroundGroupConList', groundGroupConList);
        /*messageConList.length != 0 && */commit('setMessageNotifyList', messageConList);//消息通知

    },
    /**
     * @param commit
     * @param payload {deptId:部门id,cascade:数组层级,index:坐标}
     * deptId:1000001 是查询所有主部门
     */
    getLocalDbDepartment({commit, state}, payload){
        //要在更新完通讯录的时候去查数据,否则查不出来
        if (state.hasUpdateContact){
            new Promise(function (resolve) {
                dataAccess.getDeptAndStaff(payload.deptId, (contacts, staffLength) => {
                    console.log('contacts', contacts);
                    if (payload.indexArr == undefined) {
                        commit('setLocalDbDepAndStuff', contacts);
                    } else if (state.localDbDepAndStuff) {
                        let depAndStuffs = state.localDbDepAndStuff;
                        let target;
                        if (payload.indexArr.length == 1) {
                            target = depAndStuffs[payload.indexArr[0]];
                        } else if (payload.indexArr.length == 2) {
                            target = depAndStuffs[payload.indexArr[0]]._childNodes[payload.indexArr[1]]
                        }
                        target._childNodes = contacts;
                        target._showChildNodes = ! target._showChildNodes;
                        commit('setLocalDbDepAndStuff', depAndStuffs);
                    }
                    resolve();
                }, 0);
            })
        }
    },
    /**
     * @param filter 模糊查询内容
     * @param start 查询数据其实位置
     * @param isAppend 是否是在上一次查询结果后拼接
     */
    getLocalDbUserLike({state,commit},{filter,start,isAppend}){
        return new Promise(function (resolve,reject) {
            dataAccess.queryStaffByLike(filter, (contacts)=>{
                console.log('查询结果:',contacts);
                //如果本地没有查询到后台查
                if (!contacts || contacts.length==0){
                    Service.getInstance().post(SpringLib.Config.smpGetStaffListByConUrl, {
                        searchInfo:filter,
                        start:start,
                        limit:SpringLib.Config.staffLimit,
                        jobcode:state.userInfo.jobcode
                    }).then(res => {
                        if (res && res.data && res.data.isSuccess){
                            console.log('查询后台通讯录结果返回:',res.data.data);
                            let resItems = res.data.data || [];
                            contacts = transRemote2local(resItems.result);
                            if(isAppend){
                                contacts = state.localDbDepAndStuff.concat(contacts)
                            }
                            commit('setLocalDbDepAndStuff', contacts);
                            resolve(contacts);
                        }
                    });
                }else{
                    if(isAppend){
                        contacts = state.localDbDepAndStuff.concat(contacts)
                    }
                    commit('setLocalDbDepAndStuff', contacts);
                    resolve(contacts);
                }
            }, start);
        });
    },
    getLocalDbUserDetail({commit,state},staffId){
        return new Promise(function(resolve,reject){
            dataAccess.queryStaffDetailByStaffId(state.userInfo.jobcode,staffId,(res)=>{
                console.log('查询本地员工详情返回:',res);
                if (res && res.length>0){
                    commit('setStaffProfileDetail',res[0]);
                    resolve();
                }else{
                    reject();
                }
            })
        })
    },
    checkStaffDetail({state,commit,dispatch},targetId){
        if (state.hasUpdateContact){
            dispatch('getLocalDbUserDetail',targetId).then(() =>{
                commit('showContactProfile',true);
            });
        }
        //查询本地信息后马上查询最新的后台个人信息
        Service.getInstance().post(
            SpringLib.Config.smpGetStaffArrUrl,
            {ids:targetId,jobcode:state.userInfo.jobcode }).then(res =>{
            if (res && res.data && res.data.isSuccess){
                console.log('调用个人信息详情接口返回', res);
                if (res && res.data && res.data.isSuccess) {
                    //alert(JSON.stringify(res.data.data))
                    //用远程的信息覆盖本地信息
                    Object.assign(state.staffProfileDetail,res.data.data[0]);
                    commit('setStaffProfileDetail',state.staffProfileDetail);
                }
            }
        });
        commit('showContactProfile',true);
    },
    getQiuNiuFileToken({commit}){
        RongIMLib.RongIMClient.getInstance().getFileToken(RongIMLib.FileType.IMAGE, {
            onSuccess:  (data) => {
                console.log('七牛token',data);
                commit('setQiniuFileToken',data.token);
            },
            onError: function () {
                console.log('获取七牛token失败');
            }
        });
    }
}