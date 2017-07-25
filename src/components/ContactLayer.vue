<!-- 通讯录人员选择弹框 -->
<template>
    <transition name="fade">
        <div class="contactLayer clearfix">
            <div class="left-area float-l">
                <div class="left-top">
                    <Search-input size="260" ref="searchContact" @search-input="searchLocalContent" @enter="dealEnter" class="contact-search"></Search-input>
                </div>
                <div class="loading-box">
                        <span class="loading-wrapper" v-show="!hasUpdateContact">
                            <i class="loading"></i>
                            <span v-text="'正在更新通讯录...'"></span>
                        </span>
                </div>
                <div class="menu" id="contactMenu">
                    <Accordion show-check="true" @select-item="getSelected"></Accordion>
                    <Waiting-mask :show-waiting="waitingBox"></Waiting-mask>
                </div>
                <div class="info">
                    <span>请勾选需要添加的联系人</span>
                </div>
            </div>
            <div class="right-area float-r">
                <div class="right-top">
                <span class="title">
                    已选择联系人
                </span>
                </div>
                <div class="selected" id="selectedStaffRightBox">
                    <div class="sel-staff" v-for="(staff,index) in selectedStaff" :key="staff.id" v-if="staff.id">
                        <Head-photo :src="staff.icon" size="25" class="select-photo"></Head-photo>
                        <span class="name" v-text="staff.text"></span>
                        <i class="on-hand" @click="deleteStaff(index)"></i>
                    </div>
                </div>

                <div class="btn-group">
                    <span class="cancel on-hand" @click="contactLayer.cancel">取消</span>
                    <span class="confirm on-hand" @click="contactLayer.confirm(selectedStaff)">确定</span>
                </div>
            </div>
        </div>
    </transition>

</template>

<script>
    import SearchInput from './SearchInput.vue'
    import Accordion from './Accordion.vue'
    import {mapMutations} from 'vuex'
    import {mapState} from 'vuex'
    import {mapActions} from 'vuex'
    import {WebChatConst} from '../util/Constant.js'
    import {debounce,Service,transRemote2local} from '../util/Utils.js'
    import SpringLib from '../libs/SpringLib.js'
    import HeadPhoto from '../components/common/HeadPhoto.vue'
    import WaitingMask from '../components/common/WaitingMask.vue'

    let container;
    export default {
        name: 'contactLayer',
        data () {
            return {
                queryCondition: '',
                queryStaffStart:0,
                selectedStaff:[],
                waitingBox:false
            }
        },
        components: {
            SearchInput,
            Accordion,
            HeadPhoto,
            WaitingMask
        },
        mounted(){
            this.$nextTick(function () {
                container = document.getElementById('contactMenu');
                let rightBox = document.getElementById('selectedStaffRightBox');
                let scrollOps = {
                    cursorcolor:"#aaa",
                    cursoropacitymin: 0, // change opacity when cursor is inactive (scrollabar "hidden" state), range from 1 to 0
                    cursoropacitymax: 1,
                    scrollspeed: 90, // scrolling speed
                };
                $(container).niceScroll(scrollOps);
                $(rightBox).niceScroll(scrollOps);
                let scrollDownFunc = debounce( () => {
                    let conWidth = document.getElementById('contactMenu').clientHeight || 370;
                    if (container.scrollTop+Number(conWidth)+5 > container.scrollHeight){
                        //每次触底起始位置加50,再查询50条
                        this.queryStaffStart+=SpringLib.Config.staffLimit;
                        if (this.hasUpdateContact) {
                            this.getLocalDbUserLike({filter:this.queryCondition,start:this.queryStaffStart,isAppend:true});
                        }else{
                            Service.getInstance().post(SpringLib.Config.smpGetStaffListByConUrl, {
                                searchInfo:this.queryCondition,
                                start:this.queryStaffStart,
                                limit:SpringLib.Config.staffLimit,
                                jobcode:this.userInfo.jobcode
                            }).then(res => {
                                if (res && res.data && res.data.isSuccess){
                                    console.log('查询后台通讯录结果返回:',res.data.data);
                                    let resItems = res.data.data || [];
                                    let transItems = transRemote2local(resItems.result);
                                    transItems = this.localDbDepAndStuff.concat(transItems)
                                    this.setLocalDbDepAndStuff(transItems);
                                }
                            });
                        }
                    }
                },300);
                container.addEventListener('scroll', () => {
                    this.queryCondition && scrollDownFunc();
                });
            })
        },
        computed: {
            ...mapState(['contactLayer','localDbDepAndStuff','userInfo','curMiddleView','hasUpdateContact'])
        },
        methods: {
            ...mapMutations(['showContactLayer','setLocalDbDepAndStuff']),
            ...mapActions(['getLocalDbUserLike','getLocalDbDepartment']),
            cancel(){
                this.showContactLayer({show:false});
            },
            searchLocalContent(text){
                //每次输入将滚动条置顶,防止在最下面的时候再次触发触底查询
                container.scrollTop = 0;

                this.queryCondition = text;
                this.queryStaffStart = 0;
                if (this.hasUpdateContact){
                    if (text){
                        this.getLocalDbUserLike({filter:this.queryCondition,start:0});
                    }else{
                        this.getLocalDbDepartment({deptId:1000001});
                    }
                }else{

                }
            },
            getSelected(items){
                this.selectedStaff = items;
            },
            deleteStaff(index){
                this.selectedStaff.splice(index, 1);
            },
            showWaitingBox(flag){
                this.waitingBox=flag;
            },
            dealEnter(){
                if (this.queryCondition =='' || this.queryCondition==undefined) {
                    return;
                }
                if (!this.hasUpdateContact){
                    this.showWaitingBox(true);
                    Service.getInstance().post(SpringLib.Config.smpGetStaffListByConUrl, {
                        searchInfo: this.queryCondition,
                        start:0,
                        limit:SpringLib.Config.staffLimit,
                        jobcode:this.userInfo.jobcode
                    }).then(res => {
                        this.showWaitingBox(false);
                        if (res && res.data && res.data.isSuccess){
                            console.log('查询后台通讯录结果返回:',res.data.data);
                            let resItems = res.data.data || [];
                            let transItems = transRemote2local(resItems.result);
                            this.setLocalDbDepAndStuff(transItems);
                        }
                    }).catch((err)=>{
                        console.log('查询后台通讯录失败:',err);
                        this.showWaitingBox(false);
                    });
                }
            }
        },
        watch:{
            hasUpdateContact:function (val) {
                if (val){
                    if (this.queryCondition){
                        this.getLocalDbUserLike({filter:this.queryCondition,start:0});
                    }else{
                        this.getLocalDbDepartment({deptId:1000001});
                    }
                }
            }
        }
    }

