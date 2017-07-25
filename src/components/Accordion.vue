<!-- 通讯录手风琴菜单
     props
        showCheck(Boolean):是否显示多选框
-->
<template>
    <div class="accordion">
        <transition name="fade">
            <div class="inner">
                <div class="parent" v-for="(parentDepAndStuff,parentIndex) in localDbDepAndStuff" :key="parentDepAndStuff.id">
                    <div class="parent-content" @click="getData(parentDepAndStuff.id,[parentIndex])">
                        <div v-if="parentDepAndStuff.dataType == 3">
                            <i class="arr" :class="{'arr-expand':parentDepAndStuff._showChildNodes}"></i>
                            <span class="txt" v-text="parentDepAndStuff.text"></span>
                        </div>

                        <div v-else class="staff"  @click.stop="itemClick(parentDepAndStuff)">
                            <Head-photo type="search-res" :class="{'on-hand':!showCheck}" class="h-p" style="margin-left:1px" size="38" :src="parentDepAndStuff.icon" :alt="parentDepAndStuff.text"></Head-photo>
                            <span class="top-detail" v-text="parentDepAndStuff.text" :title="parentDepAndStuff.text"></span>
                            <span class="bottom-detail" style="width:190px">
                                <span v-text="parentDepAndStuff.deptName" :title="parentDepAndStuff.deptName+' '+parentDepAndStuff.posnDescr"></span>
                                <span v-text="parentDepAndStuff.posnDescr" :title="parentDepAndStuff.deptName+' '+parentDepAndStuff.posnDescr" class="psn-desc"></span>
                            </span>
                            <check-box v-show="showCheck" :disable="!showCheckBox(parentDepAndStuff.id)" class="ckb on-hand" :selected="hasSelectStaff(parentDepAndStuff)" @select="doSelect(parentDepAndStuff)"></check-box>
                        </div>
                    </div>
                    <div class="son" v-show="parentDepAndStuff._showChildNodes"
                         v-for="(sonDepAndStuff,sonIndex) in parentDepAndStuff._childNodes" :key="sonDepAndStuff.id">
                        <div class="son-content" @click="getData(sonDepAndStuff.id,[parentIndex,sonIndex])">
                            <div v-if="sonDepAndStuff.dataType == 3">
                                <i class="arr"  :class="{'arr-expand':sonDepAndStuff._showChildNodes}"></i>
                                <span class="txt" v-text="sonDepAndStuff.text"></span>
                            </div>
                            <div v-else-if="sonDepAndStuff.dataType == 4" class="staff" @click.stop="itemClick(sonDepAndStuff)">
                                <Head-photo type="search-res" class="h-p" :class="{'on-hand':!showCheck}" size="38" :src="sonDepAndStuff.icon" :alt="sonDepAndStuff.text"></Head-photo>
                                <span class="top-detail" v-text="sonDepAndStuff.text" :title="sonDepAndStuff.text"></span>
                                <span class="bottom-detail">
                                   <span v-text="sonDepAndStuff.deptName" :title="sonDepAndStuff.deptName+' '+sonDepAndStuff.posnDescr"></span>
                                   <span v-text="sonDepAndStuff.posnDescr" :title="sonDepAndStuff.deptName+' '+sonDepAndStuff.posnDescr" class="psn-desc"></span>
                                </span>
                                <check-box v-show="showCheck" :disable="!showCheckBox(sonDepAndStuff.id)" class="ckb on-hand" :selected="hasSelectStaff(sonDepAndStuff)" @select="doSelect(sonDepAndStuff)"></check-box>
                            </div>
                        </div>
                        <div class="grand-son" v-show="sonDepAndStuff._showChildNodes"
                             v-for="(grandSonDepAndStuff,grandSonIndex) in sonDepAndStuff._childNodes" :key="grandSonDepAndStuff.id">
                            <div class="grand-son-content">
                                <div v-if="grandSonDepAndStuff.dataType == 3">
                                    <i class="arr" :class="{'arr-expand':grandSonDepAndStuff._showChildNodes}"></i>
                                    <span class="txt" v-text="grandSonDepAndStuff.text"></span>
                                </div>
                                <div v-else-if="grandSonDepAndStuff.dataType == 4" class="staff"  @click.stop="itemClick(grandSonDepAndStuff)">
                                    <Head-photo type="search-res" class="h-p" :class="{'on-hand':!showCheck}" size="38" :src="grandSonDepAndStuff.icon" :alt="grandSonDepAndStuff.text"></Head-photo>
                                    <span class="top-detail" v-text="grandSonDepAndStuff.text" :title="grandSonDepAndStuff.text"></span>
                                    <span class="bottom-detail">
                                        <span v-text="grandSonDepAndStuff.deptName" :title="grandSonDepAndStuff.deptName+' '+grandSonDepAndStuff.posnDescr"></span>
                                        <span v-text="grandSonDepAndStuff.posnDescr" :title="grandSonDepAndStuff.deptName+' '+grandSonDepAndStuff.posnDescr" class="psn-desc"></span>
                                    </span>
                                    <check-box v-show="showCheck" :disable="!showCheckBox(grandSonDepAndStuff.id)" class="ckb on-hand" :selected="hasSelectStaff(grandSonDepAndStuff)" @select="doSelect(grandSonDepAndStuff)"></check-box>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import CheckBox from './common/CheckBox.vue'
    import {mapState} from 'vuex'
    import {mapActions} from 'vuex'
    import {WebChatConst} from '../util/Constant.js'
    import HeadPhoto from './common/HeadPhoto.vue'

    export default {
        name: 'accordion',
        data () {
            return {
                selected: [],
                expandAll:false,
                contactConst:WebChatConst
            }
        },
        computed:{
            ...mapState(['contactLayer','localDbDepAndStuff','curMiddleView','hasUpdateContact'])
        },
        props:['showCheck'],
        components:{
            CheckBox,
            HeadPhoto
        },
        methods: {
            ...mapActions(['getLocalDbDepartment']),
            getSrc(src){
                return src && require(src);
            },
            itemClick(staff){
                this.$emit('item-click',staff);
            },
            showCheckBox(staffId){
                let isAreadyInGroup = false;
                for (let memberId of this.contactLayer.existMembers){
                    if (staffId == memberId){
                        isAreadyInGroup =  true;
                    }
                }
                return !isAreadyInGroup;
            },
            getData(id,indexArr){
                this.getLocalDbDepartment({
                    deptId:id,
                    indexArr:indexArr
                }).then(()=>{

                })

            },
            hasSelectStaff(staff){
                return this.selected.find((item)=>{
                    return item.id == staff.id;
                })
            },
            doSelect(staff){
                for (let i = 0;i<this.selected.length;i++){
                    if (this.selected[i].id == staff.id){
                        this.selected.splice(i, 1);
                        this.$emit('select-item',this.selected);
                        return;
                    }
                }
                this.selected.push(staff);
                this.$emit('select-item',this.selected);
            }

        }
    }

