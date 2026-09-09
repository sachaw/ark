import { Selection, type SelectionMode } from '@zag-js/collection'
import { createEffect, createMemo, createSignal } from 'solid-js'
import type { MaybeAccessor } from '../../types.ts'
import type { CollectionItem, ListCollection } from './list-collection.ts'

export interface UseListSelectionProps<T extends CollectionItem> {
  /**
   * The selection mode.
   */
  selectionMode?: SelectionMode
  /**
   * Whether the selection is deselectable.
   */
  deselectable?: boolean
  /**
   * The initial selected values.
   */
  initialSelectedValues?: string[]
  /**
   * Whether to reset the selection when the collection changes.
   */
  resetOnCollectionChange?: boolean
  /**
   * The collection to use.
   */
  collection: ListCollection<T>
}

export function useListSelection<T extends CollectionItem>(
  props: MaybeAccessor<UseListSelectionProps<T>>,
): UseListSelectionReturn {
  // Read the caller's own keys straight off `raw()`. Nothing here ever needed
  // the rest half, so there is no split to make.
  const raw = createMemo(() => (typeof props === 'function' ? props() : props))

  const createSelection = (values: string[] = []) => {
    const selection = new Selection(values)
    selection.selectionMode = raw().selectionMode ?? 'single'
    selection.deselectable = raw().deselectable ?? true
    return selection
  }

  const init = () => {
    return createSelection(raw().initialSelectedValues ?? [])
  }

  const [selection, setSelection] = createSignal(init())

  const watchDeps = () => {
    return [raw().collection.getValues(), raw().resetOnCollectionChange] as const
  }

  createEffect(
    watchDeps,
    ([, resetOnCollectionChange]) => {
      if (resetOnCollectionChange) {
        setSelection(createSelection())
      }
    },
    { defer: true },
  )

  const selectedValues = createMemo(() => Array.from(selection()))

  const isEmpty = createMemo(() => selection().isEmpty())

  const firstSelectedValue = createMemo(() => {
    return selection().firstSelectedValue(raw().collection)
  })

  const lastSelectedValue = createMemo(() => {
    return selection().lastSelectedValue(raw().collection)
  })

  return {
    selectedValues,
    isEmpty,
    firstSelectedValue,
    lastSelectedValue,
    isSelected: (value: string | null) => {
      return selection().isSelected(value)
    },
    isAllSelected: () => {
      const allValues = raw().collection.getValues()
      return allValues.length > 0 && allValues.every((value) => selection().isSelected(value))
    },
    isSomeSelected: () => {
      const allValues = raw().collection.getValues()
      return allValues.some((value) => selection().isSelected(value))
    },
    canSelect: (value: string) => {
      return selection().canSelect(raw().collection, value)
    },
    select: (value: string, forceToggle?: boolean) => {
      setSelection(selection().select(raw().collection, value, forceToggle))
    },
    deselect: (value: string) => {
      setSelection(selection().deselect(value))
    },
    toggle: (value: string) => {
      setSelection(selection().toggleSelection(raw().collection, value))
    },
    replace: (value: string | null) => {
      setSelection(selection().replaceSelection(raw().collection, value))
    },
    extend: (anchorValue: string, targetValue: string) => {
      setSelection(selection().extendSelection(raw().collection, anchorValue, targetValue))
    },
    setSelectedValues: (values: string[]) => {
      setSelection(selection().setSelection(values))
    },
    clear: () => {
      setSelection(selection().clearSelection())
    },
    resetSelection: () => {
      setSelection(createSelection())
    },
  }
}

export interface UseListSelectionReturn {
  /**
   * The selected values as an array.
   */
  selectedValues: () => string[]
  /**
   * Whether the selection is empty.
   */
  isEmpty: () => boolean
  /**
   * The first selected value.
   */
  firstSelectedValue: () => string | null
  /**
   * The last selected value.
   */
  lastSelectedValue: () => string | null
  /**
   * Check if a value is selected.
   */
  isSelected: (value: string | null) => boolean
  /**
   * Check if a value can be selected.
   */
  canSelect: (value: string) => boolean
  /**
   * Select a value.
   */
  select: (value: string, forceToggle?: boolean) => void
  /**
   * Deselect a value.
   */
  deselect: (value: string) => void
  /**
   * Toggle selection of a value.
   */
  toggle: (value: string) => void
  /**
   * Replace the selection with a single value.
   */
  replace: (value: string | null) => void
  /**
   * Extend the selection from anchor to target.
   */
  extend: (anchorValue: string, targetValue: string) => void
  /**
   * Set the selected values.
   */
  setSelectedValues: (values: string[]) => void
  /**
   * Clear the selection.
   */
  clear: () => void
  /**
   * Clear all selections.
   */
  resetSelection: () => void
  /**
   * Returns true if all items from the collection are selected.
   */
  isAllSelected: () => boolean
  /**
   * Returns true if at least one item from the collection is selected.
   */
  isSomeSelected: () => boolean
}
