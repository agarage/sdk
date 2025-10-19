import type { InstalledPlugin } from "../types";
import { PluginCard } from "./PluginCard";

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

export { InstalledPlugins }
