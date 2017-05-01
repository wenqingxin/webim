<template>
    <div class="aside-bar">
        <router-link to="/chatList">
            <div class="bubble-chat" @click="swipeOut">
                <Badge count="3" >
                    <i></i>
               </Badge>
            </div>
        </router-link>
        <router-link to="/contactList">
            <div class="bubble-contact" @click="swipeOut">
                <i></i>
            </div>
        </router-link>

        <Poptip placement="right" class="bubble-add" >
            <div class="add-btn" >
                <i></i>
            </div>
            <div class="api" slot="content" v-show="showAddDiv">
                <h2>添加</h2>
                <router-link to="searchBox" class="btn-addGroup">
                    <Button type="ghost" class="add-item" @click="">航班群</Button>
                </router-link>
                <router-link to="searchBox" class="btn-addGroup">
                    <Button type="ghost" class="add-item" @click="">用户群</Button>
                </router-link>
                <router-link to="searchBox" class="btn-addGroup">
                    <Button type="ghost" class="add-item" @click="">通讯录</Button>
                </router-link>
                <router-link to="searchBox" class="btn-addGroup">
                    <Button type="ghost" class="add-item" @click="">常用联系人</Button>
                </router-link>

            </div>
        </Poptip>


        <div class="bubble-swipe" @click="swipeOutToggle">
            <Icon class="icon-one" type="navicon"></Icon>
        </div>
    </div>
</template>
<script>
    import store from '../../../store/store';
    export default {
        data(){
            return {
                showAddDiv:true
            }
        },
        methods: {
            swipeOutToggle(){
               store.commit('swipeOutToggle');
           },
            swipeOut(){
                store.commit('swipeOut');

            }
        }
    }
</script>
<style scoped lang="less">
    .aside-bar {
        position: relative;
        .bubble(@url,@url_hover) {
            text-align: center;
            i {
                display: inline-block;
                width: 68px;
                height: 60px;
                background: @url center no-repeat;
                transform: scale(.5, .5);
                &:hover {
                    background: @url_hover center no-repeat;
                    transform: scale(.5, .5);
                    cursor: pointer;
                }
            }

        }
        .bubble-chat {
            margin-top: 15px;
            .bubble(url(../../images/icons_chat_bubble_1.png),url(../../images/icons_chat_bubble_2.png));

        }
        .bubble-contact {
            .bubble(url(../../images/icons_contact_bubble_1.png),url(../../images/icons_contact_bubble_2.png));

        }
        .bubble-add {
            .bubble(url(../../images/icon_add.png),'');
            position: absolute;
            bottom: 70px;
            .add-btn{
                transition: transform 0.2s linear;
                &:hover {
                    transform:  scale(1.4, 1.4);
                    cursor: pointer;
                }
            }

        }
        .bubble-swipe{
            width: 68px;
            text-align: center;
            font-size: 38px;
            position: absolute;
            bottom: 20px;
            color: #fff;
            transition: transform 0.2s linear;
            &:hover {
                transform:translateX(-2px)  rotate(90deg);
                cursor: pointer;
            }
        }
    }
</style>