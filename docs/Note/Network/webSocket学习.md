# webSocket 学习

## 概念

WebSocket 是一种在单个 TCP 连接上进行全双工通信的网络协议。它是 HTML5 中的一种新特性，能够实现 Web 应用程序和服务器之间的实时通信，比如在线聊天、游戏、数据可视化等。

相较于 HTTP 协议的请求-响应模式，使用 WebSocket 可以建立持久连接，允许服务器主动向客户端推送数据，避免了不必要的轮询请求，提高了实时性和效率。同时，WebSocket 的连接过程也比较简单，可以通过 JavaScript 中的 WebSocket API 进行创建和管理，并且可以和现有的 Web 技术如 HTML、CSS 和 JavaScript 无缝集成。

WebSocket 协议是基于握手协议（Handshake Protocol）的，它在建立连接时使用 HTTP/HTTPS 发送一个初始握手请求，然后服务器响应该请求，建立连接后就可以在连接上进行数据传输了。

总之，WebSocket 提供了一种快速、可靠且灵活的方式，使 Web 应用程序能够实现实时通信，同时也提高了网络性能和用户体验。

## 场景

1. 实时性要求较高的应用，比如在线聊天、游戏、数据可视化等；
2. 需要频繁交换数据的应用，比如在线编辑器、文件管理器等；
3. 需要推送服务的应用，比如实时数据监控、通知系统等；
4. 跨平台的应用，比如桌面应用程序、移动应用程序等。

## demo 简易聊天 后端 nodejs

```js
import ws from 'ws';

const wss = new ws.Server({ port: 8080 });
const state = {
  HEART: 1,
  MESSAGE: 2,
};
wss.on('connection', ws => {
  console.log('连接 nodejs 服务器成功');
  ws.on('message', message => {
    console.log('接收到客户端发来的消息: ' + message);
    wss.clients.forEach(client => {
      client.send(
        JSON.stringify({
          state: state.MESSAGE,
          message: '我是nodejs服务器，我收到你的消息了' + message,
        })
      );
    });
  });
  let hraetInreval = null;
  //心跳包
  const sendHeart = () => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ state: state.HEART, message: '心跳' }));
    } else {
      clearInterval(hraetInreval);
    }
  };
  hraetInreval = setInterval(sendHeart, 5000);
});
```

1. 首先通过 new ws.Server({ port: 8080 }) 创建了一个 WebSocket 服务器，监听在本机的 8080 端口；
2. 在 wss.on('connection', (ws) => {...}) 的回调函数中，当有新的客户端连接时，会执行一些初始化操作：

- 输出日志：console.log(‘连接 nodejs 服务器成功’)
- 监听客户端发送的消息，并在控制台输出接收到的内容：ws.on(‘message’, (message) => {…})
- 开启一个定时器，每 5 秒向该客户端发送一条心跳消息：setInterval(sendHeart, 5000);

3. 客户端发送消息后，服务器会将消息广播给所有连接的客户端：wss.clients.forEach((client) => {…})

   state 是一个自定义的对象，包含了 HEART 和 MESSAGE 两个常量，用于标识消息的类型

> 前端代码

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style></style>
  </head>

  <body>
    <div>
      <ul id="list"></ul>
      <input type="text" id="input" />
      <button id="send">发送</button>
      <button id="stop">断开</button>
    </div>

    <script>
      //webSocket
      const list = document.querySelector('#list');
      const ws = new WebSocket('ws://localhost:8080');

      ws.addEventListener('open', () => {
        console.log('连接');
      });

      ws.addEventListener('message', e => {
        let data = JSON.parse(e.data);
        const li = document.createElement('li');
        if (data.state == 2) {
          li.innerText = data.message;
          list.appendChild(li);
        }
      });

      const btn = document.querySelector('#send');
      const input = document.querySelector('#input');
      const stop = document.querySelector('#stop');
      btn.addEventListener('click', () => {
        if (input.value) {
          ws.send(input.value);
          input.value = '';
        }
      });
      stop.addEventListener('click', () => {
        ws.close();
      });
    </script>
  </body>
</html>
```

在 HTML 中，有一个包含输入框、发送按钮、断开连接按钮和消息列表的 div。其中输入框的 id 为 input，发送按钮的 id 为 send，断开连接按钮的 id 为 stop，消息列表的 id 为 list。

在 JavaScript 中，定义了一个 WebSocket 对象 ws，并通过 ws.addEventListener() 监听其 open 和 message 事件。当 WebSocket 连接成功时，会输出 连接；当接收到服务端返回的消息时，会解析 JSON 字符串并将消息添加到消息列表中。

此外，还监听了发送按钮和断开连接按钮的点击事件，并在点击后调用相应的方法。发送按钮点击事件会检查输入框中是否有文本，如果有则通过 WebSocket 发送消息；断开连接按钮的点击事件会关闭 WebSocket 连接。
