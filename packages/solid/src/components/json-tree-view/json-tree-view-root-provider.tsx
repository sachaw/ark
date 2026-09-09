import type { JsonNode } from '@zag-js/json-tree-utils'
import { createMemo, omit } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { TreeView } from '../tree-view/index.tsx'
import { JsonTreeViewPropsProvider } from './json-tree-view-props-context.ts'
import type { UseJsonTreeViewReturn } from './use-json-tree-view.ts'

export interface JsonTreeViewRootProviderProps extends Omit<TreeView.RootProviderProps<JsonNode>, 'value'> {
  value: UseJsonTreeViewReturn
}

export const JsonTreeViewRootProvider = (props: JsonTreeViewRootProviderProps): JSX.Element => {
  const restProps = omit(props, 'value')

  const treeView = createMemo(() => {
    const { options: _, ...rest } = props.value()
    return rest
  })

  return (
    <JsonTreeViewPropsProvider value={props.value().options}>
      <TreeView.RootProvider data-scope="json-tree-view" value={treeView} {...restProps} />
    </JsonTreeViewPropsProvider>
  )
}
