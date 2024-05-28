# Topon H5 SDK Examples

### Examples启动流程

- 替换config.json的appId\appKey\placementId等参数为您自己的参数【若是直接打开html文件方式进行访问，则请将global.js中的参数一起替换】
- 进入对应示例文件夹
- 启动预览

### h5-example快速启动

- 进入h5-example目录
- npm install安装依赖
- npm start 启动预览模式

### h5-example特别说明

- 为了便于集成、快速启动测试以及尽可能简化配置，h5-example采用express + hbs模板进行组织代码（推荐）
- 当前示例代码仅供参考，具体场景请根据自身需要组织代码

### h5-example启动说明

- 默认启动域名为本机ip
- 默认端口为80端口
- 更多启动信息或需要自定义启动，请查看或编辑package.json scripts命令配置
- 需要自定义启动服务器请看server.js
- 您也可以不通过node服务器启动示例，单独直接打开/h5-example/public/index.html进行访问

#### h5-example默认启动

```shell
npm start
```

#### 指定启动域名和端口

TIPS：当需要绑定域名场景时建议使用此命令，如测试AdSense广告

```shell

npm start -- --host http://www.example.com --port 3000

```

### ~~react-example|vue-example快速启动~~（注意：暂未提供npm包，需要通过script引入）

- 进入目录/react-example or /vue-example
- npm install安装依赖
- npm start 启动预览

### 集成文档

详见[文档](https://help.toponad.com/cn/docs/SPBcrl).
