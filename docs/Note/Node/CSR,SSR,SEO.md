# CSR SSR SEO

## 概述

在 node 环境中无法操作 DOM 和 BOM，但是如果非要操作 DOM 和 BOM 也是可以的我们需要使用第三方库帮助我们`jsdom`

```shell
npm i jsdom
```

`jsdom` 是一个模拟浏览器环境的库，可以在 Node.js 中使用 DOM API

## 简单案例

```js
// ssr渲染
const fs = require('node:fs');

const { JSDOM } = require('jsdom');

const root = new JSDOM(
  '<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>'
);

const document = root.window.document;

fetch('https://api.thecatapi.com/v1/images/search?limit=10&page=1')
  .then(res => res.json())
  .then(data => {
    data.forEach(cat => {
      const img = document.createElement('img');
      img.src = cat.url;
      img.style.width = '200px';
      img.style.height = '200px';
      document.getElementById('app').appendChild(img);
    });
    fs.writeFileSync('./index.html', root.serialize());
  });
```

运行完该脚本会在执行目录下生成 html 文件里面内容都是渲染好的

## CSR SSR

上面的操作属于 SSR `（Server-Side Rendering）`服务端渲染请求数据和拼装都在服务端完成，而我们的 Vue,react 等框架这里不谈(nuxtjs,nextjs)，是在客户端完成渲染拼接的属于 CSR`（Client-Side Rendering）`客户端渲染

**CSR 和 SSR 区别**

1. 页面加载方式：

   - CSR：在 CSR 中，服务器返回一个初始的 HTML 页面，然后浏览器下载并执行 JavaScript 文件，JavaScript 负责动态生成并更新页面内容。这意味着初始页面加载时，内容较少，页面结构和样式可能存在一定的延迟。
   - SSR：在 SSR 中，服务器在返回给浏览器之前，会预先在服务器端生成完整的 HTML 页面，包含了初始的页面内容。浏览器接收到的是已经渲染好的 HTML 页面，因此初始加载的速度较快。

2. 内容生成和渲染：

   - CSR：在 CSR 中，页面的内容生成和渲染是由客户端的 JavaScript 脚本负责的。当数据变化时，JavaScript 会重新生成并更新 DOM，从而实现内容的动态变化。这种方式使得前端开发更加灵活，可以创建复杂的交互和动画效果。
   - SSR 中，服务器在渲染页面时会执行应用程序的代码，并生成最终的 HTML 页面。这意味着页面的初始内容是由服务器生成的，对于一些静态或少变的内容，可以提供更好的首次加载性能。

3. 用户交互和体验：

   - CSR：在 CSR 中，一旦初始页面加载完成，后续的用户交互通常是通过 AJAX 或 WebSocket 与服务器进行数据交互，然后通过 JavaScript 更新页面内容。这种方式可以提供更快的页面切换和响应速度，但对于搜索引擎爬虫和 SEO（搜索引擎优化）来说，可能需要一些额外的处理。
   - SSR：在 SSR 中，由于页面的初始内容是由服务器生成的，因此用户交互可以直接在服务器上执行，然后服务器返回更新后的页面。这样可以提供更好的首次加载性能和对搜索引擎友好的内容。

## SEO

SEO `（Search Engine Optimization，搜索引擎优化）`

CSR 应用对 SEO 并不是很友好

> 因为在首次加载的时候获取 HTML 信息较少 搜索引擎爬虫可能无法获取完整的页面内容

![csr](/assets/images/Node/CSR,SSR,SEO/1.webp)

> SSR 就不一样了 由于 SSR 在服务器端预先生成完整的 HTML 页面，搜索引擎爬虫可以直接获取到完整的页面内容。这有助于搜索引擎正确理解和评估页面的内容

![ssr](/assets/images/Node/CSR,SSR,SEO/2.webp)

哪些网站适合做 CSR 哪些适合做 SSR

CSR 应用例如 ToB 后台管理系统 大屏可视化 都可以采用 CSR 渲染不需要很高的 SEO 支持

SSR 应用例如 内容密集型应用大部分是 ToC 新闻网站 ，博客网站，电子商务，门户网站需要更高的 SEO 支持
