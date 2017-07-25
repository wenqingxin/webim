<template>
    <div id="login" class="box-shadow" @keyup.enter="login">
       <!-- <i class="close on-hand"></i>-->
        <div class="head-photo">
            <i class="default-bk" v-show="!successSrc"></i>
            <img v-if="successSrc" :src="successSrc" alt="头像">
            <i v-show="showLogin" class="border-circle"><i></i></i>
        </div>
        <div class="err-msg" v-show="loginErrInfo">
            <span v-text="loginErrInfo">密码错误，请重新输入</span>
        </div>
        <transition name="fade">
            <div class="form" v-show="!showLogin">
                <form action="">
                    <div class="input-item">
                        <span class="top-text" v-text="accountFocus ? '用户账户' : ''"></span>
                        <input type="text"
                               :placeholder="!accountFocus ? '用户账户' : ''"
                               @focus="accountFocus=true"
                               v-focus
                               v-model="accountValue"
                        />
                    </div>
                    <div class="input-item">
                        <span class="top-text" v-text="passwordFocus ? '登录密码' : ''"></span>
                        <input type="password"
                               :placeholder="!passwordFocus ? '登录密码' : ''"
                               @focus="passwordFocus=true"
                               v-model="pwdValue"
                               v-if="!seePwd"
                        />
                        <input type="text"
                               :placeholder="!passwordFocus ? '登录密码' : ''"
                               @focus="passwordFocus=true"
                               v-model="pwdValue"
                               v-if="seePwd"
                        />
                        <i class="see-eye" v-if="seePwd" @click="seePwd=!seePwd"></i>
                        <i class="no-see-eye" v-if="!seePwd" @click="seePwd=!seePwd"></i>
                    </div>
                    <div class="rem-pass">
                        <check-box class="rem-box" :selected="selected" @select="selected = !selected"></check-box>
                        <div class="rem-txt">记住密码</div>
                    </div>
                    <div class="login-btn on-hand" @click="login">
                        <span>登录</span>
                    </div>
                </form>
            </div>

        </transition>
        <transition name="fade">
            <div class="login-ing" v-show="showLogin">
                <div class="name"><span v-text="displayStaffName"></span></div>
                <div class="cancel-btn on-hand" @click="showLogin=false"><span>取消</span></div>
            </div>
        </transition>

    </div>
</template>

<script>
    import CheckBox from '../components/common/CheckBox.vue'
    import SpringLib from '../libs/SpringLib.js'
    import {Service} from '../util/Utils'
    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    import {mapActions} from 'vuex'
    import RongIMLib from '../libs/RongIMLib-dev'
    import {getLocalUserArr,getLastLocalUser} from '../util/Utils.js'
    export default {
        name: 'login',
        data () {
            return {
                successSrc: '',
                displayStaffName: '',
                accountFocus: false,
                passwordFocus: false,
                showLogin: false,
                accountValue: '',
                pwdValue: '',
                loginErrInfo: '',
                seePwd: false,
                selected: false,
            }
        },
        components: {
            CheckBox
        },
        mounted(){
            this.$nextTick(function () {
                let user = getLastLocalUser();
                if (user){
                    this.pwdValue = getCookie("_imweb_"+user.staffCode);
                    if (this.pwdValue){
                        this.loadImg(user.icon);
                        this.accountValue = user.staffCode;
                        this.selected = true;
                    }
                }
            })
        },
        watch: {
            'userInfo.icon': {
                handler: function (val, oldVal) {
                    this.loadImg(val);
                }
            }
        },

        computed: {
            ...mapState({
                userInfo: state => state.userInfo || {}
            }),

        },
        methods: {
            ...mapMutations(['setUserInfo']),
            ...mapActions({
                loginAction: 'loginAction'
            }),
            loadImg(url){
                url = SpringLib.Config.smpServerUrl+SpringLib.Config.smpDownloadFileUrl + "/photo/b_" + url;
                let img = new Image();
                img.onload = () => {
                    this.successSrc = url;
                };
                img.src = url;
            },
            startLogging(){
                this.showLogin = true;
                this.loginErrInfo = '';
                this.displayStaffName = '欢迎使用';
                this.successSrc = '';
                //如果输入ID对应的人在当前的缓存里
                let userArr = getLocalUserArr();
                for (let i = 0;i<userArr.length;i++){
                    if (userArr[i].loginId == this.accountValue ){
                        this.displayStaffName = userArr[i].staffName;
                        //document.cookie
                        this.loadImg(userArr[i].icon);
                        break;
                    }
                }
            },
            stopLogging(resInfo){
                this.showLogin = false;
                this.loginErrInfo = resInfo || '';
            },
            login(){
                if(!this.validate()) return;
                this.startLogging();
                let param = {
                    userName: this.accountValue,
                    password: this.pwdValue,
                    isFocLogin: false,
                    isSaveCookie: this.selected
                }
                this.loginAction(param).then((data) => {
                    //没有取消登录才执行回调
                    if (this.showLogin){
                        this.stopLogging(data);
                        if (data && data.user) {
                            if (this.selected){
                                if (data.user.cacheInfo) {
                                    console.log(data.user.cacheInfo);
                                    setCookie("_imweb_" + this.userInfo.loginId, data.user.cacheInfo);
                                }
                            }else{
                                delCookie("_imweb_" + this.userInfo.loginId);
                            }

                            this.$router.replace({path:'/index',query: { loginId: this.userInfo.loginId}});
                        }
                    }
                }).catch((err)=>{
                    if (this.showLogin) {
                        this.stopLogging('登录出错');
                    }
                    console.log('登录抛异常',err);
                });
            },
            validate(){
                this.loginErrInfo = '';
                if(!this.accountValue){
                    this.loginErrInfo='账号不能为空！';
                    return false;
                }
                if(!this.pwdValue){
                    this.loginErrInfo='密码不能为空！';
                    return false;
                }
                return true;
            }
        }
    }
    //写cookies
    function setCookie(name,value)
    {
        var Days = 7;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        //document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
        document.cookie = name + "="+ value + ";expires=" + exp.toGMTString()+";path=/";
    }

    //读取cookies
    function getCookie(name)
    {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg)) {
            //return unescape(arr[2]);
            return arr[2];
        }else
            return null;
    }
    function delCookie(name)
    {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval=getCookie(name);
        if(cval!=null)
            document.cookie= name + "="+cval+";expires="+exp.toGMTString();
    }
