# os

**Nodejs os 模块可以跟操作系统进行交互**

```js
var os = require('node:os');
```

| 序号 | API           | 作用                                                                                                                                                                          |
| ---- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | os.type()     | 它在 Linux 上返回 `'Linux'`，在 macOS 上返回 `'Darwin'`，在 Windows 上返回 `'Windows_NT'`                                                                                     |
| 2    | os.platform() | 返回标识为其编译 Node.js 二进制文件的操作系统平台的字符串。 该值在编译时设置。 可能的值为 `'aix'`、`'darwin'`、`'freebsd'`、`'linux'`、`'openbsd'`、`'sunos'`、以及 `'win32'` |
| 3    | os.release()  | 返回操作系统的版本例如 10.xxxx win10                                                                                                                                          |
| 4    | os.homedir()  | 返回用户目录 例如 c:\user\xiaoman 原理就是 windows `echo %USERPROFILE%` posix $HOME                                                                                           |
| 5    | os.arch()     | 返回操作系统的 CPU 架构。 可能的值为 `'arm'`、`'arm64'`、`'ia32'`、`'mips'`、`'mipsel'`、`'ppc'`、`'ppc64'`、`'s390'`、`'s390x'`、`'x32'`、`'x64'`                            |

## 获取 CPU 的线程以及详细信息

```js
const os = require('node:os');
os.cpus();
```

```js
[
  {
    model: 'AMD Ryzen 7 8845H w/ Radeon 780M Graphics',
    speed: 3793,
    times: { user: 260875, nice: 0, sys: 305046, idle: 122493593, irq: 23500 },
  },
  {
    model: 'AMD Ryzen 7 8845H w/ Radeon 780M Graphics',
    speed: 3793,
    times: { user: 129500, nice: 0, sys: 132796, idle: 122797140, irq: 3953 },
  },
];
//.........
```

- model: 表示 CPU 的型号信息，其中 "AMD Ryzen 7 8845H w/ Radeon 780M Graphics" 是一种具体的型号描述。

- speed: 表示 CPU 的时钟速度，以 MHz 或 GHz 为单位。在这种情况下，速度为 3793 MHz 或 3.793 GHz。

- times: 是一个包含 CPU 使用时间的对象，其中包含以下属性：

  - user: 表示 CPU 被用户程序使用的时间（以毫秒为单位）。
  - nice: 表示 CPU 被优先级较低的用户程序使用的时间（以毫秒为单位）。
  - sys: 表示 CPU 被系统内核使用的时间（以毫秒为单位）。
  - idle: 表示 CPU 处于空闲状态的时间（以毫秒为单位）。
  - irq: 表示 CPU 被硬件中断处理程序使用的时间（以毫秒为单位）。

## 获取网络信息

```js
const os = require('node:os');
os.networkInterfaces();
```

## 案例

知道这些信息有什么用？

非常经典的例子 webpack vite 有一个配置项可以打开浏览器 `open:true` 简单复刻一下

```js
const { exec } = require('child_process');
const os = require('os');

function openBrowser(url) {
  if (os.platform() === 'darwin') {
    // macOS
    exec(`open ${url}`); //执行shell脚本
  } else if (os.platform() === 'win32') {
    // Windows
    exec(`start ${url}`); //执行shell脚本
  } else {
    // Linux, Unix-like
    exec(`xdg-open ${url}`); //执行shell脚本
  }
}

// Example usage
openBrowser('https://www.juejin.cn');
```
