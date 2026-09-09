import { omit } from 'solid-js'

import type { JSX } from '@solidjs/web'
import type { HTMLProps, PolymorphicProps } from '../factory.tsx'
import { ark } from '../factory.tsx'
import { type UseDownloadProps, useDownload } from './use-download.ts'

export interface DownloadTriggerBaseProps extends PolymorphicProps<'button'>, UseDownloadProps {}

export interface DownloadTriggerProps extends HTMLProps<'button'>, DownloadTriggerBaseProps {}

export function DownloadTrigger(props: DownloadTriggerProps) {
  const restProps = omit(props, 'fileName', 'data', 'mimeType', 'onClick')
  const { download } = useDownload(() => ({
    fileName: props.fileName,
    mimeType: props.mimeType,
    data: props.data,
  }))

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (e) => {
    if (typeof props.onClick === 'function') {
      props.onClick(e)
    }

    if (e.defaultPrevented) return

    download()
  }

  return <ark.button {...restProps} type="button" onClick={handleClick} />
}
