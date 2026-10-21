import type { JsonNodeHastElement } from '@zag-js/json-tree-utils'
import { For } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { dynamic } from '@solidjs/web'

interface JsonTreeViewValueNodeProps {
  node: JsonNodeHastElement
  renderValue?: (node: JsonNodeHastElement) => JSX.Element
}

export const JsonTreeViewValueNode = (props: JsonTreeViewValueNodeProps): JSX.Element => {
  if (props.node.type === 'text') {
    return <>{props.renderValue?.(props.node) ?? props.node.value}</>
  }

  const Element = dynamic(() => (props.node.type === 'text' ? undefined : props.node.tagName))
  return (
    <Element
      data-root={props.node.properties.root ? '' : undefined}
      data-type={props.node.properties.nodeType}
      data-kind={props.node.properties.kind}
    >
      <For each={props.node.children}>
        {(child) => <JsonTreeViewValueNode node={child} renderValue={props.renderValue} />}
      </For>
    </Element>
  )
}
