import { describe, expect, it, test } from 'vitest';
import { DeepWeakMap } from './deep-weak-map.js';

describe('DeepWeakMap', (): void => {
  const a = {};
  const b = {};
  const c = {};
  const d = {};

  describe('constructor', (): void => {
    it('accepts an iterable or entries', (): void => {
      const map: DeepWeakMap<number> = new DeepWeakMap<number>([[[a, b], 3]]);

      expect(map.get([a, b])).toBe(3);
    });
  });

  describe('methods', (): void => {
    describe('set/get/has', (): void => {
      test('key=[]', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([], 1);
        expect(map.get([])).toBe(1);
        expect(map.has([])).toBe(true);
      });

      test('key=[a]', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([a], 1);
        expect(map.get([a])).toBe(1);
        expect(map.has([a])).toBe(true);
      });

      test('set and returns expected value', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([a, b], 1);
        expect(map.get([a, b])).toBe(1);
        expect(map.has([a, b])).toBe(true);
      });

      it('supports value override when using the same key', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([a, b], 1);
        expect(map.get([a, b])).toBe(1);

        map.set([a, b], 2);
        expect(map.get([a, b])).toBe(2);
      });

      it('supports multiple sub-keys', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([a, b], 1);
        expect(map.get([a, b])).toBe(1);

        map.set([a, c], 2);
        expect(map.get([a, c])).toBe(2);
      });
    });

    describe('has', (): void => {
      it('must returns false if the key is not present', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([a, b], 1);
        expect(map.has([a, b])).toBe(true);
        expect(map.has([a, c])).toBe(false);
        expect(map.get([a, c])).toBe(undefined);
      });
    });

    describe('upsert', (): void => {
      it('must get existing value', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([a, b], 1);

        expect(map.upsert([a, b], () => 3)).toBe(1);
      });

      it('must insert non existing value', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        expect(map.upsert([a, b], () => 3)).toBe(3);
      });
    });

    describe('delete', (): void => {
      test('key=[]', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([], 1);
        expect(map.delete([])).toBe(true);
        expect(map.get([])).toBe(undefined);
      });

      test('key=[a]', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([a], 1);
        expect(map.delete([a])).toBe(true);
        expect(map.get([a])).toBe(undefined);
      });

      test('key=[a, b]', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([a, b], 1);
        expect(map.delete([a, b])).toBe(true);
        expect(map.get([a, b])).toBe(undefined);
      });

      it('must returns false if the key is not present', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        expect(map.delete([])).toBe(false);
        expect(map.delete([a, b])).toBe(false);
      });

      it('supports extended keys', (): void => {
        const map: DeepWeakMap<number> = new DeepWeakMap<number>();

        map.set([a, b], 1);
        map.set([a, b, c], 3);
        map.set([a, d], 4);
        expect(map.delete([a, b])).toBe(true);
        expect(map.get([a, b, c])).toBe(3);
        expect(map.delete([a, b, c])).toBe(true);
      });
    });
  });
});
