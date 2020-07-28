# @lxsmnsyc/dendro

> Simple, granular, reactive, composable state management library. Inspired by Recoil.

## Install

```bash
npm install @lxsmnsyc/dendro
```
```bash
yarn add @lxsmnsyc/dendro
```

## Usage

### Creating a Dendro instance

The package exports a function for constructing `Dendro` instances. This function accepts a function that supplies the composable logic and returns the state of the `Dendro`.

```ts
import dendro from '@lxsmnsyc/dendro';

const counter = dendro(() => 0);
```

You can call the `read` method to receive the value, or you can use the `addListener` to receive and handle the new values.

```ts
const currentCount = counter.read(); // 0

currentCount.addListener((value) => {
  // yet to receive an update.
});
```

A `Dendro` instance can update its state using `write`.

```ts
counter.write(counter.read() + 1);
```

### Adding a Dendro dependency

The function provided to the constructor may receive a function that handles subscription to another `Dendro` instance and allows reactive re-computation.

```ts
const delayedCounter = dendro(async (get) => {
  // Read counter value and register as a dependency
  const value = get(counter);
  await sleep(2000);
  return `Delayed for 2s : ${value}`;
});

delayedCounter.addListener((value) => {
  value.then(console.log); // Delayed for 2s : 5
});

counter.write(5);
```

Whenever the dependencies emits a new value (either through `write` or reactive recomputation), the dependent `Dendro` instance recomputes its value.

The `get` function can be called anywhere inside the function, useful for conditional dependencies or arbitrary number of dependencies.

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)