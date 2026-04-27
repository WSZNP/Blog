# npx

## npx 是什么

npx 是一个命令行工具，它是 npm 5.2.0 版本中新增的功能。它允许用户在不安装全局包的情况下，运行已安装在本地项目中的包或者远程仓库中的包。

npx 的作用是在命令行中运行 node 包中的可执行文件，而不需要全局安装这些包。这可以使开发人员更轻松地管理包的依赖关系，并且可以避免全局污染的问题。它还可以帮助开发人员在项目中使用不同版本的包，而不会出现版本冲突的问题。

## npx 的优势

1. 避免全局安装：`npx` 允许你执行 npm package，而不需要你先全局安装它。
2. 总是使用最新版本：如果你没有在本地安装相应的 npm package，`npx` 会从 npm 的 package 仓库中下载并使用最新版。
3. 执行任意 npm 包：`npx` 不仅可以执行在 `package.json` 的 `scripts` 部分定义的命令，还可以执行任何 npm package。
4. 执行 GitHub gist：`npx` 甚至可以执行 GitHub gist 或者其他公开的 JavaScript 文件。

## npm 和 npx 区别

`npx`侧重于执行命令的，执行某个模块命令。虽然会自动安装模块，但是重在执行某个命令

`npm`侧重于安装或者卸载某个模块的。重在安装，并不具备执行某个模块的功能。

## 示例

1. npx 执行 vue/cli 创建项目

```shell
npx @vue/cli create npx-init-demo
```

2. npx 执行 create-react-app 创建项目

![example](/assets/images/Node/npx/1.webp)

npx 的运行规则和 npm 是一样的 本地目录查找.bin 看有没有 如果没有就去全局的 node_moduels 查找，如果还没有就去下载这个包然后运行命令，然后删除这个包
