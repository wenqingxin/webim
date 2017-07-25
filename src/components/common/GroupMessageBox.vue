<!-- 群组退出的提示框 -->
<template>
    <transition name="fade">
        <div class="group-message-box" v-show="groupMessageBox.show">
            <div class="notify-title">
                <Icon-head-photo class="mes-head-photo"
                                 :src="getGroupIcon.icon"
                                 :bg-color="getGroupIcon.color"
                                 img-width="27"
                                 img-height="26"
                                 >
                </Icon-head-photo>
                <span class="title" v-text="groupMessageBox.title">产品部</span>
            </div>
            <div class="notify-content">
                <span class="message" v-text="groupMessageBox.msg">退出群组后，你将不会收到来自该群组的任何消息，确定退出群组？</span>
            </div>
            <div class="buttons">
                <My-button class="cancel on-hand"  @btn-click="groupMessageBox.cancel"></My-button>
                <My-button class="confirm on-hand" text="确定" color="b" @btn-click="groupMessageBox.confirm"></My-button>
            </div>
        </div>
    </transition>
</template>

<script>
    import MyButton from './MyButton.vue'

    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    import {mapGetters} from 'vuex'
    import {WebChatConst} from '../../util/Constant.js'

    import IconHeadPhoto from './IconHeadPhoto.vue'
    export default {
        name: 'groupMessageBox',
        data () {
            return {
            }
        },
        components:{
            IconHeadPhoto,
            MyButton
        },
        computed:{
            ...mapState(['groupMessageBox','rightWindowData']),
            ...mapGetters(['getGroupIcon'])
        },
        methods: {
            ...mapMutations(['showGroupMessageBox'])

        }
    }


</script>

<style lang="less" scoped>
    @import "../../styles/common.less";
    .group-message-box{
        height: 200px;
        width: 400px;
        .box-shadow;
        background-color: #fff;
        position: relative;
        .notify-title{
            margin-top: 21px;
            margin-left: 20px;
            .mes-head-photo{
                vertical-align: middle;
                margin-right: 8px;
                display: inline-block;
            }
            .title{
                font-size: 16px;
                font-family: "Microsoft YaHei";
                color: rgb(69, 75, 85);
                vertical-align: middle;
                line-height: 50px;
            }
        }
        .notify-content{
            margin-left: 20px;
            margin-right: 20px;
            margin-top: 9px;
            height: 66px;
            .message{
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(102, 102, 102);
            }
        }
        .buttons{
            .btn(){
                position: absolute;
                bottom: 20px;
                border-radius: 3px;
            }
            .cancel{
                .btn();
                right: 130px;
            }
            .confirm{
                .btn();
                right: 20px;
                &:hover{
                    background-color:#2660a7 !important;
                }
            }
        }
    }
</style>
