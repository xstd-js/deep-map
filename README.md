[![npm (scoped)](https://img.shields.io/npm/v/@xstd/deep-map.svg)](https://www.npmjs.com/package/@xstd/deep-map)
![npm](https://img.shields.io/npm/dm/@xstd/deep-map.svg)
![NPM](https://img.shields.io/npm/l/@xstd/deep-map.svg)
![npm type definitions](https://img.shields.io/npm/types/@xstd/deep-map.svg)
![coverage](https://img.shields.io/badge/coverage-100%25-green)
![AI generation](https://img.shields.io/badge/AI_generation-low-yellow)

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

### DeepMap

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

### DeepWeakMap

The DeepWeakMap object holds key-value pairs where the key is an Iterable of weakly-held values.
Like a WeakMap, its entries are automatically removed when one of their keys is garbage collected.

```ts
export declare type DeepWeakMapKey = Iterable<WeakKey>;

export declare class DeepWeakMap<GValue> {
  constructor(input?: Iterable<readonly [DeepWeakMapKey, GValue]>);

  /**
   * Adds a new element with a specified key and value to the DeepWeakMap.
   * If an element with the same key already exists, the element will be updated.
   */
  set(key: DeepWeakMapKey, value: GValue): this;

  /**
   * Returns the element associated with the specified key from the DeepWeakMap.
   *
   * @returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get(key: DeepWeakMapKey): GValue | undefined;

  /**
   * Returns `true` if the element associated with the specified key exists in the DeepWeakMap
   *
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key: DeepWeakMapKey): boolean;

  /**
   * Returns the element associated with the specified key from the DeepWeakMap.
   * If this element does not exist, then `factory` is called, the returned value is inserted in the DeepWeakMap, and this value is returned.
   *
   * @returns the value existing or inserted associated with the specified key.
   */
  upsert(key: DeepWeakMapKey, factory: () => GValue): GValue;

  /**
   * Removes the element associated with the specified key from the DeepWeakMap.
   *
   * @returns true if an element in the DeepMap existed and has been removed, or false if the element does not exist.
   */
  delete(key: DeepWeakMapKey): boolean;
}
```

#### Example

```ts
const sizes = new DeepWeakMap<number>();

const container: HTMLElement = document.querySelector('.container')!;
const panel: HTMLElement = container.querySelector('.panel')!;

sizes.set([container, panel], panel.getBoundingClientRect().width);

// the entry is automatically removed when `container` or `panel` are garbage collected
```

### EphemeralDeepMap

The EphemeralDeepMap object holds key-value pairs where the key is an Iterable of unknown values.
Each entry is automatically removed after the `keepalive` duration; this duration is extended each time the entry is accessed.
An optional `expired` callback can be provided for each entry; it is called with the value when the entry expires (manual removals with `delete` or `clear`, and replacements with `set`, do not call it).

```ts
export interface OnEphemeralDeepMapEntryExpired<GValue> {
  (value: GValue): any;
}

export declare class EphemeralDeepMap<GValue> {
  constructor(
    keepalive: number,
    input?: Iterable<readonly [DeepMapKey, GValue, OnEphemeralDeepMapEntryExpired<GValue>?]>,
  );

  /**
   * The duration in milliseconds after which an entry is removed if it is not accessed.
   */
  get keepalive(): number;

  /**
   * The number of elements present in the DeepMap.
   */
  get size(): number;

  /**
   * Adds a new element with a specified key and value to the DeepMap.
   * If an element with the same key already exists, the element will be updated.
   */
  set(key: DeepMapKey, value: GValue, expired?: OnEphemeralDeepMapEntryExpired<GValue>): this;

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
  upsert(
    key: DeepMapKey,
    factory: () => GValue,
    expired?: OnEphemeralDeepMapEntryExpired<GValue>,
  ): GValue;

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
const pool = new EphemeralDeepMap<WebSocket>(10000);

function getWebSocketFromPool(url: string | URL, protocol?: string): WebSocket {
  return pool.upsert([url.toString(), protocol], () => new WebSocket(url, protocol));
}

const ws1 = getWebSocketFromPool('wss://echo.websocket.org/');
// 10 seconds after the last access to the websocket, it is removed from the pool.
```

### cachedInstance

Returns the instance of `ctor` constructed with `args` from the cache.
If this instance is not cached, it is constructed with `args`, added to the cache, and returned.

Instances are cached in a shared EphemeralDeepMap, keyed by `[ctor, ...args]`.
Each entry is automatically removed 60 seconds after its last access; this duration is extended each time the instance is retrieved.
When an entry expires, the cached instance is disposed: `Symbol.asyncDispose` is called if present, otherwise `Symbol.dispose`.

```ts
export declare function cachedInstance<GConstructor extends GenericConstructor>(
  ctor: GConstructor,
  ...args: ConstructorParameters<GConstructor>
): InstanceType<GConstructor>;
```

#### Example

```ts
class Logger {
  readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  log(message: string): void {
    console.log(`[${this.prefix}] ${message}`);
  }
}

const logger1 = cachedInstance(Logger, 'app');
const logger2 = cachedInstance(Logger, 'app');
console.assert(logger1 === logger2);
```
