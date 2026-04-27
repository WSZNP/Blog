# SWC

## 什么是 swc?

![SWC](/assets/images/React/SWC/logo.png)

SWC 既可用于编译，也可用于打包。对于编译，它使用现代 JavaScript 功能获取 JavaScript / TypeScript 文件并输出所有主流浏览器支持的有效代码。

`SWC在单线程上比 Babel 快 20 倍，在四核上快 70 倍。`

简单点来说 swc 实现了和 babel 一样的功能，但是它比 babel 快。

FAQ 为什么快?

编译型 Rust 是一种编译型语言，在编译时将代码转化为机器码（底层的 CPU 指令）。这种机器码在执行时非常高效，几乎不需要额外的开销。

解释型 JavaScript 是一种解释型语言，通常在浏览器或 Node.js 环境中通过解释器运行。尽管现代的 JavaScript 引擎（如 V8 引擎）使用了 JIT（即时编译）技术来提高性能，但解释型语言本质上还是需要更多的运行时开销。

v8 编译原理 https://juejin.cn/post/7291135064843304994#heading-0

swc 官网 https://swc.rs/

## 核心功能

1. JavaScript/TypeScript 转换 可以将现代 JavaScript（ES6+）和 TypeScript 代码转换为兼容旧版 JavaScript 环境的代码。这包括语法转换（如箭头函数、解构赋值等）以及一些 polyfill 的处理
2. 模块打包 SWC 提供了基础的打包功能，可以将多个模块捆绑成一个单独的文件
3. SWC 支持代码压缩和优化功能，类似于 Terser。它可以对 JavaScript 代码进行压缩，去除不必要的空白、注释，并对代码进行优化以减小文件大小，提高加载速度
4. SWC 原生支持 TypeScript，可以将 TypeScript 编译为 JavaScript
5. SWC 支持 React 和 JSX 语法，可以将 JSX 转换为标准的 JavaScript 代码。它还支持一些现代的 React 特性

## 案例

1. 语法转换：将新版本的 JavaScript 语法转换为旧版本的语法

转换前

```js
//语法
const a = (params = 2) => 1 + params;
const b = [1, 2, 3];
const c = [...b, 4, 5];
class Babel {}
new Babel();
//API
const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(x => x % 2 === 0);
const y = Object.assign({}, { name: 1 });
```

swc 转换代码

```js
import swc from '@swc/core';

const result = swc.transformFileSync('./test.js', {
  jsc: {
    target: 'es5', //代码转换es5
    parser: {
      syntax: 'ecmascript',
    },
  },
});
console.log(result.code);
```

`swc转换用时 default: 8.088ms`

`Babel转换用时 default: 417.59ms`

2. swc 转换 react jsx 语法

test.jsx

```jsx
import react from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  return <div>小满是谁？？？？？</div>;
};

createRoot(document.getElementById('root')).render(<App />);
```

转换代码

```js
import swc from '@swc/core';
console.time();
const result = swc.transformFileSync('./test.jsx', {
  jsc: {
    target: 'es5', //代码转换es5
    parser: {
      syntax: 'ecmascript',
      jsx: true,
    },
    transform: {
      react: {
        runtime: 'automatic',
      },
    },
  },
});
console.log(result.code);
console.timeEnd();
```

结果

```js
import { jsx as _jsx } from 'react/jsx-runtime';
import react from 'react';
import { createRoot } from 'react-dom/client';
var App = function () {
  return /*#__PURE__*/ _jsx('div', {
    children: '小满是谁？？？？？',
  });
};
createRoot(document.getElementById('root')).render(/*#__PURE__*/ _jsx(App, {}));
```

`swc转换用时 default: 4.251ms`

`Babel转换用时 default: 80.613ms`

3. swc 简易打包

截止 2024-9-4 日 目前该功能鸡肋 不推荐使用 了解即可

目前 swc 打包只能支持 cjs 未来才能支持 esm 比较鸡肋 其次就是参数只能 entry output 暂无其他参数

创建配置文件`spack.config.js`

编写以下代码执行 `npx spack`打包

```js
const { config } = require('@swc/core/spack');
const path = require('path');
module.exports = config({
  entry: {
    web: path.join(__dirname, './test.js'), //入口
  },
  output: {
    path: path.join(__dirname, './dist'), //出口
    name: 'test.js',
  },
});
```
