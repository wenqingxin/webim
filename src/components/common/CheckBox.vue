<!-- 多选框
    props:
        selected(boolean):是否被选中
 -->
<template>
    <div class="check-box" :class="{active:selected,disable:disable}" @click="select">
        <i></i>
    </div>
</template>

<script>
    export default {
        name: 'checkBox',
        props:['selected','disable'],
        methods: {
            select(){
                !this.disable && this.$emit('select');
            }
        }
    }

</script>

<style lang='less' scoped>
    @import "../../styles/common.less";
    .check-box{
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 2px;
        border: 1px solid rgb(153, 153, 153);;
        vertical-align: middle;
    }
    .disable{
        .active;
        background-color: #cccccc !important;
        border: none!important;
        width: 18px!important;
        height: 18px!important;
        i{
            top: 5px!important;
            left: 3px!important;
        }
    }
    .active{
        background-color: @common_blue;
        width: 16px;
        height: 16px;
        position: relative;
        border: 1px solid transparent;
        i{
            display: inline-block;
            width: 12px;
            height: 8px;
            background: url(../../images/check_box.png) center no-repeat;
            background-size: 12px 8px;
/*            border-left: 2px solid #ffffff;
            border-bottom:2px solid #ffffff;
            transform: rotate(-45deg);*/
            position: absolute;
            top: 4px;
            left: 2px;
        }
    }
</style>
