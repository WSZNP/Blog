# 重学 SSE

## 概述

SSE（Server-Sent Events）是一种用于实现服务器主动向客户端推送数据的技术，也被称为“事件流”（Event Stream）。它基于 HTTP 协议，利用了其长连接特性，在客户端与服务器之间建立一条持久化连接，并通过这条连接实现服务器向客户端的实时数据推送。

## SSE 和 Socket 区别

SSE（Server-Sent Events）和 WebSocket 都是实现服务器向客户端实时推送数据的技术，但它们在某些方面还是有一定的区别。

1. 技术实现

   > SSE 基于 HTTP 协议，利用了其长连接特性，通过浏览器向服务器发送一个 HTTP 请求，建立一条持久化的连接。而 WebSocket 则是通过特殊的升级协议（HTTP/1.1 Upgrade 或者 HTTP/2）建立新的 TCP 连接，与传统 HTTP 连接不同。

2. 数据格式
   > SSE 可以传输文本和二进制格式的数据，但只支持单向数据流，即只能由服务器向客户端推送数据。WebSocket 支持双向数据流，客户端和服务器可以互相发送消息，并且没有消息大小限制。
3. 连接状态
   > SSE 的连接状态仅有三种：已连接、连接中、已断开。连接状态是由浏览器自动维护的，客户端无法手动关闭或重新打开连接。而 WebSocket 连接的状态更灵活，可以手动打开、关闭、重连等。
4. 兼容性
   > SSE 是标准的 Web API，可以在大部分现代浏览器和移动设备上使用。但如果需要兼容老版本的浏览器（如 IE6/7/8），则需要使用 polyfill 库进行兼容。而 WebSocket 在一些老版本 Android 手机上可能存在兼容性问题，需要使用一些特殊的 API 进行处理。
5. 安全性

   > SSE 的实现比较简单，都是基于 HTTP 协议的，与普通的 Web 应用没有太大差异，因此风险相对较低。WebSocket 则需要通过额外的安全措施（如 SSL/TLS 加密）来确保数据传输的安全性，避免被窃听和篡改，否则可能会带来安全隐患。

   > 总体来说，SSE 和 WebSocket 都有各自的优缺点，适用于不同的场景和需求。如果只需要服务器向客户端单向推送数据，并且应用在前端的浏览器环境中，则 SSE 是一个更加轻量级、易于实现和维护的选择。而如果需要双向传输数据、支持自定义协议、或者在更加复杂的网络环境中应用，则 WebSocket 可能更加适合。

## 适用于场景

**chatGPT 返回的数据 就是使用的 SSE 技术**

**实时数据大屏 如果只是需要展示 实时的数据可以使用 SSE 技术 而不是非要使用 webSocket**

## API 用法

> `EventSource` 对象是 HTML5 新增的一个客户端 API，用于通过服务器推送实时更新的数据和通知。在使用 EventSource 对象时，可以通过以下方法进行配置和操作：

1. EventSource() 构造函数

   > `EventSource` 的构造函数接收一个 URL 参数，通过该 URL 可以建立起与服务器的连接，并开始接收服务器发送的数据。

   ```js
   const eventSource = new EventSource(url, options);
   ```

   - `url`：String 类型，表示与服务器建立连接的 URL。必填。

   - `options`：Object 类型，表示可选参数。常用的可选参数包括：

     - `withCredentials`：Boolean 类型，表示是否允许发送 Cookie 和 HTTP 认证信息。默认为 false。
     - `headers`：Object 类型，表示要发送的请求头信息。
     - `retryInterval`：Number 类型，表示与服务器失去连接后，重新连接的时间间隔。默认为 1000 毫秒。

示例：

```js
const eventSource = new EventSource('/my-server');
```

2. EventSource.readyState 属性

   > `readyState` 属性表示当前 `EventSource` 对象的状态，它是一个只读属性，它的值有以下几个：

   - `CONNECTING`：表示正在和服务器建立连接。
   - `OPEN`：表示已经建立连接，正在接收服务器发送的数据。
   - `CLOSED`：表示连接已经被关闭，无法再接收服务器发送的数据。

示例：

```js
if (eventSource.readyState === EventSource.CONNECTING) {
  console.log('正在连接服务器...');
} else if (eventSource.readyState === EventSource.OPEN) {
  console.log('已经连接上服务器！');
} else if (eventSource.readyState === EventSource.CLOSED) {
  console.log('连接已经关闭。');
}
```

3. EventSource.close() 方法

> `close()` 方法用于关闭 `EventSource` 对象与服务器的连接，停止接收服务器发送的数据。

`eventSource.close()`;

4. EventSource.onopen 事件

> `onopen` 事件表示 `EventSource` 对象已经和服务器建立了连接，并开始接收来自服务器的数据。当 `EventSource` 对象建立连接时，触发该事件。

```js
eventSource.onopen = function (event) {
  console.log('连接成功！', event);
};
```

5. EventSource.onerror 事件

> `onerror` 事件表示在建立连接或接收服务器数据时发生了错误。当出现错误时，触发该事件。

```js
eventSource.onerror = function (event) {
  console.log('发生错误：', event);
};
```

6. EventSource.onmessage 事件

> `onmessage` 事件表示已经接收到服务器发送的数据，当接收到数据时，触发该事件。

```js
eventSource.onmessage = function (event) {
  console.log('接收到数据：', event);
};
```

以上就是 `EventSource` 对象的常用 API 介绍，需要注意的是，在使用 `EventSource` 对象的过程中，如果服务器没有正确地设置响应头信息（如：`Content-Type: text/event-stream`），可能会导致 `EventSource` 对象无法接收到服务器发送的数据。

## nodejs 后端操作

```js
import express from 'express';
const app = express();
app.get('/api/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream', //核心返回数据流
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
    Connection: 'close',
  });
  const data = fs.readFileSync('./index.txt', 'utf8');
  const total = data.length;
  let current = 0;
  //mock sse 数据
  let time = setInterval(() => {
    console.log(current, total);
    if (current >= total) {
      console.log('end');
      clearInterval(time);
      return;
    }
    //返回自定义事件名
    res.write(`event:lol\n`) / 返回数据;
    res.write(`data:${data.split('')[current]}\n\n`);
    current++;
  }, 300);
});
app.listen(3000, () => {
  console.log('Listening on port 3000');
});
```

文本数据

```text
悲索之人烈焰加身，堕落者 不可饶恕，我即是引路的灯塔，也是净化的清泉。
永恒燃烧的羽翼，带我脱离凡间的沉沦，圣火将你洗涤。
今由烈火审判，于光明中得救。
利刃在手，制裁八方！
```

## 前端调用

```js
const sse = new EventSource('http://localhost:3000/api/sse');

sse.addEventListener('open', e => {
  console.log(e.target);
});
//对应后端nodejs自定义的事件名lol
sse.addEventListener('lol', e => {
  console.log(e.data);
});
```

![重学SSE](/assets/images/Network/重学SSE/1.png)
