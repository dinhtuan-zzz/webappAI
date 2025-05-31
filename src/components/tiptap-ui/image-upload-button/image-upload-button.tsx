"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { ImagePlusIcon } from "@/components/tiptap-icons/image-plus-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

export interface ImageUploadButtonProps extends ButtonProps {
  editor?: Editor | null
  text?: string
  onImageUpload?: (file: File) => Promise<string>
}

export function isImageActive(
  editor: Editor | null,
  extensionName: string
): boolean {
  if (!editor) return false
  return editor.isActive(extensionName)
}

export function insertImage(
  editor: Editor | null,
  extensionName: string
): boolean {
  if (!editor) return false

  return editor
    .chain()
    .focus()
    .insertContent({
      type: extensionName,
    })
    .run()
}

export function useImageUploadButton(
  editor: Editor | null,
  extensionName: string = "imageUpload",
  disabled: boolean = false
) {
  const isActive = isImageActive(editor, extensionName)
  const handleInsertImage = React.useCallback(() => {
    if (disabled) return false
    return insertImage(editor, extensionName)
  }, [editor, extensionName, disabled])

  return {
    isActive,
    handleInsertImage,
  }
}

export const ImageUploadButton = React.forwardRef<
  HTMLButtonElement,
  ImageUploadButtonProps
>(({ editor: providedEditor, text, className = "", disabled, onClick, children, onImageUpload, ...buttonProps }, ref) => {
  const editor = useTiptapEditor(providedEditor)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (!e.defaultPrevented && !disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImageUpload || !editor) return
    setLoading(true)
    setError(null)
    try {
      // Optionally validate file type/size here
      const url = await onImageUpload(file)
      if (url) {
        editor.chain().focus().insertContent({ type: "image", attrs: { src: url } }).run()
      }
    } catch (err: any) {
      setError(err?.message || "Image upload failed")
    } finally {
      setLoading(false)
      e.target.value = "" // reset input
    }
  }

  if (!editor || !editor.isEditable) {
    return null
  }

  return (
    <>
      <Button
        ref={ref}
        type="button"
        className={className.trim()}
        data-style="ghost"
        data-active-state={false}
        role="button"
        tabIndex={-1}
        aria-label="Add image"
        aria-pressed={false}
        tooltip="Add image"
        onClick={handleButtonClick}
        disabled={disabled || loading}
        {...buttonProps}
      >
        {children || (
          <>
            <ImagePlusIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {loading && <span className="ml-2 text-xs text-blue-500">Uploading...</span>}
          </>
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </>
  )
})

ImageUploadButton.displayName = "ImageUploadButton"

export default ImageUploadButton
