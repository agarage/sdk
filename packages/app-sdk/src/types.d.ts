export type PluginToInstall = {
  url: string;
}

export type LoadedPlugin = {
  name: string;
  url: string;
  json: PluginJson;
  iframe: HTMLIFrameElement;
}

export interface AppConfig {
  /** Array of plugin origins to trust. */
  allowedOrigins: string[];
}

export interface PluginRegistration {
  window: Window;
  origin: string;
}

export interface AppSDK {
  /** Registers a plugin iframe. */
  registerPlugin: (namespace: string, window: Window, origin: string) => RegisteredPluginContext;
  /** Registers a handler for the app itself. */
  handle: (requestType: string, handler: HandlerFn) => void;
  /** Sends a request to a plugin. */
  request: <T = any>(requestType: string, payload?: any) => Promise<T>;
  /** Registers an event listener for events from plugins. */
  on: (eventType: string, listener: ListenerFn) => void;
  /** Removes an event listener. */
  off: (eventType: string, listener: ListenerFn) => void;
  /** Removes the message listener. */
  destroy: () => void;

  logger: Logger;
}

export interface RegisteredPluginContext {
  emit: (eventType: string, payload?: any) => void;
}
