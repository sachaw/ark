import { omit } from 'solid-js'
import { mergeProps } from '@zag-js/solid'

import { pickProps } from '../../utils/pick-props.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { type UseSwapProps, useSwap } from './use-swap.ts'
import { SwapProvider } from './use-swap-context.ts'

export interface SwapRootBaseProps extends UseSwapProps, PolymorphicProps<'span'> {}

export interface SwapRootProps extends HTMLProps<'span'>, SwapRootBaseProps {}

export const SwapRoot = (props: SwapRootProps) => {
  const localProps = omit(props, 'swap', 'lazyMount', 'unmountOnExit')
  const swap = useSwap(pickProps(props, ['swap', 'lazyMount', 'unmountOnExit']))
  const mergedProps = mergeProps(() => swap().getRootProps(), localProps)

  return (
    <SwapProvider value={swap}>
      <ark.span {...mergedProps} />
    </SwapProvider>
  )
}
