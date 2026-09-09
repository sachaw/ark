import { createOptionalContext } from '../../utils/create-context.ts'
import type { UseMenuReturn } from './use-menu.ts'

export type UseMenuMachineContext = UseMenuReturn['service'] | undefined

export const [MenuMachineProvider, useMenuMachineContext] = createOptionalContext<UseMenuMachineContext>('MenuMachineProvider')
