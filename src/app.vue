<template>
    <div class="web-chat-app" @click="clearScreen" >
        <router-view></router-view>
        <!-- 最小化工具条 -->
        <Minimize></Minimize>
    </div>
</template>
<script>
    import {mapMutations} from 'vuex'
    import {mapState} from 'vuex'
    import Minimize from './components/MinimizeBar.vue'
    export default {
        data () {
            return {

            }
        },
        computed:{
            ...mapState(['contextMenu','emojiPanel','profileLayer'])
        },
        methods: {
            ...mapMutations(['showContextMenu','showEmojiPanel','showProfileLayer']),
            clearScreen(){
                this.contextMenu.show && this.showContextMenu({show:false});
                 this.emojiPanel && this.showEmojiPanel(false);
                 this.profileLayer && this.showProfileLayer(false);
            }
        },
        components:{
            Minimize
        }
    }
</script>
<style>
    @import 'styles/common.less';
    html,body{
        margin: 0;
        padding: 0;
        height: 100%;
        background: url("./images/background.png") fixed center no-repeat;
        background-size: cover;
    }
    .web-chat-app{
        height: 100%;
    }
</style>