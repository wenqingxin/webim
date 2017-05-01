const routers = [
    {
        path: '/',
        meta: {
            title: ''
        },
        component: (resolve) => require(['./views/index.vue'], resolve),
        children: [
            {
                // 当 /user/:id/profile 匹配成功，
                // UserProfile 会被渲染在 User 的 <router-view> 中
                path: '/contactList',
                component: (resolve) => require(['./views/chatlist/contactList.vue'], resolve),
            },
            {
                path: '/chatList',
                component: (resolve) => require(['./views/chatlist/chatList.vue'], resolve),
            },
            {
                path: '/groupList',
                component: (resolve) => require(['./views/chatlist/groupList.vue'], resolve),
            },
            {
                path: '/searchBox',
                component: (resolve) => require(['./views/chatlist/searchBox.vue'], resolve),
            },
        ]
    }

];
export default routers;