<!-- 主view 加载页面所有组件 -->
<template>
    <transition name="fade">
        <div id="index" class="clearfix" :class="{maximize:maximize}" v-show="!minimizeOps.show" >

            <!-- 页面主体 -->
            <left-bar class="float-l"></left-bar>
            <middle-box class="float-l"></middle-box>
            <right-window class="float-l"></right-window>
            <!-- 弹出层 -->
            <Contact-layer class="contact-layer" v-if="contactLayer.show"></Contact-layer>
            <Bar-manager-layer class="manager-layer"></Bar-manager-layer>
            <Profile-layer class="profile-layer"></Profile-layer>
            <Mask-layer></Mask-layer>
            <Group-message-box class="group-message-box"></Group-message-box>
            <Message-box class="message-box" is-input="true"></Message-box>
            <Image-viewer></Image-viewer>
            <Context-menu v-show="contextMenu.show"></Context-menu>

        </div>
    </transition>

</template>
<script>
    import leftBar from './child/leftBar.vue'
    import middleBox from './child/middleBox.vue'
    import rightWindow from './child/rightWindow.vue'
    import ContactLayer from '../components/ContactLayer.vue'
    import MaskLayer from '../components/MaskLayer.vue'
    import BarManagerLayer from '../components/BarManagerLayer.vue'
    import ProfileLayer from '../components/ProfileLayer.vue'
    import GroupMessageBox from '../components/common/GroupMessageBox.vue'
    import MessageBox from '../components/common/MessageBox.vue'
    import ContextMenu from '../components/ContextMenu.vue'
    import ImageViewer from '../components/common/ImageViewer.vue'
    import {mapState} from 'vuex'
    import {mapActions} from 'vuex'
    import {mapMutations} from 'vuex'
    import {mapGetters} from 'vuex'
    import {getLocalUserArr} from '../util/Utils.js'
    import {WebChatConst} from '../util/Constant.js'
    import SpringLib from '../libs/SpringLib.js'
    import {Service,dataAccess} from '../util/Utils.js'
    import {uploadFile} from '../util/RongUpload.js'

    export default {
        name:'index',
        methods: {
            ...mapActions(['initRong','queryGroupList','getQiuNiuFileToken','getDiscussName']),
            ...mapMutations(['showUpdatingContact','showConnectInfo','showAsideBar','setUpdateContact']),
        },
        mounted(){
            //初始化融云
            this.$nextTick(function () {
                if (this.userInfo.token){
                    this.initRong().then(()=>{
                        this.queryGroupList();//拉取加入的群组
                        console.log('开始拉取通讯录...');
                        SpringLib.DBUtil.init(this.userInfo.staffId) &&
                        dataAccess.getContactsFromRemote().then( ()=> {
                                console.log('同步通讯录成功');
                                this.setUpdateContact(true);
                                this.showConnectInfo({show:true,msg:'通讯录更新成功',loading:false});
                                setTimeout(()=>{
                                    this.getDiscussName();
                                },100)
                        }).catch(err=> {
                            if (err == -1) {
                                    //有其他进程在更新通讯录
                                    this.showConnectInfo({show:true,msg:'通讯录已在更新中',loading:true});
                                } else {
                                    console.log('更新通讯录出错',err);
                                    this.showConnectInfo({show:true,msg:'更新通讯录出错',loading:false});
                                }
                                this.setUpdateContact(true);
                                setTimeout(()=>{
                                    this.getDiscussName();
                                },100)
                        });
                    });
                }
            });
        },
        computed: {
            ...mapState(['minimizeOps','userInfo','contactLayer','contextMenu','maximize']),
            //...mapGetters(['getHistoryCon'])
        },
        components: {
            leftBar,
            middleBox,
            rightWindow,
            ContactLayer,
            MaskLayer,
            BarManagerLayer,
            ProfileLayer,
            GroupMessageBox,
            MessageBox,
            ContextMenu,
            ImageViewer

        }
    }
</script>
<style lang="less" scoped>
    @import "../styles/common.less";
    .maximize{
        width: 100% !important;
        height: 100% !important;
         top: 0 !important;
         left: 0 !important;
         margin-top: 0 !important;
         margin-left:0 !important;
    }
    #index {
        width: 900px;
        height: 600px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -300px;
        margin-left: -450px;

        .layer() {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 30;
        }
        .contact-layer {
            .layer();
            margin-left: -300px;
            margin-top: -235px;
        }
        .manager-layer {
            .layer();
            margin-left: -150px;
            margin-top: -180px;
        }
        .profile-layer {
            position: absolute;
            top: 20px;
            left: 70px;
            z-index: 30;

        }
        .group-message-box {
            position: absolute;
            top: 200px;
            left: 50%;
            margin-left: -175px;
            border-radius: 5px;
            z-index: 130;

        }
        .message-box {
            position: absolute;
            top: 200px;
            left: 50%;
            margin-left: -175px;
            border-radius: 5px;
            z-index: 130;

        }
        &:hover {
            cursor: default;
        }
    }
</style>