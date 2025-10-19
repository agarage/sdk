console.log("Hello world App.tsx loaded");

import { createSignal } from 'solid-js';
import type { ThemeToggleApi } from '../../theme-toggle/src/types/types';

function App() {
  const [count, setCount] = createSignal(0);
  const [messages, setMessages] = createSignal<string[]>([]);

  const themePlugin = SDK.getPluginApi<ThemeToggleApi>("theme-toggle");
  
  console.log("Hello world App component setup");

  const sayHello = () => {
    SDK.send("say-hello", "Hello from the plugin");
  };

  window.addEventListener("message", (event) => {
    if (event.data.type === "say-hello") {
      setMessages(prev => [...prev, event.data.message]);
    }
  });

  return (
    <div class="flex flex-col items-center justify-center h-screen gap-4">
      <h1 class="text-2xl font-bold">{count()}</h1>
      <button class="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setCount(count() + 1)}>
          Increment
      </button>

      {messages().map(message => (
        <div class="text-sm text-gray-500">{message}</div>
      ))}

      <button class="px-4 py-2 bg-blue-500 text-white rounded" onClick={sayHello}>
        Say Hello
      </button>
    </div>
  );
}

export default App
