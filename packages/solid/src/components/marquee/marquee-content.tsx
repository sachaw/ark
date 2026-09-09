import { mergeProps } from '@zag-js/solid'
import { For, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useMarqueeContext } from './use-marquee-context.ts'

export interface MarqueeContentBaseProps extends PolymorphicProps<'div'> {
  children?: JSX.Element
}
export interface MarqueeContentProps extends HTMLProps<'div'>, MarqueeContentBaseProps {}

export const MarqueeContent = (props: MarqueeContentProps) => {
  const restProps = omit(props, 'children')
  const context = useMarqueeContext()

  return (
    <For each={Array.from({ length: context().contentCount })}>
      {(_, index) => {
        const mergedProps = mergeProps(() => context().getContentProps({ index: index() }), restProps)
        return <ark.div {...mergedProps}>{props.children}</ark.div>
      }}
    </For>
  )
}
