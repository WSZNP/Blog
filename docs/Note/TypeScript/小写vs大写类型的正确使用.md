# TypeScript 中大小写 Object, Number, String, Boolean 的区别

::: warning 提示
在 TypeScript 中，大小写的类型有着重要的区别，理解这些差异对于编写类型安全的代码至关重要。
:::

## 核心概念：自动装箱（Auto-boxing）

> 在 JavaScript 中，当你尝试访问一个原始类型的属性或方法时，JavaScript 引擎会临时创建一个对应的包装对象（wrapper object），从而允许你调用该对象的方法。这个过程称为自动装箱。一旦操作完成，这个临时的包装对象就会被销毁，而原始值保持不变。

> 例如，考虑以下代码片段：

```typescript
const str = 'hello';
console.log(str.toUpperCase()); // 输出: HELLO
```

> 在这里，str 是一个字符串类型的原始值。当你调用 toUpperCase() 方法时，JavaScript 会临时将 str 包装成一个 String 对象，以便能够访问并调用其方法。方法调用完成后，包装对象被销毁，str 仍然是原始的字符串值 'hello'。

> 这种机制使得你可以像使用对象一样调用原始类型的方法，但它并不意味着你可以永久性地将原始类型当作对象来操作。比如，你不可以直接给原始类型添加属性：

```typescript
const num = 42;
num.myProperty = 'value'; // 这不会生效
console.log(num.myProperty); // 输出: undefined
```

> 这是因为每次你试图访问或修改原始类型的属性时，都会创建一个新的包装对象，而不会影响原始值本身。

TypeScript 中的自动装箱

> TypeScript 模拟了 JavaScript 的这一行为，因此你在 TypeScript 中也可以对原始类型调用相应的方法。然而，TypeScript 提供了静态类型检查，它能确保你只能调用那些适用于特定类型的方法，从而减少了潜在的错误。

> 例如，在 TypeScript 中：

```typescript
let text: string = 'world';
console.log(text.toUpperCase()); // 正确
// text.someNonExistentMethod(); // 错误：编译时会报错
```

## 类型详解

### 1. Object 和 object

- **`object` (小写):**

  - 表示所有**非原始类型**（non-primitive type），即引用类型。
  - 包括普通对象 `{}`、数组 `[]`、函数 `function() {}` 等。
  - **不包含**原始类型如 `number`、`string`、`boolean`、`symbol`、`bigint`、`null`、`undefined`。
  - 在实际开发中，object 类型较少直接使用，因为它是宽泛的类型，不能提供关于对象结构的具体信息。推荐使用更具体的类型，如对象字面量或接口，以提高代码的可读性和可维护性。

- **`Object` (大写):**
  - 是一个构造函数，用来创建对象实例。它也代表了所有对象的原型，但作为类型声明过于宽泛，不能提供关于对象结构的具体信息。
  - 不建议在类型注解中使用 `Object`，因为它可以接受任何类型的值（除了 `null` 和 `undefined`），这违背了 TypeScript 提供严格类型检查的目的。

### 2. Number 和 number

- **`number` (小写):**

  - 表示 JavaScript 的**原始数值类型**。
  - 虽然可以通过自动装箱机制访问 `Number` 对象的方法，但在大多数情况下，直接使用数值字面量就足够了。
  - 类型注解和类型推断时应优先使用 `number`。

- **`Number` (大写):**
  - 构造函数，用于显式创建新的 `Number` 对象，或作为转换函数将值转换为数值。
  - 不推荐在类型声明中使用 `Number` 类型，因为它允许 `null` 和 `undefined`，与 TypeScript 的严格模式不符。
  - 如果需要处理可能为 `null` 或 `undefined` 的数值，应该使用联合类型如 `number | null` 或 `number | undefined`。

### 3. String 和 string

- **`string` (小写):**

  - 表示 JavaScript 的**原始字符串类型**。
  - 同样地，虽然可以通过自动装箱访问 `String` 对象的方法，但对于大多数操作来说，直接使用字符串字面量就足够了。
  - 类型注解和类型推断时应优先使用 `string`。

- **`String` (大写):**
  - 构造函数，用于显式创建新的 `String` 对象。
  - 类似于 `Number`，`String` 类型不推荐用于类型声明，如果需要处理可能为 `null` 或 `undefined` 的字符串，应该使用联合类型如 `string | null` 或 `string | undefined`。

### 4. Boolean 和 boolean

- **`boolean` (小写):**

  - 表示 JavaScript 的**原始布尔类型**，只能是 `true` 或 `false`。
  - 类型注解和类型推断时应优先使用 `boolean`。

- **`Boolean` (大写):**
  - 构造函数，用于显式创建新的 `Boolean` 对象。
  - 同样的，`Boolean` 类型不应该用于类型声明，如果需要处理可能为 `null` 或 `undefined` 的布尔值，应该使用联合类型如 `boolean | null` 或 `boolean | undefined`。

### 总结

| 类型      | 主要用途                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `object`  | 描述普通的 JavaScript 对象，不包含基本类型的值。通常用于类型注解，表示非原始类型。                                                                                       |
| `Object`  | 构造函数，用于创建对象实例。在类型注解中不推荐使用，因为它是所有对象的原型，并且过于宽泛。                                                                               |
| `number`  | 类型注解和类型推断，表示原始数值类型。通过自动装箱可以访问 `Number` 对象的方法，但直接使用数值字面量更常见。                                                             |
| `Number`  | 构造函数，用于创建新的 `Number` 对象或转换值为数值。类型声明中不推荐使用，如果需要处理 `null` 或 `undefined`，使用联合类型如 `number \| null` 或 `number \| undefined`。 |
| `string`  | 类型注解和类型推断，表示原始字符串类型。通过自动装箱可以访问 `String` 对象的方法，但直接使用字符串字面量更常见。                                                         |
| `String`  | 构造函数，用于创建新的 `String` 对象。类型声明中不推荐使用，如果需要处理 `null` 或 `undefined`，使用联合类型如 `string \| null` 或 `string \| undefined`。               |
| `boolean` | 类型注解和类型推断，表示原始布尔类型。通过自动装箱可以访问 `Boolean` 对象的方法，但直接使用布尔字面量更常见。                                                            |
| `Boolean` | 构造函数，用于创建新的 `Boolean` 对象。类型声明中不推荐使用，如果需要处理 `null` 或 `undefined`，使用联合类型如 `boolean \| null` 或 `boolean \| undefined`。            |

**关键点：**

- 小写的类型 (`object`, `number`, `string`, `boolean`) 应该在类型注解和类型推断中优先使用，因为它们更加具体和严格。
- 大写的构造函数 (`Object`, `Number`, `String`, `Boolean`) 主要用于创建包装对象，但在现代 JavaScript 和 TypeScript 编程中并不常使用，因为它们引入了不必要的复杂性并且容易导致混淆。
- 如果你需要处理可能为 `null` 或 `undefined` 的值，请明确地使用联合类型，而不是依赖于大写的包装对象类型。
