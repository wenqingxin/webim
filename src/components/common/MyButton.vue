<!-- 按钮
    props:
        text:(String):按钮内容
        color(String):背景颜色
-->
<template>
    <div class="button">
        <span class="on-hand" :class="{'blue':color=='b','white':color!='b'}" @click="click" v-text="text||'取消'"></span>
    </div>
</template>

<script>
    export default {
        name: 'myButton',
        data () {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        },
        props:['text','color'],
        methods: {
            click(){
                this.$emit('btn-click')
            }
        }
    }


</script>

<style lang="less" scoped>
    @import "../../styles/common.less";
    .button{
        display: inline-block;
        .btn(){
            font-size: 14px;
            font-family: "Microsoft YaHei";
            text-align: center;
            display: inline-block;
            border-radius: 3px;
        }
        .white{
            height: 30px;
            line-height: 30px;
            width: 98px;
            border: 1px solid @common_border_color;
            background-color: #ffffff;
            .btn();
            color: rgb(49, 109, 182);
        }
        .blue{
            height: 32px;
            line-height: 32px;
            width: 100px;
            background-color: #316db6;
            .btn();
            color: rgb(255, 255, 255);
            &:hover{
                background-color:#2660a7 !important;
            }
        }
    }
</style>
