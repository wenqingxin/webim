<!-- 各个群类型的头像图标
        src(String):图片的相对url地址
        alt(String):图片占位字符串
        bgColor(String):头像的背景颜色
        imgWidth(Number):图片的宽度
        imgHeight(Number):图片的高度
-->
<template>
    <div class="group-head-photo" :style="{'background-color':bgColor}">
        <img :src="src" :alt="alt" :style="imgStyle">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'iconHeadPhoto',
        data () {
            return {}
        },

        props: ['src', 'alt','bgColor','imgWidth','imgHeight'],
        computed:{
            imgStyle(){
                return {
                    'margin-top': (-this.imgHeight/2) + 'px',
                    'margin-left': (-this.imgWidth/2) + 'px',
                    'width':this.imgWidth + 'px',
                    'height':this.imgHeight + 'px'
                }
            }
        }
    }

</script>

<style lang='less' scoped>
    .group-head-photo {
        text-align: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        position: relative;
        img {
            width: 26px;
            height: 25px;
            position: absolute;
            top: 50%;
            left: 50%;
        }

    }
</style>
