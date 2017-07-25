import login from './views/login.vue'
import index from './views/index.vue'
const routers = [
    { path: '/', redirect: '/index' },
    {
        path: '/login',
        meta: {
            title: '登录'
        },
        component: (resolve) => require(['./views/login.vue'], resolve)
        //component:login
    },
    {
        path: '/index',
        meta: {
            title: '主页',
            requireAuth: true,  // 添加该字段，表示进入这个路由是需要登录的
        },
        component: (resolve) => require(['./views/index.vue'], resolve)
        //component:index
    }
];
export default routers;