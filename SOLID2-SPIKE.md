# Spike: @ark-ui/solid on Solid 2.0

Branch `solid-2`, forked from chakra-ui/ark @ main (MIT). Validated against
`solid-js@2.0.0-rc.6` / `@solidjs/web@2.0.0-rc.6`.

## Verdict

Viable. No architectural blocker was found. The work is bounded and
concentrated, not spread across the component surface.

## What was actually ported

**`@zag-js/solid` (594 LOC, vendored into `packages/solid/zag-solid/`)** —
lives in a *different repo* (chakra-ui/zag), so a fork of ark alone is not
enough. This is the only Solid-coupled zag package; the other 67 zag deps are
framework-agnostic state machines and need zero changes.

Fully ported, typechecks clean, **18/18 runtime assertions pass** against real
`@zag-js/collapsible` and `@zag-js/select` machines (`spike-env/rt/`).

| file | change |
|---|---|
| `bindable.ts` | **redesigned** — see below |
| `machine.ts` | `onMount`+`onCleanup` → single `onSettled` w/ returned cleanup; `mergeProps` → `merge`; `flush` now drains Solid's queue |
| `track.ts` | manual `prevDeps` bookkeeping → native `createEffect(compute, apply)`; `untrack` on the callback |
| `use-sync-external-store.ts` | `onMount`/`onCleanup` → `onSettled`; generic `createSignal` cast |
| `normalize-props.ts` | `JSX` type ← `@solidjs/web` |
| `refs.ts`, `merge-props.ts` | **unchanged** — no Solid coupling |

### The one real design problem

Solid 2 commits signal writes on flush: `setValue(x); value()` returns the OLD
value until the microtask drains. zag's machine reads state back
*synchronously* inside a transition (`send` reads `state.get()` right after a
prior `state.set()`), so a literal port silently transitions from stale state.

Fix in `bindable.ts`: keep the authoritative value in a plain shadow cell and
demote the signal to a pure change notification. `get()` reads the shadow
(synchronous, always current) while still subscribing, so rendering stays
reactive and the machine stays correct. Covered by the
"two sends in one tick" and "last write wins across one tick" assertions.

## Ark component layer (955 files / 21.3k LOC)

Far smaller than the raw grep suggests: **495 of ark's 498 `mergeProps` call
sites import zag's own implementation**, which has no Solid coupling and needs
no change. Ark's real Solid surface is ~30 distinct symbols.

Codemod applied (`/tmp/codemod.py`): 109 files `JSX` → `@solidjs/web`,
10 `onMount` → `onSettled`, 6 `solid-js/web` → `@solidjs/web`, 4 jsx-runtime,
2 `mergeProps` → `merge`, 1 `solid-js/store` → `solid-js`.

Typecheck errors, and how concentrated they are:

| after | errors | what moved it |
|---|---|---|
| codemod only | 507 | |
| + `factory.tsx` ported | 177 | one file: `splitProps`→`omit`, `ComponentProps` removed |
| + `splitProps` compat shim | **155** | one file: keeps the 1.x `[picked, rest]` tuple so ~200 call sites stay untouched |

## What remains (155 errors)

- **~108 errors, one systemic cause.** Solid 2 widened every JSX attribute to
  `T | RemoveAttribute` (`undefined | false`). Ark's and zag's props both
  declare the narrow `id?: string`, so component roots can no longer extend
  both (TS2320) or forward props into their machine (TS2345). **Not** a
  one-line narrowing — `Exclude<T[K], false>` also destroys genuine boolean
  attributes (`disabled?: boolean` → `true`) and made it *worse*, 155 → 644.
  Needs an attribute-aware mapped type or a widening of ark's base props.
- 12 × `createEffect` single-arg → `(compute, apply)`. Per-site judgement.
- 7 files `Index` → `<For keyed={false}>` (callback shape flips).
- 2 files `.Provider` → `<Context value={...}>`; 1 × `on()` → split effect.
- 10 implicit-any, 5 index-signature, ~8 misc.

## Gotchas worth recording

- `solid-js` resolves to the **server build** under Node's default conditions;
  effects never run. Test with `--conditions=browser --conditions=development`.
- `createSignal<T>(value: Exclude<T, Function>)` — generic library code holding
  a possibly-function value cannot select the plain-value overload without a cast.
- `onSettled` returning a cleanup **hard-errors** if unowned
  (`SETTLED_CLEANUP_UNOWNED`). `useMachine` now requires a live owner at call
  time; an `await` before it loses the owner. 1.x only warned.
- `flush()` inside an effect's *apply* phase is a warned no-op, and
  `getObserver()` is null there (apply runs untracked) so you cannot detect it.
  Defer with `queueMicrotask`.
- Ark's repo uses `bun`; this spike used `npm` + `node --experimental-strip-types`.
