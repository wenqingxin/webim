/*
* <p>春秋航空js库</p>
* <p>author chenhj</p>
* <p>since 2017-04-10</p>
* <p>version 1.0.0</p>
* <p>description : 提供常用联系人，组织架构本地持久化工具，以及信息本地化安全工具</p>
*/
/*
angular.module("SpringLib", []);
*/

/*初始化常量*/
var SpringLib;
/**
 * 当前登录用户
 */
(function (SpringLib){
	var currUser = {
			
	};
	SpringLib.LoginUser = currUser;
})(SpringLib || (SpringLib = {}));
/**
 * 初始化SpringLib常量
 * @param SpringLib
 */
(function (SpringLib){
	var Constants = {
		//创建常用联系人表
		optCCCreate : 1,
		//创建部门表
		optDeptCreate : 2,
		//创建员工表
		optStaffCreate : 3,
		//查询员工表最后一次更新的时间
		optStaffLastTime : 4,
		//查询部门表最后一次更新的时间
		optDeptLastTime : 5,
		//本地员工表
		staffTableName : "t_staff",
		//本地部门表
		deptTableName : "t_department",
		//常用联系人表前缀
		commonContactTableName : "t_common_contact_",
		//数据类型（1航班群 2.用户群 3.组织架构部门 4.组织架构员工 5.常用联系人），
		//可用于控制右键菜单功能过滤，但显示时必须选择相关数据来确定将要操作的数据类型
		 dataType : {
			flightGroup : 1,
			userGroup : 2,
			contactDept : 3,
			contactStaff : 4,
			commonContact : 5
		}
	};
	SpringLib.Constants = Constants;
})(SpringLib || (SpringLib = {}));
/*初始化配置*/
(function (SpringLib){
    var Config = SpringLib_EnvConfig;
	SpringLib.Config = Config;
})(SpringLib || (SpringLib = {}));
//定义通用的列表项结构，便于维护，用于航班群、用户群、部门、员工、常用联系人等自定义对象可以继承该类
(function(SpringLib){
	var DataItem = function(){
		this.id = ''; //数据项id，存放员工、常用联系人的staffId，航班群、用户群的chartGroupId、部门的deptId
		this.text = '';//数据项显示名称，存放员工、常用联系人的staffName，航班群、用户群的chartGroupName、部门的deptName
		this.code = '';//编号，存放员工、常用联系人的staffCode
		this.type = 0;//类别，区分员工和部门的0表示员工，1表示部门；群类型：0航班群 1用户群
		this.dataType = '';//数据类型，用于过滤右键菜单列表项（即控制操作），暂时常用联系人列表、通讯录支持右键菜单，取值与SpringLib.Constants.dataType对应
		this.sex = '0';//性别，存放员工、常用联系人的性别 0男 1女
		this.targetType = SpringLib.Config.targetType0;//会话类型，存放会话目标类型 1单聊 3群聊，触发聊天窗口的会使用到该标志（搜索出的员工、通讯录中员工、常用联系人、航班群、用户群）
		this.icon = '';//图标路径
	};
	var staffDetail = function () {
        this.deptId = '';//部门Id
        this.deptName = '';//部门名称
        this.icon = '';//员工头像
        this.phone = '';//员工手机
        this.posnDescr = '';//职位描述
        this.sex = 0;//性别
        this.staffId = '';//员工id
        this.staffName = '';//员工姓名
        this.telephone = '';//座机电话
        this.staffCode = '';//工号
        this.email = '';//邮箱
    }
	SpringLib.DataItem = DataItem;
    SpringLib.staffDetail = staffDetail;
})(SpringLib || (SpringLib = {}));
/*加工工具*/
(function(SpringLib){
	var CommonUtil = (function (){

        function CommonUtil(){};

        CommonUtil.prototype.getCommonSql = function (sqlType, userId){
            switch (sqlType) {
                //常用联系人建表语句
                case SpringLib.Constants.optCCCreate :
                    return "create table if not exists t_common_contact_" + userId + " (staffId varchar(255),userId varchar(255), UNIQUE(staffId, userId))";

                //部门建表语句
                case SpringLib.Constants.optDeptCreate :
                    return "create table if not exists " + SpringLib.Constants.deptTableName + " (deptId VARCHAR(255) PRIMARY KEY, deptName VARCHAR(255), parentDeptId VARCHAR(255)"
                        + ", deptOrder VARCHAR(255), deptCode VARCHAR(255), status VARCHAR(2), createdTime VARCHAR(32), modifiedTime VARCHAR(32)"
                        + ", creator VARCHAR(255), modifier VARCHAR(255), version VARCHAR(32), deptLevel VARCHAR(32))";

                //员工建表语句
                case SpringLib.Constants.optStaffCreate :
                    return "create table if not exists " + SpringLib.Constants.staffTableName + " (staffId VARCHAR(255) PRIMARY KEY, icon VARCHAR(255), sex VARCHAR(32)"
                        + ", phone VARCHAR(255), telephone VARCHAR(255), email VARCHAR(255), deptId VARCHAR(255), status VARCHAR(2)"
                        + ", staffName VARCHAR(255), staffCode VARCHAR(32), staffShortName VARCHAR(255), createdTime VARCHAR(32)"
                        + ", modifiedTime VARCHAR(32), creator VARCHAR(255), modifier VARCHAR(255), version VARCHAR(32)"
                        + ", jobIndicator VARCHAR(32), jobcode VARCHAR(32), jobcodeDescr VARCHAR(255), positionNbr VARCHAR(32)"
                        + ", posnDescr VARCHAR(255))";

                //查询本地员工表中最后一次更新时间sql语句
                case SpringLib.Constants.optStaffLastTime :
                    return "select max(case when modifiedTime is null then createdTime else modifiedTime end ) modified_date from t_staff";

                //查询本地部门表中最后一次更新时间sql语句
                case SpringLib.Constants.optDeptLastTime :
                    return "select max(case when modifiedTime is null then createdTime else modifiedTime end ) modified_date from t_department";

                default :
                    return '';
            }
        };
        /**
		 * 将字符串转为16进制unicode
         * @param str
         * @returns {*}
         */
        CommonUtil.prototype.strToHex =  function strToHexCharCode(str) {
            // if(str === "")
            //     return "";
            // var hexCharCode = [];
            // hexCharCode.push("0x");
            // for(var i = 0; i < str.length; i++) {
            //     hexCharCode.push((str.charCodeAt(i)).toString(16));
            // }
            // return hexCharCode.join("");
			var s = "";
            for (var i = 0; i < str.length; i++) {
                s +="|"+str.charCodeAt(i).toString(16);
            }
            return s;
        }
        /**
		 * 将16进制的unicode转为字符串
         * @param hexCharCodeStr
         * @returns {string}
         */
        CommonUtil.prototype.hexToStr =  function hexCharCodeToStr(hexcode) {
            // var trimedStr = hexCharCodeStr.trim();
            // var rawStr =
            //     trimedStr.substr(0,2).toLowerCase() === "0x"
            //         ?
            //         trimedStr.substr(2)
            //         :
            //         trimedStr;
            // var len = rawStr.length;
            // if(len % 2 !== 0) {
            //     alert("Illegal Format ASCII Code!");
            //     return "";
            // }
            // var curCharCode;
            // var resultStr = [];
            // for(var i = 0; i < len;i = i + 2) {
            //     curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
            //     resultStr.push(String.fromCharCode(curCharCode));
            // }
            // return resultStr.join("");
            var str = "";
            var s = hexcode.split('|');
            for(var i = 1;i < s.length;i++){
                str += String.fromCharCode(parseInt(s[i],16));
            }
            return str;
        }

        return CommonUtil;
	})();
	SpringLib.CommonUtil = CommonUtil;
})(SpringLib || (SpringLib = {}));

