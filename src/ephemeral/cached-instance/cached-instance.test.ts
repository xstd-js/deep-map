import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cachedInstance } from './cached-instance.js';

describe('cachedInstance', (): void => {
  beforeEach((): void => {
    vi.useFakeTimers();
  });

  afterEach((): void => {
    // expires every cached instance of the shared cache, stopping all its timers
    vi.advanceTimersByTime(60_000);
    vi.useRealTimers();
  });

  it('creates a new instance when not cached', (): void => {
    let constructionsCount: number = 0;
    class Foo {
      constructor() {
        constructionsCount++;
      }
    }

    const instance: Foo = cachedInstance(Foo);

    expect(instance).toBeInstanceOf(Foo);
    expect(constructionsCount).toBe(1);
  });

  it('returns the same instance when called twice with the same constructor and arguments', (): void => {
    let constructionsCount: number = 0;
    class Foo {
      constructor() {
        constructionsCount++;
      }
    }

    const first: Foo = cachedInstance(Foo);
    const second: Foo = cachedInstance(Foo);

    expect(second).toBe(first);
    expect(constructionsCount).toBe(1);
  });

  it('passes the provided arguments to the constructor', (): void => {
    const calls: unknown[][] = [];
    class Foo {
      constructor(...args: unknown[]) {
        calls.push(args);
      }
    }

    cachedInstance(Foo, 'x', 1, true);

    expect(calls).toEqual([['x', 1, true]]);
  });

  it('returns distinct instances for different arguments', (): void => {
    class Foo {
      readonly value: string;

      constructor(value: string) {
        this.value = value;
      }
    }

    const a: Foo = cachedInstance(Foo, 'a');
    const b: Foo = cachedInstance(Foo, 'b');

    expect(b).not.toBe(a);
    expect(a.value).toBe('a');
    expect(b.value).toBe('b');
  });

  it('returns distinct instances for different constructors', (): void => {
    class Foo {}
    class Bar {}

    const foo: Foo = cachedInstance(Foo);
    const bar: Bar = cachedInstance(Bar);

    expect(foo).toBeInstanceOf(Foo);
    expect(bar).toBeInstanceOf(Bar);
    expect(bar).not.toBe(foo);
  });

  it('creates a new instance after the keepalive expires', (): void => {
    let instanceId: number = 0;
    class Foo {
      readonly id: number;

      constructor() {
        this.id = instanceId++;
      }
    }

    const first: Foo = cachedInstance(Foo);
    vi.advanceTimersByTime(60_000);
    const second: Foo = cachedInstance(Foo);

    expect(second).not.toBe(first);
    expect(second.id).toBe(1);
  });

  it('extends the instance lifetime on each access', (): void => {
    let instanceId: number = 0;
    class Foo {
      readonly id: number;

      constructor() {
        this.id = instanceId++;
      }
    }

    const first: Foo = cachedInstance(Foo);

    vi.advanceTimersByTime(59_999);
    expect(cachedInstance(Foo)).toBe(first);

    vi.advanceTimersByTime(59_999);
    expect(cachedInstance(Foo)).toBe(first);

    vi.advanceTimersByTime(60_000);
    expect(cachedInstance(Foo)).not.toBe(first);
    expect(instanceId).toBe(2);
  });
});
