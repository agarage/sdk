import { type LoadedPlugin } from "app-sdk";
import { createSignal, For, Match, onCleanup, onMount, Show, Switch } from "solid-js";

function PluginFrame(props: { plugin: LoadedPlugin }) {
  const [loaded, setLoaded] = createSignal(false);

  const handleLoad = () => {
    setLoaded(true);
  }

  onMount(() => {
    const iframe = props.plugin.iframe;
    
    iframe.addEventListener('load', handleLoad);
  })

  onCleanup(() => {
    const iframe = props.plugin.iframe;
    iframe.removeEventListener('load', handleLoad);
  })

  return (
    <>
      <Show when={!loaded()}>
        <div>Loading...</div>
      </Show>
      
      <div classList={{ 'hidden': !loaded() }}>
        {props.plugin.iframe}
      </div>
    </>
  );
}

function SinglePluginFrame(props: { plugin: LoadedPlugin }) {
  return (
    <div class="relative w-full h-full border-2 border-gray-300 rounded-md">
      <PluginFrame plugin={props.plugin} />
    </div>
  );
}

function PluginFrames(props: { plugins: LoadedPlugin[] }) {
  return (
    <div class="flex flex-col gap-4 border p-4 h-128">
      <h3 class="text-lg font-bold">Plugin Frames</h3>

      <For each={props.plugins}>
        {(plugin) => (
          <SinglePluginFrame plugin={plugin} />
        )}
      </For>
    </div>
  );
}

export { PluginFrames };
