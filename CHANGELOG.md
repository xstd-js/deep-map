# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-10-23

### Added

- `EphemeralDeepMap`: an optional `expired` callback can be registered per entry (through the constructor input, `set`, or `upsert`); it is called with the value when the entry expires.
- Tests for the `expired` callback (100% coverage).

### Changed

- `cachedInstance`: cached instances are now disposed when their cache entry expires (`Symbol.asyncDispose` is called if present, otherwise `Symbol.dispose`).

## [1.2.0] - 2026-09-18

### Added

- `EphemeralDeepMap`: a `DeepMap` whose entries automatically expire after a configurable `keepalive` (in milliseconds). The lifetime of an entry is extended each time it is accessed through `get`, `has`, `upsert`, or the iterators.
- Tests for `EphemeralDeepMap` (100% coverage).

## [1.1.0] - 2026-07-03

### Added

- `DeepWeakMap`: a deep Map holding its keys weakly.

## [1.0.0] - 2025-08-16

### Added

- `DeepMap`: a Map keyed by iterables of unknown values.
