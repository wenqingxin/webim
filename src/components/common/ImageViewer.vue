<!-- 图片预览组件 -->
<template>
    <transition name="fade">
        <div class="image-viewer" v-if="imageViewer.show" @click="close($event)">
            <div class="mask"></div>
            <img :src="imageViewer.src" alt="图片预览"/>
            <i class="close-view" @click="showImageViewer({show:false})"></i>
        </div>
    </transition>
</template>

<script>
    import {mapState} from 'vuex'
    import {mapMutations} from 'vuex'
    export default {
        name: 'imageViewer',
        data () {
            return {
                msg: 'Welcome to Your Vue.js App'
            }
        },
        computed:{
            ...mapState(['imageViewer'])
        },
        methods:{
            ...mapMutations(['showImageViewer']),
            close(e){
                e = e || window.event;
                if(e.target.tagName!='IMG'){
                    this.showImageViewer({show:false});
                }
            }
        }
    }


</script>

<style lang="less" scoped>
    @import "../../styles/common.less";
    .full-screen(){
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
    .image-viewer{
        z-index:100;
        .mask{
            .full-screen();
            background-color: #333;
            opacity: 0.9;
        }
        .full-screen();
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        img{
            display: block;
            margin: auto;
            position: relative;
            opacity: 1;
            z-index: 120;
        }
        .close-view{
            display: inline-block;
            position: fixed;
            top:0px;
            right: 0px;
            width: 20px;
            height: 20px;
            background: url(../../images/close_icon.png) center no-repeat;
            background-size: contain;
            .on-hand;
            z-index: 120;
        }
    }
</style>
