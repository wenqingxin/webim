<template>
    <div class="contact-list-box">
        <router-link to="groupList">
            <div class="contact-item">
                <i class="contact-item-icon-flight"></i>
                <span class="contact-item-text">航班群</span>
            </div>
        </router-link>

        <div class="contact-item">
            <router-link to="groupList">
                <i class="contact-item-icon-user"></i>
                <span class="contact-item-text">用户群</span>
            </router-link>

        </div>
        <div class="contact-item">
            <i class="contact-item-icon-con"></i>
            <span class="contact-item-text">通讯录</span>
        </div>
        <div class="contact-item">
            <router-link to="groupList">
                <i class="contact-item-icon-common"></i>
                <span class="contact-item-text">常用联系人</span>
            </router-link>

        </div>
    </div>

</template>
<script>
    export default {
        data(){
            return {
                value1:''
            }
        },
        methods: {}
    }
</script>
<style scoped lang="less">
    .contact-list-box{
        @common_width:270px;
        .be-center(){
            width: @common_width;
            margin: 10px auto;
        }
        .contact-item{
            height: 55px;
            border-bottom: 1px solid rgb(225,233,241);
            .be-center();
            @item_height:50px;
            .contact-item-icon(@url){
                margin-left: 20px;
                display: inline-block;
                width: @item_height;
                height: @item_height;
                background:@url  center no-repeat;
                vertical-align: middle;

            }
            .contact-item-icon-flight{
                .contact-item-icon(url(../../images/group_flight.png));
            }
            .contact-item-icon-user{
                .contact-item-icon(url(../../images/group_normal.png));
            }
            .contact-item-icon-con{
                .contact-item-icon(url(../../images/contact.png));
            }
            .contact-item-icon-common{
                .contact-item-icon(url(../../images/favorite.png));
            }
            .contact-item-text{
                display: inline-block;
                height: @item_height;
                line-height: @item_height;
                text-indent: 10px;
                font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
                font-size: 16px;
                vertical-align: middle;
            }
        }
    }

</style>