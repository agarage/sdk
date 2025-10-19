import { usePluginManager } from "app-sdk";
import { For } from "solid-js";
import { InstalledPlugins } from "./InstalledPlugins";
import { PluginFrameCard } from "./PluginFrameCard";

function Devtools() {
  const pluginManager = usePluginManager();

  return (
    <div class="flex flex-col gap-4 p-4">
      <h2>Devtools</h2>

      <InstalledPlugins plugins={pluginManager.plugins()} />

      <div class="flex flex-col gap-4 border p-4 h-128">
        <h3 class="text-lg font-bold">From-app Emissions</h3>

        <div class="flex gap-x-4 space-x-4 h-full">
          <For each={pluginManager.plugins()}>
            {(plugin) => (
              <PluginFrameCard
                url={plugin.url}
                name={plugin.name}
                registeredPluginContext={pluginManager.getLoadedPluginContext(plugin.name)}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

export { Devtools };
