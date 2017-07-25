<!-- 蒙层
    props:
        isBlack(Boolean):是否显示黑色蒙层
-->
<template>
    <transition name="fade">
        <div class="mask-layer" v-show="maskLayer.show" :style="bgStyle">

        </div>
    </transition>
</template>

<script>
    import {mapState} from 'vuex'
    export default {
        name: 'maskLayer',
        computed:{
            ...mapState(['maskLayer']),
            bgStyle(){
                return {
                    //'background-color': '#333',
                    'z-index':this.maskLayer.zIndex
                }

            }
        },
        props:['isBlack']
    }

</script>

<style lang='less' scoped>
    @import "../styles/common.less";
    .mask-layer{
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        //background-color: #333;
        opacity: 0.7;
        z-index:25;
    }
</style>
