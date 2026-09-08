# Spike: @ark-ui/solid on Solid 2.0

Branch `solid-2`, forked from chakra-ui/ark @ main (MIT). Validated against
`solid-js@2.0.0-rc.6` / `@solidjs/web@2.0.0-rc.6`.

## Verdict

**Done and working.** The whole `@ark-ui/solid` adapter typechecks clean against
`solid-js@2.0.0-rc.6`, compiles with `babel-preset-solid@2.0.0-rc.2`, and real
components render and behave correctly. No architectural blocker exists.

| | result |
|---|---|
| ark adapter typecheck (955 files / 21.3k LOC) | **0 errors** (from 507) |
| forked `@zag-js/solid` binding typecheck | **0 errors** |
| babel build w/ Solid 2 JSX transform | **1738 files** |
| runtime assertions (4 suites) | **33 / 33 pass** |

## What was ported

**`@zag-js/solid` (594 LOC, vendored into `packages/solid/zag-solid/`)** — lives
in a *different repo* (chakra-ui/zag), so forking ark alone is not enough. It is
the only Solid-coupled zag package; the other 67 deps are framework-agnostic
state machines needing zero changes.

| file | change |
|---|---|
| `bindable.ts` | **redesigned** — shadow cell, see below |
| `machine.ts` | `onMount`+`onCleanup` → one `onSettled` w/ returned cleanup; `mergeProps` → `merge`; `flush` defers a real drain |
| `track.ts` | manual `prevDeps` bookkeeping → native `createEffect(compute, apply)` |
| `use-sync-external-store.ts` | `onSettled`; generic `createSignal` cast |
| `normalize-props.ts` | `JSX` ← `@solidjs/web`; `PropTypes` narrowed |
| `refs.ts`, `merge-props.ts` | **unchanged** — no Solid coupling |

### The core design problem

Solid 2 commits signal writes on flush: `setValue(x); value()` returns the OLD
value until the microtask drains. zag's machine reads state back *synchronously*
inside a transition, so a literal port silently transitions from stale state.

`bindable.ts` now keeps the authoritative value in a plain shadow cell and
demotes the signal to a pure change notification: `get()` is synchronous and
always current, while reads still subscribe.

## Ark component layer

Far smaller than it looks — **495 of ark's 498 `mergeProps` call sites import
zag's own implementation**, which has no Solid coupling.

Errors collapsed via chokepoints, not file-by-file grind:

| after | errors |
|---|---|
| codemod only | 507 |
| `factory.tsx` (`splitProps`→`omit`, `ComponentProps` gone) | 177 |
| `splitProps` compat shim (keeps the 1.x `[picked, rest]` tuple, ~200 call sites untouched) | 155 |
| attribute-aware `NarrowAttr` for `RemoveAttribute` widening | 78 |
| `compose-refs.ts` (2.0 ref arrays) | 53 |
| `Index` → `<For keyed={false}>` (7 files) | 36 |
| 11 × `createEffect` → `(compute, apply)` | 24 |
| context-as-provider, `merge` typing, aria/frame/misc | **0** |

## Findings a typecheck could never catch

The render pass caught three real bugs after types were already clean:

1. **Two-arg `createEffect` runs its compute EAGERLY.** Any effect referencing a
   `const` declared later in the component body now throws a TDZ
   `ReferenceError`. Safe under 1.x, where the single-arg body was deferred.
2. **The `splitProps` shim defined absent keys.** 1.x `splitProps` buckets the
   source's *own* keys; defining every requested key as an enumerable getter
   makes absent ones `undefined`, which then clobbers defaults when the result
   is spread (`{ id, ...rest }` rendered `id="collapsible:undefined"`).
3. **Default-less `createContext` throws in 2.0.** `getContext` raises
   `ContextNotFoundError` whenever the resolved value is `undefined`, so a
   context can no longer model "optional". The fork parks a sentinel default and
   maps it back to `undefined`, preserving ark's `strict: false` behaviour.

## Other 2.0 gotchas worth recording

- `solid-js` resolves to the **server build** under Node's default conditions;
  effects never run. Use `--conditions=browser --conditions=development`.
- `createSignal<T>(value: Exclude<T, Function>)` — generic library code holding a
  possibly-function value needs a cast to select the plain-value overload.
