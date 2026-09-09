import { mergeProps } from '@zag-js/solid'
import { type Accessor, omit } from 'solid-js'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import type { UseSwapReturn } from './use-swap.ts'
import { SwapProvider } from './use-swap-context.ts'

export interface SwapRootProviderBaseProps extends PolymorphicProps<'span'> {
  value: Accessor<UseSwapReturn>
}

export interface SwapRootProviderProps extends HTMLProps<'span'>, SwapRootProviderBaseProps {}

export const SwapRootProvider = (props: SwapRootProviderProps) => {
  const localProps = omit(props, 'value')
  const mergedProps = mergeProps(() => props.value().getRootProps(), localProps)

  return (
    <SwapProvider value={props.value}>
      <ark.span {...mergedProps} />
    </SwapProvider>
  )
}
