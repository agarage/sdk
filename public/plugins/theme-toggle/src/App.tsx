console.log("Hello world App.tsx loaded");

import { createSignal } from 'solid-js';

function App() {
  const [theme, setTheme] = createSignal<'light' | 'dark'>('light');
  
  return (
    <div class="flex flex-col items-center justify-center h-screen gap-4">
      <h1 class="text-2xl font-bold">Theme: {theme()}</h1>
      <button class="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setTheme(theme() === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}

export default App
