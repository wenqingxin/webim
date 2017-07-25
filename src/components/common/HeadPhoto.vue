<!-- 人物头像组件
    props:
        src(String):icon名称
        alt(String):加载失败占位字符串
        size(Number):图片宽高 不带'px'
        type(String):图片的类型,类型不同,src为空的情况的下默认头像样式有小差异
-->
<template>
    <div class="head-photo" :style="getSize" @click="emitClick">
        <img v-if="successSrc" class="img-p" :src="successSrc" :style="getSize">
        <span v-else  class="img-p" :class="getDefaultBk" :style="getSize"></span>
        <slot></slot>
    </div>
</template>

<script>
    import SpringLib from '../../libs/SpringLib.js'

    export default {
        name: 'headPhoto',
        data () {
            return {
                successSrc :'',
            }
        },

        computed:{
            getSize(){
                let style = {};
                if (this.size){
                    style = {
                        width:this.size+'px',
                        height:this.size+'px',
                        'background-size': this.size * (16/25) +'px '+  this.size * (20/25)+'px',
                        'background-position': this.size * (5/25)+'px '+  this.size * (3/11)+'px'
                    };
                }
                return style;
            },
            getDefaultBk(){
                if(this.type == 'login'){
                    return 'bk-login'
                }
                if(this.type == 'left-bar'){
                    return 'bk-left-bar'
                }
                if(this.type == 'profile-layer'){
                    return 'profile-layer'
                }
                if(this.type == 'profile-panel'){
                    return 'profile-panel'
                }
                if(this.type == 'search-res'){
                    return 'search-res'
                }
                if(this.type == 'aside'){
                    return 'aside'
                }
                else{
                    return 'bk-other'
                }
            }
        },
        mounted(){
          this.$nextTick(function () {
              this.loadImg(this.src);
          })  
        },
        watch:{
            src:{
                handler: function (val, oldVal) {
                    this.loadImg(val);
                }
            }
        },
        props:['src','alt','size','type'],
        methods: {
            loadImg(url){
                if (!url){
                    this.successSrc = '';
                }else{
                    url = SpringLib.Config.smpServerUrl+SpringLib.Config.smpDownloadFileUrl+"/photo/b_"+url;

                    let img = new Image();
                    img.onload =  () => {
                        //alert('成功');
                        //console.log('获取图片成功 '+url);
                        if (url!=this.successSrc){
                            this.successSrc = url;
                        }
                    };
                    img.onerror =  () => {
                        //alert('失败');
                        this.successSrc = '';
                        //console.log('获取图片失败  '+url);
                    };
                    img.src = url;
                }
            },
            emitClick(){
                this.$emit('h-click')
            }
        }
    }

</script>

<style lang='less' scoped>
    .head-photo{
        @img_width:50px;
        @img_height:50px;
        display: inline-block;
        text-align: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        position: relative;

        .img-p{
            width: 50px;
            height: 50px;
            position: absolute;
            top: -1px;
            left: -1px;
            border: none;
            border-radius: 50%;
        }
        .bk-login{
            background: #d3e7ff url('../../images/login_head_icon.png') @img_width * (5/25) @img_height * (5/25) no-repeat;
            background-size: @img_width * (16/25)  @img_height * (20/25);
        }
        .bk-left-bar{
            background: #d3e7ff url('../../images/left_bar_head.png') center no-repeat;
            background-size: 34px 39px!important;
            background-position: 8px 9px !important;
        }
        .profile-layer{
            background: #d3e7ff url('../../images/profile_layer_head.png') center no-repeat;
            background-size: 63px 70px !important;
            background-position: 14px 19px!important;

        }
        .profile-panel{
            background: #d3e7ff url('../../images/profile_panel_head.png') center no-repeat;
            background-size: 75px 86px !important;
            background-position: 18px 23px !important;
        }
        .search-res{
            background: url('../../images/search_res_head.png') center no-repeat !important;
            background-size: 38px 38px !important;
        }
        .aside{
            background: url('../../images/aside_head.png') center no-repeat !important;
            background-size: 25px 25px !important;
        }
        .bk-other{
            background: #d3e7ff url('../../images/left_bar_head.png') @img_width * (5/25) @img_height * (5/25) no-repeat;
            background-size: @img_width * (16/25)  @img_height * (20/25);
        }



    }
</style>
