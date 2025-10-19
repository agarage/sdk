import type { HostConfig, HostSDK, PluginRegistration, PendingRequest, HandlerFn, ListenerFn, RequestMessage, ResponseMessage, SdkMessage, EventMessage, RegisteredPluginContext } from './types';

/**
 * Creates a Host SDK for the main application.
 * Manages plugin registration and routes all requests.
 */
export function createHost({ allowedOrigins = [] }: HostConfig): HostSDK {
  const pluginRegistry = new Map<string, PluginRegistration>();
  const pendingRequests = new Map<string, PendingRequest>();
  const hostHandlers = new Map<string, HandlerFn>();
  const eventListeners = new Map<string, Set<ListenerFn>>();

  const logger = {
    info: (...args: any[]) => {
      console.log(`[host]`, ...args);
    },
    error: (...args: any[]) => {
      console.error(`[host]`, ...args);
    },
    warn: (...args: any[]) => {
      console.warn(`[host]`, ...args);
    },
    debug: (...args: any[]) => {
      console.debug(`[host]`, ...args);
    },
  };

  function _request(targetWindow: Window, targetOrigin: string, requestType: string, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      pendingRequests.set(requestId, { resolve, reject });

      const message: RequestMessage = {
        type: 'request',
        id: requestId,
        requestType,
        payload
      };
      targetWindow.postMessage(message, targetOrigin);

      setTimeout(() => {
        if (pendingRequests.has(requestId)) {
          reject(new Error(`[host] Request timed out for: ${requestType}`));
          pendingRequests.delete(requestId);
        }
      }, 5000);
    });
  }

  const messageListener = async (event: MessageEvent<SdkMessage>) => {
    // 1. Validate origin
    if (!allowedOrigins.includes(event.origin)) return;

    
    const { data: msg, source } = event;
    if (!msg || !msg.type || !source) return;
    
    // 2. Handle an incoming RESPONSE (completing a pending request)
    if (msg.type === 'response' && msg.id) {
      const promise = pendingRequests.get(msg.id);
      if (promise) {
        if (msg.error) promise.reject(new Error(msg.error));
        else promise.resolve(msg.payload);
        pendingRequests.delete(msg.id);
      }
      return;
    }

    // 3. Handle an incoming EVENT (from a plugin)
    if (msg.type === 'event' && msg.eventType) {
      const { eventType, payload } = msg;
      const handlers = eventListeners.get(eventType);

      logger.debug('Handling event', eventType, payload);
      
      // Call host event handlers
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(payload);
          } catch (err: any) {
            console.error(`[host] Error in event handler for ${eventType}:`, err);
          }
        });
      }

      // Broadcast event to all other plugins
      const eventMessage = {
        type: 'event',
        eventType,
        payload
      };

      pluginRegistry.forEach((registration, namespace) => {
        if (registration.window !== source) { // Don't send back to the sender
          try {
            registration.window.postMessage(eventMessage, registration.origin);
            logger.debug(`Broadcasted ${eventType} to plugin ${namespace}`);
          } catch (err: any) {
            console.error(`[host] Error broadcasting to plugin ${namespace}:`, err);
          }
        }
      });

      return;
    }

    // 4. Handle an incoming REQUEST (from a plugin)
    if (msg.type === 'request' && msg.id && msg.requestType) {
      const { id, requestType, payload } = msg;
      const [namespace] = requestType.split('.');
      
      let targetHandler: HandlerFn | undefined;
      let targetWindow: Window | undefined;
      let targetOrigin: string | undefined;

      // Check if it's for the host itself
      if (hostHandlers.has(requestType)) {
        targetHandler = hostHandlers.get(requestType);
      }
      // Check if it's for another plugin
      else if (pluginRegistry.has(namespace)) {
        const registration = pluginRegistry.get(namespace);
        targetWindow = registration?.window;
        targetOrigin = registration?.origin;
      }
      
      if (!targetHandler && !targetWindow) {
        (source as Window).postMessage({ type: 'response', id, error: `[Host] No handler or plugin found for namespace: ${namespace}` } as ResponseMessage, event.origin);
        return;
      }
      
      try {
        let responseData: any;
        if (targetHandler) {
          // A. Execute host handler
          responseData = await targetHandler(payload);
        } else if (targetWindow && targetOrigin) {
          // B. Forward to target plugin and await its response
          responseData = await _request(targetWindow, targetOrigin, requestType, payload);
        }
        
        // Send the successful response back to the *original* sender
        (source as Window).postMessage({ type: 'response', id, payload: responseData } as ResponseMessage, event.origin);
        
      } catch (err: any) {
        // Send an error response back to the *original* sender
        (source as Window).postMessage({ type: 'response', id, error: err.message } as ResponseMessage, event.origin);
      }
    }
  };

  window.addEventListener('message', messageListener);

  const createRegisteredPlugin = (_namespace: string, window: Window, origin: string): RegisteredPluginContext => {
    return {
      emit: (eventType: string, payload?: any) => {
        window.postMessage({ type: 'event', eventType, payload } satisfies EventMessage, origin);
      },
    };
  };

  return {
    registerPlugin: (namespace, window, origin) => {
      pluginRegistry.set(namespace, { window, origin });
      if (!allowedOrigins.includes(origin)) {
        console.warn(`[host] Plugin origin ${origin} is not in allowedOrigins.`);
      }

      return createRegisteredPlugin(namespace, window, origin);
    },

    handle: (requestType, handler) => {
      hostHandlers.set(requestType, handler);
    },

    request: <T = any>(requestType: string, payload?: any): Promise<T> => {
      const [namespace] = requestType.split('.');
      const targetInfo = pluginRegistry.get(namespace);
      
      if (!targetInfo) {
        return Promise.reject(new Error(`[host] No plugin registered for namespace: ${namespace}`));
      }
      
      return _request(targetInfo.window, targetInfo.origin, requestType, payload);
    },

    on: (eventType: string, listener: ListenerFn) => {
      if (!eventListeners.has(eventType)) {
        eventListeners.set(eventType, new Set());
      }
      eventListeners.get(eventType)!.add(listener);
    },

    off: (eventType: string, listener: ListenerFn) => {
      const handlers = eventListeners.get(eventType);
      if (handlers) {
        handlers.delete(listener);
        if (handlers.size === 0) {
          eventListeners.delete(eventType);
        }
      }
    },
    
    destroy: () => {
      window.removeEventListener('message', messageListener);
    },

    logger,
  };
}