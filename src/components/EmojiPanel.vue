<!-- 表情面板 -->
<template>
    <transition name="fade">
        <div class="emoji-panel" v-show="emojiPanel">
            <i class="arr-down"></i>
            <ul class="emoji-list">
                <li class="emoji" v-for="emoji in pageEmojiList()" @click="selectEmoji(emoji.text)">
                    <img :src="require('../images/emotion/'+emoji.name+'.png')" alt="emoji.text">
                </li>
            </ul>
            <div class="swipe-bar">
                <i class="dot" v-for="i in sumPages" :class="{active:isActive(i)}" @click.stop="swipe(i)"></i>
            </div>
        </div>
    </transition>
</template>

<script>
    import {mapState} from 'vuex'

    export default {
        name: 'app',
        data () {
            return {
                emojiList:require('../images/emotion/emotion.json'),
                start:0,
                size:72
            }
        },
        computed:{
            ...mapState(['emojiPanel']),
            sumPages(){
                return Math.ceil(this.emojiList.length/this.size);
            },
        },
        methods: {
            swipe(pageIndex){
                this.start = Number(this.size) * (Number(pageIndex)-1);
            },
            isActive(index){
                return index == Number(this.start) / Number(this.size) + 1;
            },
            pageEmojiList(){
                return this.emojiList.slice(this.start,Number(this.start)+Number(this.size));
            },
            selectEmoji(emojiTxt){
                this.$emit('select-emoji',emojiTxt);
            }
        }
    }


</script>

<style lang="less" scoped>
    @import "../styles/common.less";
    .emoji-panel{
        height: 230px;
        width: 405px;
        .box-shadow;
        background-color: #ffffff;
        position: relative;
        border-radius: 5px;
        z-index: 20;
        .arr-down{
            display: inline-block;
            border: 10px solid transparent;
            border-top:10px solid #ffffff;
            position: absolute;
            bottom: -20px;
            left: 193px;
        }
        .emoji-list{
            list-style: none;
            margin: 0;
            padding: 20px;
            padding-bottom: 0;
            .emoji{
                text-align: center;
                display: inline-block;
                margin: 1px 2px;
                img{
                    height: 26px;
                    width: 26px;
                    .on-hand;
                }
            }

        }
        .swipe-bar{
            text-align: center;
            position: absolute;
            width: 100%;
            bottom: 10px;
            .active{
                background-color: #aaaaaa !important;
            }
            .dot{
                display: inline-block;
                border-radius: 50%;
                width: 6px;
                height: 6px;
                background-color: #dcdcdc;
                vertical-align: middle;
                .on-hand;
                margin: 0 3px;
            }
        }
    }
</style>
