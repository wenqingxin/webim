/**
 * Created by Administrator on 2017/5/31.
 */
import axios from 'axios'
import Qs from 'Qs'
import SpringLib from '../libs/SpringLib.js'
import {WebChatConst} from './Constant.js'

export class Service {
    constructor(){
        this.serviceInstance;
        this.axiosInstance;
    }
     static getInstance(){
        if (!this.serviceInstance){
            this.serviceInstance = new Service();
        }
        return this.serviceInstance;
    }

     createAxiosIns(){
        if (!this.axiosInstance){
            axios.defaults.withCredentials = true;
            this.axiosInstance = axios.create({
                timeout : 30000,
                baseURL : SpringLib.Config.smpServerUrl
            });
        }
    }
     getAxiosIns(){
         this.createAxiosIns();
         return this.axiosInstance;
    }

    //创建实例,支持跨域
     post (url,param) {
        this.createAxiosIns();
        param = Qs.stringify(param);
        console.log('接口参数:',param);
        return this.axiosInstance.post(url,param);
     };
    //创建实例,支持跨域
     get (url,param) {
        this.createAxiosIns();
        param = Qs.stringify(param);
        console.log('接口参数:',param);
        return this.axiosInstance.get(url,param);
     };
}
export const dataAccess = new SpringLib.DataAccess(Service.getInstance());
//返回localstorage缓存人员数组
export function getLocalUserArr() {
    let userStr = localStorage.getItem(WebChatConst.webChatUserInfo);
    if (userStr && userStr!='undefined'){
        return JSON.parse(userStr);
    }else{
        return [];
    }
}
export function getLastLocalUser() {
    let users = getLocalUserArr();
    if (users && users.length!=0){
        return users.pop();
    }else{
        return "";
    }
}
export function transRemote2local(items){
    let res = [];
    for (let i=0;i<items.length;i++){
        let temp = items[i];
        let localItem = new SpringLib.DataItem();
        localItem.id = temp.staffId; //数据项id，存放员工、常用联系人的staffId，航班群、用户群的chartGroupId、部门的deptId
        localItem.text = temp.staffName;//数据项显示名称，存放员工、常用联系人的staffName，航班群、用户群的chartGroupName、部门的deptName
        localItem.code = temp.staffCode;//编号，存放员工、常用联系人的staffCode
        localItem.type = 0;//类别，区分员工和部门的0表示员工，1表示部门；群类型：0航班群 1用户群
        //localItem.dataType = temp;//数据类型，用于过滤右键菜单列表项（即控制操作），暂时常用联系人列表、通讯录支持右键菜单，取值与SpringLib.Constants.dataType对应
        localItem.sex = temp.sex;//性别，存放员工、常用联系人的性别 0男 1女
        localItem.targetType = SpringLib.Config.targetType0;//会话类型，存放会话目标类型 1单聊 3群聊，触发聊天窗口的会使用到该标志（搜索出的员工、通讯录中员工、常用联系人、航班群、用户群）
        localItem.icon = temp.icon;//图标路径
        localItem.posnDescr = temp.posnDescr;//职位描述
        localItem.deptName = temp.deptName;//部门

        localItem.origin_remote_data = temp;
        res.push(localItem);
    }
    return res;
}
/**
 * 转换字典中的null值为空字符串，仅对字符串有效
 */
export function convertNullToEmptyForDict(oriDict) {
    for (var key in oriDict) {
        oriDict[key] = convert_null_undefined(oriDict[key]);
    }
    return oriDict;
}

/**
 * 判断是否是无效的对象
 */
export function isInvalidObject(tempObject) {
    if (!tempObject || typeof(tempObject) == "undefined" || tempObject == "null") {
        return true;
    }
    return false;
}

/**
 * 判断是否是空字符串
 */
function isEmptyString(tempObject) {
    if (tempObject == "") {
        return true;
    }
    return false;
}

/**
 * 判断是否是无效的字符串
 */
export function isInvalidString(tempObject) {
    return isInvalidObject(tempObject) || isEmptyString(tempObject);
}
/**
 * 计算相差天数
 */
