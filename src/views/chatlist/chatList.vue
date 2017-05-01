<template>
    <div class="chat-list-box">

            <div class="contact-item">
                <Badge count="3">
                    <span class="contact-item-photo"></span>
                </Badge>

                <span class="contact-item-from-user">温庆心</span>
                <span class="contact-item-message">哈哈~</span>
                <span class="contact-item-time">19:15</span>
            </div>

    </div>

</template>
<script>
    import store from '../../../store/store'
    export default {
        methods: {

        }
    }
</script>
<style scoped lang="less">
    .chat-list-box{
        @common_width:270px;
        .be-center(){
            width: @common_width;
            margin: 10px auto;
        }
        .contact-item{
            height: 55px;
            border-bottom: 1px solid rgb(225,233,241);
            font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
            position: relative;
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
            .contact-item-photo{
                border-radius: 50%;
                .contact-item-icon(url(../../images/avatar_male_s.png));
            }

            .contact-item-from-user{
                position: absolute;
                font-size: 16px;
                top:10px;
                left: 75px;
            }
            .contact-item-message{
                position: absolute;
                font-size: 12px;
                top:30px;
                left: 75px;

            }
            .contact-item-time{
                position: absolute;
                font-size: 12px;
                right:5px;
                top:10px;
            }

        }
    }
</style>