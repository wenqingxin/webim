<template>
    <div>
        <Button-group class="clearfix">
            <div to="contactList" class="btn-goback" @click="goback">
                <Button type="text" size="large">
                    <Icon type="chevron-left"></Icon>
                    返回
                </Button>
            </div>
        </Button-group>
        <Input icon="search" placeholder="请搜索" class="search-input"></Input>
    </div>
</template>
<script>
    import groupList from './groupList.vue'
    export default {
        methods: {
            goback(){
                this.$router.go(-1);
            }
        },
        components:{
            groupList
        }
    }
</script>
<style scoped lang="less">
    @common_width:270px;
    .be-center(){
        width: @common_width;
        margin: 10px auto;
    }
    .search-input{
        .be-center();
        display: block;
    }
</style>