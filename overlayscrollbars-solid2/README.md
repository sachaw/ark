# overlayscrollbars-solid on Solid 2

Not part of the ark fork — this is the other 1.x-only dependency **our client**
uses. One consumer: `client/packages/ui/core/primitives/scroll-area/ScrollArea.tsx`.

`overlayscrollbars-solid@0.5.6` (last published 2025-01-05, peer `solid-js@^1.7.0`,
no prerelease line). Its Solid coupling is **2 files / 138 lines**, and the
package exposes a `solid` export condition pointing at that uncompiled source.
The `overlayscrollbars` core it wraps is framework-agnostic and unaffected.

## Changes

`createOverlayScrollbars.js` — three single-arg `createRenderEffect`s split into
`(compute, apply)`.

`OverlayScrollbarsComponent.jsx`
- `mergeProps` → `merge`, `splitProps` → `omit` (rest-only; locals read off props)
- `Dynamic` ← `@solidjs/web`
- `createEffect` / `createRenderEffect` → two-arg form; the effect's `onCleanup`
  becomes a **returned** cleanup
- the 1.x object-ref branch (`finalProps.ref = ref`) is gone — 2.0 refs are
  always functions, and assigning to a props proxy would throw
- `merge` treats an explicit `undefined` as a real overriding value (1.x
  `mergeProps` skipped it), so the `element` default is applied at the use site

`types/*.d.ts` — `Store` moves from the removed `solid-js/store` subpath into
`solid-js`; `JSX`, `ComponentProps` and `ValidComponent` move to `@solidjs/web`.
2.0 splits these: `solid-js` keeps the renderer-neutral `ValidComponent =
Component<any>`, which does NOT accept intrinsic tag names, so
`ComponentProps<'div'>` only compiles against the `@solidjs/web` versions.

## Verification

`solid-js@2.0.0-rc.6`, 23/23 assertions, plus 0 type errors on the ported `.d.ts`.

- `test.js` (14) — renders, default `div`, custom element, init marker, rest-prop
  forwarding, contents wrapper, children, function ref with `getElement()` /
  `osInstance()`, a real OverlayScrollbars instance, reactive class + children,
  and stable element identity across updates.
- `test-deferred.js` (9) — mirrors ScrollArea's actual usage: `defer: true`,
  reactive `options` pushed into the live instance, `initialized` / `updated`
  events, and destroy on dispose.

```bash
babel src --config-file babel.jsx.cjs --extensions .js,.jsx --out-dir dist
node --conditions=browser --conditions=development test.js
node --conditions=browser --conditions=development test-deferred.js
```
