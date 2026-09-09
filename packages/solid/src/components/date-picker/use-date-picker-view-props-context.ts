import type { ViewProps } from '@zag-js/date-picker'
import { createContext } from '../../utils/create-context.ts'

export interface UseDatePickerViewContext extends Required<ViewProps> {}

export const [DatePickerViewProvider, useDatePickerViewContext] = createContext<UseDatePickerViewContext>('DatePickerViewProvider', { view: 'day' })