</script>

<style lang='less' scoped>
    @import "../styles/common.less";

    .contactLayer {
        width: 600px;
        height: 470px;
        background-color: #ffffff;
        border-radius: 5px;
        .box-shadow;
        .left-area {
            width: 301px;
            //border-right: 1px solid @common_border_color;
            height: 100%;
            position: relative;
            .left-top {
                background-color: #316db6;
                height: 40px;
                border-top-left-radius: 5px;
                border-right: 1px solid #5c89db;
                overflow: auto;
                .contact-search {
                    margin: 6px auto;
                }
            }
            .loading-box {
                font-size: 12px;
                font-family: "SimSun";
                color: #666;
                text-align: center;
                transition: height .3s linear;
                height: 16px;
                position: absolute;
                left: 106px;
                top: 40px;
                .loading-wrapper {
                    position: relative;
                    .loading {
                        position: absolute;
                        left: -18px !important;
                        .loading(0px, 0px);
                        width: 12px;
                        height: 12px;
                    }
                }
            }
            .menu {
                border-right: 1px solid @common_border_color;
                border-bottom: 1px solid @common_border_color;
                border-left: 1px solid @common_border_color;
                height: 369px;
                position: relative;
                overflow: hidden;
            }
            .info {
                font-size: 12px;
                font-family: "SimSun";
                color: rgb(197, 197, 197);
                span {
                    display: inline-block;
                    height: 60px;
                    line-height: 60px;
                    margin-left: 20px;
                }
            }
        }
        .right-area {
            width: 299px;
            height: 100%;
            border-bottom: 1px solid @common_border_color;
            border-bottom-right-radius: 5px;

            .right-top {
                background-color: #316db6;
                height: 40px;
                border-top-right-radius: 5px;
                .title {
                    font-size: 14px;
                    font-family: "Microsoft YaHei";
                    color: rgb(255, 255, 255);
                    line-height: 40px;
                    margin-left: 20px;
                }
            }
            .selected {
                border-bottom: 1px solid @common_border_color;
                height: 369px;
                .sel-staff {
                    height: 37px;
                    line-height: 37px;
                    position: relative;
                    .select-photo {
                        margin-left: 20px;
                        vertical-align: text-top
                    }
                    .name {
                        vertical-align: middle;
                        font-size: 14px;
                        font-family: "Microsoft YaHei";
                        color: rgb(102, 102, 102);
                        margin-left: 10px;
                        width: 200px;
                        display: inline-block;
                        .text-ellipsis();
                    }
                    i {
                        display: inline-block;
                        width: 16px;
                        height: 16px;
                        background: url("../images/delete_icon.png") center no-repeat;
                        background-size: 16px 16px;
                        position: absolute;
                        right: 20px;
                        top:13px;
                        &:hover{
                            transition: transform 0.5s cubic-bezier(.55, 0, .1, 1);
                            transform: rotate(180deg);
                        }
                    }
                }
            }
            .btn-group {
                font-size: 14px;
                font-family: "Microsoft YaHei";
                margin-left: 120px;
                margin-top: 14px;
                .cancel {
                    display: inline-block;
                    color: rgb(49, 109, 182);
                    &:hover{
                        text-decoration: underline;
                    }
                }
                .confirm {
                    display: inline-block;
                    color: #ffffff;
                    width: 100px;
                    height: 32px;
                    background-color: #316db6;
                    border-radius: 3px;
                    text-align: center;
                    line-height: 32px;
                    margin-left: 26px;
                    &:hover{
                        background-color:#2660a7 !important;
                    }
                }
            }
        }
    }
</style>
