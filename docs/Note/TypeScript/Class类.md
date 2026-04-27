# Class 类

> ES6 提供了更接近传统语言的写法，引入了 Class（类）这个概念，作为对象的模板。通过 class 关键字，可以定义类。基本上，ES6 的 class 可以看作只是一个语法糖，它的绝大部分功能，ES5 都可以做到，新的 class 写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已。上面的代码用 ES6 的“类”改写，就是下面这样。

```ts
//定义类
class Person {
  constructor() {}
  run() {}
}
```

## 1.ok！那我们在 TS 是如何定义类的如下图

![错误的定义](/assets/images/TypeScript/Class类/1.png)

> 在 TypeScript 是不允许直接在 constructor 定义变量的 需要在 constructor 上面先声明

![定义](/assets/images/TypeScript/Class类/2.png)

> 这样引发了第二个问题你如果了定义了变量不用 也会报错 通常是给个默认值 或者 进行赋值

![默认值](/assets/images/TypeScript/Class类/3.png)

![赋值](/assets/images/TypeScript/Class类/4.png)

## 2.类的修饰符

### 总共有三个 public private protected

> 使用 public 修饰符 可以让你定义的变量 内部访问 也可以外部访问 如果不写默认就是 public

![public修饰符](/assets/images/TypeScript/Class类/5.png)

> 使用 private 修饰符 代表定义的变量私有的只能在内部访问 不能在外部访问

![private修饰符](/assets/images/TypeScript/Class类/6.png)

> protected 修饰符 代表定义的变量私有的只能在内部和继承的子类中访问 不能在外部访问

![protected修饰符](/assets/images/TypeScript/Class类/7.png)

![protected修饰符](/assets/images/TypeScript/Class类/8.png)

> TIPS:代码

```ts
class Person {
  public name: string;
  private age: number;
  protected some: any;
  constructor(name: string, ages: number, some: any) {
    this.name = name;
    this.age = ages;
    this.some = some;
  }
  run() {}
}

class Man extends Person {
  constructor() {
    super('张三', 18, 1);
    console.log(this.some);
  }
  create() {
    console.log(this.some);
  }
}
let xiaoman = new Person('小满', 18, 1);
let man = new Man();
man.some;
```

## 3. static 静态属性 和 静态方法

![static](/assets/images/TypeScript/Class类/9.png)

> 我们用 static 定义的属性 不可以通过 this 去访问 只能通过类名去调用

![static](/assets/images/TypeScript/Class类/10.png)

> static 静态函数 同样也是不能通过 this 去调用 也是通过类名去调用

![static](/assets/images/TypeScript/Class类/11.png)

> 需注意： 如果两个函数都是 static 静态的是可以通过 this 互相调用

![static](/assets/images/TypeScript/Class类/12.png)

## 4.interface 定义类

![interface](/assets/images/TypeScript/Class类/13.png)

> ts interface 定义类 使用关键字 implements 后面跟 interface 的名字多个用逗号隔开 继承还是用 extends

```ts
interface PersonClass {
  get(type: boolean): boolean;
}

interface PersonClass2 {
  set(): void;
  asd: string;
}

class A {
  name: string;
  constructor() {
    this.name = '123';
  }
}

class Person extends A implements PersonClass, PersonClass2 {
  asd: string;
  constructor() {
    super();
    this.asd = '123';
  }
  get(type: boolean) {
    return type;
  }
  set() {}
}
```

## 5.抽象类

> 应用场景如果你写的类实例化之后毫无用处此时我可以把他定义为抽象类

> 或者你也可以把他作为一个基类-> 通过继承一个派生类去实现基类的一些方法

> 我们看例子

> 下面这段代码会报错抽象类无法被实例化

```ts
abstract class A {
  public name: string;
}

new A();
```

> 例子 2

> 我们在 A 类定义了 getName 抽象方法但为实现

> 我们 B 类实现了 A 定义的抽象方法 如不实现就不报错 我们定义的抽象方法必须在派生类实现

```ts
abstract class A {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  print(): string {
    return this.name;
  }

  abstract getName(): string;
}

class B extends A {
  constructor() {
    super('小满');
  }
  getName(): string {
    return this.name;
  }
}

let b = new B();

console.log(b.getName());
```
