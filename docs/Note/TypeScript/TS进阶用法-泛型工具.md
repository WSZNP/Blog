# TS 进阶用法-泛型工具

## TypeScript 泛型工具：提升类型灵活性和重用性

> 泛型工具是一组预定义的泛型类型和操作符，用于操作和转换类型。它们可以帮助我们编写更灵活、更通用的代码，并提高代码的可读性和可维护性。

## Partial 和 Required

> Partial 是一个泛型类型，用于将一个类型的所有属性变为可选。与之相反，Required 是一个泛型类型，用于将一个类型的所有属性变为必选

> Partial(可选)

```ts
interface User {
  name: string;
  age: number;
}
```

```ts
type test = Partial<User>;

//转换完成之后的结果

type test = {
  name?: string | undefined;
  age?: number | undefined;
};

//原理
type PratialUser<T, K extends keyof T> = {
  [P in K]?: T[P];
};
```

> Required(必选)

```ts
interface User {
  name?: string;
  age?: number;
}
//原理
type CustomRequired<T> = {
  [P in keyof T]-?: T[P];
};

type test = Required<User>;
type test2 = CustomRequired<User>;

//结果
interface User {
  name: string;
  age: number;
}
```

## Pick 和 Exclude

> pick 用于从一个类型中选取指定的属性

> 原理：为什么要搞 never？

> 因为 never 在联合类型中会被忽略

```ts
interface User {
  name?: string;
  age?: number;
}
//原理
type CoustomPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type test = Pick<User, 'age'>;

//结果
type test = {
  age?: number | undefined;
};
```

> Exclude 是一个类型操作符，用于从一个类型的属性集合中排除指定的属性

```ts
//原理
type CustomExclude<T, K> = T extends K ? never : T;

type test = Exclude<'a' | 'b' | 'c', 'a' | 'b'>;

//结果

type test = 'c';
```

## Omit

> 用于创建一个新类型，该新类型从原始类型中排除指定的属性

```ts
interface User {
  address?: string;
  name?: string;
  age?: number;
}
//原理
type coustomOmit<T, K> = Pick<T, Exclude<keyof T, K>>;

type test = Omit<User, 'age'>;

//结果

type test = {
  address?: string | undefined;
  name?: string | undefined;
};
```

## Record

> 泛型工具 Record 接受两个泛型 K,T

> Record 工具类型有两个类型参数 K 和 T，其中：

- K 表示创建的新对象需要具有哪些属性，属性可以只有一个，也可以有多个，多个属性时采用"联合类型"的写法。
- T 表示对象属性的类型。

> 案例 约束一个对象的 key，value

```ts
//record 约束对象的key和value

type Key = 'c' | 'x' | 'k';

type Value = '唱' | '跳' | 'rap' | '篮球';

let obj: Record<Key, Value> = {
  c: '唱',
  x: '跳',
  k: 'rap',
};
```

> Record 源码

```ts
type CustomRecord<K extends keyof any, T> = {
  [P in K]: T;
};
```

> 对象的 key 只能是 symbol string number 那么 keyof any 正好获取这三个类型

![工具](/assets/images/TypeScript/TS进阶用法-泛型工具/1.png)

> 支持嵌套约束

```ts
//嵌套约束
let obj: CustomRecord<Key, Record<Key, Value>> = {
  c: {
    c: '唱',
    x: '跳',
    k: 'rap',
  },
  x: {
    c: '唱',
    x: '跳',
    k: 'rap',
  },
  k: {
    c: '唱',
    x: '跳',
    k: 'rap',
  },
};
```

## ReturnType< Fn >

> 这个工具主要适用于函数，能够提取函数所返回的类型。

```ts
const fn = () => [1, 2, 3, 'sad'];

type num = ReturnType<typeof fn>;
```

![ReturnType](/assets/images/TypeScript/TS进阶用法-泛型工具/2.png)

> 原理

```ts
type CustomFn<F extends Function> = F extends (...args: any[]) => infer Res
  ? Res
  : never;
```

## 索引访问类型

![索引访问类型](/assets/images/TypeScript/TS进阶用法-泛型工具/3.jpg)