</script>

<style lang="less" scoped>
    @import url('../styles/common.less');

    @box_width: 298px;
    @box_height: 400px;
    #login {
        width: @box_width;
        height: @box_height;
        border-radius: 5px;
        background-color: #ffffff;
        position: absolute;
        top: @common_margin_top;
        left: 50%;
        margin-left: -@box_width/2;
        @font_gray: rgb(153, 153, 153);
        @form_width: 240px;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.76);
        .close {
            display: inline-block;
            width: 16px;
            height: 16px;
            background: url('../images/login_close_icon.png') center no-repeat;
            position: absolute;
            top: 20px;
            right: 20px;
        }
        .err-msg {
            height: 24px;
            line-height: 24px;
            border: 1px solid #f4a0a0;
            background-color: #ffe0e0;
            font-size: 12px;
            font-family: "SimSun";
            color: rgb(236, 80, 80);
            position: absolute;
            top: 132px;
            left: 0;
            width: 240px;
            left: 50%;
            margin-left: -120px;
            text-align: center;
        }
        .head-photo {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background-color: #5888d3;
            position: absolute;
            top: 30px;
            margin-left: -45px;
            left: 50%;
            .default-bk {
                display: inline-block;
                width: 71px;
                height: 82px;
                background: url('../images/login_head_icon.png') center no-repeat;
                background-size: 71px 82px;
                position: absolute;
                left: 13px;
                bottom: -3px;
            }
            img {
                width: 90px;
                height: 90px;
                border-radius: 50%;
            }
            .border-circle {
                display: inline-block;
                width: 100px;
                height: 100px;
                background: url('../images/around-circle.png') center no-repeat;
                background-size: 100px 100px;
                top: -5px;
                left: -5px;
                position: absolute;
                animation: change 2s linear infinite;
                i {
                    display: inline-block;
                    width: 3px;
                    height: 3px;
                    border-radius: 50%;
                    top: 49px;
                    left: 97px;
                    background-color: #6291e6;
                    position: absolute;
                }
            }

            @keyframes change {
                　　from {
                    transform: rotate(0deg);
                }
                　　to {
                    transform: rotate(360deg);
                }
            }

            img {
                display: block;
            }
        }

        .form {
            position: absolute;
            top: 150px;
            left: 50%;
            margin-left: -120px;
            input {
                width: @form_width;
                border: none;
                border-bottom: 1px solid #d1d4d6;
                height: 30px;
                margin-top: 32px;
                outline: none;
                font-size: 14px;
                font-family: "Arial";
                color: rgb(49, 109, 182);

                .place-holder() {
                    font-size: 14px;
                    font-family: "Microsoft YaHei";
                    color: @font_gray;
                }
                &::placeholder {
                    .place-holder();
                }
            }
            .input-item {
                position: relative;
                .top-text {
                    position: absolute;
                    font-size: 14px;
                    font-family: "Microsoft YaHei";
                    color: @font_gray;
                    left: 0;
                    bottom: 26px;
                    top: 15px;
                }
                .eye(@url,@w,@h) {
                    width: @w;
                    height: @h;
                    background: @url center no-repeat;
                    background-size: @w @h;
                    display: inline-block;
                    position: absolute;
                    right: 0px;
                    bottom: 8px;
                }
                .no-see-eye {
                    .eye(url("../images/login_nosee_pswd_icon.png"), 16px, 15px);
                }
                .see-eye {
                    .eye(url("../images/login_see_pswd_icon.png"), 16px, 11px);
                }
            }
            .rem-pass {
                margin-top: 15px;
                .clearfix;
                .rem-box{
                    float: left;
                }
                .rem-txt {
                    font-size: 14px;
                    font-family: "Microsoft YaHei";
                    color: @font_gray;
                    vertical-align: middle;
                    float: left;
                    margin-left: 10px;
                    line-height: 18px;
                }
            }

            .login-btn {
                background-color: @common_blue;
                height: 36px;
                line-height: 36px;
                border-radius: 5px;
                text-align: center;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(255, 255, 255);
                margin-top: 17px;
                &:hover{
                    background-color:#2660a7 !important;
                }
            }
        }
        .login-ing {
            position: absolute;
            top: 230px;
            text-align: center;
            width: 100%;
            .name {
                font-size: 24px;
                font-family: "Microsoft YaHei";
                color: rgb(69, 75, 85);
            }
            .cancel-btn {
                margin-top: 26px;
                span {
                    border: 1px solid #cdd0d7;
                    border-radius: 5px;
                    width: 98px;
                    height: 34px;
                    line-height: 34px;
                    display: inline-block;
                    font-size: 14px;
                    font-family: "Microsoft YaHei";
                    color: rgb(49, 109, 182);
                }
            }

        }
    }
</style>
