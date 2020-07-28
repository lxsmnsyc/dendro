# @lxsmnsyc/dendro-react

> React bindings for [@lxsmnsyc/dendro](https://github.com/lxsmnsyc/dendro/tree/master/packages/dendro)

[![NPM](https://img.shields.io/npm/v/@lxsmnsyc/dendro-react.svg)](https://www.npmjs.com/package/@lxsmnsyc/dendro-react)

## Install

```bash
npm install @lxsmnsyc/dendro-react
```
```bash
yarn add @lxsmnsyc/dendro-react
```

## Usage

### useDendroValue

Reactively update component whenever a Dendro instance emits a new value.

```tsx
import dendro from '@lxsmnsyc/dendro';
import { useDendroValue } from '@lxsmnsyc/dendro-react';

const counter = dendro(() => 0);

// ...
const count = useDendroValue(counter);

return (
  <h1>Count: {count}</h1>
);
```

### Dendro Resource

Dendro Resources allows Promise-emitting Dendro instances to Result-emitting Dendro instances.

```tsx
import { createDendroResource } from '@lxsmnsyc/dendro-react;

const userData = dendro(() => fetch('/api/user'));

const userResource = createDendroResource(userData);

const value = userResource.read(); // { status: 'pending' }
```

#### useDendroResource

```tsx
function UserDetails() {
  const { status, value } = useDendroResource(userResource);

  if (status === 'pending') {
    return <Loading />;
  }
  if (status === 'failure') {
    return <ErrorMessage reason={value} />;
  }
  return (
    <h1>Name: {value.name}</h1>
  );
}
```

`useDendroResource` also accepts a second parameter for turning on Suspense mode.

```tsx
function UserDetails() {
  const { value } = useDendroResource(userResource, true);

  return (
    <h1>Name: {value.name}</h1>
  );
}

function Profile() {
  return (
    <Suspense fallback={<Loading />}>
      <UserDetails />
    </Suspense>
  );
}
```

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)