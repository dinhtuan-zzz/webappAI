"use client"

import * as React from "react"
import { isNodeSelection, type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { HeadingIcon } from "@/components/tiptap-icons/heading-icon"

// --- Lib ---
import { isNodeInSchema } from "@/lib/tiptap-utils"

// --- Tiptap UI ---
import {
  HeadingButton,
  headingIcons,
  type Level,
  getFormattedHeadingName,
} from "@/components/tiptap-ui/heading-button/heading-button"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/tiptap-ui-primitive/dropdown-menu"

export interface HeadingDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null
  levels?: Level[]
  hideWhenUnavailable?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export function HeadingDropdownMenu({
  editor: providedEditor,
  levels = [1, 2, 3],
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: HeadingDropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const editor = useTiptapEditor(providedEditor)

  const headingInSchema = isNodeInSchema("heading", editor)

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [onOpenChange]
  )

  const getActiveIcon = React.useCallback(() => {
    if (!editor) return <HeadingIcon className="tiptap-button-icon" />

    const activeLevel = levels.find((level) =>
      editor.isActive("heading", { level })
    ) as Level | undefined

    if (!activeLevel) return <HeadingIcon className="tiptap-button-icon" />

    const ActiveIcon = headingIcons[activeLevel]
    return <ActiveIcon className="tiptap-button-icon" />
  }, [editor, levels])

  const canToggleAnyHeading = React.useCallback((): boolean => {
    if (!editor) return false
    return levels.some((level) =>
      editor.can().toggleNode("heading", "paragraph", { level })
    )
  }, [editor, levels])

  const isDisabled = !canToggleAnyHeading()
  const isAnyHeadingActive = editor?.isActive("heading") ?? false

  const show = React.useMemo(() => {
    if (!headingInSchema || !editor) {
      return false
    }

    if (hideWhenUnavailable) {
      if (isNodeSelection(editor.state.selection) || !canToggleAnyHeading()) {
        return false
      }
    }

    return true
  }, [headingInSchema, editor, hideWhenUnavailable, canToggleAnyHeading])

  if (!show || !editor || !editor.isEditable) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="tiptap-toolbar-btn flex items-center justify-center h-8 w-8"
          disabled={isDisabled}
          data-style="ghost"
          data-active-state={isAnyHeadingActive ? "on" : "off"}
          data-disabled={isDisabled}
          role="button"
          tabIndex={-1}
          aria-label="Format text as heading"
          aria-pressed={isAnyHeadingActive}
          tooltip="Heading"
          {...props}
        >
          {getActiveIcon()}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        className="tiptap-dropdown-menu-content bg-white dark:bg-gray-900 shadow-lg rounded border border-gray-200 dark:border-gray-700 w-auto min-w-fit max-w-xs max-h-60 overflow-y-auto p-1"
        style={{ backgroundColor: '#fff', zIndex: 9999 }}
      >
        <DropdownMenuGroup>
          {/* Normal/Paragraph option */}
          <DropdownMenuItem
            key="heading-normal"
            role="option"
            aria-selected={!editor?.isActive('heading')}
            className={`flex items-center px-3 py-2 rounded cursor-pointer transition-colors select-none hover:bg-gray-100 ${!editor?.isActive('heading') ? 'bg-blue-50' : ''}`}
            onClick={() => editor?.chain().focus().setParagraph().run()}
          >
            <span className="flex items-center justify-start w-6 h-6">
              <HeadingIcon className="w-5 h-5 text-gray-500" />
            </span>
          </DropdownMenuItem>
          {/* Heading options */}
          {levels.map((level) => {
            const ActiveIcon = headingIcons[level];
            const isActive = editor?.isActive('heading', { level });
            return (
              <DropdownMenuItem
                key={`heading-${level}`}
                role="option"
                aria-selected={isActive}
                className={`flex items-center px-3 py-2 rounded cursor-pointer transition-colors select-none hover:bg-gray-100 ${isActive ? 'bg-blue-50' : ''}`}
                onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
              >
                <span className="flex items-center justify-start w-6 h-6">
                  <ActiveIcon className="w-5 h-5 text-gray-700" />
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeadingDropdownMenu
