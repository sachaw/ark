import { createOptionalContext } from '../../utils/create-context.ts'
import type { UseCheckboxGroupReturn } from './use-checkbox-group.ts'

export interface UseCheckboxGroupContext extends UseCheckboxGroupReturn {}

export const [CheckboxGroupContextProvider, useCheckboxGroupContext] = createOptionalContext<UseCheckboxGroupContext>('CheckboxGroupContextProvider')
