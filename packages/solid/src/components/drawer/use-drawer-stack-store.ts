import type { DrawerStack } from '@zag-js/drawer'
import { createOptionalContext } from '../../utils/create-context.ts'

// 2.0: a raw `createContext<T>()` with no default THROWS `ContextNotFoundError`
// when read outside a provider, but `useDrawer` reads this unconditionally and
// a standalone Drawer has no stack. Route it through ark's own helper with
// `strict: false`, which parks a sentinel default and hands back `undefined`.
export const [DrawerStackStoreProvider, useDrawerStackStore] = createOptionalContext<DrawerStack>('DrawerStackStoreProvider')
