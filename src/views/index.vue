<template>
    <div class="chat" id="chat" >
        <chat-aside class="aside-box"></chat-aside>
        <div class="chat-list" :class="{'chat-list-hide':!isSwipeOut}">
            <router-view ></router-view>
        </div>
        <chat-body class="chat-body" :class="{'chat-body-long':!longChatBody}">
        </chat-body>
    </div>
</template>
<script>
    import chatAside from './chatside/chatAside.vue'
    import chatBody from './chatbody/chatBody.vue'
    import store from '../../store/store';

    export default {
        data(){
            return {
            }
        },
        created(){

        },
        components:{
            chatAside,
            chatBody
        },
        computed: {
            isSwipeOut(){
                return store.state.chat.isSwipeOut;
            },
            longChatBody(){
                return store.state.chat.longChatBody;
            }
        }
    }
</script>
<style scoped lang="less">
    .item1 {
        height: 10px;
        background-color: red;
    }

    .item2 {
        height: 10px;
        background-color: green;
    }

    .item3 {
        height: 10px;
        background-color: blue;
    }

    .chat {
        height: 100%;
        position: relative;
        @aside_bar_width: 70px;
        @chat_list_width: 314px;
        .aside-box{
            width: @aside_bar_width;
            background-color: #753a88;
            position: absolute;
            height: 100%;
            z-index:999;
        }
        .chat-list-hide{
            transform:translateX(-@chat_list_width)!important;
        }
        .chat-list {
            width: @chat_list_width;
            transform:translateX(@aside_bar_width) ;
            background-color: rgb(244,248,252);
            position: absolute;
            height: 100%;
            transition:transform .15s linear;

        }
        .chat-body-long{
            margin-left: @aside_bar_width + @chat_list_width !important;
        }
        .chat-body {
            height: 100%;
            margin-left: @aside_bar_width;
            transition:margin-left .15s linear;
        }

    }
</style>