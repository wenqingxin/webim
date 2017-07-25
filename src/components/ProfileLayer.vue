<!-- 个人信息弹框 -->
<template>
    <transition name="fade">
        <div v-show="profileLayer">
            <div class="profileLayer" @click.stop="">
                <div class="ops">
                    <span class="done on-hand" v-show="editable&&!pending" @click.prevent="done">完成</span>
                    <i class="loading" v-show="pending"></i>
                    <span class="edit on-hand" v-show="!editable&&!pending" @click.prevent="editProfile">编辑</span>
                    <i class="close on-hand" @click="closeProfile"></i>
                </div>
                <div class="basic-info">
                    <Head-photo class="header-photo on-hand" :class="{'on-hand':editable}" :src="userInfo.icon"
                                size="90" @h-click="choosePhoto" type="profile-layer"></Head-photo>
                    <input type="file" v-show="false" name="file" id="profileChoosePhoto" @change="uploadFile"/>
                    <div class="name"><span v-text="userInfo.staffName"></span></div>
                    <div class="staffId" v-text="userInfo.empid"><span></span></div>
                </div>
                <div class="err-msg" v-show="errInfo">
                    <span v-text="errInfo"></span>
                </div>
                <div class="split-line" v-show="!errInfo"></div>
                <div class="contact-info">
                    <div class="department item">
                        <span class="key">部门</span>
                        <span class="value" v-text="userInfo.deptName"></span>
                    </div>
                    <div class="item">
                        <span class="key">手机</span>
                        <input class="value input" @blur="removeErr" :class="errClass.phone" id="profilePhoneNum"
                               type="number" onKeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
                               v-model="userInfo.phone" v-show="editable"
                               style="border: 1px solid #e9e9e9;"/>
                        <span class="value" v-show="!editable" style="height: 28px;padding-left:1px "
                              v-text="userInfo.phone">18580465521</span>
                    </div>
                    <div class="item">
                        <span class="key">电话</span>
                        <input class="value input" @blur="removeErr" v-show="editable" :class="errClass.telephone"
                               type="number" onKeypress="return (/[\d]/.test(String.fromCharCode(event.keyCode)))"
                               value="67252125" style="border: 1px solid #e9e9e9;"
                               v-model="userInfo.telephone"/>
                        <span class="value" v-show="!editable" style="height: 28px;padding-left:1px "
                              v-text="userInfo.telephone">67251125</span>
                    </div>
                    <div class="item">
                        <span class="key">邮箱</span>
                        <input class="value input" @blur="removeErr" type="email" :class="errClass.email"
                               value="lixiaoyun@ch.com" v-show="editable"
                               style="border: 1px solid #e9e9e9;" v-model="userInfo.email"/>
                        <span class="value" v-show="!editable"
                              style="height: 28px;padding-left:1px " v-text="userInfo.email"> lixiaoyun@ch.com</span>
                    </div>
                </div>
                <div class="logout-btn on-hand" v-if="!editable" @click="logout">
                    <span>退出当前账号</span>
                </div>
            </div>
        </div>

    </transition>
</template>