export function differentDays(date) {
    if (date == null || typeof(date) == 'undefined') {
        return;
    }
    var year = date.substr(0, 4);
    var month = date.substr(5, 2);
    var day = date.substr(8, 2);
    var now = new Date();
    //&& differentDays('2015-10-26 14:20:36')>=1
    var otherDay = (new Date).setFullYear(Number(year), Number(month) - 1, Number(day));
    var today = (new Date).setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    //alert(Math.abs(Math.floor((today-otherDay)/86400000)));
    return Math.abs(Math.floor((today - otherDay) / 86400000));
}
let minShowMessageTime;//最小的显示时间戳时间
let maxShowMessageTime;//最大的显示时间戳时间
export function parseMessageList(messageList,lastUser){
    if (!messageList || messageList.length == 0) {
        return messageList;
    }
    if (!lastUser) {
        return;
    }
    let lastUserId = lastUser.staffId;
    for (let i = messageList.length - 1; i >= 0; i--) {
        //设置发送时间
        if (messageList[i].sentTime) {
            messageList[i].messageTime = convert_message_timestamp(messageList[i].sentTime);
        }
        else {
            messageList[i].messageTime = "";
        }
        if (i == 0 && messageList.length > 1) {
            minShowMessageTime = null;
            maxShowMessageTime = null;
        }
        //设置发送人姓名
        if (messageList[i].senderUserId == lastUserId) {
            messageList[i].sendUserName = "我";
            continue;
        }
        if (messageList[i].objectName == 'RC:CmdNtf') {
            // alert(JSON.stringify(messageList[i]));
            try {
                let cmdData = messageList[i].content.data;
                messageList[i].cmdDataContent = cmdData.content;
                continue;
            } catch (e) {

            }

        }

        let extraMessage = messageList[i].content.extra;
        if (extraMessage && extraMessage != '') {
            let extraJSON = JSON.parse(extraMessage);
            if (extraJSON['id' + messageList[i].senderUserId] != null && extraJSON['id' + messageList[i].senderUserId].name) {
                messageList[i].sendUserName = extraJSON['id' + messageList[i].senderUserId].name;
            }
            else {
                messageList[i].sendUserName = "";
            }
        }
        else {
            messageList[i].sendUserName = "";
        }
    }
    return messageList;
}

export function DateDiff(otherParam, todayParam) {
    let otherDay = (new Date).setFullYear(otherParam.getFullYear(), otherParam.getMonth(), otherParam.getDate());
    let today = (new Date).setFullYear(todayParam.getFullYear(), todayParam.getMonth(), todayParam.getDate());
    return Math.floor((today - otherDay) / 86400000);
}

/**
 * 格式化时间
 * from为1表示从单个聊天界面过来，否则就表示从对话列表传过来
 */
export function formatDate(dateParam, from) {
    let date = new Date(dateParam);
    let curDate = new Date();
    let diffDate = DateDiff(date, curDate);
    let formatDate;
    if ((curDate.getFullYear() == date.getFullYear()) && (curDate.getMonth() == date.getMonth()) && (curDate.getDate() == date.getDate())) {
        //显示今天
        formatDate = '今天' + " " + ((date.getHours().toString().length == 1) ? '0' + date.getHours() : date.getHours()) + ':' + ((date.getMinutes().toString().length == 1) ? '0' + date.getMinutes() : date.getMinutes());
    } else if (diffDate == 1) {//昨天
        //显示日期
        formatDate = '昨天';
    } else {
        formatDate = (date.getMonth() + 1) + "-" + date.getDate();
        switch (curDate.getDay()) {//判断今天周几
            case 3://周三
                if (diffDate == 2)
                    formatDate = '周一';
                break;
            case 4://周四
                if (diffDate == 3)
                    formatDate = '周一';
                else if (diffDate == 2)
                    formatDate = '周二';
                break;
            case 5://周五
                if (diffDate == 4)
                    formatDate = '周一';
                else if (diffDate == 3)
                    formatDate = '周二';
                else if (diffDate == 2)
                    formatDate = '周三';
                break;
            case 6://周六
                if (diffDate == 5)
                    formatDate =  '周一';
                else if (diffDate == 4)
                    formatDate = '周二';
                else if (diffDate == 3)
                    formatDate = '周三';
                else if (diffDate == 2)
                    formatDate = '周四';
                break;
            case 0://周天
                if (diffDate == 6)
                    formatDate = '周一';
                else if (diffDate == 5)
                    formatDate = '周二';
                else if (diffDate == 4)
                    formatDate ='周三';
                else if (diffDate == 3)
                    formatDate = '周四';
                else if (diffDate == 2)
                    formatDate = '周五';
                break;
        }
    }
    if (from == 1 && diffDate >= 1)//如果是从单聊界面过来，且不是今天
        formatDate += " " + ((date.getHours().toString().length == 1) ? '0' + date.getHours() : date.getHours()) + ':' + ((date.getMinutes().toString().length == 1) ? '0' + date.getMinutes() : date.getMinutes());
    return formatDate;
}
/**
 * 转化时间戳，5分钟内的消息时间戳合并
 */
