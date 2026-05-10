import type { DefaultTheme } from 'vitepress';

import { createItemFactory, group } from '../shared.mts';

const java = createItemFactory('/Note/Java');
const node = createItemFactory('/Note/Node');

export const backendSidebar = {
  '/Note/Java/': [
    group('Java基础', [
      java('简介'),
      java('常量与变量'),
      java('运算符'),
      java('流程控制'),
      java('数组'),
      java('方法'),
      java('初识面向对象'),
      java('String和ArrayList'),
      java('封装和继承'),
      java('static关键字和方法重写'),
      java('抽象类和接口'),
      java('异常'),
      java('常用类'),
      java('集合'),
      java('IO流'),
      java('多线程'),
      java('注解和反射'),
      java('网络编程'),
      java('JDK8新特性'),
      java('MySQL'),
      java('Java9-17新特性'),
    ]),
    group('JavaWeb', [
      java('Maven基础'),
      java('基础知识'),
      java('IOC+DI'),
      java('数据库'),
      java('java代码操作数据库'),
      group('后端Web实战', [
        java('后端Web实战(部门管理开发)'),
        java('后端Web实战(多表操作&员工列表查询)'),
        java('后端Web实战(员工新增)'),
        java('后端Web实战(登录认证)'),
        java('后端Web实战(AOP)'),
        java('后端Web原理(SpringBoot原理)'),
        java('后端Web开发-Maven高级'),
      ]),
    ]),
    java('Linux'),
    java('Git'),
    group('苍穹外卖', [
      java('基础搭建', '苍穹外卖/基础搭建'),
      java('Redis', '苍穹外卖/Redis'),
      java('HttpClient', '苍穹外卖/HttpClient'),
      java('SpringCache', '苍穹外卖/SpringCache'),
      java('微信支付', '苍穹外卖/微信支付'),
    ]),
  ],
  '/Note/Node/': [
    group('Node基础', [
      node('Package.json', 'Packagejson'),
      node('npm install原理', 'install原理'),
      node('npm run原理', 'run原理'),
      node('npx'),
      node('npm搭建私服'),
      node('模块化'),
      node('全局变量'),
      node('CSR SSR SEO', 'CSR,SSR,SEO'),
      node('path'),
      node('os'),
      node('process'),
      node('child_process'),
      node('ffmpeg'),
      node('events'),
      node('util'),
      node('pngquant'),
      node('fs'),
      node('crypto'),
    ]),
  ],
} satisfies DefaultTheme.Sidebar;
