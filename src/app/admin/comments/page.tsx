import { CommentListTable } from '@/features/admin/comments/components/CommentListTable';
import { commentService } from '@/features/admin/comments/services/commentService';
import { validateAdminCommentList } from '@/features/admin/comments/services/commentGuard';

export default async function AdminCommentsPage() {
  // Server-side fetch for demo; replace with client-side fetch/SWR for real API
  const comments = validateAdminCommentList(await commentService.getAllComments());

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Comment Management</h1>
      <CommentListTable comments={comments} />
    </main>
  );
} 