/*websql数据库工具类*/
(function(SpringLib){
	var DBUtil = (function (){
		function DBUtil(){};
		
		DBUtil.prototype.init = function (userId){
			console.log('init local database...');
			var me = this, isInit = false;
			me.userId = userId;
			me.db = openDatabase(
						SpringLib.Config.dataBaseName,
						SpringLib.Config.dataBaseVersion,
						SpringLib.Config.dataBaseDescription,
						SpringLib.Config.dataBaseSize
					);
			if (me.db) {
				isInit = true;
				var commonUtil = new SpringLib.CommonUtil();
				me.execUpdate(commonUtil.getCommonSql(SpringLib.Constants.optCCCreate, userId));
				me.execUpdate(commonUtil.getCommonSql(SpringLib.Constants.optDeptCreate, ''));
				me.execUpdate(commonUtil.getCommonSql(SpringLib.Constants.optStaffCreate, ''));
			}
			console.log('init local database end');
			return isInit;
		};
		/**
		* @param sql 要执行查询的sql语句
		* @param values 参数
		* @param callback callback.onSuccess = function(rows, count){...},callback.onError = function(code, message){...}
		*/
		DBUtil.prototype.execSearchByParams = function (sql, values, callback) {
            this.db.transaction(function (tx) {
            	console.log(sql);
                tx.executeSql(sql, values, function (tx, results) {
                    if (callback && callback.onSuccess) {
                        callback.onSuccess(results.rows, results.rowsAffected);
					}
                }, function (tx, results) {
                    //throw new Error("{errorCode:" + results.code + ",content:" + results.message + "}");
                    if (callback && callback.onError) {
                        callback.onError(results.code, results.message);
                    }
                });
            });
        };
        /**
		* @param sql 要执行查询的sql语句
		* @param callback callback.onSuccess = function(rows, count){...},callback.onError = function(code, message){...}
		*/
        DBUtil.prototype.execSearch = function (sql, callback) {
            this.db.transaction(function (tx) {
            	console.log(sql);
                tx.executeSql(sql, [], function (tx, results) {
                    if (callback && callback.onSuccess) {
                        callback.onSuccess(results.rows, results.rowsAffected);
					}
                }, function (tx, results) {
                    if (callback && callback.onError) {
                        callback.onError(results.code, results.message);
					}
                   // throw new Error("{errorCode:" + result.code + ",content:" + result.message + "}");
                });
            });
        };
        /**
		* @param sql 要执行的数据库变更sql语句
		* @param values 语句需要的参数，是一个按照sql语句中的？先后顺序排列的一维数组
		*/
        DBUtil.prototype.execUpdateByParams = function (sql, values, callback) {
            this.db.transaction(function (tx) {
           		console.log(sql);
                tx.executeSql(sql, values
                    , function(tx, results){
                		if (callback && callback.onSuccess) {
                            callback.onSuccess(results.rows, results.rowsAffected);
                        }
                    }
                    , function(tx, results) {
                        if (callback && callback.onError) {
                            callback.onError(results.code, results.message);
						}
                    });
            }, function (tx, result) {
                throw new Error("{errorCode:" + tx.code + ",content:" + tx.message + "}");
            });
        };
        DBUtil.prototype.execUpdate = function (sql, callback) {
            this.db.transaction(function (tx) {
            	console.log(sql);
                tx.executeSql(sql, []
					, function(tx, results){
                        if (callback && callback.onSuccess) {
                            callback.onSuccess(results.rows, results.rowsAffected);
                        }
					}
					, function(tx, results) {
                        if (callback && callback.onError) {
                            callback.onError(results.code, results.message);
                        }
					});
            });
        };
        return DBUtil;
	})();
	//所有使用操作数据库的地方都只使用该实例（疑问：数据库打开没有关闭？）
	SpringLib.DBUtil = new DBUtil();
})(SpringLib || (SpringLib = {}));

