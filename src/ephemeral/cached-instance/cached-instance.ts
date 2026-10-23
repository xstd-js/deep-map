import type { GenericConstructor } from '@xstd/constructor-types';
import { EphemeralDeepMap, type OnEphemeralDeepMapEntryExpired } from '../ephemeral-deep-map.ts';

const CACHED_INSTANCES: EphemeralDeepMap<unknown> = new EphemeralDeepMap<unknown>(60_000);

/**
 * Returns the instance of `ctor` constructed with `args` from the cache.
 * If this instance is not cached, it is constructed with `args`, added to the cache, and returned.
 *
 * Instances are cached in a shared {@link EphemeralDeepMap}, keyed by `[ctor, ...args]`.
 * Each entry is automatically removed 60 seconds after its last access; this duration is extended each time the instance is retrieved.
 * When an entry expires, the cached instance is disposed: `Symbol.asyncDispose` is called if present, otherwise `Symbol.dispose`.
 *
 * @example
 *
 * ```ts
 * class Logger {
 *   constructor(prefix: string) { ... }
 * }
 *
 * const logger1 = cachedInstance(Logger, 'app');
 * const logger2 = cachedInstance(Logger, 'app');
 *
 * console.log(logger1 === logger2); // true
 * ```
 *
 * @param ctor the constructor of the instance to retrieve or create.
 * @param args the arguments passed to `ctor` when the instance is not cached.
 * @returns the cached or newly created instance of `ctor`.
 */
export function cachedInstance<GConstructor extends GenericConstructor>(
  ctor: GConstructor,
  ...args: ConstructorParameters<GConstructor>
): InstanceType<GConstructor> {
  return CACHED_INSTANCES.upsert(
    [ctor, ...args],
    (): InstanceType<GConstructor> => {
      return new ctor(...args);
    },
    ((value: InstanceType<GConstructor>): void => {
      if (Symbol.asyncDispose in value) {
        value[Symbol.asyncDispose]();
      } else if (Symbol.dispose in value) {
        value[Symbol.dispose]();
      }
    }) as OnEphemeralDeepMapEntryExpired<unknown>,
  ) as InstanceType<GConstructor>;
}
