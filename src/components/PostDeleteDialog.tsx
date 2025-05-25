import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PostDeleteDialogProps {
  postId: string;
  postTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
  previousStatus?: string;
  onUndo?: () => void;
}

export default function PostDeleteDialog({
  postId,
  postTitle,
  open,
  onOpenChange,
  onDeleted,
  previousStatus = "PUBLISHED",
  onUndo,
}: PostDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const undoButtonRef = useRef<HTMLButtonElement>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      onOpenChange(false);
      onDeleted?.();
      // Show undo toast and auto-focus Undo button
      const toastId = toast.success(
        <span>
          Đã xóa bài viết "{postTitle ?? postId}"
          <Button
            ref={undoButtonRef}
            size="sm"
            variant="outline"
            className="ml-2"
            onClick={async (e) => {
              e.stopPropagation();
              if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
              try {
                const undoRes = await fetch(`/api/admin/posts/${postId}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ previousStatus }),
                });
                if (!undoRes.ok) throw new Error("Failed to undo delete");
                toast.success("Đã hoàn tác xóa bài viết");
                onDeleted?.();
                onUndo?.();
              } catch {
                toast.error("Hoàn tác thất bại");
              }
            }}
          >
            Hoàn tác
          </Button>
        </span>,
        { duration: 5000 }
      );
      setTimeout(() => {
        if (undoButtonRef.current) undoButtonRef.current.focus();
      }, 100);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
        toast.dismiss(toastId);
        undoTimeoutRef.current = null;
      }, 5000);
    } catch (e) {
      toast.error("Xóa bài viết thất bại");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm">
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogDescription>
          Bạn có chắc chắn muốn xóa bài viết "{postTitle ?? postId}"? Hành động này không thể hoàn tác.
        </DialogDescription>
        <div className="flex gap-2 justify-center mt-4">
          <Button ref={cancelRef} variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 