import type { DefaultTheme } from 'vitepress';

import { backendSidebar } from './backend.mts';
import { frontendSidebar } from './frontend.mts';
import { networkSidebar } from './network.mts';

export const sidebar = {
  ...frontendSidebar,
  ...backendSidebar,
  ...networkSidebar,
} satisfies DefaultTheme.Sidebar;
