import type { PluginSdk } from '../../../../packages/plugin-sdk/types';

declare global {
    const SDK: PluginSdk;
}

export type Theme = 'dark' | 'light';
