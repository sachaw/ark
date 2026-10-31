import type { WindowVirtualizer } from '@zag-js/virtualizer'
import { createContext } from '../../utils/create-context.ts'

export interface UseWindowVirtualizerContext extends WindowVirtualizer {}

export const [WindowVirtualizerProvider, useWindowVirtualizerContext] = createContext<UseWindowVirtualizerContext>('WindowVirtualizerProvider')
