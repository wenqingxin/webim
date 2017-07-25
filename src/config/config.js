var SpringLib_EnvConfig = {
    //融云appKey
    appKey:'uwd1c0sxd37j1',
    dataBaseName : 'SpringLibDB',//数据库名
    dataBaseVersion : '1.0',//数据库当前版本
    dataBaseDescription : '春秋本地化数据库',//数据库描述
    dataBaseSize : 20*1024*1024,//数据库大小（byte）
    staffFromRemoteLimit : 500,//向远程每次拉取员工数
    deptFromRemoteLimit : 99999999,//向远程每次拉取部门数
    staffLimit : 50,//本地每次拉取的员工数
    infinityLimit : 99999999,//无穷大
    //serverUrl:'http://10.131.0.153:8266/smp_interfaces',
    //smpServerUrl :'https://localhost:8443/smp_imweb',//数据库大小（byte）
    smpServerUrl :'http://10.131.10.237:8080/smp_imweb',//数据库大小（byte）
    smpGetGroupListUrl:'/api/EI101',//查询群组
    smpJoinGroupUrl:'/api/EI102',//加入群组
    smpJoinGroupBatchUrl:'/api/EI103',//批量加入群组
    smpQuitGroupUrl:'/api/EI104',//退出群组
    smpGetGroupStaffUrl:'/api/EI105',//获取组成员
    smpGetStaffUrl:'/api/EI106',//拉取员工
    smpGetDeptUrl:'/api/EI107',//拉取部门
    smpLoginUrl:'/api/EI108',//用户登录验证
    smpUpdateUserInfoUrl:'/api/EI109',//更新用户信息
    smpUploadIconUrl:'/api/upload/EI110',//上传头像
    smpGetStaffInfoUrl:'/api/EI111',//获取员工信息
    smpGetStaffListByConUrl:'/api/EI112',//根据条件模糊查询员工列表
    smpGetGroupByLikeNameUrl:'/api/EI113',//查询未加入的群组
    feedbackMcMsgUrl:'/api/EI114',//航班调配反馈疑问
    saveIgnoreMsgTypeUrl:'/api/EI115',//保存屏蔽推送消息
    getIgnoreMsgTypeUrl:'/api/EI116',//查询屏蔽推送消息
    smpGetStaffArrUrl:'/api/EI117',//多个staffId查询员工信息
    smpDownloadFileUrl:'/api/download/EI119',//文件下载接口
    logoutUrl:'/imuser/logout',//登出
    targetType0 : 0,//默认会话类型
    targetType1 : 1,//单聊
    targetType3 : 3//群聊
};
