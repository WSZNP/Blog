# TypeScript 进阶类型兼容

> 所谓的类型兼容性，就是用于确定一个类型是否能赋值给其他的类型。TypeScript 中的类型兼容性是基于结构类型的（也就是形状），如果 A 要兼容 B 那么 A 至少具有 B 相同的属性。

## 协变 也可以叫鸭子类型

> 一只鸟 走路像鸭子 ，游泳也像，做什么都像，那么这只鸟就可以成为鸭子类型。

> 举例说明

```ts
interface A {
  name: string;
  age: number;
}

interface B {
  name: string;
  age: number;
  sex: string;
}

let a: A = {
  name: '老墨我想吃鱼了',
  age: 33,
};

let b: B = {
  name: '老墨我不想吃鱼',
  age: 33,
  sex: '女',
};

a = b;
```

> A B 两个类型完全不同但是竟然可以赋值并无报错 B 类型充当 A 类型的子类型，当子类型里面的属性满足 A 类型就可以进行赋值，也就是说不能少可以多，这就是协变。

## 逆变

> 逆变一般发生于函数的参数上面

> 举例说明

```ts
interface A {
  name: string;
  age: number;
}

interface B {
  name: string;
  age: number;
  sex: string;
}

let a: A = {
  name: '老墨我想吃鱼了',
  age: 33,
};

let b: B = {
  name: '老墨我不想吃鱼',
  age: 33,
  sex: '女',
};

a = b;

let fna = (params: A) => {};
let fnb = (params: B) => {};

fna = fnb; //错误

fnb = fna; //正确
```

> 这里比较绕，注意看 fna 赋值 给 fnb 其实最后执行的还是 fna 而 fnb 的类型能够完全覆盖 fna 所以这一定是安全的，相反 fna 的类型不能完全覆盖 fnb 少一个 sex 所以是不安全的。

## 双向协变

> tsconfig strictFunctionTypes 设置为 false 支持双向协变 fna fnb 随便可以来回赋值

![双向协变](/assets/images/TypeScript/TypeScript进阶类型兼容/1.png)

![双向协变](/assets/images/TypeScript/TypeScript进阶类型兼容/2.png)
