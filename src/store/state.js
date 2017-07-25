/**
 * Created by Administrator on 2017/5/31.
 */
import {WebChatConst} from '../util/Constant.js'
export var state = {
    waitingBox:false,
    discussCache:[{
        targetId: '',
        targetName:'',
        msg:''
    }],
    sumUnreadMsg:0,
    maskLayer: {
        show:false,
        zIndex:25
    },
    maximize:false,
    hasUpdateContact:false,
    batchDelete:{
        show:false,
        deleteData:[]
    },
    contactLayer: {
        show:false,
        existMembers:[],
        cancel:function () {},
        confirm:function () {}
    },
    contactProfile:false,
    barManager: false,
    profileLayer: false,
    imageViewer:{
      show:false,
      src:''
    },
    asideBar: false,
    groupMessageBox: {
        show: false,
        msg:'',
        title:'',
        icon:'',
        cancel:function () {},
        confirm:function () {}
    },
    minimizeOps: {
        show:false,
        msg:''
    },
    emojiPanel: false,
    curMiddleView: WebChatConst.menuHistoryCon,
    curChatWindowView: WebChatConst.framePlaceHolder,
    userInfo: {},
    conversationList: [],//原始的会话列表
    historyConList:[],     //1.历史会话列表
    historyGroupConList:[],//2.历史航班群
    flightGroupConList:[], //3.航班群会话列表
    groundGroupConList:[], //4.地服群会话列表
    userGroupConList:[],   //5.用户群会话列表
    messageNotifyList:[],  //6.消息通知列表
    remoteGroupList:[],//所有已加入群列表
    remoteGroupListNotIn:[],//所有未加入群列表
    messageBox: {
        show: false,
        isInput: false,
        value:'',
        title: '消息提示',
        content:'',
        showCancel:true,
        cancel:function () {},
        confirm:function () {}
    },
    contextMenu: {
        show: false,
        position: {top: '0px', left: '0px'},
        item:{
            makeTop:true,//置顶
            modifyName:true,//修改名字
            noNotify:true,//屏蔽群消息
            delete:true,//删除会话
            noSysNotify:true,//屏蔽系统消息
            batchDelete:true
        },
        data:{
            targetId:'',
            type:'',
            targetName:''
        }
    },
    connectInfo:{
        show:true,
        loading:true,
        msg:'连接中'
    },

    rightWindowData:{
        title:'',
        targetMemNum:'',
        chatBodyData:{}
    },
    curReceiveMessage:{},
    localDbDepAndStuff:[],
    staffProfileDetail:{},//员工详细信息展示页数据
    qiniuFileToken:''
}