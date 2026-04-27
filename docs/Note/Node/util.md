# util

## `util.promisify`

Node.js 大部分 API 都是遵循 回调函数的模式去编写的。

例如`exec`

获取 Node 版本

```js
import { exec } from 'node:child_process';
exec('node -v', (err, stdout) => {
  if (err) {
    return err;
  }
  console.log(stdout);
});
```

以上就是常规写法

使用 util 的`promisify` 改为 promise 风格 Promiseify 接受 `original`一个函数体

```js
import { exec } from 'node:child_process';
import util from 'node:util';

const execPromise = util.promisify(exec);

execPromise('node -v')
  .then(res => {
    console.log(res, 'res');
  })
  .catch(err => {
    console.log(err, 'err');
  });
```

## `util.callbackify`

这个 API 正好是 反过来的，将 promise 类型的 API 变成 回调函数。

```js
import util from 'node:util';

const fn = type => {
  if (type == 1) {
    return Promise.resolve('test');
  }
  return Promise.reject('error');
};

const callback = util.callbackify(fn);

callback(1222, (err, val) => {
  console.log(err, val);
});
```

## `util.format`

- `%s`: String  将用于转换除  BigInt、Object  和  -0  之外的所有值。 BigInt  值将用  n  表示，没有用户定义的  toString  函数的对象使用具有选项  { depth: 0, colors: false, compact: 3 }  的  util.inspect()  进行检查。
- `%d`: Number  将用于转换除  BigInt  和  Symbol  之外的所有值。
- `%i`: parseInt(value, 10)  用于除  BigInt  和  Symbol  之外的所有值。
- `%f`: parseFloat(value)  用于除  Symbol  之外的所有值。
- `%j`: JSON。 如果参数包含循环引用，则替换为字符串  '[Circular]'。
- `%o`: Object. 具有通用 JavaScript 对象格式的对象的字符串表示形式。 类似于具有选项  { showHidden: true, showProxy: true }  的  util.inspect()。 这将显示完整的对象，包括不可枚举的属性和代理。
- `%O`: Object. 具有通用 JavaScript 对象格式的对象的字符串表示形式。 类似于没有选项的  util.inspect()。 这将显示完整的对象，但不包括不可枚举的属性和代理。
- `%c`: CSS. 此说明符被忽略，将跳过任何传入的 CSS。
- `%%`: 单个百分号 ('%')。 这不消费参数。

语法 跟 C 语言的 `printf` 一样的

```js
util.format(format, [args]);
```

例子 格式化一个字符串

```js
util.format('%s-----%s %s/%s', 'foo', 'bar', 'xm', 'zs');
//foo-----bar xm/zs  可以返回指定的格式
```

如果不传入格式化参数 就按空格分开

```js
util.format(1, 2, 3);
//1 2 3
```
