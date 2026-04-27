# 重学 fetch

## 概述

Fetch 是一种网络通信协议，用于在客户端和服务器之间传输数据。该协议使用 HTTP 请求和响应进行通信，与传统的 AJAX 方式相比，Fetch 更加简单易用，并提供了许多现代化的功能。

使用 Fetch 可以方便地向服务器发送请求，并将响应返回给客户端。你可以使用 Fetch 获取文本、JSON、图像和文件等数据，并进行各种处理。Fetch 还支持流式传输和取消请求等高级功能，使得处理大型数据集和长时间运行的操作变得更加简单和可靠。

Fetch API 也是 Javascript 中常用的 API 之一，它提供了一组方法和属性，可以在浏览器端与服务器进行通信。通过 Fetch API，你可以轻松地使用 Fetch 协议进行数据传输，并对请求和响应进行操作和处理。

## fetch 对比 xhr

`fetch` 和 `XMLHttpRequest`（XHR）都是前端与服务器进行数据交互的常用方式，它们各有优缺点，下面是它们的比较：

1. API 设计和使用方式
   > `fetch` 的 API 设计更加现代化、简洁和易于使用，使用起来更加直观和方便。相比之下，XHR 的 API 设计比较繁琐，需要进行多个参数的配置和回调函数的处理。
2. 支持的请求方法
   > `fetch` API 默认只支持 GET 和 POST 请求方法，而 XHR 则支持所有标准的 HTTP 请求方法。
3. 请求头部
   > 在 `fetch` 中设置请求头部的方式更加清晰和直接，可以通过 `Headers` 对象进行设置，而 XHR 的方式相对较为繁琐。
4. 请求体
   > 在发送 POST 请求时，`fetch` API 要求将请求体数据作为参数传递给 `fetch` 方法中的 `options` 对象，而 XHR 可以直接在 `send()` 方法中设置请求体数据。
5. 支持的数据类型
   > 在解析响应数据时，`fetch` API 提供了多种方法，包括 `.json()`, `.blob()`, `.arrayBuffer()` 等，而 XHR 只支持文本和二进制数据两种数据类型。
6. 跨域请求

   > 在进行跨域请求时，`fetch` API 提供了一种简单而强大的解决方案——使用 CORS（跨域资源共享）头部实现跨域请求，而 XHR 则使用了一个叫做 `XMLHttpRequest Level 2` 的规范，在代码编写上相对较为繁琐。

   > 总的来说，`fetch` API 与 XHR 各有优缺点，具体选择哪种方式还需要根据具体情况进行考虑。平时开发中使用较多的是 `fetch` ，因为它使用方便、API 简洁、语法清晰，同时也支持了大多数常用的功能，可以有效地简化前端开发流程。

## fetch 发送请求

### fetch 返回格式

- text(): 将响应体解析为纯文本字符串并返回。
- json(): 将响应体解析为 JSON 格式并返回一个 JavaScript 对象。
- blob(): 将响应体解析为二进制数据并返回一个 Blob 对象。
- arrayBuffer(): 将响应体解析为二进制数据并返回一个 ArrayBuffer 对象。
- formData(): 将响应体解析为 FormData 对象。

1. get 请求

```js
fetch('http://localhost:3000/api/txt')
  .then(res => {
    console.log(res);
    return res.text();
  })
  .then(res => {
    console.log(res);
  });
```

2. post 请求

```js
fetch('http://localhost:3000/api/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'zhangsan',
    age: 18,
  }),
})
  .then(res => {
    console.log(res);
    return res.json();
  })
  .then(res => {
    console.log(res);
  });
```

3. 中断请求

> 使用 `AbortController` 的 `abort`方法中断

```js
const abort = new AbortController();
fetch('http://localhost:3000/api/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  signal: abort.signal,
  body: JSON.stringify({
    name: 'zhangsan',
    age: 18,
  }),
})
  .then(res => {
    console.log(res);
    return res.json();
  })
  .then(res => {
    console.log(res);
  });

document.querySelector('#stop').addEventListener('click', () => {
  console.log('stop');
  abort.abort();
});
```

4. 获取进度

> 使用 data.clone()方法复制了响应对象 data，然后使用 getReader()方法获取数据流中的 reader 对象，接着通过读取数据流并计算已加载字节数，实现了一个基于原生 JavaScript 的进度条功能。

```js
const btn = document.querySelector('#send');
const sendFetch = async () => {
  const data = await fetch('http://localhost:3000/api/txt', {
    signal: abort.signal,
  });
  //fetch 实现进度条
  const response = data.clone();
  const reader = data.body.getReader();
  const contentLength = data.headers.get('Content-Length');
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    loaded += value?.length || 0;
    const progress = document.querySelector('#progress');
    progress.innerHTML = ((loaded / contentLength) * 100).toFixed(2) + '%';
  }
  const text = await response.text();
  console.log(text);
};
btn.addEventListener('click', sendFetch);
```
