<!-- 人员信息面板 -->
<template>

        <div class="profile-panel" :style="getHeight">
            <div class="basic-info">
                <Head-photo class="header-photo" :src="staffProfileDetail.icon"
                            size="110" type="profile-panel"></Head-photo>
                <div class="name"><span v-text="staffProfileDetail.staffName"></span></div>
                <div class="staffId" v-text="staffProfileDetail.staffCode"><span></span></div>
            </div>
            <div class="split-line"></div>
            <div class="contact-info">
                <div class="wrapper">
                    <div class="department item">
                        <span class="key">部门</span>
                        <span class="value" v-text="staffProfileDetail.deptName||'-'">   </span>
                    </div>
                    <div class="item">
                        <span class="key">手机</span>
                        <span class="value" v-text="staffProfileDetail.phone||'-'"></span>
                    </div>
                    <div class="item">
                        <span class="key">电话</span>
                        <span class="value" v-text="staffProfileDetail.telephone||'-'"></span>
                    </div>
                    <div class="item">
                        <span class="key">邮箱</span>
                        <span class="value" v-text="staffProfileDetail.email||'-'"> </span>
                    </div>
                </div>
            </div>
            <div class="send-btn on-hand" v-show="userInfo.staffId != this.staffProfileDetail.staffId" @click="sendMessage"><span>发消息</span></div>
        </div>

</template>

<script>
    import HeadPhoto from '../components/common/HeadPhoto.vue'
    import {mapMutations} from 'vuex'
    import {mapState} from 'vuex'
    import {mapActions} from 'vuex'
    import {WebChatConst} from '../util/Constant.js'
    export default {
        name: 'profilePanel',
        data () {
            return {
                src: require('../images/head_photo.png'),
            }
        },
        computed:{
            ...mapState(['staffProfileDetail','userInfo','maximize','contactProfile']),
            getHeight(){
                let height = document.body.clientHeight;
                if (this.maximize){
                    return {
                        height:(height-50)+'px'
                    }
                }
            }
        },
        methods: {
            ...mapMutations(['showContactProfile','setStaffProfileDetail']),
            ...mapActions(['openConversation']),
            sendMessage(){
                this.showContactProfile(false);
                this.openConversation({
                    targetId: this.staffProfileDetail.staffId,
                    conversationType: RongIMLib.ConversationType.PRIVATE,
                    icon: this.staffProfileDetail.icon,
                    gender: this.staffProfileDetail.sex,
                    targetName: this.staffProfileDetail.staffName,
                    //groupType:this.groupType,//私聊没有该项
                    //flightTime:this.flightTime,//私聊没有该项
                });

            }
        },
        components: {
            HeadPhoto
        }
    }


</script>

<style lang="less" scoped>
    @import "../styles/common.less";
    .profile-panel {
        background-color: #ffffff;
        height: 549px;
        position: relative;
        z-index: 1;
        .basic-info {
            padding-top: 1px;
            .header-photo {
                position: absolute;
                top: 40px;
                left: 50%;
                margin-left: -55px;
            }
            .name {
                font-size: 24px;
                font-family: "Microsoft YaHei";
                color: rgb(69, 75, 85);
                text-align: center;
                margin-top: 168px;
            }
            .staffId {
                font-size: 14px;
                font-family: "Arial";
                color: rgb(153, 158, 168);
                text-align: center;
                margin-top: 18px;
            }
        }
        .split-line {
            width: 350px;
            margin: 30px auto;
            margin-bottom: 0;
            border-top: 1px solid @common_border_color;
        }
        .contact-info {
            text-align: center;
            .wrapper{
                display: inline-block;
                text-align: left;
                .item {
                    margin-top: 8px;
                    //margin-left: 29%;
                    height: 28px;
                    .key {
                        display: inline-block;
                        height: 28px;
                        line-height: 28px;
                        font-size: 14px;
                        font-family: "Microsoft YaHei";
                        color: rgb(153, 158, 168);
                    }
                    .value {
                        padding-left: 25px;
                        font-size: 14px;
                        height: 26px;
                        line-height: 26px;
                        font-family: "Microsoft YaHei";
                        color: rgb(69, 75, 85);
                        border-radius: 4px;
                        margin: 0;
                    }
                }
                .department {
                    margin-top: 23px;
                }
            }

        }
        .send-btn {
            width: 150px;
            height: 32px;
            background-color: #316db6;
            line-height: 32px;
            color: #fff;
            text-align: center;
            border-radius: 3px;
            position: absolute;
            left: 50%;
            margin-left: -75px;
            bottom: 60px;
            &:hover{
                background-color:#2660a7 !important;
            }

        }
    }
</style>
