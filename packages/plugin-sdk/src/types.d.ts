interface PluginConfig {
  /** The unique namespace for this plugin. */
  namespace: string;
  /** The exact origin of the parent. */
  parentOrigin: string;
}

export interface PluginSDK {
  /** Registers a handler for an action within this plugin's namespace. */
  handle: (action: string, handler: HandlerFn) => void;
  /** Sends a request to the app or another plugin. */
  request: <T = any>(requestType: string, payload?: any) => Promise<T>;
  /** Emits an event to the app. */
  emit: (eventType: string, payload?: any) => void;
  /** Registers an event listener for events from the app. */
  on: (eventType: string, listener: ListenerFn) => void;
  /** Removes an event listener. */
  off: (eventType: string, listener: ListenerFn) => void;
  /** Removes the message listener. */
  destroy: () => void;

  logger: Logger;
}

