# Render harness

Proves ported components actually render + behave under Solid 2, not just typecheck.

```bash
# 1. compile ark + the forked binding with the Solid 2 JSX transform
babel packages/solid/src      --config-file babel.config.cjs --extensions .ts,.tsx --out-dir <out>/ark
babel packages/solid/zag-solid/src --config-file babel.config.cjs --extensions .ts,.tsx --out-dir <out>/zag-solid
# 2. rewrite relative .ts/.tsx specifiers to .js and point @zag-js/solid at the fork
# 3. run
node --conditions=browser --conditions=development render.test.js
```

`--conditions=browser --conditions=development` is mandatory: Node's default
conditions resolve `solid-js` to the **server** build, where effects never run.

babel needs per-extension overrides — ark's `.ts` files use generic arrows
(`const f = <T>(x: T) => ...`) that a TSX parser reads as JSX.
