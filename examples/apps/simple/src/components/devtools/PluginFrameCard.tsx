import type { RegisteredPluginContext } from "app-sdk";

interface PluginFrameProps {
  url: string;
  name: string;
  registeredPluginContext: RegisteredPluginContext;
}

function PluginFrameCard(props: PluginFrameProps) {
  const sendTime = () => {
    const pluginContext = props.registeredPluginContext;
    if(!pluginContext) return;

    pluginContext.emit('app.onReceiveTime', new Date().toISOString());
  }

  return (
    <div class="flex flex-col gap-2 border-2 border-gray-300 rounded-md p-4">
      <div class="flex flex-col gap-2">
        <h3 class="text-lg font-bold">{props.name}</h3>
        <p class="text-sm text-gray-500">{props.url}</p>
      </div>

      <button class="px-4 py-2 bg-green-500 text-white rounded" onClick={sendTime}>
        Send Time to {props.name}
      </button>
    </div>
  );
}

export { PluginFrameCard };
