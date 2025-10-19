import { createSignal, For } from "solid-js";
import { app } from "../app";

function RandomNumbers() {
  const [randomNumbers, setRandomNumbers] = createSignal<number[]>([]);

  app.on('onReceiveRandomNumber', (number: number) => {
    setRandomNumbers(prev => [...prev, number]);
  });

  return (
    <div class="flex flex-col gap-4 border p-4">
      <h2 class="text-lg font-bold">Random Numbers</h2>

      <div class="flex flex-col gap-2">
        <For each={randomNumbers()}>
          {(number) => (
            <p class="text-sm text-gray-500">{number}</p>
          )}
        </For>
      </div>
    </div>
  );
}

export { RandomNumbers };
