# 重学 Ajax

## 概述

Ajax（Asynchronous JavaScript And XML）即异步 JavaScript 和 XML，是一组用于在网页上进行异步数据交换的 Web 开发技术，可以在不刷新整个页面的情况下向服务器发起请求并获取数据，然后将数据插入到网页中的某个位置。这种技术能够实现增量式更新页面，提高用户交互体验，减少响应时间和带宽的消耗。

使用 Ajax 技术，可以通过 JavaScript 和 XMLHttpRequest 对象来向服务器获取数据。在 Ajax 请求的过程中，可以通过定义回调函数来对请求的结果进行处理，回调函数会在请求完成后执行，通过这种方式可以更新页面内容或者响应用户操作。

**Ajax 可以用来实现以下功能：**

- 异步更新页面内容（如搜索建议、聊天框等）
- 在页面中特定区域显示动态数据
- 提交表单数据而无需刷新整个页面
- 与服务器进行交互，不会导致页面跳转或刷新

**Ajax 的主要优点包括：**

- 提高用户体验：通过减少页面的重载和刷新，使得网站变得更加灵活和动态。
- 减轻服务器负载：通过使用 Ajax，可以有效减少服务器接收到的请求次数和需要响应的数据量，从而减轻服务器的负担。
- 提高响应速度：使用 Ajax 可以异步获取数据并更新页面，从而提高响应速度。
- 增加交互性：通过使用 Ajax，可以使得页面变得更加动态和交互性。

**然而也需要注意一些问题：**

- Ajax 对搜索引擎优化(Seo)劣势较大，对于需要 SEO 的项目需要谨慎选择使用 Ajax 技术。
- 在使用 Ajax 时，需要考虑数据安全性和网络安全性问题，并采取相应的措施加以防范。
- 不合适的使用 Ajax，可能会造成降低网站质量和效率的问题，所以需要根据实际需求来决定是否采用该技术。

[**Ajax 文档**](https://developer.mozilla.org/zh-CN/docs/Web/Guide/AJAX)

## 核心 API

1. 需要创建 xhr 实例 通过 XMLHttpRequest 使用 XMLHttpRequest 可以通过 JavaScript 发起 HTTP 请求，接收来自服务器的响应，并动态地更新网页中的内容。这种异步通信方式不会阻塞用户界面，有利于增强用户体验。

2. 我们需要使用 open() 方法打开一个请求，该方法会初始化一个请求，但并不会发送请求。它有三个必填参数以及一个可选参数

- method：请求的 HTTP 方法，例如 GET、POST 等。
- url：请求的 URL 地址。
- async：是否异步处理请求，默认为 true，即异步请求。

3. onreadystatechange 一个回调函数，在每次状态发生变化时被调用。

- readyState 0：未初始化，XMLHttpRequest 对象已经创建，但未调用 open 方法。
- readyState 1：已打开，open 方法已经被调用，但 send 方法未被调用。
- readyState 2：已发送，send 方法已经被调用，请求已经被服务器接收。
- readyState 3：正在接收，服务器正在处理请求并返回数据。
- readyState 4：完成，服务器已经完成了数据传输。

4. send 向后端传递参数 例如 xhe.send(params)

## 案例

### 发送一个 get 请求

在 XMLHttpRequest 对象中，onload 事件是指在 AJAX 请求成功完成后所触发的事件。当异步请求成功返回响应时，该事件会被调用，可以在该事件中处理服务器返回的数据。

使用 XMLHttpRequest 对象时，在调用 send() 方法发送请求后，会监听 readystatechange 事件，该事件会在请求过程中多次触发，它有多个状态，其中，当该对象 readyState 状态码值为 4 时表示已经获取到服务器的响应信息。但是只有当 HTTP 状态码为 200（OK）时，响应才是有效的。此时，你可以通过响应结果来更新页面，反之则应该进行错误处理。

使用 onload 事件可以更加直接地判断 AJAX 请求是否成功，只有在响应成功（即获得正确的 HTTP 状态码）时才会触发，并且无需判断服务器响应的状态码。可以在 onload 事件中处理服务器返回的数据，并根据需要更新网页内容。

```js
const xhr = new XMLHttpRequest();
xhr.open('GET', 'http://localhost:3000/api/txt');
xhr.onload = function () {
  if (xhr.status === 200) {
    document.querySelector('#result').innerText = xhr.responseText;
  } else {
    console.log('Request failed.  Returned status of ' + xhr.status);
  }
};
xhr.send(null);
```

### 发送 post 请求 json

```js
const xhr = new XMLHttpRequest();
xhr.open('POST', 'http://localhost:3000/api/post');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function () {
  if (xhr.status === 200) {
    document.querySelector('#result').innerText = xhr.responseText;
  } else {
    console.log('Request failed.  Returned status of ' + xhr.status);
  }
};
xhr.send(JSON.stringify({ name: 'zhangsan', age: 18 }));
```

### 发送 post 请求 application/x-www-form-urlencoded

```ts
const xhr = new XMLHttpRequest();
xhr.open('POST', 'http://localhost:3000/api/post');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.onload = function () {
  if (xhr.status === 200) {
    document.querySelector('#result').innerText = xhr.responseText;
  } else {
    console.log('Request failed.  Returned status of ' + xhr.status);
  }
};
xhr.send('name=zhangsan&age=18');
```

### 上传图片 multipart/form-data

浏览器会自动设置请求头为 multipart/form-data

![Ajax](/assets/images/Network/重学Ajax/1.png)

并且浏览器会自动添加 boundary 分割线

![Ajax](/assets/images/Network/重学Ajax/2.png)

```js
document.querySelector('#file').addEventListener('change', function () {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000/api/upload');
  xhr.onload = function () {
    if (xhr.status === 200) {
      document.querySelector('#result').innerText = xhr.responseText;
    } else {
      console.log('Request failed.  Returned status of ' + xhr.status);
    }
  };

  let file = this.files[0];
  let formData = new FormData();
  formData.append('file', file);
  xhr.send(formData);
});
```

## 中断请求 和 设置超时时间

中断请求只需要调用 xhr.abort(); 即可

并且会有一个中断的回调

```js
xhr.addEventListener('abort', function (event) {
  console.log('我被中断了');
});
```

超时时间可以设置 timeout 参数

xhr.timeout = 3000;

同样有一个超时回调

```js
xhr.addEventListener('timeout', function (event) {
  console.log('超时啦');
});
```

## 获取进度

可以监听 progress

在监听器中，我们通过 event.loaded 和 event.total 属性获取已上传数据量和总数据量，并计算上传进度，最后将进度显示在页面上

![进度](/assets/images/Network/重学Ajax/3.png)

```js
xhr.addEventListener('progress', function (event) {
  document.querySelector('#progress').innerText = `${(
    (event.loaded / event.total) *
    100
  ).toFixed(2)}%`;
});
```
