import type { JSX } from '@solidjs/web'
import { type UseFieldsetContext, useStrictFieldsetContext } from './use-fieldset-context.ts'

export interface FieldsetContextProps {
  children: (context: UseFieldsetContext) => JSX.Element
}

export const FieldsetContext = (props: FieldsetContextProps) => props.children(useStrictFieldsetContext())
