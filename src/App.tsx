import { toposortReverse } from '@n1ru4l/toposort';
import { createSignal, onMount } from 'solid-js';
import { PLUGINS_TO_INSTALL } from './data/plugins';
import { createHost } from './lib/host';
import type { PluginJson } from './lib/plugin-core';
import type { RegisteredPluginContext } from './lib/types';
import { InstalledPlugins } from './components/InstalledPlugins';
import type { InstalledPlugin } from './types';

const host = createHost({
  allowedOrigins: ["http://localhost:5174", "http://localhost:5175", "http://localhost:5174/", "http://localhost:5175/"],
});

function PluginFrame(props: { url: string, name: string }) {
  const [loaded, setLoaded] = createSignal(false);
  const [registeredPluginContext, setRegisteredPluginContext] = createSignal<RegisteredPluginContext | undefined>(undefined);

  let iframe: HTMLIFrameElement | undefined;

  const sendTime = () => {
    const pluginContext = registeredPluginContext();
    if(!pluginContext) return;

    pluginContext.emit('host.onReceiveTime', new Date().toISOString());
  }

  const handleLoad = () => {
    if (!iframe || !iframe.contentWindow) return;

    setLoaded(true);

    const registeredPluginContext = host.registerPlugin(
      props.name,
      iframe.contentWindow!,
      props.url,
    );
    setRegisteredPluginContext(registeredPluginContext);
    host.logger.info(`${props.name} plugin registered.`);
  }

  return (
    <div class="flex flex-col gap-2 border-2 border-gray-300 rounded-md p-4">
      <div class="flex flex-col gap-2">
        <h3 class="text-lg font-bold">{props.name}</h3>
        <p class="text-sm text-gray-500">{props.url}</p>
      </div>

      <div class="relative w-full h-full border-2 border-gray-300 rounded-md">
        {!loaded() && (
          <div class="absolute inset-0 flex items-center justify-center bg-white z-10">
            <span class="text-gray-500">Loading plugin…</span>
          </div>
        )}
        <iframe
          id={`iframe-plugin-${props.name}`}
          ref={iframe}
          src={props.url}
          class="w-full h-full"
          onLoad={handleLoad}
          style={ !loaded()
            ? { visibility: "hidden" }
            : undefined
          }
        />
      </div>

      <button class="px-4 py-2 bg-green-500 text-white rounded" onClick={sendTime}>
        Send Time to {props.name}
      </button>
    </div>
  );
}

function RandomNumbers() {
  const [randomNumbers, setRandomNumbers] = createSignal<number[]>([]);

  host.on('onReceiveRandomNumber', (number: number) => {
    setRandomNumbers(prev => [...prev, number]);
  });

  return (
    <div class="flex flex-col gap-4 border p-4">
      <h2 class="text-lg font-bold">Random Numbers</h2>

      <div class="flex flex-col gap-2">
        {randomNumbers().map(number => (
          <p class="text-sm text-gray-500">{number}</p>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [plugins, setPlugins] = createSignal<InstalledPlugin[]>([]);
  const deps = new Map<string, Set<string>>();

  const loadPlugins = async () => {
    host.logger.info("Loading plugins");

    const loadedPluginJsons = new Map<string, PluginJson & { url: string }>();

    for await (const plugin of PLUGINS_TO_INSTALL) {
      const res = await fetch(`${plugin.url}/plugin.json`);
      const pluginJson = await res.json();
      loadedPluginJsons.set(pluginJson.name, { ...pluginJson, url: plugin.url });

      const depNames = Object.keys(pluginJson.dependencies || {});
      deps.set(pluginJson.name, new Set(depNames));

      host.logger.info(`${pluginJson.name} plugin.json loaded.`);
    }

    host.logger.debug("Sorting and loading plugins");

    const sortedPlugins = toposortReverse(deps);
    
    for (const task of sortedPlugins) {
      const pluginsToLoad = task

      for (const pluginToLoad of pluginsToLoad) {
        const pluginJson = loadedPluginJsons.get(pluginToLoad);
        if (!pluginJson) {
          continue;
        }
        const { url, ...json } = pluginJson;

        const plugin: InstalledPlugin = {
          name: pluginJson.name,
          url: pluginJson.url,
          json,
        };

        if (plugin) {
          setPlugins(prev => [...prev, plugin]);
        }

        host.logger.info(`${plugin.name} loaded.`);
      }
    }
  }

  const handleMessages = () => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "say-hello") {
        host.logger.info(event.data.message);
      }
    });
  }

  const emitHostEvents = () => {
    // Host can emit events that plugins can listen to
    // Example: host.emit('hostReady', { version: '1.0.0' });
    host.logger.info('Host ready, plugins can now listen to host events');
  }

  onMount(async () => {
    loadPlugins();

    handleMessages();
    emitHostEvents();
  });
  

  return (
    <div class="flex flex-col gap-4 p-4">
      <h1>
        Host Page
      </h1>

      <InstalledPlugins plugins={plugins()} />

      <div class="flex flex-col gap-4 border p-4 h-128">
        <h2 class="text-lg font-bold">Plugin Frames</h2>

        <div class="flex gap-x-4 space-x-4 h-full">
          {plugins().map(plugin => (
            <PluginFrame url={plugin.url} name={plugin.name} />
          ))}
        </div>
      </div>

      <RandomNumbers />
    </div>
  )
}

export default App
