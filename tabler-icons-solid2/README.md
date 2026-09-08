# @tabler/icons-solidjs on Solid 2

Not part of the ark fork — this is the icon library **our client** actually uses
(43 files). Kept here because the spike environment already has Solid 2 wired up.

The whole Solid coupling of `@tabler/icons-solidjs` is ONE ~30-line file,
`createSolidComponent.jsx`. Every one of the ~5,900 icons is a two-line data
module over it:

```js
import createSolidComponent from '../createSolidComponent'
export default createSolidComponent('outline', 'check', 'Check', [['path', { d: 'M5 12l5 5l10 -10' }]])
```

Its only Solid 1.x dependencies are `splitProps` (removed in 2.0) and
`Dynamic` from `solid-js/web` (moved to `@solidjs/web`).

`createSolidComponent.jsx` here is the ported version. `test.js` renders it
against `solid-js@2.0.0-rc.6` — 12/12 assertions: reactive `size` and `class`,
rest-prop forwarding, `title`, icon paths, the filled variant, and stable
element identity across updates.

```bash
babel src --config-file babel.jsx.cjs --extensions .js,.jsx --out-dir dist
node --conditions=browser --conditions=development test.js
```

Note the published package exposes a `solid` export condition pointing at this
uncompiled source, so a bundler configured with that condition compiles it with
whichever Solid compiler is in use — only the two import lines need changing.
