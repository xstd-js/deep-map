import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';
import { EphemeralDeepMap } from './ephemeral-deep-map.js';

describe('EphemeralDeepMap', (): void => {
  beforeEach((): void => {
    vi.useFakeTimers();
  });

  afterEach((): void => {
    vi.useRealTimers();
  });

  describe('constructor', (): void => {
    it('throws when keepalive is NaN', (): void => {
      expect(() => new EphemeralDeepMap<number>(NaN)).toThrow('Keepalive must be greater than 0');
    });

    it('throws when keepalive is not a safe integer', (): void => {
      expect(() => new EphemeralDeepMap<number>(1.5)).toThrow('Keepalive must be greater than 0');
    });

    it('throws when keepalive is less than or equal to 0', (): void => {
      expect(() => new EphemeralDeepMap<number>(0)).toThrow('Keepalive must be greater than 0');
      expect(() => new EphemeralDeepMap<number>(-1)).toThrow('Keepalive must be greater than 0');
    });

    it('creates an empty map when no input is provided', (): void => {
      const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

      expect(map.size).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('accepts initial entries', (): void => {
      const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000, [[[1, 2], 3]]);

      expect(map.size).toBe(1);
      expect(map.get([1, 2])).toBe(3);
    });
  });

  describe('properties', (): void => {
    describe('keepalive', (): void => {
      it('returns the expected keepalive', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1234);

        expect(map.keepalive).toBe(1234);
      });
    });

    describe('size', (): void => {
      it('returns the expected size', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1, 2], 1);
        expect(map.size).toBe(1);

        map.set([1, 3], 2);
        expect(map.size).toBe(2);

        map.delete([1, 3]);
        expect(map.size).toBe(1);
      });
    });
  });

  describe('methods', (): void => {
    describe('set/get/has', (): void => {
      test('key=[]', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([], 1);
        expect(map.get([])).toBe(1);
        expect(map.has([])).toBe(true);
      });

      test('key=[1]', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1], 1);
        expect(map.get([1])).toBe(1);
        expect(map.has([1])).toBe(true);
      });

      it('sets and returns the expected value', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1, 2], 1);
        expect(map.get([1, 2])).toBe(1);
        expect(map.has([1, 2])).toBe(true);
      });

      it('supports value override when using the same key', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1, 2], 1);
        expect(map.get([1, 2])).toBe(1);

        map.set([1, 2], 2);
        expect(map.get([1, 2])).toBe(2);
      });

      it('returns undefined when the key is not present', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1, 2], 1);
        expect(map.has([1, 3])).toBe(false);
        expect(map.get([1, 3])).toBe(undefined);
      });

      it('starts only one timer per entry', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1], 1);
        expect(vi.getTimerCount()).toBe(1);

        map.set([1], 2);
        expect(vi.getTimerCount()).toBe(1);
      });

      it('extends the entry lifetime when using get', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1], 1);
        vi.advanceTimersByTime(600);

        expect(map.get([1])).toBe(1);
        vi.advanceTimersByTime(600);
        expect(map.get([1])).toBe(1);

        vi.advanceTimersByTime(1000);
        expect(map.get([1])).toBe(undefined);
      });

      it('extends the entry lifetime when using has', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1], 1);
        vi.advanceTimersByTime(600);

        expect(map.has([1])).toBe(true);
        vi.advanceTimersByTime(600);
        expect(map.has([1])).toBe(true);

        vi.advanceTimersByTime(1000);
        expect(map.has([1])).toBe(false);
      });

      it('does not extend the lifetime when the key is not present', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        vi.advanceTimersByTime(1000);

        expect(map.get([1])).toBe(undefined);
        expect(map.has([1])).toBe(false);
        expect(vi.getTimerCount()).toBe(0);
      });
    });

    describe('upsert', (): void => {
      it('returns the existing value without calling the factory', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);
        const factory = vi.fn((): number => 3);

        map.set([1, 2], 1);

        expect(map.upsert([1, 2], factory)).toBe(1);
        expect(factory).not.toHaveBeenCalled();
      });

      it('inserts the value returned by the factory when the key is not present', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);
        const factory = vi.fn((): number => 3);

        expect(map.upsert([1, 2], factory)).toBe(3);
        expect(factory).toHaveBeenCalledTimes(1);
        expect(map.get([1, 2])).toBe(3);
      });
    });

    describe('delete', (): void => {
      test('key=[]', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([], 1);
        expect(map.delete([])).toBe(true);
        expect(map.get([])).toBe(undefined);
      });

      it('removes the entry and stops its timer', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1, 2], 1);
        expect(map.delete([1, 2])).toBe(true);
        expect(map.get([1, 2])).toBe(undefined);
        expect(map.size).toBe(0);
        expect(vi.getTimerCount()).toBe(0);
      });

      it('returns false if the key is not present', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        expect(map.delete([])).toBe(false);
        expect(map.delete([1, 2])).toBe(false);
      });
    });

    describe('clear', (): void => {
      it('removes all entries and stops all timers', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1, 2], 1);
        map.set([1, 2, 3], 3);
        expect(map.size).toBe(2);
        expect(vi.getTimerCount()).toBe(2);

        map.clear();
        expect(map.size).toBe(0);
        expect(vi.getTimerCount()).toBe(0);
        expect(map.get([1, 2])).toBe(undefined);
      });
    });

    describe('expiration', (): void => {
      it('keeps the entry before the keepalive', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1], 1);
        vi.advanceTimersByTime(999);

        expect(map.get([1])).toBe(1);
      });

      it('removes the entry after the keepalive', (): void => {
        const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000);

        map.set([1], 1);
        vi.advanceTimersByTime(1000);

        expect(map.size).toBe(0);
        expect(map.get([1])).toBe(undefined);
        expect(vi.getTimerCount()).toBe(0);
      });
    });

    describe('iterator', (): void => {
      describe('entries', (): void => {
        it('lists all entries and extends their lifetime', (): void => {
          const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000, [
            [[1, 2], 3],
            [[1, 4], 5],
          ]);

          expect(Array.from(map.entries())).toEqual([
            [[1, 2], 3],
            [[1, 4], 5],
          ]);
          expect(vi.getTimerCount()).toBe(2);

          vi.advanceTimersByTime(600);
          Array.from(map.entries());
          vi.advanceTimersByTime(600);
          expect(map.size).toBe(2);
        });
      });

      describe('keys', (): void => {
        it('lists all keys', (): void => {
          const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000, [[[1, 2], 3]]);

          expect(Array.from(map.keys())).toEqual([[1, 2]]);
        });
      });

      describe('values', (): void => {
        it('lists all values', (): void => {
          const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000, [[[1, 2], 3]]);

          expect(Array.from(map.values())).toEqual([3]);
        });
      });

      describe('[Symbol.iterator]', (): void => {
        it('is iterable', (): void => {
          const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000, [[[1, 2], 3]]);

          expect(Array.from(map)).toEqual([[[1, 2], 3]]);
        });
      });

      describe('forEach', (): void => {
        it('calls the callback for each entry', (): void => {
          const map: EphemeralDeepMap<number> = new EphemeralDeepMap<number>(1000, [[[1, 2], 3]]);

          const spy = vi.fn();
          map.forEach(spy);

          expect(spy).toHaveBeenCalledTimes(1);
          expect(spy).toHaveBeenNthCalledWith(1, 3, [1, 2], map);
        });
      });
    });
  });
});
