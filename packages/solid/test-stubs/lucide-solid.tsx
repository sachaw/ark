// Test stub for `lucide-solid`.
//
// lucide-solid is Solid 1.x only: its `Icon.tsx` calls `splitProps`, which 2.0
// removed, so importing it throws at render. It is used ONLY by ark's test
// fixtures and storybook examples as decoration — zero library source imports
// it — so the fork stubs it for the test run rather than forking an icon set.
//
// Each export renders an inert <svg> that forwards props, which is all the
// tests need (they query by role/text, never by icon internals).
import type { JSX } from '@solidjs/web'

type IconProps = JSX.IntrinsicElements['svg'] & { size?: number | string; absoluteStrokeWidth?: boolean }

const makeIcon = (name: string) => (props: IconProps) => {
  const { size, absoluteStrokeWidth, ...rest } = props as Record<string, unknown>
  return (
    <svg
      {...(rest as JSX.IntrinsicElements['svg'])}
      data-lucide-stub={name}
      width={(size as number) ?? 24}
      height={(size as number) ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    />
  )
}

export const AccessibilityIcon = makeIcon('AccessibilityIcon')
export const AlignCenterIcon = makeIcon('AlignCenterIcon')
export const AlignJustifyIcon = makeIcon('AlignJustifyIcon')
export const AlignLeftIcon = makeIcon('AlignLeftIcon')
export const AlignRightIcon = makeIcon('AlignRightIcon')
export const ArrowDownIcon = makeIcon('ArrowDownIcon')
export const ArrowDownLeft = makeIcon('ArrowDownLeft')
export const ArrowLeftIcon = makeIcon('ArrowLeftIcon')
export const ArrowLeftRightIcon = makeIcon('ArrowLeftRightIcon')
export const ArrowRightIcon = makeIcon('ArrowRightIcon')
export const ArrowUpDownIcon = makeIcon('ArrowUpDownIcon')
export const ArrowUpIcon = makeIcon('ArrowUpIcon')
export const BoldIcon = makeIcon('BoldIcon')
export const CalendarIcon = makeIcon('CalendarIcon')
export const Check = makeIcon('Check')
export const CheckIcon = makeIcon('CheckIcon')
export const ChevronDownIcon = makeIcon('ChevronDownIcon')
export const ChevronLeftIcon = makeIcon('ChevronLeftIcon')
export const ChevronRight = makeIcon('ChevronRight')
export const ChevronRightIcon = makeIcon('ChevronRightIcon')
export const ChevronUpIcon = makeIcon('ChevronUpIcon')
export const ChevronsLeftIcon = makeIcon('ChevronsLeftIcon')
export const ChevronsRightIcon = makeIcon('ChevronsRightIcon')
export const ChevronsUpDownIcon = makeIcon('ChevronsUpDownIcon')
export const CircleAlertIcon = makeIcon('CircleAlertIcon')
export const CircleCheckIcon = makeIcon('CircleCheckIcon')
export const ClapperboardIcon = makeIcon('ClapperboardIcon')
export const ClipboardCopyIcon = makeIcon('ClipboardCopyIcon')
export const CornerDownLeftIcon = makeIcon('CornerDownLeftIcon')
export const CropIcon = makeIcon('CropIcon')
export const DownloadIcon = makeIcon('DownloadIcon')
export const EllipsisVerticalIcon = makeIcon('EllipsisVerticalIcon')
export const ExternalLink = makeIcon('ExternalLink')
export const ExternalLinkIcon = makeIcon('ExternalLinkIcon')
export const EyeIcon = makeIcon('EyeIcon')
export const EyeOffIcon = makeIcon('EyeOffIcon')
export const File = makeIcon('File')
export const FileIcon = makeIcon('FileIcon')
export const FlipHorizontalIcon = makeIcon('FlipHorizontalIcon')
export const FlipVerticalIcon = makeIcon('FlipVerticalIcon')
export const Folder = makeIcon('Folder')
export const FolderIcon = makeIcon('FolderIcon')
export const FolderOpenIcon = makeIcon('FolderOpenIcon')
export const GripVertical = makeIcon('GripVertical')
export const HeartIcon = makeIcon('HeartIcon')
export const ImageIcon = makeIcon('ImageIcon')
export const InfoIcon = makeIcon('InfoIcon')
export const ItalicIcon = makeIcon('ItalicIcon')
export const KeyboardIcon = makeIcon('KeyboardIcon')
export const LayersIcon = makeIcon('LayersIcon')
export const ListChecksIcon = makeIcon('ListChecksIcon')
export const LoaderCircleIcon = makeIcon('LoaderCircleIcon')
export const LoaderIcon = makeIcon('LoaderIcon')
export const Maximize2 = makeIcon('Maximize2')
export const Minus = makeIcon('Minus')
export const MinusIcon = makeIcon('MinusIcon')
export const MoonIcon = makeIcon('MoonIcon')
export const MoreHorizontalIcon = makeIcon('MoreHorizontalIcon')
export const PaletteIcon = makeIcon('PaletteIcon')
export const PaperclipIcon = makeIcon('PaperclipIcon')
export const PauseIcon = makeIcon('PauseIcon')
export const PencilIcon = makeIcon('PencilIcon')
export const Pin = makeIcon('Pin')
export const PinOff = makeIcon('PinOff')
export const Pipette = makeIcon('Pipette')
export const PlayIcon = makeIcon('PlayIcon')
export const PlusIcon = makeIcon('PlusIcon')
export const RectangleHorizontalIcon = makeIcon('RectangleHorizontalIcon')
export const RectangleVerticalIcon = makeIcon('RectangleVerticalIcon')
export const RefreshCwIcon = makeIcon('RefreshCwIcon')
export const RocketIcon = makeIcon('RocketIcon')
export const RotateCcwIcon = makeIcon('RotateCcwIcon')
export const RotateCwIcon = makeIcon('RotateCwIcon')
export const SaveIcon = makeIcon('SaveIcon')
export const SearchIcon = makeIcon('SearchIcon')
export const SparklesIcon = makeIcon('SparklesIcon')
export const SquareCheckBigIcon = makeIcon('SquareCheckBigIcon')
export const SquareIcon = makeIcon('SquareIcon')
export const SquareMinusIcon = makeIcon('SquareMinusIcon')
export const StarIcon = makeIcon('StarIcon')
export const StrikethroughIcon = makeIcon('StrikethroughIcon')
export const SunIcon = makeIcon('SunIcon')
export const TrashIcon = makeIcon('TrashIcon')
export const TriangleAlertIcon = makeIcon('TriangleAlertIcon')
export const UnderlineIcon = makeIcon('UnderlineIcon')
export const UploadIcon = makeIcon('UploadIcon')
export const Volume2Icon = makeIcon('Volume2Icon')
export const VolumeXIcon = makeIcon('VolumeXIcon')
export const XIcon = makeIcon('XIcon')
export const ZoomInIcon = makeIcon('ZoomInIcon')
export const ZoomOutIcon = makeIcon('ZoomOutIcon')