<script>
    import HeadPhoto from '../components/common/HeadPhoto.vue'
    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    import {mapActions} from 'vuex'
    import SpringLib from '../libs/SpringLib.js'
    import {Service} from '../util/Utils.js'
    import $ from 'jquery'
    export default {
        name: 'profileLayer',
        data () {
            return {
                src: require('../images/head_photo.png'),
                editable: false,
                errInfo: '',
                pending: false,
                uploadUrl: SpringLib.Config.smpServerUrl + SpringLib.Config.smpUploadIconUrl,
                oriUserInfo: {
                    phone: '',
                    telephone: '',
                    email: '',
                },
                errClass: {
                    phone: '',
                    telephone: '',
                    email: ''
                }
            }
        },
        components: {
            HeadPhoto
        },
        computed: {
            ...mapState({
                profileLayer: state => state.profileLayer,
                userInfo: state => state.userInfo || {},
            }),
        },
        methods: {
            ...mapMutations([
                'showProfileLayer',
                'setUserInfo',
                'showMessageBox',
                'deleteUser'
            ]),
            ...mapActions(['logOutAction', 'updateProfileAction']),
            closeProfile(){
                this.showProfileLayer(false);
                //还没保存,关闭的时候回复到初始值
            },
            uploadFile(){
                let fd = new FormData();
                fd.append('userId', this.userInfo.staffId);
                fd.append("file", document.getElementById('profileChoosePhoto').files[0]);
                fd.append("stoken", this.userInfo.stoken);

                $.ajax({
                    url: SpringLib.Config.smpServerUrl + SpringLib.Config.smpUploadIconUrl,
                    type: 'POST',
                    data: fd,
                    enctype: 'multipart/form-data',
                    async: false,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: res => {
                        console.log('上传头像接口返回:', res);
                        console.log(res && res.data);
                        console.log(res.isSuccess);
                        if (res && res.data && res.isSuccess) {
                            let filePath = res.data.filePath;
                            this.userInfo.icon = filePath;
                            this.setUserInfo(this.userInfo);
                        }else{
                            this.errInfo = '头像上传失败';
                        }
                    },
                    error: function (returndata) {
                        console.log('上传头像接口返回:', returndata);
                    }
                });
            },
            reset(){
                this.editable = false;
                this.errClass = {
                    phone: '',
                    telephone: '',
                    email: ''
                };
                this.errInfo = '';

            },
            editProfile(){
                this.editable = true;
                //在编辑之前保存下修改之前的个人信息
                this.oriUserInfo = {
                    phone: this.userInfo.phone,
                    telephone: this.userInfo.telephone,
                    email: this.userInfo.email,
                };
                setTimeout(() => {
                    document.getElementById('profilePhoneNum').focus();
                    document.getElementById('profilePhoneNum').select();
                }, 50);

            },
            logout(){
                //this.setUserInfo('');
                //this.deleteUser(this.userInfo.staffId);
                this.$router.replace('/login');
                location.reload();//重新刷新页面,清除vuex缓存,断开融云连接
                this.logOutAction().then((info) => {
                    //this.$router.replace('/login');
                })
            },
            done(){
                this.errInfo = '';
                if (this.oriUserInfo.phone == this.userInfo.phone
                    && this.oriUserInfo.telephone == this.userInfo.telephone
                    && this.oriUserInfo.email == this.userInfo.email) {
                    console.log('全都相等');
                    this.editable = false;
                    return;
                }
                if (!this.validate()) return;
                let param = {
                    phone: this.userInfo.phone,
                    telephone: this.userInfo.telephone,
                    email: this.userInfo.email,
                    staffId: this.userInfo.staffId,
                    //stoken: this.userInfo.stoken
                };
                this.pending = true;
                this.updateProfileAction(param).then(() => {
                    this.editable = false;
                    this.pending = false;
                    console.log('更新个人信息成功!');
                    //alert(JSON.stringify(this.oriUserInfo))
                }).catch(() => {
                    //alert(JSON.stringify(this.oriUserInfo));
                    console.log('更新个人信息失败!');
                    this.errInfo = '更新个人信息失败';
                    /*                    this.showMessageBox({
                     show: true,
                     title: '消息提示',
                     isInput: false,
                     content: '修改个人信息失败!',
                     showCancel: false,
                     confirm: () => {
                     alert('哈哈')
                     }
                     })*/

                    //还原修改之前的值
                });
            },
            validatePhone(){
                let phone = this.userInfo.phone;
                //let phoneReg = /^((\+?86)|(\+86))?(13[012356789][0-9]{8}|15[012356789][0-9]{8}|18[02356789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/;
                let phoneReg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;
                return phoneReg.test(phone);
            },
            validateTelePhone(){
                let telephone = this.userInfo.telephone;
                //let telephoneReg = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
                let telephoneReg = /^(([\d]{8})|(0[\d]{10,11}))$/;
                return telephoneReg.test(telephone);
            },
            validateEmail(){
                let email = this.userInfo.email;
                //let emailReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
                let emailReg = /^(?:\w+\.?)*\w+@(?:\w+\.)*\w+$/;
                return emailReg.test(email);
            },
            removeErr(){
                if(this.validatePhone()){
                    this.errClass.phone = '';
                    this.errInfo=false;
                }
                if(this.validateTelePhone()){
                    this.errClass.telephone = '';
                    this.errInfo=false;
                }
                if( this.validateEmail()){
                    this.errClass.email = '';
                    this.errInfo=false;
                }
            },
            validate(){
                //只对改动的字段进行校验
                if (this.oriUserInfo.phone != this.userInfo.phone && !this.validatePhone()) {
                    this.errInfo = '手机号码格式错误';
                    this.errClass.phone = 'err-input animated shake';
                    return false;
                }
                if (this.oriUserInfo.telephone != this.userInfo.telephone && !this.validateTelePhone()) {
                    this.errInfo = '座机号码格式错误';
                    this.errClass.telephone = 'err-input animated shake';
                    return false;
                }
                if (this.oriUserInfo.email != this.userInfo.email && !this.validateEmail()) {
                    this.errInfo = '邮箱格式错误';
                    this.errClass.email = 'err-input animated shake';
                    return false;
                }
                return true;
            },
            choosePhoto(){
                $('#profileChoosePhoto').click();
            }
        },
        watch: {
            profileLayer: function (val) {
                if (!val){
                    if (this.editable) {
                        //alert('原始信息'+JSON.stringify(this.oriUserInfo))
                        //alert('更改之后的信息'+JSON.stringify(this.userInfo))
                        Object.assign(this.userInfo, this.oriUserInfo);
                        //alert('合并之后的信息' + JSON.stringify(this.userInfo))
                    }
                    setTimeout(() => {
                        this.reset();
                    }, 500);
                }
            }
        }
    }


