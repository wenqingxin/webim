# webchat-project

webchat based on pc,communicate with smp app.

## Install
```bush
// install dependencies
npm install
```
## Run
### Development
```bush
// 运行dev命令前先运行这个命令,会创建index.html,就可以运行dev命令,进入开发模式,同时该命令也会生成编译后的文件,这些文件命名没加入hash值.
npm run init 
npm run dev
```
### Production(Build)
```bush
// 运行该命令生成构建文件,文件命名会加入hash值,目的是当线上代码有更新的时候浏览器不会因为请求资源文件名字相同而采用本地的缓存.
npm run build
```

