import type { ColorFormat } from '@zag-js/color-picker'
import { createOptionalContext } from '../../utils/create-context.ts'

export interface UseColorPickerSwatchPropsContext {
  format: ColorFormat
}

export const [ColorPickerFormatPropsProvider, useColorPickerFormatPropsContext] = createOptionalContext<UseColorPickerSwatchPropsContext>('ColorPickerFormatPropsProvider')