</script>

<style lang='less' scoped>
    @import "../styles/common.less";
    .accordion{
        .inner{
            margin-left: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            @margin_left:10px;
            .arr-expand{
                transform:rotate(90deg);
            }
            .arr{
                display: inline-block;
                margin-left: @margin_left;
                border: 5px solid transparent;
                border-left: 5px solid #999999;
                transition: transform 0.3s cubic-bezier(.55, 0, .1, 1);
                transform-origin: 25% center;
            }
            .txt{
                line-height: 39px;
                vertical-align: middle;
                font-size: 14px;
                font-family: "Microsoft YaHei";
                color: rgb(102, 102, 102);
            }
            .query-result{
                left:-30px;
            }
            .staff{
                height: 59px;
                line-height: 59px;
                //border-bottom: 1px solid @common_border_color;
                position: relative;
                .h-p{
                    width: 25px;
                    height: 25px;
                    vertical-align: middle;
                    display: inline-block;
                    margin-left: @margin_left + 10px*2;
                }
                .detail(){
                    margin-left: 10px;
                    font-family: "Microsoft YaHei";
                    display: inline-block;
                    width: 160px;
                    .text-ellipsis();
                    vertical-align: middle;
                    position: absolute;
                }
                .top-detail{
                    .detail();
                    color: rgb(69, 75, 85);
                    top:13px;
                    font-size: 14px;
                    line-height: 14px;

                }
                .bottom-detail{
                    .psn-desc{
                        //margin-left: -2px;
                    }
                    .detail();
                    top:34px;
                    font-family: "SimSun";
                    color: rgb(153, 158, 168);
                    font-size: 12px;
                    line-height: 12px;


                }
                .ckb{
                    position: absolute;
                    top: 50%;
                    right: 20px;
                    margin-top: -8px;
                }

            }
            .parent{
                .parent-content{
                    //height: 39px;
                    border-bottom: 1px solid @common_border_color;
                }
            }
            .son{
                .son-content{
                    border-bottom: 1px solid @common_border_color;
                    .arr{
                        margin-left: @margin_left + 10px;
                    }

                }

            }
            .grand-son{
                .grand-son-content{
                    border-bottom: 1px solid @common_border_color;
                    .arr{
                        margin-left: @margin_left + 10px*2;
                    }
                }
                .staff-list{

                }

            }
        }
    }
</style>
