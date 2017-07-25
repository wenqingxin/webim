import Vue from 'vue';
import VueRouter from 'vue-router';
import Routers from './router';
import storeConfig from './store/store';
import App from './app.vue';
import Vuex from 'vuex';
import {Service,getLocalUserArr} from './util/Utils.js'
import Qs from 'Qs'
import SpringLib from './libs/SpringLib.js'
import 'animate.css';
import 'Normalize.css';
import env from './config/env.js'
import * as mockData from './test/mock/data'
require('jquery.nicescroll');
//生产环境禁用日志打印
if (env == 'production'){
    try {
        window.console.log = function () {
            //donothing
        }
        window.console.warn = function () {
            //donothing
        }
    }catch (e){
    }
}

Vue.use(VueRouter);
Vue.use(Vuex);
// 路由配置
const RouterConfig = {
    //mode: 'history',
    routes: Routers
};
export const router = new VueRouter(RouterConfig);
const store = new Vuex.Store(storeConfig);
//路由拦截器
router.beforeEach((to, from, next) => {
    if (to.path == '/login'){
        next() ;
        if (RongIMClient._instance){
            //去登陆界面就断开当前连接,防止没断开连接再次登录同一账号就提示账号在其他地方登陆
            RongIMLib.RongIMClient.getInstance().disconnect();
        }
        return;
    }
    let loginId = to.query.loginId;
    let userArr = getLocalUserArr();
    let user;
    for (let i = 0;i<userArr.length;i++){
        if (userArr[i].staffCode == loginId ){
            user = userArr[i];
            break;
        }
    }
    if ((!user || !loginId) && userArr.length>0){
        user = userArr[userArr.length-1];//如果没有指定某个人的loginId就默认最后登录的人
    }
    if (user && to.meta.requireAuth) {// 判断该路由是否需要登录权限
        if (user.stoken){
            store.commit('setUserInfo',user);
            next() ;
        }else{
            next('/login')
        }
    }else {
        next('/login')
    }
});

router.afterEach((to, from, next) => {

});

let axiosIns = Service.getInstance().getAxiosIns();
//request拦截器
axiosIns.interceptors.request.use(
    config => {
        let loginFullRequestUrl = SpringLib.Config.smpServerUrl + SpringLib.Config.smpLoginUrl;
        // 判断是否存在stoken，如果存在且不是登录接口，则每个http请求参数都加上stoken
        if (store.state.userInfo.stoken && config.url != loginFullRequestUrl) {
            config.transformRequest=[function (data) {
                return data+'&'+Qs.stringify({stoken:store.state.userInfo.stoken});
            }]
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    });
//response拦截器
axiosIns.interceptors.response.use(
    response => {
        if (response && response.data &&
            !response.data.isSuccess &&
            response.data.errcode == 'ERROR.CODE.110') {
            store.commit('showMessageBox',{
                show: true,
                title: '提示',
                content:'登录信息过期,请返回登录界面',
                confirm:()=>{
                    router.replace({
                        path: '/login'
                    });
                    location.reload();//重新刷新页面,清除vuex缓存,断开融云连接
                }});
            console.log('token失效,返回登录界面');
            store.state.userInfo.stoken = '';
            store.commit('setUserInfo', store.state.userInfo);
        }
        return response;
    },
    error => {
        // Do something with response error
        return Promise.reject(error);
    });

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App)
});

Vue.directive('focus', {
    // 当绑定元素插入到 DOM 中。
    inserted: function (el) {
        // 聚焦元素
        el.focus()
    }
});
//右键菜单自定义指令
Vue.directive('onctxmenu', {
    inserted: function (el) {
        el.addEventListener('contextmenu', function (e) {
            let event = e || window.event;
            let clientX = event.clientX;
            let clientY = event.clientY;
            console.log('clienX:' + clientX + ' clientY:' + clientY);

            let appBox = document.getElementById('index');
            let appTop = appBox.getBoundingClientRect().top;
            let appLeft = appBox.getBoundingClientRect().left;
            console.log('appTop:' + appTop + ' appLeft:' + appLeft);

            let position = {
                top: Number(clientY) - Number(appTop) + 'px',
                left: Number(clientX) - Number(appLeft) + 'px'
                /*                top:clientY+'px',
                 left:clientX+'px'*/
            };
            console.log(JSON.stringify(position))
            store.commit('showContextMenu', {show: true, position: position})
        })
    }
});



