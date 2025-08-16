const VALUE = Symbol('VALUE');

export type DeepMapKey = Iterable<unknown>;

/**
 * The DeepMap object holds key-value pairs where the key is an Iterable of unknown values.
 *
 * @example
 *
 * ```ts
 * const pool = new DeepMap<WebSocket>();
 *
 * function getWebSocketFromPool(url: string | URL, protocol?: string): WebSocket {
 *   return pool.upsert([url.toString(), protocol], () => new WebSocket(url, protocol));
 * }
 *
 * const ws1 = getWebSocketFromPool('wss://echo.websocket.org/');
 * const ws2 = getWebSocketFromPool('wss://echo.websocket.org/');
 * console.assert(ws1 === ws2);
 * ```
 */
export class DeepMap<GValue> {
  readonly #root: Map<unknown, unknown>;
  #size: number; // computed

  constructor(input?: Iterable<readonly [DeepMapKey, GValue]>) {
    this.#root = new Map();
    this.#size = 0;

    if (input !== undefined) {
      for (const [key, value] of input) {
        this.set(key, value);
      }
    }
  }

  /**
   * The number of elements present in the DeepMap.
   */
  get size(): number {
    return this.#size;
  }

  /**
   * Adds a new element with a specified key and value to the DeepMap.
   * If an element with the same key already exists, the element will be updated.
   */
  set(key: DeepMapKey, value: GValue): this {
    let map: Map<unknown, unknown> = this.#root;

    for (const subKey of key) {
      let subMap: Map<unknown, unknown> | undefined = map.get(subKey) as
        | Map<unknown, unknown>
        | undefined;
      if (subMap === undefined) {
        subMap = new Map<unknown, unknown>();
        map.set(subKey, subMap);
      }
      map = subMap;
    }

    if (!map.has(VALUE)) {
      this.#size++;
    }

    map.set(VALUE, value);

    return this;
  }

  /**
   * Returns the element associated with the specified key from the DeepMap.
   *
   * @returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get(key: DeepMapKey): GValue | undefined {
    let map: Map<unknown, unknown> = this.#root;

    for (const subKey of key) {
      map = map.get(subKey) as Map<unknown, unknown>;
      if (map === undefined) {
        return undefined;
      }
    }

    return map.get(VALUE) as GValue | undefined;
  }

  /**
   * Returns `true` if the element associated with the specified key exists in the DeepMap
   *
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key: DeepMapKey): boolean {
    let map: Map<unknown, unknown> = this.#root;

    for (const subKey of key) {
      map = map.get(subKey) as Map<unknown, unknown>;
      if (map === undefined) {
        return false;
      }
    }

    return map.has(VALUE);
  }

  /**
   * Returns the element associated with the specified key from the DeepMap.
   * If this element does not exist, then `factory` is called, the returned value is inserted in the DeepMap, and this value is returned.
   *
   * @returns the value existing or inserted associated with the specified key.
   */
  upsert(key: DeepMapKey, factory: () => GValue): GValue {
    if (this.has(key)) {
      return this.get(key) as GValue;
    } else {
      const value: GValue = factory();
      this.set(key, value);
      return value;
    }
  }

  /**
   * Removes the element associated with the specified key from the DeepMap.
   *
   * @returns true if an element in the DeepMap existed and has been removed, or false if the element does not exist.
   */
  delete(key: DeepMapKey): boolean {
    let map: Map<unknown, unknown> = this.#root;

    for (const subKey of key) {
      map = map.get(subKey) as Map<unknown, unknown>;
      if (map === undefined) {
        return false;
      }
    }

    if (map.delete(VALUE)) {
      this.#size--;

      if (map.size === 0) {
        const keys: unknown[] = [];
        const maps: Map<unknown, unknown>[] = [this.#root];
        map = this.#root;

        for (const subKey of key) {
          map = map.get(subKey) as Map<unknown, unknown>;
          keys.push(subKey);
          maps.push(map);
        }

        for (let i: number = maps.length - 1; i > 0; i--) {
          const subMap: Map<unknown, unknown> = maps[i];
          if (subMap.size === 0) {
            maps[i - 1].delete(keys[i - 1]);
          }
        }
      }

      return true;
    } else {
      return false;
    }
  }

  /**
   * Removes all elements from the DeepMap.
   */
  clear(): void {
    this.#root.clear();
    this.#size = 0;
  }

  /**
   * Returns an Iterable of key/value pairs for every entry in the DeepMap.
   */
  entries(): Generator<readonly [DeepMapKey, GValue]> {
    const iterate = function* (
      key: DeepMapKey,
      map: Map<unknown, unknown>,
    ): Generator<readonly [DeepMapKey, GValue]> {
      if (map.has(VALUE)) {
        yield [key, map.get(VALUE) as GValue];
      }

      for (const [subKey, subMap] of map.entries()) {
        if (subKey !== VALUE) {
          yield* iterate([...key, subKey], subMap as Map<unknown, unknown>);
        }
      }
    };

    return iterate([], this.#root);
  }

  /**
   * Returns an Iterable of keys in the DeepMap.
   */
  *keys(): Generator<DeepMapKey> {
    for (const [key] of this.entries()) {
      yield key;
    }
  }

  /**
   * Returns an Iterable of values in the DeepMap.
   */
  *values(): Generator<GValue> {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }

  /**
   * Returns an Iterable of entries in the DeepMap.
   */
  [Symbol.iterator](): Generator<readonly [DeepMapKey, GValue]> {
    return this.entries();
  }

  /**
   * Executes the provided function once per each key/value pair in the DeepMap.
   */
  forEach(callbackFnc: (value: GValue, key: DeepMapKey, map: this) => void): void {
    for (const [key, value] of this.entries()) {
      callbackFnc(value, key, this);
    }
  }
}
