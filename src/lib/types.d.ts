// --- Core Message & Handler Types ---

// The structure of a request message
interface RequestMessage {
  type: 'request';
  id: string;
  requestType: string;
  payload?: any;
}

// The structure of a response message
interface ResponseMessage {
  type: 'response';
  id: string;
  payload?: any;
  error?: string;
}

// The structure of an event message
interface EventMessage {
  type: 'event';
  eventType: string;
  payload?: any;
  namespace?: string;
}

type SdkMessage = RequestMessage | ResponseMessage | EventMessage;

// A handler function can be sync or async
type HandlerFn = (payload?: any) => any | Promise<any>;

// An event handler function
type ListenerFn = (payload?: any) => void;

// For tracking pending requests that expect a response
interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

// --- Host SDK Types ---

interface HostConfig {
  /** Array of plugin origins to trust. */
  allowedOrigins: string[];
}

interface PluginRegistration {
  window: Window;
  origin: string;
}

export interface HostSDK {
  /** Registers a plugin iframe. */
  registerPlugin: (namespace: string, window: Window, origin: string) => RegisteredPluginContext;
  /** Registers a handler for the host itself. */
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

// --- Plugin SDK Types ---

interface PluginConfig {
  /** The unique namespace for this plugin. */
  namespace: string;
  /** The exact origin of the parent host. */
  parentOrigin: string;
}

interface Logger {
  info: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

export interface PluginSDK {
  /** Registers a handler for an action within this plugin's namespace. */
  handle: (action: string, handler: HandlerFn) => void;
  /** Sends a request to the parent host or another plugin. */
  request: <T = any>(requestType: string, payload?: any) => Promise<T>;
  /** Emits an event to the host. */
  emit: (eventType: string, payload?: any) => void;
  /** Registers an event listener for events from the host. */
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