import { resolve } from 'node:path'
import solid from '@solidjs/vite-plugin'
import { defineConfig } from 'vitest/config'

const src = (p: string) => resolve(import.meta.dirname, 'src', p)

export default defineConfig({
  logLevel: 'warn',
  // 2.0 ships its own vite plugin (`@solidjs/vite-plugin`); `vite-plugin-solid`
  // is the 1.x compiler and cannot build this tree.
  plugins: [solid()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setup-test.solid2.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: [
      // lucide-solid is Solid 1.x only (its Icon.tsx calls the removed
      // `splitProps`); it is test/story decoration with zero library usage.
      { find: /^lucide-solid$/, replacement: resolve(import.meta.dirname, 'test-stubs/lucide-solid.tsx') },
      // other 1.x-only libraries import `solid-js/web`, which 2.0
      // no longer exports. Their surface here is just `Dynamic`, which exists
      // in `@solidjs/web`, so aliasing is enough interop.
      { find: /^solid-js\/web$/, replacement: '@solidjs/web' },
      // the fork replaces the upstream binding
      { find: /^@zag-js\/solid$/, replacement: resolve(import.meta.dirname, 'zag-solid/src/index.ts') },
      // ark's own exports map points at src; mirror it for the self-referential
      // imports the fixtures use (`@ark-ui/solid/field`, ...)
      { find: /^@ark-ui\/solid$/, replacement: src('index.tsx') },
      { find: /^@ark-ui\/solid\/anatomy$/, replacement: src('components/anatomy.ts') },
      { find: /^@ark-ui\/solid\/environment$/, replacement: src('providers/environment/index.tsx') },
      { find: /^@ark-ui\/solid\/locale$/, replacement: src('providers/locale/index.tsx') },
      { find: /^@ark-ui\/solid\/hotkeys$/, replacement: src('providers/hotkeys/index.tsx') },
      { find: /^@ark-ui\/solid\/interaction$/, replacement: src('providers/interaction/index.ts') },
      { find: /^@ark-ui\/solid\/factory$/, replacement: src('components/factory.tsx') },
      { find: /^@ark-ui\/solid\/(.*)$/, replacement: src('components/$1/index.tsx') },
      // storybook css modules used by a few example fixtures
      { find: /^styles\/(.*)$/, replacement: resolve(import.meta.dirname, '../../.storybook/modules/$1') },
    ],
  },
})
