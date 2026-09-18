import { DeepMap, type DeepMapKey } from '../deep-map.ts';

/**
 * An entry of an EphemeralDeepMap.
 */
export interface EphemeralDeepMapEntry<GValue> {
  /**
   * The value stored in the entry.
   */
  readonly value: GValue;

  /**
   * The timer responsible for the expiration of the entry.
   */
  timer: ReturnType<typeof setTimeout>;
}

/**
 * The EphemeralDeepMap object holds key-value pairs where the key is an Iterable of unknown values.
 * Each entry is automatically removed after the `keepalive` duration; this duration is extended each time the entry is accessed.
 *
 * @example
 *
 * ```ts
 * const pool = new EphemeralDeepMap<WebSocket>(10000);
 *
 * function getWebSocketFromPool(url: string | URL, protocol?: string): WebSocket {
 *   return pool.upsert([url.toString(), protocol], () => new WebSocket(url, protocol));
 * }
 *
 * const ws1 = getWebSocketFromPool('wss://echo.websocket.org/');
 * // 10 seconds after the last access to the websocket, it is removed from the pool.
 * ```
 */
export class EphemeralDeepMap<GValue> {
  readonly #map: DeepMap<EphemeralDeepMapEntry<GValue>>;
  readonly #keepalive: number;

  /**
   * Creates a new EphemeralDeepMap.
   *
   * @param keepalive the duration in milliseconds after which an entry is removed if it is not accessed.
   * @param input an Iterable of key/value pairs to insert in the EphemeralDeepMap.
   * @throws if `keepalive` is not a strictly positive safe integer.
   */
  constructor(keepalive: number, input?: Iterable<readonly [DeepMapKey, GValue]>) {
    if (Number.isNaN(keepalive) || !Number.isSafeInteger(keepalive) || keepalive <= 0) {
      throw new Error('Keepalive must be greater than 0');
    }

    this.#keepalive = keepalive;
    this.#map = new DeepMap<EphemeralDeepMapEntry<GValue>>();

    if (input !== undefined) {
      for (const [key, value] of input) {
        this.set(key, value);
      }
    }
  }

  /**
   * The duration in milliseconds after which an entry is removed if it is not accessed.
   */
  get keepalive(): number {
    return this.#keepalive;
  }

  /**
   * The number of elements present in the DeepMap.
   */
  get size(): number {
    return this.#map.size;
  }

  #stopEntryTimer(entry: EphemeralDeepMapEntry<GValue>): void {
    clearTimeout(entry.timer);
  }

  #startEntryTimer(key: DeepMapKey): ReturnType<typeof setTimeout> {
    return setTimeout((): void => {
      this.#map.delete(key);
    }, this.#keepalive);
  }

  #refreshEntryTimer(key: DeepMapKey, entry: EphemeralDeepMapEntry<GValue>): void {
    this.#stopEntryTimer(entry);
    entry.timer = this.#startEntryTimer(key);
  }

  /**
   * Adds a new element with a specified key and value to the DeepMap.
   * If an element with the same key already exists, the element will be updated.
   */
  set(key: DeepMapKey, value: GValue): this {
    const entry: EphemeralDeepMapEntry<GValue> | undefined = this.#map.get(key);

    if (entry !== undefined) {
      this.#stopEntryTimer(entry);
    }

    this.#map.set(key, {
      value,
      timer: this.#startEntryTimer(key),
    });

    return this;
  }

  /**
   * Returns the element associated with the specified key from the DeepMap.
   *
   * @returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get(key: DeepMapKey): GValue | undefined {
    const entry: EphemeralDeepMapEntry<GValue> | undefined = this.#map.get(key);

    if (entry === undefined) {
      return undefined;
    } else {
      this.#refreshEntryTimer(key, entry);
      return entry.value;
    }
  }

  /**
   * Returns `true` if the element associated with the specified key exists in the DeepMap
   *
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key: DeepMapKey): boolean {
    const entry: EphemeralDeepMapEntry<GValue> | undefined = this.#map.get(key);

    if (entry === undefined) {
      return false;
    } else {
      this.#refreshEntryTimer(key, entry);
      return true;
    }
  }

  /**
   * Returns the element associated with the specified key from the DeepMap.
   * If this element does not exist, then `factory` is called, the returned value is inserted in the DeepMap, and this value is returned.
   *
   * @returns the value existing or inserted associated with the specified key.
   */
  upsert(key: DeepMapKey, factory: () => GValue): GValue {
    if (this.#map.has(key)) {
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
    const entry: EphemeralDeepMapEntry<GValue> | undefined = this.#map.get(key);

    if (entry !== undefined) {
      this.#stopEntryTimer(entry);
      this.#map.delete(key);
    }

    return entry !== undefined;
  }

  /**
   * Removes all elements from the DeepMap.
   */
  clear(): void {
    for (const entry of this.#map.values()) {
      this.#stopEntryTimer(entry);
    }
    this.#map.clear();
  }

  /**
   * Returns an Iterable of key/value pairs for every entry in the DeepMap.
   */
  *entries(): Generator<readonly [DeepMapKey, GValue]> {
    for (const [key, entry] of this.#map.entries()) {
      this.#refreshEntryTimer(key, entry);
      yield [key, entry.value];
    }
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
