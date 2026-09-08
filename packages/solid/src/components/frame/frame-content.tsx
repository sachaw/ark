import { onSettled } from 'solid-js'
import type { JSX } from '@solidjs/web'

interface FrameContentProps {
  onMount?(): void
  onUnmount?(): void
  children?: JSX.Element
}

export const FrameContent = (props: FrameContentProps) => {
  const { onMount, onUnmount, children } = props

  // No reactive dependency — this is pure setup/teardown, which is exactly
  // what onSettled is for in 2.0.
  onSettled(() => {
    onMount?.()
    return () => {
      onUnmount?.()
    }
  })

  return children
}
