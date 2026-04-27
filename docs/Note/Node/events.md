# events

## EventEmitter

Node.js 核心 API 都是采用异步事件驱动架构，简单来说就是通过有效的方法来监听事件状态的变化，并在变化的时候做出相应的动作。

```js
fs.mkdir('/tmp/a/apple', { recursive: true }, err => {
  if (err) throw err;
});
```

```js
process.on('xxx', () => {});
```

举个例子，你去一家餐厅吃饭，这个餐厅就是一个`调度中心`，然后你去点饭，可以理解注册了一个事件`emit`,然后我们等候服务员的喊号，喊到我们的时候就去取餐，这就是监听了这个事件`on`

## 事件模型

Nodejs 事件模型采用了，`发布订阅设计模式`

![发布订阅设计模式](/assets/images/Node/events/1.webp)

当一个发布者有新消息时，就将这个消息发布到调度中心。调度中心就会将这个消息通知给所有订阅者。这就实现了发布者和订阅者之间的解耦，发布者和订阅者不再直接依赖于彼此，他们可以独立地扩展自己

## 代码案例

```js
const EventEmitter = require('events');

const event = new EventEmitter();
//监听test
event.on('test', data => {
  console.log(data);
});

event.emit('test', 'xmxmxmxmx'); //派发事件
```

监听消息数量默认是 10 个

```js
const EventEmitter = require('events');

const event = new EventEmitter();

event.on('test', data => {
  console.log(data);
});
event.on('test', data => {
  console.log(data);
});
event.on('test', data => {
  console.log(data);
});
event.on('test', data => {
  console.log(data);
});
event.on('test', data => {
  console.log(data);
});
event.on('test', data => {
  console.log(data);
});
event.on('test', data => {
  console.log(data);
});
event.on('test', data => {
  console.log(data);
});
event.on('test', data => {
  console.log(data);
});

event.on('test', data => {
  console.log(data);
});
event.on('test', data => {
  console.log(data);
});
event.on('test', data => {
  console.log(data);
});

event.emit('test', 'xmxmxmxmx');
```

如何解除限制 调用 setMaxListeners 传入数量

```js
event.setMaxListeners(20);
```

只想监听一次 `once` 即使`emit`派发多次也只触发一次`once`

```js
const EventEmitter = require('events');

const event = new EventEmitter();
event.setMaxListeners(20);
event.once('test', data => {
  console.log(data);
});

event.emit('test', 'xmxmxmxmx1');
event.emit('test', 'xmxmxmxmx2');
```

如何取消侦听 off

```js
const EventEmitter = require('events');

const event = new EventEmitter();

const fn = msg => {
  console.log(msg);
};
event.on('test', fn);
event.off('test', fn);

event.emit('test', 'xmxmxmxmx1');
event.emit('test', 'xmxmxmxmx2');
```

## 有谁用到了

`process`

![process](/assets/images/Node/events/2.webp)

打开 nodejs 源码 搜索 `setupProcessObject` 这个函数

![process](/assets/images/Node/events/3.webp)

1. 它首先引入 `event`模块
2. 获取`process` 的原型对象
3. 将`evnet`的原型对象设给了`process` 的原型对象
4. 并且重新绑定上下文
5. 将`process` 挂载到`globalThis` 所以我们可以全局访问这个 API
