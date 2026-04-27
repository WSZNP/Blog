# npm 搭建私服

## [发布 npm 包](https://juejin.cn/post/7261518347829133372)

## 构建 npm 私服

构建私服有什么收益

- 可以离线使用，你可以将 npm 私服部署到内网集群，这样离线也可以访问私有的包。
- 提高包的安全性，使用私有的 npm 仓库可以更好的管理你的包，避免在使用公共的 npm 包的时候出现漏洞。
- 提高包的下载速度，使用私有 npm 仓库，你可以将经常使用的 npm 包缓存到本地，从而显著提高包的下载速度，减少依赖包的下载时间。这对于团队内部开发和持续集成、部署等场景非常有用

## 如何搭建 npm 私服

[Verdaccio 文档](https://verdaccio.org/zh-cn/)

Verdaccio 是可以帮我们快速构建npm私服的一个工具

```shell
npm install verdaccio -g
```

使用方式非常简单

>verdaccio 直接运行即可

![运行](/assets/images/Node/npm搭建私服/1.webp)

然后访问4873默认端口即可

## 基本命令

```shell
#创建账号
npm adduser --registry http://localhost:4873/
# 账号 密码 邮箱
```

```shell
# 发布npm
npm publish --registry http://localhost:4873/
```

```shell
#指定开启端口 默认 4873
verdaccio --listen 9999
```

```shell
# 指定安装源
npm install --registry http://localhost:4873
```

```shell
# 从本地仓库删除包
npm unpublish <package-name> --registry http://localhost:4873
```
[其他配置文件项](https://verdaccio.org/zh-cn/docs/configuration/)