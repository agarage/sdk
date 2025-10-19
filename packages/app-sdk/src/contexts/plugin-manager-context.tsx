import { createContext, useContext, type Accessor, type JSX } from "solid-js";
import type { LoadedPlugin, RegisteredPluginContext } from "../types";

interface PluginManagerContextType {
  plugins: Accessor<LoadedPlugin[]>;
  getLoadedPluginContext: (pluginName: string) => RegisteredPluginContext | undefined;
}

export const PluginManagerContext = createContext<PluginManagerContextType>({
  plugins: () => [],
  getLoadedPluginContext: () => undefined,
});

interface PluginManagerProviderProps {
  children: JSX.Element;
  plugins: Accessor<LoadedPlugin[]>;
}

function PluginManagerProvider(props: PluginManagerProviderProps) {
  const loadedPluginContexts = new Map<string, RegisteredPluginContext>();

  const getLoadedPluginContext = (pluginName: string) => {
    const plugin = props.plugins().find(plugin => plugin.name === pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    if (loadedPluginContexts.has(pluginName)) {
      return loadedPluginContexts.get(pluginName);
    }

    const registeredPluginContext: RegisteredPluginContext = {
      emit: (eventType: string, payload?: any) => {
        plugin.iframe.contentWindow?.postMessage({
          type: 'event',
          eventType,
          payload,
        }, plugin.url);
      },
    };
    
    loadedPluginContexts.set(pluginName, registeredPluginContext);
    return registeredPluginContext;
  }

  return (
    <PluginManagerContext.Provider value={{ plugins: () => props.plugins(), getLoadedPluginContext }}>
      {props.children}
    </PluginManagerContext.Provider>
  );
}

function usePluginManager() {
  const context = useContext(PluginManagerContext);
  if (!context) {
    throw new Error('usePluginManager must be used within a PluginManagerProvider');
  }
  return context;
}

export { PluginManagerProvider, usePluginManager };
