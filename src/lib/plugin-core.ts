export type PluginJson = {
    name: string;
    version?: string;
    description?: string;
    author?: string;
    license?: string;
    dependencies?: Record<string, string>;
  }
  