</script>

<style lang="less" scoped>
    @import '../styles/common.less';

    .err-input {
        border: 1px solid #f4a0a0 !important;
        outline: none;
    }

    .profileLayer {
        box-shadow: 1px 0 10px 0 #b1b1b1;
        width: 300px;
        background-color: #f5f5f5;
        opacity: 0.96;
        border-radius: 5px;
        padding-bottom: 28px;
        position: relative;
        overflow: auto;
        .err-msg {
            height: 24px;
            line-height: 24px;
            border: 1px solid #f4a0a0;
            background-color: #ffe0e0;
            font-size: 12px;
            font-family: "SimSun";
            color: rgb(236, 80, 80);
            position: absolute;
            top: 193px;
            width: 240px;
            left: 50%;
            margin-left: -120px;
            text-align: center;
        }
        .ops {
            .close {
                background: url(../images/close_window_icon.png) center no-repeat;
                display: inline-block;
                width: 16px;
                height: 16px;
                background-size: 16px 16px;
                position: absolute;
                right: 19px;
                top: 19px;
                &:hover{
                    background: url(../images/login_close_icon_b.png) center no-repeat;
                }
            }
            .done {
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(49, 109, 182);
                position: absolute;
                left: 20px;
                top: 17px;
            }
            .edit {
                //background: url(../images/edit_icon.png) center no-repeat;
                //display: inline-block;
                //width: 16px;
                //height: 15px;
                //background-size: 16px 15px;
                position: absolute;
                left: 20px;
                top: 20px;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(49, 109, 182);
                &:hover{
                    text-decoration: underline;
                }
            }
            .loading {
                .loading(19px, 20px);
            }

        }
        .basic-info {
            height: 76px;
            .header-photo {
                position: absolute;
                top: 30px;
                left: 50%;
                margin-left: -45px;
            }
            .name {
                font-size: 24px;
                font-family: "Microsoft YaHei";
                color: rgb(69, 75, 85);
                text-align: center;
                margin-top: 136px;
            }
            .staffId {
                font-size: 14px;
                font-family: "Arial";
                color: rgb(153, 158, 168);
                text-align: center;
                margin-top: 8px;
            }
        }
        .split-line {
            width: 260px;
            margin: 0 auto;
            border-top: 1px solid @common_border_color;
        }
        .contact-info {
            margin-top: 22px;
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
                -webkit-appearance: none !important;
                margin: 0;
            }
            input[type="number"] {
                -moz-appearance: textfield;
            }
            .department {
                margin-top: 20px;
            }
            .item {
                margin-top: 8px;
                .key {
                    //width: 67px;
                    margin-left: 18px;
                    display: inline-block;
                    text-align: center;
                    height: 28px;
                    line-height: 28px;
                    font-size: 14px;
                    font-family: "Microsoft YaHei";
                    color: rgb(153, 158, 168);
                }
                .input{
                    width: 198px !important;
                    margin-left: 9px !important;
                }
                .value {
                    padding-left: 10px !important;
                    width: 200px;
                    font-size: 14px;
                    height: 26px;
                    line-height: 26px;
                    font-family: "Microsoft YaHei";
                    color: rgb(69, 75, 85);
                    border-radius: 4px;
                    margin: 0;
                    margin-left: 10px;
                    padding: 0;
                    //outline: none;
                    outline-color:#306db6;
                }
            }

        }
        .logout-btn {
            margin: 19px auto 0 auto;
            text-align: center;
            width: 150px;
            height: 32px;
            color: #fff;
            border-radius: 3px;
            background-color: #f04242;
            line-height: 32px;
            font-family: "Microsoft YaHei";

        }

    }
</style>
