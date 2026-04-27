# sendBeacon

## 使用 `navigator.sendBeacon` 实现高效的数据上报

在 web 开发中，我们经常需要将用户行为或性能数据上报到服务器。为了不影响用户体验，开发者通常会在页面卸载时进行数据上报。然而，传统的数据上报方式，如`XMLHttpRequest`  或  `Fetch` API，容易受到页面卸载过程中的阻塞，导致数据丢失。为了解决这个问题，`navigator.sendBeacon` API 被引入，它可以在页面卸载时安全、可靠地发送数据。

## `navigator.sendBeacon` 对比 Ajax fetch

### 优点

1. 不受页面卸载过程的影响，确保数据可靠发送。
2. 异步执行，不阻塞页面关闭或跳转。
3. 能够发送跨域请求。

### 缺点

1. fetch 和 ajax 都可以发送任意请求 而 sendBeacon 只能发送 POST
2. fetch 和 ajax 可以传输任意字节数据 而 sendBeacon 只能传送少量数据（64KB 以内）
3. fetch 和 ajax 可以定义任意请求头 而 sendBeacon 无法自定义请求头
4. sendBeacon 只能传输 `ArrayBuffer`、`ArrayBufferView`、`Blob`、`DOMString`、`FormData`  或  `URLSearchParams`  类型的数据
5. 如果处于危险的网络环境，或者开启了广告屏蔽插件 此请求将无效

## `navigator.sendBeacon` 应用场景

1. 发送心跳包：可以使用  `navigator.sendBeacon`  发送心跳包，以保持与服务器的长连接，避免因为长时间没有网络请求而导致连接被关闭。
2. 埋点：可以使用  `navigator.sendBeacon`  在页面关闭或卸载时记录用户在线时间，pv uv，以及错误日志上报 按钮点击次数。
3. 发送用户反馈：可以使用  `navigator.sendBeacon`  发送用户反馈信息，如用户意见、bug 报告等，以便进行产品优化和改进

## 其他注意事项 type

ping 请求 是 html5 新增的 并且是 sendBeacon 特有的 ping 请求 只能携带少量数据，并且不需要等待服务端响应，因此非常适合做埋点统计，以及日志统计相关功能。

![sendBeacon](/assets/images/Network/sendBeacon/1.webp)

## demo 用法

> 前端

```js
<button class="send">发送</button>;
const send = document.querySelector('.send');
send.addEventListener('click', () => {
  let data = JSON.stringify({ name: 'test' });
  const blob = new Blob([data], { type: 'application/json' });
  navigator.sendBeacon('http://localhost:3000/api/beacon', blob, {
    type: 'beacon',
  });
});
```

> 后端

```js
import express from 'express';
const app = express();
app.post('/api/beacon', (req: any, res) => {
  console.log(req.body);
  res.send('ok');
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
```