export function convert_message_timestamp(message_time) {
    //第一次显示
    if (!minShowMessageTime) {
        minShowMessageTime = new Date(message_time);
        maxShowMessageTime = new Date(message_time);
        return formatDate(message_time, 1);
    }
    //5分钟时间比较
    let cur_time = new Date(message_time);//当前时间
    let max_seconds = 5 * 60 * 1000; //5分钟
    let current_seconds; //相差的时间
    if (cur_time < minShowMessageTime) {
        //当前时间小于最小时间
        current_seconds = Math.abs(cur_time - minShowMessageTime);
        if (current_seconds > max_seconds) {
            //大于5分钟返回转换的时间值
            minShowMessageTime = cur_time;
            return formatDate(message_time, 1);
        }
    }
    if (cur_time > maxShowMessageTime) {
        //当前时间大于最大时间
        current_seconds = Math.abs(maxShowMessageTime - cur_time);
        if (current_seconds > max_seconds) {
            //大于5分钟返回转换的时间值
            maxShowMessageTime = cur_time;
            return formatDate(message_time, 1);
        }
    }
    return "";
}
export function parseExtra(message){
    let extra = {};
    if (message.content.extra){
        let extraJSON = JSON.parse(message.content.extra);
        if (!isInvalidObject(extraJSON)){
            let sender = extraJSON['id' + message.targetId];
            if(!isInvalidObject(sender)){
                extra.src = sender.icon;
                extra.name = sender.name;
                extra.gender =sender.gender;
                extra.targetName = sender.name;
            }
        }
    }
    return extra;
}

export const ImageHelper = {
    getThumbnail: function (obj, area, callback) {
        var canvas = document.createElement("canvas"), context = canvas.getContext('2d');
        var img = new Image();
        img.onload = function () {
            var target_w;
            var target_h;
            var imgarea = img.width * img.height;
            if (imgarea > area) {
                var scale = Math.sqrt(imgarea / area);
                scale = Math.ceil(scale * 100) / 100;
                target_w = img.width / scale;
                target_h = img.height / scale;
            }
            else {
                target_w = img.width;
                target_h = img.height;
            }
            canvas.width = target_w;
            canvas.height = target_h;
            context.drawImage(img, 0, 0, target_w, target_h);
            try {
                var _canvas = canvas.toDataURL("image/jpeg", 0.5);
                _canvas = _canvas.substr(23);
                callback(obj, _canvas);
            }
            catch (e) {
                callback(obj, null);
            }
        };
        img.src = ImageHelper.getFullPath(obj);
    },
    getFullPath: function (file) {
        window.URL = window.URL || window.webkitURL;
        if (window.URL && window.URL.createObjectURL) {
            return window.URL.createObjectURL(file);
        }
        else {
            return null;
        }
    }
};

//延迟执行,避免重复执行函数
export function debounce(action, idle) {
    var last;
    return function () {
        var ctx = this,
            args = arguments;
        clearTimeout(last);
        last = setTimeout(function () {
            action.apply(ctx, args);
        }, idle);
    };
}