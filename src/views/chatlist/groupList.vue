<template>
    <div class="group-list">
        <div class="header">
            <Button-group class="clearfix">
                <div to="contactList" class="btn-goback" @click="goback">
                    <Button type="text" size="large">
                        <Icon type="chevron-left"></Icon>
                        返回
                    </Button>
                </div>

                <router-link to="searchBox" class="btn-addGroup">
                    <Button type="text">
                        <Icon type="plus-round" style="font-size: 16px"></Icon>
                    </Button>
                </router-link>
            </Button-group>
            <div class="empty-noti">
                <Icon type="chatbubble-working"></Icon>
                <span>没有信息</span>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        methods: {
            goback(){
                this.$router.go(-1);
            }
        }
    }
</script>
<style scoped lang="less">
    .clearfix:after{content:".";display:block;height:0;clear:both;visibility:hidden}
    .btn-goback{
        float: left;
    }
    .btn-addGroup{
        float: right;

    }
    .ivu-btn-group{
        width: 314px;
    }
    .empty-noti{
        margin-top: 20px;
        text-align: center;
        font-size: 26px;
    }
</style>