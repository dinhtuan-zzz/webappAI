"use client"

import * as React from "react"
import { isNodeSelection, type Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { CornerDownLeftIcon } from "@/components/tiptap-icons/corner-down-left-icon"
import { ExternalLinkIcon } from "@/components/tiptap-icons/external-link-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"
import { TrashIcon } from "@/components/tiptap-icons/trash-icon"

// --- Lib ---
import { isMarkInSchema } from "@/lib/tiptap-utils"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"

// --- Styles ---
import "@/components/tiptap-ui/link-popover/link-popover.scss"

export interface LinkHandlerProps {
  editor: Editor | null
  onSetLink?: () => void
  onLinkActive?: () => void
}

export interface LinkMainProps {
  url: string
  setUrl: React.Dispatch<React.SetStateAction<string>>
  alias: string
  setAlias: React.Dispatch<React.SetStateAction<string>>
  setLink: () => void
  removeLink: () => void
  isActive: boolean
}

export const useLinkHandler = (props: LinkHandlerProps) => {
  const { editor, onSetLink, onLinkActive } = props
  const [url, setUrl] = React.useState<string>("")
  const [alias, setAlias] = React.useState<string>("")

  React.useEffect(() => {
    if (!editor) return

    // Get URL and alias immediately on mount
    const { href } = editor.getAttributes("link")
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)

    if (editor.isActive("link") && !url) {
      setUrl(href || "")
      setAlias(selectedText || "")
      onLinkActive?.()
    } else if (!editor.isActive("link") && selectedText) {
      setAlias(selectedText)
    }
  }, [editor, onLinkActive, url])

  React.useEffect(() => {
    if (!editor) return

    const updateLinkState = () => {
      const { href } = editor.getAttributes("link")
      setUrl(href || "")
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to)
      if (editor.isActive("link") && !url) {
        onLinkActive?.()
      }
      if (selectedText) setAlias(selectedText)
    }

    editor.on("selectionUpdate", updateLinkState)
    return () => {
      editor.off("selectionUpdate", updateLinkState)
    }
  }, [editor, onLinkActive, url])

  const setLink = React.useCallback(() => {
    if (!url || !editor) return

    const { from, to } = editor.state.selection
    const text = alias || editor.state.doc.textBetween(from, to) || url

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .insertContent({
        type: "text",
        text,
        marks: [{ type: "link", attrs: { href: url } }],
      })
      .run()

    onSetLink?.()
  }, [editor, onSetLink, url, alias])

  const removeLink = React.useCallback(() => {
    if (!editor) return
    editor
      .chain()
      .focus()
      .unsetMark("link", { extendEmptyMarkRange: true })
      .setMeta("preventAutolink", true)
      .run()
    setUrl("")
    setAlias("")
  }, [editor])

  return {
    url,
    setUrl,
    alias,
    setAlias,
    setLink,
    removeLink,
    isActive: editor?.isActive("link") || false,
  }
}

export const LinkButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, type = "button", ...props }, ref) => {
    if (process.env.NODE_ENV === "development" && type !== "button") {
      // eslint-disable-next-line no-console
      console.warn("[LinkButton] type prop should be 'button' to prevent form submission. Received:", type);
    }
    return (
      <Button
        type={type}
        className={className}
        data-style="ghost"
        role="button"
        tabIndex={-1}
        aria-label="Link"
        tooltip="Link"
        ref={ref}
        {...props}
      >
        {children || <LinkIcon className="tiptap-button-icon" />}
      </Button>
    )
  }
)

export const LinkContent: React.FC<{
  editor?: Editor | null
}> = ({ editor: providedEditor }) => {
  const editor = useTiptapEditor(providedEditor)

  const linkHandler = useLinkHandler({
    editor: editor,
  })

  return <LinkMain {...linkHandler} />
}

const isValidUrl = (url: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const allowedProtocols = ["http:", "https:", "mailto:"];
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
};

