# 装饰器 Decorator

> Decorator 装饰器是一项实验性特性，在未来的版本中可能会发生改变
>
> 它们不仅增加了代码的可读性，清晰地表达了意图，而且提供一种方便的手段，增加或修改类的功能
>
> 若要启用实验性的装饰器特性，你必须在命令行或 tsconfig.json 里启用编译器选项

![装饰器](/assets/images/TypeScript/装饰器/1.png)

## 装饰器

> 装饰器是一种特殊类型的声明，它能够被附加到类声明，方法， 访问符，属性或参数上。

## 类装饰器

```ts
class A {
  constructor() {}
}
```

> 定义一个类装饰器函数 他会把 ClassA 的构造函数传入你的 watcher 函数当做第一个参数

```ts
const watcher: ClassDecorator = (target: Function) => {
  target.prototype.getParams = <T>(params: T): T => {
    return params;
  };
};
```

> 使用的时候 直接通过@函数名使用

```ts
@watcher
class A {
  constructor() {}
}
```

> 验证

```ts
const a = new A();
console.log((a as any).getParams('123'));
```

## 装饰器工厂

> 其实也就是一个高阶函数 外层的函数接受值 里层的函数最终接受类的构造函数

```ts
const watcher = (name: string): ClassDecorator => {
  return (target: Function) => {
    target.prototype.getParams = <T>(params: T): T => {
      return params;
    };
    target.prototype.getOptions = (): string => {
      return name;
    };
  };
};

@watcher('name')
class A {
  constructor() {}
}

const a = new A();
console.log((a as any).getParams('123'));
```

## 装饰器组合

> 就是可以使用多个装饰器

```ts
const watcher = (name: string): ClassDecorator => {
  return (target: Function) => {
    target.prototype.getParams = <T>(params: T): T => {
      return params;
    };
    target.prototype.getOptions = (): string => {
      return name;
    };
  };
};
const watcher2 = (name: string): ClassDecorator => {
  return (target: Function) => {
    target.prototype.getNames = (): string => {
      return name;
    };
  };
};

@watcher2('name2')
@watcher('name')
class A {
  constructor() {}
}

const a = new A();
console.log((a as any).getOptions());
console.log((a as any).getNames());
```

## 方法装饰器

> 返回三个参数

- 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
- 成员的名字。
- 成员的属性描述符。

```ts
[
  {},
  'getData',
  {
    value: [Function: getData],
    writable: true,
    enumerable: false,
    configurable: true
  }
]
```

```ts
const Get = (url: string) => {
  const fn: MethodDecorator = (
    target,
    propertyKey,
    descriptor: PropertyDescriptor
  ) => {
    console.log(target, propertyKey, descriptor);
    descriptor.value('我是传入的参数');
  };
  return fn;
};

class Http {
  constructor() {}

  @Get('http://www.baidu.com')
  getData(data: any) {
    console.log(data, '传入的参数被打印');
  }
}

const http = new Http();
```

## 属性装饰器

> 返回两个参数

- 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
- 属性的名字。
- [ {}, 'name', undefined ]

```ts
const met: PropertyDecorator = (...args) => {
  console.log(args);
};

class A {
  @met
  name: string;
  constructor() {}
}

const a = new A();
```

## 参数装饰器

> 返回三个参数

- 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
- 成员的名字。
- 参数在函数参数列表中的索引。
- [ {}, 'setParasm', 0 ]

```ts
const met: ParameterDecorator = (...args) => {
  console.log(args);
};

class A {
  constructor() {}
  setParasm(@met name: string = '213') {}
}

const a = new A();
```

> 元数据存储

```ts
// 存取值需要用到这个库
import 'reflect-metadata';
```

> 可以快速存储元数据然后在用到的地方取出来 defineMetadata getMetadata

```ts
//1.类装饰器 ClassDecorator
//2.属性装饰器 PropertyDecorator
//3.参数装饰器 ParameterDecorator
//4.方法装饰器 MethodDecorator PropertyDescriptor 'https://api.apiopen.top/api/getHaoKanVideo?page=0&size=10'
//5.装饰器工厂
import axios from 'axios';
import 'reflect-metadata';
const Base = (base: string) => {
  const fn: ClassDecorator = target => {
    target.prototype.base = base;
  };
  return fn;
};

const Get = (url: string) => {
  const fn: MethodDecorator = (
    target: any,
    key,
    descriptor: PropertyDescriptor
  ) => {
    axios.get(url).then(res => {
      const key = Reflect.getMetadata('key', target);
      descriptor.value(key ? res.data[key] : res.data);
    });
  };
  return fn;
};

const result = () => {
  const fn: ParameterDecorator = (target: any, key, index) => {
    Reflect.defineMetadata('key', 'result', target);
  };
  return fn;
};

const Bt: PropertyDecorator = (target, key) => {
  console.log(target, key);
};

@Base('/api')
class Http {
  @Bt
  xiaoman: string;
  constructor() {
    this.xiaoman = 'xiaoman';
  }
  @Get('https://api.apiopen.top/api/getHaoKanVideo?page=0&size=10')
  getList(@result() data: any) {
    //参数装饰器要优先于方法装饰器执行，所以在参数装饰器中存入元数据，方法装饰器中就可以取出来
    // console.log(data)
  }
  // @Post('/aaaa')
  create() {}
}

const http = new Http() as any;

// console.log(http.base)
```
