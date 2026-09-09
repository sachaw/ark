import type { Api } from '@zag-js/menu'
import type { Accessor } from 'solid-js'
import { createOptionalContext } from '../../utils/create-context.ts'

export type UseMenuTriggerItemContext = Accessor<ReturnType<Api['getTriggerItemProps']> | undefined>

export const [MenuTriggerItemProvider, useMenuTriggerItemContext] = createOptionalContext<UseMenuTriggerItemContext>('MenuTriggerItemProvider')
