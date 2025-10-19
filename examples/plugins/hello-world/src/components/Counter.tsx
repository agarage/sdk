import { createSignal } from "solid-js";

function Counter() {
    const [count, setCount] = createSignal(0);
  
    return (
      <button onClick={() => setCount(count() + 1)} class="px-4 py-2 bg-blue-500 text-white rounded flex items-center justify-center gap-2">
        Reactive Counter:
          <span class="text-sm text-white">{count()}</span>
      </button>
    );
}

export { Counter };
