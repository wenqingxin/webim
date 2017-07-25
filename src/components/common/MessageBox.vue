<!-- 弹框提示
    props:
        isInput(Boolean):是否有输入框
        title(String):弹框title
 -->
<template>
    <transition name="fade">
        <div class="message-box" v-show="messageBox.show">
            <div class="title">
                <span v-text="messageBox.title"></span>
            </div>
            <div class="content" v-if="!messageBox.isInput">
                <span v-text="messageBox.content"></span>
            </div>
            <div class="input-box" v-if="messageBox.isInput">
                <input type="text" placeholder="请输入群名称" v-focus v-model="newName"/>
            </div>
            <div class="buttons">
                <My-button class="cancel" @btn-click="messageBox.cancel" v-show="messageBox.showCancel"></My-button>
                <My-button class="confirm" text="确定" color="b" @btn-click="messageBox.confirm(newName)"></My-button>
            </div>
        </div>
    </transition>
</template>

<script>
    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    import MyButton from './MyButton.vue'
    export default {
        name: 'messageBox',
        data () {
            return {
                newName:''
            }
        },
        props:['isInput','title'],
        methods: {
            ...mapMutations(['showMessageBox']),
        },
        computed:{
            ...mapState(['messageBox'])
        },
        components:{
            MyButton
        },
        watch:{
            'messageBox.show':{
                handler:function (val) {
                    if (!val){
                        this.newName = '';
                    }else{
                        this.newName = this.messageBox.value;
                    }
                }
            }
        }

    }


</script>

<style lang="less" scoped>
    @import "../../styles/common.less";
    .message-box{
        height: 200px;
        width: 350px;
        .box-shadow;
        border-radius: 5px;
        background-color: #fff;
        overflow: hidden;
        position: relative;

        .title{
            height: 35px;
            background-color: @common_blue;
            span{
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(255, 255, 255);
                margin-left: 20px;
                line-height: 35px;
            }
        }
        .content{
            height: 113px;
            display: flex;
            align-items: center;
            text-overflow: ellipsis;
            overflow: hidden;
            span {
                margin-left: 20px;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(102, 102, 102);
            }
        }
        .input-box{
            margin-left: 20px;
            margin-top: 30px;
            input{
                outline: none;
                border-radius: 3px;
                border: 1px solid @common_border_color;
                width: 308px;
                height: 30px;
                font-size: 14px;
                padding-left: 10px;
                font-family: "Arial";
                color: rgb(51, 51, 51);
                .place-holder(){
                    font-size: 14px;
                    font-family: "Microsoft YaHei";
                    color: rgb(153, 153, 153);
                    //text-indent:10px ;
                }
                &::placeholder{.place-holder();}
                &::-moz-placeholder{.place-holder();}
                &:-ms-input-placeholder{.place-holder();}
                &::-webkit-input-placeholder{.place-holder();}

            }
        }
        .buttons{
            .cancel{
                position: absolute;
                bottom: 20px;
                right: 130px;
            }
            .confirm{
                position: absolute;
                bottom: 20px;
                right: 20px;
            }
        }
    }
</style>
