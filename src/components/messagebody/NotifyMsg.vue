<!-- 提醒类消息 (航班调配 Mis航班提醒 FOC航班提醒)
     props:
        title(String):标题
        time(String):时间字符串
        content(String):内容
        showBtn(Boolean):是否显示"签收","疑问"按钮
        done(Boolean):是否点过"签收","疑问"按钮,点过了样式不同
        messageId(String):messageId
        messageUId(String):messageUId用于发送extra消息
        msgId:(String):extra里的msgId用于调用后台签收,疑问接口
        msgType(String):消息类型,用于调用后台签收,疑问接口
-->
<template>
    <div class="notify-msg">
        <div class="notify-title">
            <span class="title-content" v-text="title"></span>
            <span class="title-time" v-text="time">
 <!--               <span class="day">5月13日</span>
                <span class="clock">9:08</span>-->
            </span>
        </div>
        <div class="notify-content">
            <div v-if="content" v-html="content"></div>
            <slot v-else></slot>
        </div>
        <div class="buttons" v-show="showBtn">
            <span :class="{undo:!hasDone}" v-show="!hasDone">
                <span class="sign on-hand" @click="feedbackMcMsg(0)">签收</span>
                <span class="question on-hand" @click="feedbackMcMsg(1)">疑问</span>
            </span>
            <span :class="{done:hasDone}" v-show="hasDone">
                <span class="have-sign">已签收</span>
                <span class="feed-back">已反馈</span>
            </span>
        </div>
    </div>
</template>

<script>
    import TimeTip from '../common/TimeTip.vue'
    import MyButton from '../common/MyButton.vue'
    import {mapMutations} from 'vuex'
    import {mapState} from 'vuex'
    import {Service} from '../../util/Utils.js'
    import SpringLib from '../../libs/SpringLib.js'
    export default {
        name: 'notifyMsg',
        data () {
            return {
                hasDone: this.done
            }
        },
        props: ['title', 'time', 'content', 'showBtn', 'done', 'messageId', 'messageUId', 'msgId', 'msgType'],
        computed: {
            ...mapState(['userInfo'])
        },
        methods: {
            feedbackMcMsg(status){
                if (status == 1) {
                    //
                    this.showMessageBox({
                        show: true,
                        title: '提示',
                        content: '我们将人工与您联系，请保持电话畅通，是否确定发送疑问？',
                        confirm: () => {
                            console.log('调用疑问接口');
                            this.feedbackRemote(status);
                        }
                    });
                } else {
                    this.feedbackRemote(status);
                }

            },
            ...mapMutations(['showMessageBox']),
            feedbackRemote(status){
                Service.getInstance().post(SpringLib.Config.feedbackMcMsgUrl, {
                    psnCode: this.userInfo.staffCode,
                    content: '我有疑问',
                    type: status,
                    msgId: this.msgId,
                    msgType: this.msgType
                }).then(response => {
                    console.log('疑问接口返回', response);
                    let addExtra = JSON.stringify({mcMageRead: 1});

                    if (response.data && response.data.isSuccess) {
                        RongIMLib.RongIMClient.getInstance().setMessageExtra(this.messageUId,addExtra,
                            {
                                onSuccess: () => {
                                    this.hasDone = true;
                                }
                            });
                        this.hasDone = true;
                    }else if ((response.data.message && response.data.message == '不能重复提交反馈消息')){
                        this.showMessageBox({
                            show: true,
                            title: '提示',
                            content: '不能重复提交反馈消息'
                        });
                        RongIMLib.RongIMClient.getInstance().setMessageExtra(this.messageUId,addExtra,
                            {
                                onSuccess: () => {
                                    this.hasDone = true;
                                }
                            });
                        this.hasDone = true;
                    }
                });
            }

        },
        components: {
            TimeTip,
            MyButton
        }
    }


</script>

<style lang="less" scoped>
    @import "../../styles/common.less";

    .notify-msg {
        width: 538px;
        border: 1px solid @common_border_color;
        margin: 20px auto 0 auto;
        border-radius: 5px;
        background: #fff;
        padding-bottom: 10px;
        .notify-title {
            border-bottom: 1px solid @common_border_color;
            height: 34px;
            padding: 0 10px;
            .title-content {
                line-height: 34px;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(69, 75, 85);
                font-weight: bold;

            }
            .title-time {
                font-size: 12px;
                font-family: "SimSun";
                color: rgb(135, 135, 135);
                margin-left: 325px;
                display: inline-block;
            }
        }
        .notify-content {
            padding: 5px 10px;
            font-size: 14px;
            font-family: "Microsoft YaHei";
            color: rgb(102, 102, 102);
            line-height: 1.643;
            display: block;
            word-break: break-all;
        }
        .buttons {
            .btn() {
                width: 60px;
                height: 22px;
                display: inline-block;
                text-align: center;
                line-height: 22px;
                font-size: 12px;
                font-family: "SimSun";
                border-radius: 3px;
            }
            .undo {
                margin-left: 400px;
                margin-top: 10px;
                .sign {
                    .btn();
                    color: #ffffff;
                    background-color: #316db6;
                }
                .question {
                    .btn();
                    margin-left: 5px;
                    color: #ffffff;
                    background-color: #fb674f;
                }
            }
            .done {
                margin-left: 400px;
                margin-top: 10px;
                .have-sign {
                    .btn();
                    color: rgb(166, 156, 154);
                    background-color: #e4e8ef;
                }
                .feed-back {
                    .btn();
                    color: rgb(166, 156, 154);
                    background-color: #fff0ed;
                }
            }

        }
    }

</style>
