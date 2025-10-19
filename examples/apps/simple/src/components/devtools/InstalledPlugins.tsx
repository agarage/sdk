import type { LoadedPlugin } from "app-sdk";
import { For } from "solid-js";

interface InstalledPluginsProps {
  plugins: LoadedPlugin[];
}

function InstalledPlugins(props: InstalledPluginsProps) {
  return (
    <div class="flex flex-col gap-2">
      <h3 class="text-lg font-bold">Installed Plugins</h3>
      <For each={props.plugins}>
        {(plugin) => <PluginCard plugin={plugin} />}
      </For>
    </div>
  );
}

function PluginCard(props: { plugin: LoadedPlugin }) {
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

export { InstalledPlugins };