import type { DefaultTheme } from 'vitepress';

import { createItemFactory, group } from '../shared.mts';

const javascript = createItemFactory('/Note/JavaScript');
const css = createItemFactory('/Note/CSS');
const html = createItemFactory('/Note/HTML');
const vue = createItemFactory('/Note/Vue');
const react = createItemFactory('/Note/React');
const demo = createItemFactory('/Note/前端DEMO');
const typescript = createItemFactory('/Note/TypeScript');

export const frontendSidebar = {
  '/Note/JavaScript/': [
    group('JavaScript基础', [
      javascript('传递参数'),
      javascript('与或操作符的返回值'),
      javascript('事件捕获&事件冒泡'),
    ], false),
    group('JavaScript进阶', [
      javascript('原型&原型链'),
      javascript('重写数组方法'),
      javascript('事件循环'),
      javascript('继承'),
    ], false),
    group('JavaScript应用', [javascript('深拷贝')], false),
    group('JavaScript小技巧', [javascript('开发小技巧')], false),
  ],
  '/Note/CSS/': [
    group('CSS学习', [
      css('渐变文字'),
      css('三栏布局'),
      css('conic-gradient画圆环'),
    ], false),
  ],
  '/Note/HTML/': [
    group('HTML学习', [html('HTML5-drag-API')]),
  ],
  '/Note/Vue/': [
    group('Vue', [vue('Vue2与Vue3的区别')]),
  ],
  '/Note/React/': [
    group('入门', [
      react('React开发环境搭建'),
      react('tsx语法入门'),
    ]),
    group('工具', [
      react('Babel'),
      react('SWC'),
    ]),
    group('原理', [
      react('vdom fiber diff', '虚拟DOM'),
      react('requestidlecallback'),
    ]),
    group('组件', [
      react('认识组件'),
      react('组件通信'),
      react('受控组件'),
      react('传送组件'),
      react('异步组件'),
      react('组件实战'),
    ]),
    group('CSS方案', [
      react('css modules ', 'cssModules'),
      react('css in js', 'cssinJs'),
      react('css 原子化', 'css原子化'),
    ]),
    group('Hooks', [
      group('数据驱动', [
        react('useState'),
        react('useReducer'),
        react('useSyncExternalStore'),
        react('useTransition'),
        react('useDeferredValue'),
      ]),
      group('副作用', [
        react('useEffect'),
        react('useLayoutEffect'),
      ]),
      group('状态传递', [
        react('useRef'),
        react('useImperativeHandle'),
        react('useContext'),
      ]),
      group('状态派生', [
        react('useMemo'),
        react('useCallback'),
      ]),
      group('工具Hooks', [
        react('useDebugValue'),
        react('useId'),
      ]),
    ]),
    group('Router', [
      group('基本使用', [
        react('路由安装'),
        react('路由模式'),
        react('路由'),
      ]),
    ]),
  ],
  '/Note/前端DEMO/': [
    group('DEMO', [demo('图片压缩')]),
  ],
  '/Note/TypeScript/': [
    group('TS基础', [
      typescript('基础类型'),
      typescript('任意类型'),
      typescript('接口和对象类型'),
      typescript('数组类型'),
      typescript('函数扩展'),
      typescript('类型断言&联合类型&交叉类型'),
      typescript('内置对象'),
      typescript('Class类'),
      typescript('元组类型'),
      typescript('枚举类型'),
      typescript('类型推论-类型别名'),
      typescript('never类型'),
      typescript('symbol类型'),
      typescript('泛型'),
      typescript('tsconfig.json配置文件'),
      typescript('namespace命名空间'),
      typescript('声明文件d.ts', '声明文件'),
      typescript('Mixins混入'),
      typescript('装饰器Decorator'),
      typescript('Map&Set'),
      typescript('小写vs大写类型的正确使用'),
    ]),
    group('TS进阶', [
      typescript('TS进阶用法Proxy&Reflect'),
      typescript('TypeScript类型守卫'),
      typescript('TypeScript进阶类型兼容'),
      typescript('TS进阶用法-泛型工具'),
      typescript('TS进阶用法infer'),
    ]),
  ],
} satisfies DefaultTheme.Sidebar;