const LinkMain: React.FC<LinkMainProps & { onClose?: () => void }> = ({
  url,
  setUrl,
  alias,
  setAlias,
  setLink,
  removeLink,
  isActive,
  onClose,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [touched, setTouched] = React.useState(false);
  const urlValid = isValidUrl(url);

  React.useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setLink();
      onClose?.();
    }
    if (event.key === "Escape") {
      onClose?.();
    }
  };

  const showError = touched && url.length > 0 && !urlValid;

  return (
    <>
      <div className="tiptap-link-input-group">
        <input
          type="text"
          placeholder="Text to display (optional)"
          value={alias}
          onChange={e => setAlias(e.target.value)}
          className="tiptap-input tiptap-input-clamp"
          aria-label="Text to display"
          style={{ marginBottom: 6 }}
        />
        <input
          ref={inputRef}
          type="url"
          placeholder="Paste a link..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (!touched) setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className={`tiptap-input tiptap-input-clamp${showError ? " tiptap-input-error" : ""}`}
          aria-label="Link URL"
          aria-describedby={showError ? "link-url-error" : undefined}
        />
        {showError && (
          <div id="link-url-error" role="alert" aria-live="polite" style={{ color: '#dc2626', fontSize: '0.85em', marginTop: 2 }}>
            Please enter a valid URL (e.g., https://example.com)
          </div>
        )}
      </div>

      <div className="tiptap-button-group" data-orientation="horizontal">
        <Button
          type="button"
          onClick={() => {
            setLink();
            onClose?.();
          }}
          title="Apply link"
          aria-label="Apply link"
          disabled={!urlValid}
          data-style="ghost"
        >
          <CornerDownLeftIcon className="tiptap-button-icon" />
        </Button>
      </div>

      <Separator />

      <div className="tiptap-button-group" data-orientation="horizontal">
        <Button
          type="button"
          onClick={() => window.open(url, "_blank")}
          title="Open in new window"
          aria-label="Open in new window"
          disabled={!urlValid}
          data-style="ghost"
        >
          <ExternalLinkIcon className="tiptap-button-icon" />
        </Button>

        <Button
          type="button"
          onClick={removeLink}
          title="Remove link"
          aria-label="Remove link"
          data-style="ghost"
        >
          <TrashIcon className="tiptap-button-icon" />
        </Button>
      </div>
    </>
  );
};

export interface LinkPopoverProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether to hide the link popover.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback for when the popover opens or closes.
   */
  onOpenChange?: (isOpen: boolean) => void
  /**
   * Whether to automatically open the popover when a link is active.
   * @default true
   */
  autoOpenOnLinkActive?: boolean
}

export function LinkPopover({
  editor: providedEditor,
  hideWhenUnavailable = false,
  onOpenChange,
  autoOpenOnLinkActive = true,
  ...props
}: LinkPopoverProps) {
  const editor = useTiptapEditor(providedEditor)

  const linkInSchema = isMarkInSchema("link", editor)

  const [isOpen, setIsOpen] = React.useState(false)

  const onSetLink = () => {
    setIsOpen(false)
  }

  const onLinkActive = () => setIsOpen(autoOpenOnLinkActive)

  const linkHandler = useLinkHandler({
    editor: editor,
    onSetLink,
    onLinkActive,
  })

  const isDisabled = React.useMemo(() => {
    if (!editor) return true
    if (editor.isActive("codeBlock")) return true
    return !editor.can().setLink?.({ href: "" })
  }, [editor])

  const canSetLink = React.useMemo(() => {
    if (!editor) return false
    try {
      return editor.can().setMark("link")
    } catch {
      return false
    }
  }, [editor])

  const isActive = editor?.isActive("link") ?? false

  const handleOnOpenChange = React.useCallback(
    (nextIsOpen: boolean) => {
      setIsOpen(nextIsOpen)
      onOpenChange?.(nextIsOpen)
    },
    [onOpenChange]
  )

  const show = React.useMemo(() => {
    if (!linkInSchema || !editor) {
      return false
    }

    if (hideWhenUnavailable) {
      if (isNodeSelection(editor.state.selection) || !canSetLink) {
        return false
      }
    }

    return true
  }, [linkInSchema, hideWhenUnavailable, editor, canSetLink])

  if (!show || !editor || !editor.isEditable) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOnOpenChange}>
      <PopoverTrigger asChild>
        <LinkButton
          type="button"
          disabled={isDisabled}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={isDisabled}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent className="link-popover-content">
        <LinkMain {...linkHandler} isActive={isActive} onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

LinkButton.displayName = "LinkButton"
