import type { PluginSdk } from '../packages/plugin-sdk/types';

declare global {
    const SDK: PluginSdk;
}

export type PluginToInstall = {
    url: string;
}
  
export type InstalledPlugin = {
    name: string;
    url: string;
    json: PluginJson;
}
