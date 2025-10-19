import type { PluginApi } from "../../../../../packages/plugin-sdk/types";

export interface ThemeToggleApi extends PluginApi {
    toggleTheme: () => void;
    getTheme: () => 'light' | 'dark';
}
