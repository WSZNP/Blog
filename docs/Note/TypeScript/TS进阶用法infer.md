# TS 进阶用法 infer

## infer 就是推导泛型参数

> infer 声明只能出现在 extends 子语句中

> 简单的例子获取 Promise 的返回值

```ts
// 用户接口定义
interface User {
  name: string;
  age: number;
}

// 定义一个 Promise 包装的 User 类型
type Result = Promise<User>; // 此时 Result 的类型是 Promise<User>

// 核心推断工具类型
type PromiseRes<T> = T extends Promise<infer R> ? R : never;

// 应用推断
type r = PromiseRes<Result>; // 最终 r 的类型就是 User
```

![infer](/assets/images/TypeScript/TS进阶用法infer/1.png)

> 如果遇到了多层的情况可以使用递归

```ts
interface User {
  name: string;
  age: number;
}

type Result = Promise<Promise<Promise<User>>>;

type PromiseRes<T> = T extends Promise<infer R> ? PromiseRes<R> : T;

type r = PromiseRes<Result>;
```

![infer](/assets/images/TypeScript/TS进阶用法infer/2.png)

## infer 的协变

> 获取对象属性的类型并且返回元组类型

```ts
let obj = {
  name: '小满',
  age: 123,
};
type protyKey<T> = T extends { name: infer N; age: infer A } ? [N, A] : T;

type res = protyKey<typeof obj>;
```

![infer](/assets/images/TypeScript/TS进阶用法infer/3.png)

> 如果同一个对象使用一个变量就会产生协变，返回值就是联合类型

```ts
let obj = {
  name: '小满',
  age: 123,
};
type protyKey<T> = T extends { name: infer U; age: infer U } ? U : T;

type res = protyKey<typeof obj>;
```

![infer](/assets/images/TypeScript/TS进阶用法infer/4.png)

## infer 的逆变

```ts
type FnType<T> = T extends {
  a: (args: infer U) => void;
  b: (args: infer U) => void;
}
  ? U
  : never;

type T = FnType<{ a: (args: number) => void; b: (args: string) => void }>;
```

> 函数会产生逆变，此时返回的值是一个交叉类型 string & number 怎么可能一个类型同时是 string 又是 number 不可能所以是 never

> 逆变案例：安全的事件总线

```ts
// 定义事件处理器类型
type EventHandler<T> = (payload: T) => void;

// 合并多个事件处理器
type UnionHandlers<T> = T extends {
  event1: EventHandler<infer U>;
  event2: EventHandler<infer U>;
}
  ? U
  : never;

// 应用示例
type SafePayload = UnionHandlers<{
  event1: EventHandler<number>;
  event2: EventHandler<number | string>;
}>; // 得到 number & (number | string) → number
```

## 总结

> 在协变位置上同一个类型变量的多个候选类型会被推断为联合类型；在逆变位置上，同一个类型变量的多个候选类型则会被推断为交叉类型

## infer 案例

1. 提取头部元素

```ts
type Arr = ['a', 'b', 'c'];

type First<T extends any[]> = T extends [infer First, ...any[]] ? First : [];

type a = First<Arr>;
```

> 类型参数 T 通过 extends 约束 只能是数组类型，然后通过 infer 声明局部 First 变量做提取，后面的元素可以是任意类型，然后把局部变量返回

2. 提取尾部元素

```ts
type Arr = ['a', 'b', 'c'];

type Last<T extends any[]> = T extends [...any[], infer Last] ? Last : [];

type c = Last<Arr>;
```

3. 剔除第一个元素 Shift

```ts
type Arr = ['a', 'b', 'c'];

type First<T extends any[]> = T extends [unknown, ...infer Rest] ? Rest : [];

type a = First<Arr>;
```

> 我们除了第一个的元素把其他的剩余元素声明成一个变量 直接返回 就实现了我们的要求 剔除第一个元素

4. 剔除尾部元素 pop

```ts
type Arr = ['a', 'b', 'c'];

type First<T extends any[]> = T extends [...infer Rest, unknown] ? Rest : [];

type a = First<Arr>;
```

## infer 的本质

可以将 `infer` 理解为类型占位符，它的核心作用是：

1. **声明临时类型变量**：在类型模式匹配时创建临时存储位置
2. **延迟类型绑定**：实际类型在使用时通过类型推导确定
3. **局部作用域**：仅在当前条件类型分支中有效

这种机制使我们可以像操作值一样操作类型，实现类型层面的模式匹配和解构。

## infer 递归

> 有这么一个类型

```ts
type Arr = [1, 2, 3, 4];
```

> 希望通过一个 ts 工具变成

```ts
type Arr = [4, 3, 2, 1];
```

> 完整代码

```ts
type Arr = [1, 2, 3, 4];

type ReveArr<T extends any[]> = T extends [infer First, ...infer rest]
  ? [...ReveArr<rest>, First]
  : T;

type Res = ReveArr<Arr>;
```

![infer](/assets/images/TypeScript/TS进阶用法infer/5.png)

> 具体思路 首先使用泛型约束 约束只能传入数组类型的东西 然后从数组中提取第一个，放入新数组的末尾，反复此操作，形成递归 满足结束条件返回该类型
