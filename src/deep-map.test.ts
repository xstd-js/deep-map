import { describe, expect, it, test, vi } from 'vitest';
import { DeepMap } from './deep-map.js';

describe('DeepMap', (): void => {
  describe('constructor', (): void => {
    it('accepts an iterable or entries', (): void => {
      const map: DeepMap<number> = new DeepMap<number>([[[1, 2], 3]]);

      expect(map.get([1, 2])).toBe(3);
    });
  });

  describe('properties', (): void => {
    describe('size', (): void => {
      it('returns the expected size', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

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
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([], 1);
        expect(map.get([])).toBe(1);
        expect(map.has([])).toBe(true);
      });

      test('key=[1]', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([1], 1);
        expect(map.get([1])).toBe(1);
        expect(map.has([1])).toBe(true);
      });

      test('set and returns expected value', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([1, 2], 1);
        expect(map.get([1, 2])).toBe(1);
        expect(map.has([1, 2])).toBe(true);
      });

      it('supports value override when using the same key', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([1, 2], 1);
        expect(map.get([1, 2])).toBe(1);

        map.set([1, 2], 2);
        expect(map.get([1, 2])).toBe(2);
      });

      it('supports multiple sub-keys', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([1, 2], 1);
        expect(map.get([1, 2])).toBe(1);

        map.set([1, 3], 2);
        expect(map.get([1, 3])).toBe(2);
      });
    });

    describe('has', (): void => {
      it('must returns false if the key is not present', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([1, 2], 1);
        expect(map.has([1, 2])).toBe(true);
        expect(map.has([1, 3])).toBe(false);
      });
    });

    describe('upsert', (): void => {
      it('must get existing value', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([1, 2], 1);

        expect(map.upsert([1, 2], () => 3)).toBe(1);
      });

      it('must insert non existing value', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        expect(map.upsert([1, 2], () => 3)).toBe(3);
      });
    });

    describe('delete', (): void => {
      test('key=[]', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([], 1);
        expect(map.delete([])).toBe(true);
        expect(map.get([])).toBe(undefined);
      });

      test('key=[1]', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([1], 1);
        expect(map.delete([1])).toBe(true);
        expect(map.get([1])).toBe(undefined);
      });

      test('key=[1, 2]', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([1, 2], 1);
        expect(map.delete([1, 2])).toBe(true);
        expect(map.get([1, 2])).toBe(undefined);
      });

      it('must returns false if the key is not present', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        expect(map.delete([])).toBe(false);
        expect(map.delete([1, 2])).toBe(false);
      });

      it('supports extended keys', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([1, 2], 1);
        map.set([1, 2, 3], 3);
        map.set([1, 4], 4);
        expect(map.delete([1, 2])).toBe(true);
        expect(map.get([1, 2, 3])).toBe(3);
        expect(map.delete([1, 2, 3])).toBe(true);
      });
    });

    describe('clear', (): void => {
      it('removes all entries', (): void => {
        const map: DeepMap<number> = new DeepMap<number>();

        map.set([1, 2], 1);
        map.set([1, 2, 3], 3);
        expect(map.size).toBe(2);
        map.clear();
        expect(map.size).toBe(0);
      });
    });

    describe('iterator', (): void => {
      describe('entries', (): void => {
        it('lists all entries', (): void => {
          const map: DeepMap<number> = new DeepMap<number>([[[1, 2], 3]]);

          expect(Array.from(map.entries())).toEqual([[[1, 2], 3]]);
        });
      });

      describe('keys', (): void => {
        it('lists all keys', (): void => {
          const map: DeepMap<number> = new DeepMap<number>([[[1, 2], 3]]);

          expect(Array.from(map.keys())).toEqual([[1, 2]]);
        });
      });

      describe('values', (): void => {
        it('lists all values', (): void => {
          const map: DeepMap<number> = new DeepMap<number>([[[1, 2], 3]]);

          expect(Array.from(map.values())).toEqual([3]);
        });
      });

      describe('[Symbol.iterator]', (): void => {
        it('is iterable', (): void => {
          const map: DeepMap<number> = new DeepMap<number>([[[1, 2], 3]]);

          expect(Array.from(map)).toEqual([[[1, 2], 3]]);
        });
      });

      describe('forEach', (): void => {
        it('is iterable', (): void => {
          const map: DeepMap<number> = new DeepMap<number>([[[1, 2], 3]]);

          const spy = vi.fn();
          map.forEach(spy);

          expect(spy).toHaveBeenCalledTimes(1);
          expect(spy).toHaveBeenNthCalledWith(1, 3, [1, 2], map);
        });
      });
    });
  });
});