/*注册sqlite数据库sql模板类*/
(function (SpringLib) {
	var SqlTemplate = (function () {
		function SqlTemplate() {};
		
		/*
		*默认清除首尾空白字符，也可清除指定后缀
		* @param inputStr输入字符串
		* @param suffixChar 替换的后缀
		*/
		SqlTemplate.prototype.trimSql = function (inputStr, suffixChar) {
			if (!inputStr) 
				return inputStr;
			var reg = "/(^\s*)|(\s*$)/g";
			if (suffixChar) {
				reg = new RegExp("("+suffixChar+")*$" , "g");
			}
			return inputStr.replace(reg, "");
		};
		
		/*
		*生成更新或者插入sql（包含空值列）
		* @param tableName 操作的表名
		* @param data数据
		*/
		SqlTemplate.prototype.replaceInto = function (tableName, data) {
			var _this = this;
			var replaceIntoSql = "REPLACE INTO " + tableName;
			var colStr = "";//变更的列
			var valueStr = "";//新的值
			//列值串拼接
			for (var key in data) {
				colStr += " " + key + ",";
				if (data[key]) {
					valueStr += " '" + (data[key] + "").replace(/'/g, "''") + "',";
				} else {
					valueStr += " NULL ,";	
				}
			}
			
			//去掉多余的后缀
			var cols =  _this.trimSql(colStr, ",");
			if (cols.length > 0) {
				replaceIntoSql += "(" + cols + ")VALUES(" +  _this.trimSql(valueStr, ",") + ")";
			}
			return replaceIntoSql;
		};
		
		/*
		*生成选择性更新或者插入sql（不包含空值列）
		* @param tableName 操作的表名
		* @param data数据
		*/
		SqlTemplate.prototype.replaceIntoSel = function (tableName, data) {
			var _this = this;
			var replaceIntoSql = "REPLACE INTO " + tableName;
			var colStr = "";//变更的列
			var valueStr = "";//新的值
			//列值串拼接
			for (var key in data) {
				if (data[key]) {
					colStr += " " + key + ",";
					valueStr += " '" + (data[key] + "").replace(/'/g, "''") + "',";
				}
			}
			
			//去掉多余的后缀
			var cols =  _this.trimSql(colStr, ",");
			if (cols.length > 0) {
				replaceIntoSql += "(" + cols + ")VALUES(" +  _this.trimSql(valueStr, ",") + ")";
			}
			return replaceIntoSql;
		};
		
		/*
		*生成插入sql（包含空值列）
		* @param tableName 操作的表名
		* @param data数据
		*/
		SqlTemplate.prototype.insertInto = function (tableName, data) {
			var _this = this;
			var insertIntoSql = "INSERT INTO " + tableName;
			var colStr = "";//变更的列
			var valueStr = "";//新的值
			//列值串拼接
			for (var key in data) {
				colStr += " " + key + ",";
				if (data[key]) {
					valueStr += " '" + (data[key] + "").replace(/'/g, "''") + "',";
				} else {
					valueStr += " NULL,";		
				}
			}
			//去掉多余的后缀
			var cols =  _this.trimSql(colStr, ",");
			if (cols.length > 0) {
				insertIntoSql += "(" + cols + ")VALUES(" +  _this.trimSql(valueStr, ",") + ")";
			}
			return insertIntoSql;
		};
		
		/*
		*生成插入sql（不包含空值列）
		* @param tableName 操作的表名
		* @param data数据
		*/
		SqlTemplate.prototype.insertInto = function (tableName, data) {
			var _this = this;
			var insertIntoSql = "INSERT INTO " + tableName;
			var colStr = "";//变更的列
			var valueStr = "";//新的值
			//列值串拼接
			for (var key in data) {
				if (data[key]) {
					colStr += " " + key + ",";
					valueStr += " '" + (data[key] + "").replace(/'/g, "''") + "',";
				}
			}
			//去掉多余的后缀
			var cols =  _this.trimSql(colStr, ",");
			if (cols.length > 0) {
				insertIntoSql += "(" + cols + ")VALUES(" +  _this.trimSql(valueStr, ",") + ")";
			}
			return insertIntoSql;
		};
		/*
		*生成查询sql
		* @param tableName 操作的表名
		* @param data数据
		* @param order排序字段数组
		* @param orderType排序字段对应排序类型
		* @param page 分页对象，page.start开始的行，page.limit分页的大小
		*/
		SqlTemplate.prototype.query = function (tableName, condition, order, orderType, page) {
			if (order && orderType && order.length != orderType.length) {
				console.log("查询参数有误，排序字段长度与类型不一致");
				return;
			}
			
			var querySql = "SELECT * FROM " + tableName + " WHERE 1=1 ";
			for (var key in condition) {
				//拼接条件
				if (condition[key]) {
					querySql += "AND " + key + "='" + condition[key] + "'"
				}
			}
			//拼接排序
			if (order && order.length > 0) {
				querySql += " order by ";
				for (var i = 0 ; i < order.length; i++) {
					querySql += order[i];
					querySql += " " + orderType[i];
				}
			}
			//拼接分页
			if (page) {
				querySql += " limit " + page.start + "," + page.limit;
			}
			return querySql;
		};
		
		return SqlTemplate;
	})();
	//直接新建实例，方便使用
	SpringLib.$sqlTemplate = new SqlTemplate();
})(SpringLib || (SpringLib = {}) );

(function (SpringLib) {
	var DataAccess = (function () {
		function DataAccess(httpProvider){
			this._dbUtil = SpringLib.DBUtil;
			this._commonUtil = new SpringLib.CommonUtil();
			this._http = httpProvider;
			//this._q = $q;
			this._lock = false;
		};
		
		/*同步执行*/
		DataAccess.prototype.syncLock = function (action) {
			var _this = this;
			 if (!_this._lock) {
				_this._lock = true;
				try {
					(action)();
				} catch ( e ) {
				
				} finally {
					_this._lock = false;
				}
				
			} else { 
				var t = setInterval(function (){
					if (!_this._lock) {
						_this._lock = true;
						try {
							(action)();
						} catch ( e ) {
							console.log("同步执行出错：" + e);
						} finally {
							_this._lock = false;
							clearInterval(t);
						}
					}
				} , 200);
			}
		}
		
		/*获取远程组织架构，并更新本地数据库*/
		DataAccess.prototype.getContactsFromRemote = function () {

            console.log("同步远程组织架构数据...");
            var _this = this;
            var exeflag = 0;//-1表示正在拉取 1表示部门或者员工信息成功拉取完毕 2部门和员工都拉取完成 "error"表示部门或者员工拉取失败
            var msg = '';//存放返回信息
			var pullKey = "pullInfo";//拉取信息对象的key名
			var pullInfo = null;//拉取的缓存信息
			var validTime = 60000;//拉取状态有效时间的毫秒数
			var startTime = "startTime";//状态开始时间
			var pullPerson = "pullPerson";//拉取人
			var timer = null;
			var util = new SpringLib.CommonUtil();
			return new Promise(function (resolve,reject) {

                _this.syncLock(function(){
                    if( typeof window.localStorage !== "undefined" ) {
                        if (window.localStorage.getItem(pullKey)) {
                            console.log(window.localStorage.getItem(pullKey));
                            pullInfo = JSON.parse(window.localStorage.getItem(pullKey));
                            console.log(pullInfo[startTime]);
                            //如果拉取标志未失效
							var t = new Date().getTime() - pullInfo[startTime];
							console.log(t);
                            if(t < validTime) {
                                console.log("有进程正在拉取数据...");
                                exeflag = -1;
                                reject(exeflag);
                            }
                        }
                    }
				});

				if (exeflag == -1) {
					return;
				}
                exeflag = 0;//可以拉取

				//拉取过程中每隔300毫秒更新一下拉取信息
                timer = setInterval(function () {
                	var t = new Date().getTime();
                    window.localStorage.setItem(pullKey, JSON.stringify({
                        pullPerson : "",
                        startTime : t
					}));
                },300);

                //查询员工最后一次更新时间
                _this._dbUtil.execSearch(
                    _this._commonUtil.getCommonSql(SpringLib.Constants.optStaffLastTime, ''),
                    {
                        onSuccess : function (rows, count) {
                            console.log(rows);
                            if (rows && rows.length > 0 && rows[0]) {
                                getStaff(0, rows[0].modified_date);
                            } else {
                                getStaff(0, "");
                            }
                        },

                        onError : function (code, message) {
                            console.log('本地查询失败，['+ code +']' +message);
                            getStaff(0, "");
                        }
                    }
                );
                //查询部门最后一次更新时间
                _this._dbUtil.execSearch(
                    _this._commonUtil.getCommonSql(SpringLib.Constants.optDeptLastTime, ''),
                    {
                        onSuccess : function (rows, count) {
                            console.log(rows);
                            if (rows && rows.length > 0 && rows[0]) {
                                getDepartment(0, rows[0].modified_date);
                            } else {
                                getDepartment(0, "");
                            }
                        },

                        onError : function (code, message) {
                            console.log('本地查询失败，['+ code +']' +message);
                            getDepartment("");
                        }
                    }
                );

                //远程获取有变更或者新增的员工列表，并更新到本地（分页拉取员工数据）
                function getStaff(start, lastTime) {
					_this._http.post(
						SpringLib.Config.smpServerUrl + SpringLib.Config.smpGetStaffUrl,
						{start : start, limit: SpringLib.Config.staffFromRemoteLimit, modifiedTime : lastTime, stoken : SpringLib.LoginUser.stoken}
					).then(function (response) {
						response = response.data;
						console.log('获取员工信息返回',response);
						if (response.isSuccess) {
							var data = response.data;
                            var c = 0;
							//有数据则逐条执行
							if (data && data.result && data.result.length > 0) {
								var result = data.result;
								//如果返回页数data.pageCount超过一定数量可以使用遮罩（因为逐条插入数据库延迟时间较长）
								//将有变更的数据逐条插入数据本地数据库
								for (var i = 0; i < result.length; i++) {

									var row = result[i];
									if (row) {
										//var sql = SpringLib.$sqlTemplate.replaceInto(SpringLib.Constants.staffTableName, row);
										var sql = "replace into " + SpringLib.Constants.staffTableName + " ("
											+ "staffId ,"
											+ "icon ,"
											+ "sex, "
											+ "phone , "
											+ "telephone ,"
											+ "email, "
											+ "deptId , "
											+ "status ,"
											+ "staffName , "
											+ "staffCode , "
											+ "staffShortName , "
											+ "createdTime ,"
											+ "modifiedTime, "
											+ "creator, "
											+ "modifier ,"
											+ "version, "
											+ "jobIndicator, "
											+ "jobcode, "
											+ "jobcodeDescr, "
											+ "positionNbr, "
											+ "posnDescr) "
											+ "VALUES("
											+ (row.staffId ? "'"+ (row.staffId + "").replace(/'/g, "''") + "'": "NULL")
											+","+ (row.icon ? "'"+ (row.icon +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.sex ? "'"+ (row.sex +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.phone ? "'"+ util.strToHex(row.phone +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.telephone ? "'"+ util.strToHex(row.telephone +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.email ? "'"+ util.strToHex(row.email +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.deptId ? "'"+ (row.deptId +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.status ? "'"+ (row.status +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.staffName ? "'"+ (row.staffName +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.staffCode ? "'"+ (row.staffCode +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.staffShortName ? "'"+ (row.staffShortName +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.createdTime ? "'"+ (row.createdTime +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.modifiedTime ? "'"+ (row.modifiedTime +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.creator ? "'"+ (row.creator +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.modifier ? "'"+ (row.modifier +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.version ? "'"+ (row.version +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.jobIndicator ? "'"+ util.strToHex(row.jobIndicator +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.jobcode ? "'"+ util.strToHex(row.jobcode +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.jobcodeDescr ? "'"+ util.strToHex(row.jobcodeDescr +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.positionNbr ? "'"+ util.strToHex(row.positionNbr +"").replace(/'/g, "''") + "'": "NULL")
											+","+(row.posnDescr ? "'"+ util.strToHex(row.posnDescr +"").replace(/'/g, "''") + "'": "NULL")
											+")";
										//本地存储如有失败，则只打印日志
										_this._dbUtil.execUpdate(sql, {
											onSuccess : function(rows, rowsAffected) {
												c++;
												if (data.pageIndex == data.pageCount -1 && c == result.length) {
													//console.log("人员信息已保存完毕");
                                                    //隐藏遮罩，提示拉取完成
                                                    _this.syncLock(function(){
                                                        console.log("员工信息保存完成，当前同步标志为："+exeflag);
                                                        if(exeflag == 1) {
                                                            //如果部门列表已拉取成功
                                                            //defer.resolve(2);
                                                            exeflag = 2;
                                                            resolve(exeflag);
                                                            clearInterval(timer);
                                                        } else if(exeflag == "error"){
                                                            exeflag = 2;
                                                            reject(msg);
                                                            clearInterval(timer);
                                                        } else {
                                                            //如果只拉取了员工列表，且拉取成功
                                                            exeflag = 1;
														}
                                                    });
												}
											},
											onError : function (code, message) {
                                                c++;
                                                console.log("保存人员信息出错,错误信息["+code+"]:"+message);
                                                if (data.pageIndex == data.pageCount -1 && c == result.length) {
                                                    _this.syncLock(function(){
                                                        //defer.resolve("error");
                                                        if(exeflag == 1) {
                                                            //如果部门列表已拉取成功
                                                            //defer.resolve(2);
                                                            exeflag = 2;
                                                            resolve(exeflag);
                                                            clearInterval(timer);
                                                        } else if(exeflag == "error"){
                                                        	//如果部门远程拉取失败
                                                            exeflag = 2;
                                                            reject(msg);
                                                            clearInterval(timer);
                                                        } else {
                                                            //如果只拉取了员工列表，且远程获取成功
                                                            exeflag = 1;
                                                        }
                                                    });
                                                }
											}
										});
									} else {
										c++;
									}
								}
								//如果没数据则直接退出
							} else {
                                _this.syncLock(function(){
                                    console.log("员工信息拉取完成，当前同步标志为："+exeflag);
                                    if(exeflag == 1) {
                                        //如果部门列表已拉取成功
                                        //defer.resolve(2);
                                        exeflag = 2;
                                        resolve(exeflag);
                                        clearInterval(timer);
                                    } else if(exeflag == "error"){
										//如果部门失败
                                        exeflag = 2;
                                        reject(msg);
                                        clearInterval(timer);
                                    } else {
                                        //如果只拉取了员工列表，且拉取成功
                                        exeflag = 1;
									}
                                });
							}
							console.log(data.pageIndex+"页已拉取完成。。。");
							//如果还有数据没有拉取完，则继续拉取
							if (data && (data.pageIndex||data.pageIndex==0) && data.pageCount && data.pageIndex < data.pageCount -1 ) {
								console.log("继续拉取"+(data.pageIndex + 1));
								//是否需要记录当前拉取的分页信息
								getStaff((data.pageIndex + 1)*SpringLib.Config.staffFromRemoteLimit, lastTime);
							} else {
								console.log("远程拉取员工数据结束");
							}
						} else {
                            _this.syncLock(function(){
                                console.log("员工信息远程获取失败："+response.message);
                                msg = msg + "员工信息远程获取失败："+response.message;
                                if(exeflag == 1 || exeflag == "error") {
                                    exeflag = "error";
                                    reject(msg);
                                    clearInterval(timer);
                                } else {
                                    exeflag = "error";
								}
                            });
						}
					}).catch(function (response) {
						_this.syncLock(function(){
                            console.log(response || '远程获取员工信息失败');
							//如果部门已经拉取或者拉取失败
                            msg = msg + "员工信息远程获取失败!";
                            if(exeflag == 1 || exeflag == "error") {
                                //如果部门列表已拉取成功
                                //defer.resolve(2);
                                exeflag = "error";
                                reject(msg);
                                clearInterval(timer);
                            } else {
                                exeflag = "error";
							}
						});
					})
                };

                //远程获取有变更或者新增的员工列表，并更新到本地（分页拉取员工数据）
                function getDepartment(start, lastTime) {
					_this._http.post(
						SpringLib.Config.smpServerUrl + SpringLib.Config.smpGetDeptUrl,
						{start : start, limit: SpringLib.Config.deptFromRemoteLimit, modifiedTime : lastTime, stoken : SpringLib.LoginUser.stoken}
					).then(function (response) {
						response = response.data;
						if (response.isSuccess) {
							var data = response.data;
                            var c = 0;
							//有数据则逐条执行
							if (data && data.length > 0) {
								//如果返回页数data.pageCount超过一定数量可以使用遮罩（因为逐条插入数据库延迟时间较长）
								//将有变更的数据逐条插入数据本地数据库
								for (var i = 0; i < data.length; i++) {
									var row = data[i];
									if (row) {
										var sql = SpringLib.$sqlTemplate.replaceInto(SpringLib.Constants.deptTableName, row);
										_this._dbUtil.execUpdate(sql,{
                                            onSuccess : function(rows, rowsAffected) {
                                                c++;//必须在回调之后执行
                                                if (c == data.length) {
                                                    //隐藏遮罩，提示拉取完成
                                                    _this.syncLock(function(){
                                                        console.log("部门信息保存完毕，当前同步标志为："+exeflag);
                                                        if(exeflag == 1) {
                                                            //如果员工列表已拉取成功
                                                            //defer.resolve(2);
                                                            exeflag = 2;
                                                            resolve(exeflag);
                                                            clearInterval(timer);
                                                        } else if(exeflag == "error"){
                                                            exeflag = 2;
                                                            reject(msg);
                                                            clearInterval(timer);
                                                        } else {
                                                            //如果只拉取了部门列表，并且拉取成功
                                                            //defer.resolve(1);
                                                            exeflag = 1;
														}
                                                    });
                                                }
                                            },
                                            onError : function (code, message) {
                                            	c++;
                                                console.log("保存部门信息出错,错误信息["+code+"]:"+message);
                                                if (c == data.length) {
                                                    _this.syncLock(function(){
                                                        msg = msg + "保存部门信息出错,错误信息["+code+"]:"+message+"!";
                                                        if(exeflag == 1) {
                                                            //如果员工列表已拉取成功
                                                            //defer.resolve(2);
                                                            exeflag = 2;
                                                            resolve(exeflag);
                                                            clearInterval(timer);
                                                        } else if(exeflag == "error"){
                                                            //如果员工列表远程拉取失败
                                                            exeflag = 2;
                                                            reject(msg);
                                                            clearInterval(timer);
                                                        } else {
                                                            //如果只拉取了部门列表，且远程获取成功
                                                            exeflag = 1;
                                                        }
                                                    });
                                                }
                                            }
                                        });
									} else {
                                        c++;
                                    }
                                }
								//没有数据直接完成部门拉取
							} else {
                                //隐藏遮罩，提示拉取完成
                                _this.syncLock(function(){
                                    console.log("部门信息保存完毕，当前同步标志为："+exeflag);
                                    if(exeflag == 1) {
                                        //如果员工列表已拉取成功
                                        //defer.resolve(2);
                                        exeflag = 2;
                                        resolve(exeflag);
                                        clearInterval(timer);
                                    } else if(exeflag == "error"){
										//如果员工失败
                                        exeflag = 2;
                                        reject(msg);
                                        clearInterval(timer);
                                    } else {
                                        //如果只拉取了员工列表，并且拉取成功
                                        //defer.resolve(1);
                                        exeflag = 1;
									}
                                });
							}
							//如果还有数据没有拉取完，则继续拉取(后台不支持分页，这块儿代码可以去掉)
							if ( data.pageIndex < data.pageCount -1 ) {
								//是否需要记录当前拉取的分页信息
								getDepartment((data.pageIndex + 1)*SpringLib.Config.deptFromRemoteLimit + 1, "");
							} else {
                                console.log("远程拉取部门数据结束");
							}

						} else {
                            _this.syncLock(function(){
                                //defer.resolve("error");
                                console.log("远程获取部门信息失败："+response.message);
                                msg = msg + "远程获取部门信息失败："+response.message;
                                if(exeflag == 1 || exeflag == "error") {
                                    exeflag = "error";
                                    reject(msg);
                                    clearInterval(timer);
                                } else {
                                    exeflag = "error";
                                }
                            });
						}
					}).catch(function (response) {
						console.log(response || '远程获取部门信息失败');
						_this.syncLock(function(){
                            console.log(response || '远程获取部门信息失败');
                            //如果员工已经拉取或者拉取失败
                            msg = msg + "部门信息远程获取失败!";
                            if(exeflag == 1 || exeflag == "error") {
                                //如果员工信息列表已拉取成功或者失败
                                //defer.resolve(2);
                                exeflag = "error";
                                reject(msg);
                                clearInterval(timer);
                            } else {
                                exeflag = "error";
                            }
						});
					})
                };
            })
		};
		
		
		/*
		*根据部门id从本地加载子部门和人员
		*@param id 部门id
		*@param callback 回调函数第一个参数是记录数据包括子部门和员工数，json结构[{id:...,text:...,type:...[,sex:...]},...], 
		*第二个参数是部门下的员工总数
		*/
		DataAccess.prototype.getDeptAndStaff = function (id, callback, start) {
			var _this = this;
			var contacts = [];
			var staffLength = 0;
            var util = new SpringLib.CommonUtil();
			
			//根据部门id从本地分页查询该部下的员工
			var getStaffPage = function (deptId, callback, start) {
                var sql = "select t1.*, t2.deptName from "+SpringLib.Constants.staffTableName+" t1 left join "+SpringLib.Constants.deptTableName+" t2 on t1.deptId = t2.deptId where t1.deptId='"+deptId+"' ";
				_this._dbUtil.execSearch(
					// SpringLib.$sqlTemplate.query(
					// 	SpringLib.Constants.staffTableName
					// 	, {deptId : id, status : 1}
					// 	, ['staffShortName']
					// 	, ['ASC']
					// 	, {start : start, limit : SpringLib.Config.infinityLimit}
					// ),
                    sql,
					{
						onSuccess : function (rows, rowCount) {
							if (rows && rows.length > 0) {
								staffLength = rows.length;
								for (var i=0; i < rows.length; i++) {
									//var item = {};
									var item = new SpringLib.DataItem();
									item.id = rows[i].staffId;
									item.text = rows[i].staffName;
									item.type = 0;//表示员工
									item.sex = rows[i].sex;
                                    item.icon = rows[i].icon;
                                    item.posnDescr = rows[i].posnDescr ? util.hexToStr(rows[i].posnDescr) : rows[i].posnDescr;
                                    item.dataType = SpringLib.Constants.dataType.contactStaff;//组织架构员工数据
									item.targetType = SpringLib.Config.targetType1;//单聊
									item.deptName = rows[i].deptName;//单聊
									contacts.push(item);
								}
							} else {
								console.log("该部门没有员工");
							}
							if (callback) {
								(callback)(contacts, staffLength);
							}
						},
						onError : function (code, message) {
							console.log("查询部门员工失败[" + code + "]" + message);
						}
					}
				);
			};
			
			//如果是查第一页，需要查询子部门
			if (start == 0) {
				//本地查询子部门，并添加到contacts中
				_this._dbUtil.execSearch(
					SpringLib.$sqlTemplate.query(
						SpringLib.Constants.deptTableName
						, {parentDeptId : id}
						, ['deptName']
						, ['ASC'] 
					), 
					{
						onSuccess : function (rows, rowCount){
							if (rows && rows.length > 0) {
								for (var i=0; i < rows.length; i++) {
									//var item = {};
									var item = new SpringLib.DataItem();
									item.id = rows[i].deptId;
									item.text = rows[i].deptName;
									item.type = 1;//表示部门
									item.dataType = SpringLib.Constants.dataType.contactDept;//组织架构部门数据
									contacts.push(item);
								}
							} else {
								console.log("未查询到部门数据");
							}
						},
						onError : function (code, message) {
							console.log("查询子部门出现错误[" + code + "]" + message);
						}
					}
				);
				getStaffPage(id, callback, start);
			} else {
				getStaffPage(id, callback, start);
			}
			
		};
		
		/*
		*根据员工名称模糊查询
		*@param filter员工名称或者姓名拼音过滤条件值 
		*@param callback 回调函数，参数是满足条件的员工列表
		*/
		DataAccess.prototype.queryStaffByLike = function (filter, callback, start) {
			var _this = this;
			var contacts = [];
            var util = new SpringLib.CommonUtil();
			var sql = "select t1.*, t2.deptName from " + SpringLib.Constants.staffTableName + " t1 left join " + SpringLib.Constants.deptTableName + " t2 on t1.deptId = t2.deptId "
					+ " where (t1.staffName like '%" + filter + "%' or t1.staffShortName like '%" +filter
								+ "%' or t1.staffCode like '%" + filter + "%') and t1.status = 1 "
					+ " order by t1.staffName limit " + start + "," +  SpringLib.Config.staffLimit;
			_this._dbUtil.execSearch(
				sql,
				{
					onSuccess : function (rows, rowCount) {
						
						if (rows && rows.length > 0) {
							for (var i = 0; i < rows.length; i++){
								//var item = {};
								var item = new SpringLib.DataItem();
								item.id = rows[i].staffId;
								item.text = rows[i].staffName;
								item.code = rows[i].staffCode;
								item.type = 0;
								item.sex = rows[i].sex;
                                item.icon = rows[i].icon;
                                item.posnDescr = rows[i].posnDescr ? util.hexToStr(rows[i].posnDescr) : rows[i].posnDescr;
								//item.dataType = SpringLib.Constants.dataType.commonContact;//右键菜单使用
								item.targetType = SpringLib.Config.targetType1;//单聊
                                item.deptName = rows[i].deptName;
								contacts.push(item);
							}
							(callback)(contacts);
						} else {
							(callback)([]);
						} 
					},
					onError : function (code, message) {
						console.log("查询员工报错[" + code + "]" + message);
						alert("查询员工数据报错");
					}
				}
			);
		};
		/*
		*根据员工id查询指定员工
		*@param filter员工名称或者姓名拼音过滤条件值 
		*@param callback 回调函数，参数是满足条件的员工列表
		*/
		DataAccess.prototype.queryStaffByStaffId = function (staffIds, callback) {
            var _this = this;
			var contacts = [];
            var idStr = "'" + staffIds[0] + "'";
            for (var i = 1; i < staffIds.length; i++) {
                idStr += ',' + "'" + staffIds[i] + "'";
            }
			var sql = "select t1.*, t2.deptName from " + SpringLib.Constants.staffTableName + " t1 left join " + SpringLib.Constants.deptTableName + " t2 on t1.deptId = t2.deptId "
					+ " where t1.staffId in ("+idStr+")";
			_this._dbUtil.execSearch(
				sql,
				{
					onSuccess : function (rows, rowCount) {
						
						if (rows && rows.length > 0) {
							for (var i = 0; i < rows.length; i++){
								//var item = {};
								var item = new SpringLib.DataItem();
								item.staffId = rows[i].staffId;
								item.staffName = rows[i].staffName;
								item.code = rows[i].staffCode;
								item.type = 0;
								item.sex = rows[i].sex;
                                item.icon = rows[i].icon;
                                item.deptName = rows[i].deptName;
								//item.dataType = SpringLib.Constants.dataType.commonContact;//右键菜单使用
								item.targetType = SpringLib.Config.targetType1;//单聊
								contacts.push(item);
							}
							(callback)(contacts);
						} else {
							(callback)([]);
						} 
					},
					onError : function (code, message) {
						console.log("查询员工报错[" + code + "]" + message);
					}
				}
			);
		};
		/*
		*根据员工id查询指定员工详细信息
		*@param jobcode职务编码
		*@param filter员工名称或者姓名拼音过滤条件值
		*@param callback 回调函数，参数是满足条件的员工列表
		*/
		DataAccess.prototype.queryStaffDetailByStaffId = function (jobcode, staffId, callback) {
            var _this = this;
			var contacts = [];
            var util = new SpringLib.CommonUtil();

            var sql = "select s.staffId, s.phone,s.staffCode,s.email,s.telephone, s.staffName, s.sex, s.icon, d.deptName,s.deptId,s.posnDescr from "+
				SpringLib.Constants.staffTableName+" as s left join "+SpringLib.Constants.deptTableName+
				" as d on s.deptId = d.deptId where s.staffId = " + "'" + staffId + "'";

			_this._dbUtil.execSearch(
				sql,
				{
					onSuccess : function (rows, rowCount) {

						if (rows && rows.length > 0) {
							for (var i = 0; i < 1; i++){
								//var item = {};
								var item = new SpringLib.staffDetail();
                                item.deptId = rows[i].deptId;
                                item.deptName = rows[i].deptName;
                                item.icon = rows[i].icon;
                                item.phone = rows[i].phone ? util.hexToStr(rows[i].phone): rows[i].phone;
                                item.posnDescr = rows[i].posnDescr ? util.hexToStr(rows[i].posnDescr) : rows[i].posnDescr;
                                item.sex = rows[i].sex;
                                item.staffId = rows[i].staffId;
                                item.staffName = rows[i].staffName;
                                item.telephone = rows[i].telephone ? util.hexToStr(rows[i].telephone) : rows[i].telephone ;
                                item.staffCode = rows[i].staffCode;
                                item.email = rows[i].email ? util.hexToStr(rows[i].email) : rows[i].email;
								contacts.push(item);
							}
							//(callback)(rows);
							if (rows[0].deptId=='1000311') {
								//如果是总裁室
                                contacts[0].phone = _this.formatPhone(contacts[0].phone);
                                (callback)(contacts);
                            } else {
                                //查询飞行部及其子部门，并屏蔽电话
                                _this.queryFXB(rows[0].deptId, {
                                    onSuccess : function(records, rowCount) {
                                        if (records && records.length > 0 &&(!jobcode || parseInt(jobcode) > 1800)) {
                                            contacts[0].phone = _this.formatPhone(contacts[0].phone);
                                        }
                                        (callback)(contacts);
                                    },
                                    onError : function (code, message) {
                                        (callback)([]);
                                    }
                                });
							}
						} else {
							(callback)([]);
						}
					},
					onError : function (code, message) {
						console.log("查询员工报错[" + code + "]" + message);
					}
				}
			);
		};

        /**
         * 转换电话号码为****
         * @param phone
         * @returns {string}
         */
        DataAccess.prototype.formatPhone = function(phone) {
        	if (!phone){
        		return '';
			}
            if (typeof phone == 'number') {
                phone = phone.toString();
            }
            if(phone.length<4){
                return phone;
            }
            return phone.substr(0, 3) + '****' + phone.substr(7, 11);
        }

		/*
		 *判断deptId是否飞行部或者其子部门
		 *@param deptId 部门id
		 *@param callback 回调函数
		 */
        DataAccess.prototype.queryFXB = function (deptId, callback) {
            var _this = this;
            var sql = "select deptId from t_department where (parentDeptId in (select a.deptId from t_department a where a.parentDeptId = '1000101') or parentDeptId = '1000101' or deptId = '1000101') "
				+ " and deptId = '"+deptId+"'";
            _this._dbUtil.execSearch(sql,{
                onSuccess : function (rows, rowCount) {
                    callback.onSuccess(rows, rowCount);
                },
                onError : function (code, message) {
                    callback.onError(code, message);
                }
			});
        };
		/*
		*添加常用联系人，支持批量
		*@param userId用户id
		*@param staffList 联系人列表
		*@param callback 回调函数
		*/
		DataAccess.prototype.addCommonContact = function (userId, staffList, callback) {
			var _this = this;
			if (staffList && staffList.length > 0) {
				for (var i = 0; i < staffList.length; i++){
					_this._dbUtil.execUpdate(SpringLib.$sqlTemplate.replaceInto(
						SpringLib.Constants.commonContactTableName + userId
						,staffList[i]
					));
				}
			}
		};
		/*
		*移除常用联系人，支持批量
		*@param userId用户id
		*@param staffList 联系人列表
		*@param callback 回调函数
		*/
		DataAccess.prototype.removeCommonContact = function (userId, staffList, callback) {
			var _this = this;
			if (staffList && staffList.length > 0) {
				for (var i = 0; i < staffList.length; i++){
					_this._dbUtil.execUpdate(
						"delete from " + SpringLib.Constants.commonContactTableName + userId 
						+ " where staffId = '" + staffList[i].staffId + "' and userId='"+ staffList[i].userId +"' " 
					);
					console.log("删除常用联系人{staffId:'"+staffList[i].staffId+"',userId:'"+staffList[i].userId+"'}");
				}
				if (callback) {
					(callback.onSuccess)();
				}
			}
		};
		/*
		*查询常用联系人
		*@param staffList员工列表
		*@param callback 回调函数
		*/
		DataAccess.prototype.getCommonContacts = function (userId, callback, start) {
			var _this = this;
			var contacts = [];
			var sql = "select t1.staffId, t2.staffName, t2.staffCode, t2.sex from "
						+ SpringLib.Constants.commonContactTableName + userId + " t1 , "
						+ SpringLib.Constants.staffTableName+" t2 "
						+ " where t1.staffId = t2.staffId  and t1.userId = '"+userId+"' and t2.status = 1 " 
						+ " order by t2.staffName limit " + start + "," +  SpringLib.Config.staffLimit;
			_this._dbUtil.execSearch(sql,
				{
					onSuccess : function (rows, rowCount) {
						
						if (rows && rows.length > 0) {
							for (var i = 0; i < rows.length; i++){
								//var item = {};
								var item = new SpringLib.DataItem();
								item.id = rows[i].staffId;
								item.text = rows[i].staffName;
								item.code = rows[i].staffCode;
								item.type = 0;
								item.sex = rows[i].sex;
								item.dataType = SpringLib.Constants.dataType.commonContact;//常用联系人数据类型
								item.targetType = SpringLib.Config.targetType1;//单聊
								contacts.push(item);
							}
							(callback)(contacts);
						} else {
							(callback)([]);
						} 
					},
					onError : function (code, message) {
						console.log("查询常用联系人出错[" + code + "]" + message);
						alert("查询常用联系人出错");
					}
				}
			);
		};
		
		return DataAccess;
	})();
	SpringLib.DataAccess = DataAccess;
/*	angular.module("SpringLib")
		.service("SpringDataAccess", SpringLib.DataAccess);*/
})(SpringLib || (SpringLib = {}));

export default SpringLib;