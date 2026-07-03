const VALUE = Symbol('VALUE');

export type DeepWeakMapKey = Iterable<WeakKey>;

/**
 * The DeepWeakMap object holds key-value pairs where the key is an Iterable of unknown values.
 */
export class DeepWeakMap<GValue> {
  readonly #root: WeakMap<WeakKey, unknown>;

  constructor(input?: Iterable<readonly [DeepWeakMapKey, GValue]>) {
    this.#root = new WeakMap();

    if (input !== undefined) {
      for (const [key, value] of input) {
        this.set(key, value);
      }
    }
  }

  /**
   * Adds a new element with a specified key and value to the DeepWeakMap.
   * If an element with the same key already exists, the element will be updated.
   */
  set(key: DeepWeakMapKey, value: GValue): this {
    let map: WeakMap<WeakKey, unknown> = this.#root;

    for (const subKey of key) {
      let subMap: WeakMap<WeakKey, unknown> | undefined = map.get(subKey) as
        WeakMap<WeakKey, unknown> | undefined;
      if (subMap === undefined) {
        subMap = new WeakMap<WeakKey, unknown>();
        map.set(subKey, subMap);
      }
      map = subMap;
    }

    map.set(VALUE, value);

    return this;
  }

  /**
   * Returns the element associated with the specified key from the DeepWeakMap.
   *
   * @returns the element associated with the specified key. If no element is associated with the specified key, undefined is returned.
   */
  get(key: DeepWeakMapKey): GValue | undefined {
    let map: WeakMap<WeakKey, unknown> = this.#root;

    for (const subKey of key) {
      map = map.get(subKey) as Map<WeakKey, unknown>;
      if (map === undefined) {
        return undefined;
      }
    }

    return map.get(VALUE) as GValue | undefined;
  }

  /**
   * Returns `true` if the element associated with the specified key exists in the DeepWeakMap
   *
   * @returns boolean indicating whether an element with the specified key exists or not.
   */
  has(key: DeepWeakMapKey): boolean {
    let map: WeakMap<WeakKey, unknown> = this.#root;

    for (const subKey of key) {
      map = map.get(subKey) as Map<WeakKey, unknown>;
      if (map === undefined) {
        return false;
      }
    }

    return map.has(VALUE);
  }

  /**
   * Returns the element associated with the specified key from the DeepWeakMap.
   * If this element does not exist, then `factory` is called, the returned value is inserted in the DeepWeakMap, and this value is returned.
   *
   * @returns the value existing or inserted associated with the specified key.
   */
  upsert(key: DeepWeakMapKey, factory: () => GValue): GValue {
    if (this.has(key)) {
      return this.get(key) as GValue;
    } else {
      const value: GValue = factory();
      this.set(key, value);
      return value;
    }
  }

  /**
   * Removes the element associated with the specified key from the DeepWeakMap.
   *
   * @returns true if an element in the DeepMap existed and has been removed, or false if the element does not exist.
   */
  delete(key: DeepWeakMapKey): boolean {
    let map: WeakMap<WeakKey, unknown> = this.#root;

    for (const subKey of key) {
      map = map.get(subKey) as WeakMap<WeakKey, unknown>;
      if (map === undefined) {
        return false;
      }
    }

    return map.delete(VALUE);
  }
}