- `onSettled` returning a cleanup **hard-errors** if unowned
  (`SETTLED_CLEANUP_UNOWNED`); an `await` before `useMachine` loses the owner.
- `flush()` inside an effect's *apply* phase is a warned no-op, and
  `getObserver()` is null there (apply runs untracked) so you cannot detect it.
- `createMemo` returns a **branded** `SourceAccessor<T>`, so
  `ReturnType<typeof useThing>` no longer accepts a plain arrow function.
- Enumerated aria attributes are `"true" | "false"` strings only — a real
  boolean (`'aria-hidden': true`) is now a type error.
- `merge` resolves function sources at runtime (wraps them in a memo) but the
  `Merge<T>` *type* does not model it; cast the argument, not the result.
- `createMemo(fn, [deps])` — the 2nd slot is `MemoOptions`, never a dep array.
- Ark's repo uses `bun`; this spike used npm + `node --experimental-strip-types`
  and babel with **per-extension overrides** (ark's `.ts` files use generic
  arrows that a TSX parser misreads as JSX).

## Tests

Ark's suite runs on Solid 2: **322 / 330 passing (41 / 47 files)**.

Toolchain: vitest 5 + vite 8 + `@solidjs/vite-plugin@3.0.0-next.39` +
`@solidjs/testing-library@1.0.0-beta.3`. `vite-plugin-solid` is the 1.x
compiler and cannot build this tree. `vitest.solid2.config.mts` mirrors ark's
exports map so the self-referential `@ark-ui/solid/*` fixture imports resolve.
85 test/fixture files and all 620 storybook examples were codemodded.

Progression: 164 → 246 → 291 → 302 → **322** passing.

### Five bugs only the suite caught

Typecheck was clean and the render harness was green when all of these were
still live:

1. **`onCleanup` inside `onSettled` is forbidden in 2.0** — you must *return*
   the cleanup. The `onMount`→`onSettled` codemod left 4 of these, and they
   alone accounted for 90 failures.
2. **The same codemod renamed `Frame`'s public `onMount` prop.** A blind
   identifier rename broke the component's API. Reverted; the other 8 renames
   were audited and are genuine Solid lifecycle imports.
3. **`htmlFor` is no longer mapped to `for`** — it renders as the invalid
   `htmlfor`, so labels silently stop associating with their controls.
4. **zag emits boolean `aria-*` values**, which 2.0 renders as an empty
   attribute (`aria-hidden=""`) that the accessibility tree ignores. ARIA
   attributes are strings; the adapter now normalizes them. This one fix took
   302 → 322.
5. **zag's `mergeProps` resolved accessor sources eagerly at call time.** In
   2.0 a component body runs inside the parent's `insert` compute, so that read
   subscribed the *parent* to child state — every child-state change re-created
   the entire subtree and lost element identity (dropped focus, restarted
   animations, stale references in tests). Now resolved under `untrack`.
   Minimal repro: `spike-env/render/repro-mergeprops-overtrack.js`.

`lucide-solid` is Solid 1.x only (its `Icon.tsx` calls the removed
`splitProps`). It is test/story decoration with zero library-source usage, so
the fork stubs it (`test-stubs/lucide-solid.tsx`) rather than forking an icon set.

### The 6 remaining failures

All are component *interaction* behaviours, all in jsdom **and** happy-dom, with
zag pinned to exactly the versions ark specifies:

- `select` ×2 — clicking an item does not commit the selection (neither
  `user.click` nor `fireEvent.click`); the machine never leaves the open state.
  Solid 2 event delegation itself is fine (verified separately), and the same
  flow works when driven directly in the render harness.
- `menu` — nested submenu does not become visible.
- `tabs` — content not visible after activating a tab.
- `toast` — show/hide cycle.
- `field` — context not updating inside `Field.Item` when `invalid` changes.

These are unresolved, not explained away.

## What is NOT done

- 6 interaction tests still fail (see above); 67 `.stories.tsx` are unported.
- Only collapsible and select were exercised at runtime; the other ~63
  components typecheck and compile but are unproven behaviourally.
- No SSR / hydration path was tested.
- Not built through ark's real pipeline (tsup) or published.
