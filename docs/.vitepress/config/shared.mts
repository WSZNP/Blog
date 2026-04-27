import type { DefaultTheme } from 'vitepress';

type SidebarItemInput = DefaultTheme.SidebarItem[];

/**
 * 创建顶部导航中的普通链接项。
 *
 * 适用场景：
 * 1. 顶部导航直接跳转到某个页面
 * 2. 不需要下拉菜单，只需要一个可点击入口
 *
 * 用法：
 * ```ts
 * navLink('首页', '/')
 * navLink('计算机网络', '/Note/Network/OSI七层网络参考模型')
 * ```
 */
export function navLink(
  text: string,
  link: string,
): DefaultTheme.NavItemWithLink {
  return { text, link };
}

/**
 * 基于统一的路径前缀，生成一个顶部导航链接工厂。
 *
 * 适用场景：
 * 1. 同一栏目下有多个导航入口
 * 2. 这些入口都共享相同的基础路径
 * 3. 想避免反复手写 `/Note/xxx/...`
 *
 * 说明：
 * - `text` 是导航上显示的文字
 * - `slug` 是最终拼接到路径上的实际文件名
 * - 如果 `slug` 不传，默认使用 `text`
 *
 * 用法：
 * ```ts
 * const react = createNavLinkFactory('/Note/React');
 *
 * react('React', 'React开发环境搭建')
 * react('Babel')
 * ```
 */
export function createNavLinkFactory(basePath: string) {
  return (text: string, slug = text) => navLink(text, `${basePath}/${slug}`);
}

/**
 * 创建顶部导航中的分组项。
 *
 * 适用场景：
 * 1. 顶部导航需要下拉菜单
 * 2. 需要把多个相关入口归到同一个分类下
 * 3. 需要继续嵌套下一级导航时
 *
 * 用法：
 * ```ts
 * navGroup('前端开发', [
 *   navGroup('前端语言', [
 *     navLink('HTML', '/Note/HTML/HTML5-drag-API'),
 *     navLink('CSS', '/Note/CSS/渐变文字'),
 *   ]),
 * ])
 * ```
 */
export function navGroup(
  text: string,
  items: DefaultTheme.NavItem[],
): DefaultTheme.NavItemChildren {
  return { text, items } as DefaultTheme.NavItemChildren;
}

/**
 * 创建侧边栏中的单个可点击文档项。
 *
 * 适用场景：
 * 1. 某一项直接对应一篇 md 文档
 * 2. 不需要再往下分组
 *
 * 用法：
 * ```ts
 * item('简介', '/Note/Java/简介')
 * item('Vue2与Vue3的区别', '/Note/Vue/Vue2与Vue3的区别')
 * ```
 */
export function item(
  text: string,
  link: string,
): DefaultTheme.SidebarItem {
  return { text, link };
}

/**
 * 基于统一的路径前缀，生成一个侧边栏文档项工厂。
 *
 * 适用场景：
 * 1. 同一栏目下有很多文档
 * 2. 大部分文档路径都共享相同的目录前缀
 * 3. 想减少重复路径，降低维护时的手误概率
 *
 * 说明：
 * - `text` 是侧边栏显示名称
 * - `slug` 是实际拼接到路径上的文件名或子路径
 * - 如果 `slug` 不传，默认使用 `text`
 *
 * 用法：
 * ```ts
 * const java = createItemFactory('/Note/Java');
 *
 * java('简介')
 * java('Package.json', 'Packagejson')
 * java('基础搭建', '苍穹外卖/基础搭建')
 * ```
 */
export function createItemFactory(basePath: string) {
  return (text: string, slug = text) => item(text, `${basePath}/${slug}`);
}

/**
 * 创建侧边栏分组。
 *
 * 适用场景：
 * 1. 需要把多篇文档归到一个可折叠分组里
 * 2. 需要在侧边栏中形成多级结构
 * 3. 需要控制某个分组默认是否折叠
 *
 * 参数说明：
 * - `text`：分组标题
 * - `items`：分组下的文档项或子分组
 * - `collapsed`：是否默认折叠；不传时保持 VitePress 默认行为
 *
 * 用法：
 * ```ts
 * group('Java基础', [
 *   java('简介'),
 *   java('常量与变量'),
 * ])
 *
 * group('JavaScript基础', [
 *   javascript('传递参数'),
 *   javascript('事件循环'),
 * ], false)
 * ```
 */
export function group(
  text: string,
  items: SidebarItemInput,
  collapsed?: boolean,
): DefaultTheme.SidebarItem {
  return collapsed === undefined ? { text, items } : { text, items, collapsed };
}
