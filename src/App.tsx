import { toposortReverse } from '@n1ru4l/toposort';
import { createSignal, onMount } from 'solid-js';
import type { PluginJson } from './lib/plugin-core';
import { PLUGINS_TO_INSTALL } from './data/plugins';

export type PluginToInstall = {
  url: string;
}

export type InstalledPlugin = {
  name: string;
  url: string;
  json: PluginJson;
}

function PluginFrame(props: { url: string, name: string }) {
  const [loaded, setLoaded] = createSignal(false);

  let iframe: HTMLIFrameElement | undefined;

  const sendHelloToPlugin = () => {
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage({
      type: "say-hello",
      message: "Hello from the host",
    }, "*");
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
          ref={iframe}
          src={props.url}
          class="w-full h-full"
          onLoad={() => setLoaded(true)}
          style={ !loaded()
            ? { visibility: "hidden" }
            : undefined
          }
        />
      </div>

      <button class="px-4 py-2 bg-green-500 text-white rounded" onClick={sendHelloToPlugin}>
        Say Hello to {props.url}
      </button>
    </div>
  );
}

function PluginCard(props: { plugin: InstalledPlugin }) {
  const dependencies = Object.keys(props.plugin.json.dependencies || {});

  return (
    <div class="flex flex-col gap-2">
      <h3 class="text-lg font-bold">{props.plugin.json.name} v{props.plugin.json.version}</h3>
      <p class="text-sm text-gray-500">{props.plugin.json.description}</p>
      {dependencies.length > 0 && (
        <p class="text-sm text-gray-500">Dependencies: {dependencies.join(', ')}</p>
      )}
    </div>
  );
}

function InstalledPlugins(props: { plugins: InstalledPlugin[] }) {
  return (
    <div class="flex flex-col gap-4 border p-4">
      <h2 class="text-lg font-bold">Installed Plugins</h2>
      
      <div class="flex gap-x-4 border p-4 space-x-4">
        {props.plugins.map(plugin => (
          <PluginCard plugin={plugin} />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [plugins, setPlugins] = createSignal<InstalledPlugin[]>([]);
  const deps = new Map<string, Set<string>>();

  const loadPlugins = async () => {
    console.log("Loading plugins");

    const loadedPluginJsons = new Map<string, PluginJson & { url: string }>();

    console.log("Fetching plugin.json files");
    for await (const plugin of PLUGINS_TO_INSTALL) {
      const res = await fetch(`${plugin.url}/plugin.json`);
      const pluginJson = await res.json();
      loadedPluginJsons.set(pluginJson.name, { ...pluginJson, url: plugin.url });

      const depNames = Object.keys(pluginJson.dependencies || {});
      deps.set(pluginJson.name, new Set(depNames));

      console.log(`${pluginJson.name} plugin.json loaded.`);
      // console.log(`${JSON.stringify(pluginJson)}`);
    }

    console.log("Sorting and loading plugins");

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

        console.log(`${plugin.name} loaded.`);
        // console.log(`${JSON.stringify(plugin)}`);
      }
    }
  }

  const handleMessages = () => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "say-hello") {
        console.log(event.data.message);
      }
    });
  }


  onMount(async () => {
    loadPlugins();

    handleMessages();
  });
  

  return (
    <div class="flex flex-col gap-4 p-4">
      <h1>
        Host Page
      </h1>

      <InstalledPlugins plugins={plugins()} />

      <div class="flex flex-col gap-4 border p-4">
        <h2 class="text-lg font-bold">Plugin Frames</h2>

        <div class="flex gap-x-4 space-x-4">
          {plugins().map(plugin => (
            <PluginFrame url={plugin.url} name={plugin.name} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
