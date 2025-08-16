[![npm (scoped)](https://img.shields.io/npm/v/@xstd/deep-map.svg)](https://www.npmjs.com/package/@xstd/deep-map)
![npm](https://img.shields.io/npm/dm/@xstd/deep-map.svg)
![NPM](https://img.shields.io/npm/l/@xstd/deep-map.svg)
![npm type definitions](https://img.shields.io/npm/types/@xstd/deep-map.svg)
![coverage](https://img.shields.io/badge/coverage-100%25-green)

<picture>
  <source height="64" media="(prefers-color-scheme: dark)" srcset="https://github.com/xstd-js/website/blob/main/assets/logo/png/logo-large-dark.png?raw=true">
  <source height="64" media="(prefers-color-scheme: light)" srcset="https://github.com/xstd-js/website/blob/main/assets/logo/png/logo-large-light.png?raw=true">
  <img height="64" alt="Shows a black logo in light color mode and a white one in dark color mode." src="https://github.com/xstd-js/website/blob/main/assets/logo/png/logo-large-light.png?raw=true">
</picture>

## @xstd/deep-map

A _deep_ Map implementation.

## 📦 Installation

```shell
yarn add @xstd/deep-map
# or
npm install @xstd/deep-map --save
```

## 📜 Documentation

The DeepMap object holds key-value pairs where the key is an Iterable of unknown values.

```ts
export declare class DeepMap<GValue> {
  
  constructor(input?: Iterable<readonly [DeepMapKey, GValue]>);
  
  /**
   * The number of elements present in the DeepMap.
   */
  get size(): number;
  
  /**
   * Adds a new element with a specified key and value to the DeepMap.
   * If an element with the same key already exists, the element will be updated.
   */
  set(key: DeepMapKey, value: GValue): this;
  
  /**
   * Returns the element associated with the specified key from the DeepMap.
   *
   * @returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get(key: DeepMapKey): GValue | undefined;
  
  /**
   * Returns `true` if the element associated with the specified key exists in the DeepMap
   *
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key: DeepMapKey): boolean;
  
  /**
   * Returns the element associated with the specified key from the DeepMap.
   * If this element does not exist, then `factory` is called, the returned value is inserted in the DeepMap, and this value is returned.
   *
   * @returns the value existing or inserted associated with the specified key.
   */
  upsert(key: DeepMapKey, factory: () => GValue): GValue;
  
  /**
   * Removes the element associated with the specified key from the DeepMap.
   *
   * @returns true if an element in the DeepMap existed and has been removed, or false if the element does not exist.
   */
  delete(key: DeepMapKey): boolean;
  
  /**
   * Removes all elements from the DeepMap.
   */
  clear(): void;
  
  /**
   * Returns an Iterable of key/value pairs for every entry in the DeepMap.
   */
  entries(): Generator<readonly [DeepMapKey, GValue]>;
  
  /**
   * Returns an Iterable of keys in the DeepMap.
   */
  keys(): Generator<DeepMapKey>;
  
  /**
   * Returns an Iterable of values in the DeepMap.
   */
  values(): Generator<GValue>;
  
  /**
   * Returns an Iterable of entries in the DeepMap.
   */
  [Symbol.iterator](): Generator<readonly [DeepMapKey, GValue]>;
  
  /**
   * Executes the provided function once per each key/value pair in the DeepMap.
   */
  forEach(callbackFnc: (value: GValue, key: DeepMapKey, map: this) => void): void;
}
```

#### Example

```ts
const pool = new DeepMap<WebSocket>();

function getWebSocketFromPool(url: string | URL, protocol?: string): WebSocket {
  return pool.upsert([url.toString(), protocol], () => new WebSocket(url, protocol));
}

const ws1 = getWebSocketFromPool('wss://echo.websocket.org/');
const ws2 = getWebSocketFromPool('wss://echo.websocket.org/');
console.assert(ws1 === ws2);
```
