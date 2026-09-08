import { createEffect, onCleanup } from 'solid-js'
import type { JSX } from '@solidjs/web'

interface FrameContentProps {
  onSettled?(): void
  onUnmount?(): void
  children?: JSX.Element
}

export const FrameContent = (props: FrameContentProps) => {
  const { onSettled, onUnmount, children } = props

  createEffect(() => {
    onSettled?.()

    onCleanup(() => {
      onUnmount?.()
    })
  })

  return children
}
