import type { InstalledPlugin } from "../types";

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

export { PluginCard };
