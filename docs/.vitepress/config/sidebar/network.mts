import type { DefaultTheme } from 'vitepress';

import { createItemFactory, group } from '../shared.mts';

const network = createItemFactory('/Note/Network');

export const networkSidebar = {
  '/Note/Network/': [
    group('计算机网络', [
      network('OSI七层网络参考模型'),
      network('TCP三次握手和四次挥手'),
      network('跨域'),
      network('重学Ajax'),
      network('重学fetch'),
      network('重学SSE'),
      network('webSocket学习'),
      network('sendBeacon'),
      network('TLS&SSL'),
      network('JWT'),
      network('前端的网络状态'),
      network('TCP实现HTTP服务'),
      network('HTTPS'),
      network('DNS查询流程'),
    ]),
  ],
} satisfies DefaultTheme.Sidebar;
