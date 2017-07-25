<!-- 搜索框
     props:
        size(Number):宽度大小,不带px
        placeHolder(String):占位内容
-->
<template>
    <div class="search-input" :style="getDivSize">
        <input id="inputBox" v-focus type="text" :placeholder="placeHolder||'搜索'"
               @focus="btnOnFocus"
               @input="searchOn"
               @keyup.self.enter="emitEnter"
               :style="[getInputSize,hideGlass]"
               v-model="searchTxt"
               @blur="btnOnBlur"
        />
        <i class="clean-btn on-hand" v-show="showCleanIcon" @mousedown.prevent="clean"></i>
    </div>
</template>

<script>
    import {debounce} from '../util/Utils.js'
    import {mapState} from 'vuex'
    let search;
    export default {
        name: 'searchInput',
        data () {
            return {
                hideGlass: '',
                searchTxt: '',
                showCleanIcon: false,
            }
        },
        props: ['size','placeHolder'],
        created(){
            search = debounce(function (text,vm) {
                vm.$emit('search-input',text);
            },200)
        },
        computed: {
            ...mapState(['curMiddleView']),
            getDivSize(){
                let defaultWidth = '188px';

                if (this.size) {
                    defaultWidth =this.size+'px'
                }
                return {
                    'width': defaultWidth
                }
            },
            getInputSize(){
                let defaultWidth = '136px';
                let defaultBkPos = '60px 6px';
                if (this.size) {
                    defaultWidth =(this.size - 26 * 2) + 'px';
                    defaultBkPos =(this.size / 2 - 35) + 'px 6px';
                }
                //alert('init:'+ (this.size / 2 - 35) + 'px 6px')

                return  {
                    'width': defaultWidth,
                    'background-position': defaultBkPos
                };

            }
        },
        methods: {
            btnOnFocus(){
                if (this.searchTxt != '') {
                    this.showCleanIcon = true;
                }
                this.hideGlass = {
                    'background-position': '5px 6px !important'
                };
            },
            focusInput(){
                document.getElementById('inputBox').focus();
                //this.searchTxt='';
                //this.$emit('search','');
                //vm.$emit('search-input','');
            },
            btnOnBlur(){
                if (this.searchTxt != '') {
                    this.hideGlass = {
                        'background-position': '5px 6px !important'
                    };
                } else {
                    let size =this.size||188;
                    this.hideGlass = {
                        'background-position': (size / 2 - 35) + 'px 6px !important'
                    };
                    //alert(JSON.stringify(this.hideGlass))
                }
/*                this.hideGlass = {
                    'background-position': '5px 6px !important'
                };*/
                this.showCleanIcon = false;

            },
            clean(){
                this.searchTxt = '';
                this.showCleanIcon = false;
                this.$emit('search-input','');
            },
            searchOn(){
                this.showCleanIcon=true;
                search(this.searchTxt,this);
            },
            emitEnter(){
                this.$emit('enter',this.searchTxt);
            }

        },
        watch:{
            curMiddleView:function () {
                this.searchTxt = '';
            },
            size:function () {
                if(this.searchTxt == ''){
                    let size =this.size||188;
                    this.hideGlass = {
                        'background-position': (size / 2 - 35) + 'px 6px !important'
                    };
                }
            }
        }
    }

</script>

<style lang='less' scoped>
    @import '../styles/common.less';

    .search-input {
        position: relative;

        input {
            outline: none;
            height: 26px;
            border: none;
            width: 136px;
            margin: 0 auto;
            display: block;
            padding: 0 26px;
            border-radius: 12px;
            border: 1px solid #ebebeb;
            background: #f4f6fa url("../images/search_glass_icon.png") no-repeat;
            background-size: 16px 16px;
            font-size: 14px;
            font-family: "Arial";
            color: rgb(51, 51, 51);
            transition: border 0.2s ease;

            &::placeholder {
                text-align: center;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(153, 153, 153);
/*                line-height: 26px;
                vertical-align: middle;*/
            }
            &::-moz-placeholder {
                text-align: center;
            }
            &::-ms-clear {
                display: none;
            }
            &:focus {
                border: 1px solid #316db6;
                background-position: 5px 6px !important;
            }
        }
        .search-glass {
            background: url("../images/search_glass_icon.png") center no-repeat;
            background-size: 16px 16px;
            display: inline-block;
            width: 16px;
            height: 16px;
            position: absolute;
            left: 5px;
            top: 50%;
            margin-top: -8px;
        }
        .clean-btn {
            background: url("../images/input_clean_icon.png") center no-repeat;
            background-size: 16px 16px;
            display: inline-block;
            width: 16px;
            height: 16px;
            position: absolute;
            right: 6px;
            top: 50%;
            margin-top: -8px;
            &:hover {
                background: url("../images/input_clean_icon_hover.png") center no-repeat;

            }
        }

    }
</style>
