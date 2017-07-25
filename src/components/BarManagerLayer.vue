<!-- 菜单管理弹框 -->
<template>
    <transition name="fade">
        <div class="barManager" v-show="barManager">
            <div class="title">
                <span>界面管理</span>
                <i class="on-hand" @click="close"></i>
            </div>
            <div class="bars" >
                <draggable v-model="myBars" :options="sortOptions">
                    <div class="bar" v-for="(bar,index) in myBars" :key="index">
                        <i :class="bar.class"></i>
                        <span class="bar-name" v-text="bar.text"></span>
                    </div>
                </draggable>
            </div>
            <div class="operation">
                <span class="drag-tip">
                    拖动列表项调整位置
                </span>

                <span class="confirm on-hand" @click="confirm">
                    确定
                </span>
            </div>
        </div>
    </transition>
</template>

<script>
    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    import {WebChatConst} from '../util/Constant.js'
    import draggable from 'vuedraggable'
    import CheckBox from './common/CheckBox.vue'
    import Draggabilly from 'Draggabilly'
    export default {
        name: 'barManagerLayer',
        data () {
            return {
                selected: {
                    hisCon: false,
                    flight: false,
                    ground: false,
                    hisGrp: false,
                    user: false,
                    contact: false,
                    notify: false
                },
                sortOptions:{
                    animation: 100,
                    chosenClass:'chosen',
                    ghostClass:'ghost',
                },
                myBars:[],
                left:0,
                top:0,
                startDrag:false
            }
        },
        mounted(){
            let obj = document.getElementsByClassName('barManager')[0];
            var draggie = new Draggabilly( obj, {
                // options...
                handle:'.title'
            });
        },
        computed: {
            ...mapState(['barManager','userInfo']),
            getPosition(){
                return {
                    left:this.left+'px',
                    top:this.top+'px'
                }
            }
        },
        components: {
            CheckBox,
            draggable
        },
        watch:{
            barManager:function (val) {
                let barsState = this.userInfo && this.userInfo[WebChatConst.webChatBarOrder];
                if(val){
                    if (barsState){
                        Object.assign(this.myBars,barsState);
                    }else{
                        //初始化
                        this.myBars = WebChatConst.BarOrderList;
                    }

                }
            }
        },
        methods: {
            ...mapMutations(['showBarManager','setUserInfo']),
            dragStart(e){
                this.startDrag = true;
                let event = window.event || e;
                this.left = event.target.offsetLeft;
                this.top = event.target.offsetTop;
                console.log('dragStart'+' '+this.left+' '+this.top);
            },
            drag(e){
                let event = window.event || e;
                let left = event.target.offsetLeft;
                let top = event.target.offsetTop;
                console.log('dragStart'+' '+left+' '+top);
            },
            dragend(){
                this.startDrag = false;
            },
            close(){
                this.showBarManager(false);
            },
            confirm(){
                this.$set(this.userInfo,WebChatConst.webChatBarOrder,this.myBars);
                this.setUserInfo(this.userInfo);
                this.close();
            }
        }
    }


</script>

<style lang="less" scoped>
    @import "../styles/common.less";

    .barManager {
        border-radius: 5px;
        height: 369px;
        width: 300px;
        background-color: #ffffff;
        position: relative;
        .chosen {
            background-color: #fff;
        }
        .ghost {
            background-color: #d3e7ff;
        }
        .box-shadow;
        .title {
            height: 35px;
            background-color: @common_blue;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
            position: relative;
            span {
                margin-left: 20px;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(255, 255, 255);
                line-height: 35px;
            }
            i {
                background: url(../images/close_icon.png) center no-repeat;
                display: inline-block;
                width: 16px;
                height: 16px;
                background-size: 16px 16px;
                position: absolute;
                right: 10px;
                top: 10px;
            }
        }
        .bars {
            .bar {
                height: 38px;
                border-top: 1px solid @common_border_color;
                position: relative;
                .ckb {
                    position: absolute;
                    top: 11px;
                    left: 20px;
                }
                .bar-name {
                    margin-left: 55px;
                    line-height: 38px;
                    font-size: 14px;
                    font-family: "Microsoft YaHei";
                    color: rgb(102, 102, 102);
                }
                &:last-child {
                    border-bottom: 1px solid @common_border_color;
                }
                cursor: move;
            }
            .icon(@url,@w,@h) {
                display: inline-block;
                width: @w/1.5;
                height: @h/1.5;
                background: @url center no-repeat;
                background-size: @w/1.5 @h/1.5;
                position: absolute;
                top:50%;
                left:20px;
                margin-top: -@h/1.5/2;
            }
            .history-con-icon {
                .icon(url(../images/history_con_bar_icon_man.png), 24px, 25px);
            }

            .flight-group-icon {
                .icon(url(../images/flight_group_con_icon_man.png), 26px, 25px);
            }

            .ground-group-icon {
                .icon(url(../images/groundserv_bar_icon_man.png), 22px, 26px);
            }

            .notice-icon {
                .icon(url(../images/notice_bar_icon_man.png), 22px, 24px);
            }

            .history-group-icon {
                .icon(url(../images/history_flt_bar_icon_man.png), 24px, 24px);
            }

            .user-group-icon {
                .icon(url(../images/user_bar_icon_man.png), 24px, 23px);
            }

            .contact-icon {
                .icon(url(../images/contact_bar_icon_man.png), 24px, 26px);
            }

        }
        .operation {
            height: 60px;
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            .drag-tip {
                line-height: 60px;
                font-size: 12px;
                font-family: SimSun;
                color: #c5c5c5;
                margin-left: 20px;
            }

            .confirm {
                display: inline-block;
                width: 100px;
                height: 32px;
                background-color: #316db6;
                text-align: center;
                line-height: 32px;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(255, 255, 255);
                border-radius: 3px;
                position: absolute;
                right: 20px;
                top: 14px;
            }
        }

    }
</style>
