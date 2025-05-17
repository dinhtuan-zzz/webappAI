import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ThumbsUp, MessageSquare, Eye } from "lucide-react";

function formatNumber(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : n.toString();
}

export function PostCard({ post }: { post: any }) {
  const author = post.author || {};
  const avatarUrl = author.profile?.avatarUrl;
  const email = author.email;
  const name = author.profile?.displayName || author.username || "Unknown";
  const thumbnail = post.thumbnail || "/blog-thumb-placeholder.jpg";

  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <div className="bg-white/90 dark:bg-[#23272f] rounded-xl shadow-md border border-[#e6e6e6] flex flex-col overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={thumbnail}
            alt={post.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="flex-1 flex flex-col p-4 gap-2">
          <h2 className="text-lg font-bold text-[#2a4257] line-clamp-2 group-hover:text-[#6bb7b7] transition-colors">
            {post.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
            {post.summary || post.content?.slice(0, 100) + "..."}
          </p>
          <div className="flex items-center gap-2 mt-auto">
            <Avatar avatarUrl={avatarUrl} email={email} name={name} size={28} />
            <span className="text-xs text-[#2a4257] font-medium">{name}</span>
            <span className="text-xs text-gray-400 ml-auto">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{formatNumber(post._count?.votes || 0)}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{formatNumber(post._count?.comments || 0)}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(post.viewCount || 0)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}