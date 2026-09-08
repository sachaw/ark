import { createMemo } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { parts } from './field.anatomy.ts'
import { FieldProvider, useFieldContext, type UseFieldContext } from './use-field-context.ts'

export interface FieldItemBaseProps {
  value: string
}

export interface FieldItemProps extends FieldItemBaseProps {
  children?: JSX.Element
}

export const FieldItem = (props: FieldItemProps) => {
  const parentField = useFieldContext()

  // 2.0: `createMemo` returns a branded `SourceAccessor`, so a plain arrow
  // function no longer satisfies `UseFieldContext` (= ReturnType of a memo).
  // This is derived state anyway, so a memo is the correct shape.
  const itemField: UseFieldContext = createMemo(() => {
    const parent = parentField?.()
    if (!parent) {
      throw new Error('Field.Item must be used within Field.Root')
    }

    const controlId = `field::${parent.ids.control}::item::${props.value}`
    const labelId = `${controlId}::label`

    const getControlProps = () => ({
      ...parent.getInputProps(),
      id: controlId,
    })

    return {
      ...parent,
      ids: {
        ...parent.ids,
        control: controlId,
        label: labelId,
      },
      getLabelProps: () => ({
        ...parent.getLabelProps(),
        id: labelId,
        for: controlId,
      }),
      getInputProps: () => ({
        ...getControlProps(),
        ...parts.input.attrs,
      }),
      getSelectProps: () => ({
        ...getControlProps(),
        ...parts.select.attrs,
      }),
      getTextareaProps: () => ({
        ...getControlProps(),
        ...parts.textarea.attrs,
      }),
    }
  })

  return <FieldProvider value={itemField}>{props.children}</FieldProvider>
}
