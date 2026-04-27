# TCP 实现 HTTP 服务

![OSI](/assets/images/Network/OSI七层网络参考模型/1.png)

从传输层实现应用层 http 服务

使用 nodejs 原生 net 模块就可以打通 TCP 传输层并且提供一个端口号进行监听

![net](/assets/images/Network/TCP实现HTTP服务/1.png)

创建一个 TCP 服务

```js
import net from 'net';

const server = net.createServer(socket => {
  socket.on('data', data => {
    console.log('data is', data.toString());
    socket.write('hello from server');
  });
});

server.listen(8080, () => {
  console.log('server is listening', server.address());
});
```

net.createServer 创建 Unix 域套接字并且返回一个 server 对象接受一个回调函数

socket 可以监听很多事件

1. close 一旦套接字完全关闭就触发
2. connect 当成功建立套接字连接时触发
3. data 接收到数据时触发
4. end 当套接字的另一端表示传输结束时触发，从而结束套接字的可读端

通过 node index.js 启动之后我们使用浏览器访问一下

![net](/assets/images/Network/TCP实现HTTP服务/2.png)

可以看到浏览器发送了一个 http get 请求 我们可以通过关键字 get 返回相关的内容例如 html

```js
import net from 'net';
let html = `
   <h1>BLG</h1>
`;
let headers = [
  'HTTP/1.1 200 OK',
  'Content-Type: text/html',
  `Content-length:${html.length} `,
  `Date:${new Date()}`,
  'Connection: keep-alive',
  //'Transfer-Encoding: chunked',
  '\r\n',
  html,
];

const server = net.createServer(socket => {
  socket.on('data', data => {
    let msg = data.toString();
    if (/GET/.test(msg)) {
      console.log(headers.join('\r\n'));
      socket.write(headers.join('\r\n'));
      socket.end();
    }
    // console.log('data is', data.toString())
    // socket.write('hello from server')
  });
});

server.listen(8080, () => {
  console.log('server is listening', server.address());
});
```

通过拦截 get 请求模拟请求头相关报文去返回一个 html 看浏览器是否能够识别

![net](/assets/images/Network/TCP实现HTTP服务/3.png)

也是成功的返回了
