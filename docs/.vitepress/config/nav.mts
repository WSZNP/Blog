import type { DefaultTheme } from 'vitepress';

import { createNavLinkFactory, navGroup, navLink } from './shared.mts';

const html = createNavLinkFactory('/Note/HTML');
const css = createNavLinkFactory('/Note/CSS');
const javascript = createNavLinkFactory('/Note/JavaScript');
const typescript = createNavLinkFactory('/Note/TypeScript');
const demo = createNavLinkFactory('/Note/前端DEMO');
const vue = createNavLinkFactory('/Note/Vue');
const react = createNavLinkFactory('/Note/React');
const node = createNavLinkFactory('/Note/Node');
const java = createNavLinkFactory('/Note/Java');
const network = createNavLinkFactory('/Note/Network');

export const nav = [
  navLink('首页', '/'),
  navGroup('前端开发', [
    navGroup('前端语言', [
      html('HTML', 'HTML5-drag-API'),
      css('CSS', '渐变文字'),
      javascript('JavaScript', '传递参数'),
      typescript('TypeScript', '基础类型'),
      demo('DEMO合集', '图片压缩'),
    ]),
    navGroup('框架', [
      vue('Vue', 'Vue2与Vue3的区别'),
      react('React', 'React开发环境搭建'),
    ]),
  ]),
  navGroup('后端开发', [
    navGroup('后端', [
      node('Node', 'Packagejson'),
      java('Java', '简介'),
    ]),
  ]),
  network('计算机网络', 'OSI七层网络参考模型'),
] satisfies DefaultTheme.NavItem[];
