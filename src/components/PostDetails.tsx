import Image from "next/image";
import { Avatar } from "@/components/Avatar";
import type { Post } from "@/types/Post";
import type { Category } from "@/types/Category";

interface PostDetailsProps {
  post: Post;
  actions?: React.ReactNode;
}

export default function PostDetails({ post, actions }: PostDetailsProps) {
  const author = post.author || {};
  const avatarUrl = author.profile?.avatarUrl;
  const name = author.profile?.displayName || author.username || "Unknown";
  const email = author.email;
  const categories = post.categories || [];
  const tags = post.tags || [];
  const thumbnail = post.thumbnail || "/blog-thumb-placeholder.jpg";

  return (
    <section className="bg-white dark:bg-[#23272f] rounded-xl shadow-md border border-[#e6e6e6] max-w-2xl mx-auto p-6 mt-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 w-full md:w-56 h-40 relative rounded overflow-hidden border">
          <Image
            src={thumbnail}
            alt={post.title}
            className="object-cover w-full h-full"
            fill
            sizes="(max-width: 768px) 100vw, 224px"
            priority={false}
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#2a4257] mb-1">{post.title}</h1>
          {post.summary && <p className="text-gray-600 dark:text-gray-300 mb-2">{post.summary}</p>}
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {"status" in post && (
              <div>
                <dt className="font-semibold">Status</dt>
                <dd>{(post as any).status || "Unknown"}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold">Created</dt>
              <dd>{new Date(post.createdAt).toLocaleString()}</dd>
            </div>
            {"updatedAt" in post && (post as any).updatedAt && (
              <div>
                <dt className="font-semibold">Updated</dt>
                <dd>{new Date((post as any).updatedAt).toLocaleString()}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold">Views</dt>
              <dd>{post.viewCount ?? 0}</dd>
            </div>
            <div>
              <dt className="font-semibold">Votes</dt>
              <dd>{post._count?.votes ?? post.votes ?? 0}</dd>
            </div>
            <div>
              <dt className="font-semibold">Comments</dt>
              <dd>{post._count?.comments ?? post.comments ?? 0}</dd>
            </div>
            <div className="col-span-1 md:col-span-2">
              <dt className="font-semibold">Categories</dt>
              <dd className="flex flex-wrap gap-2 mt-1">
                {categories.length ? categories.map((cat: Category) => (
                  <span key={cat.id} className="inline-block bg-[#e6f7f7] text-[#2a4257] px-2 py-0.5 rounded text-xs font-medium border border-[#b2e0e0]">{cat.name}</span>
                )) : <span className="text-gray-400">None</span>}
              </dd>
            </div>
            {tags.length > 0 && (
              <div className="col-span-1 md:col-span-2">
                <dt className="font-semibold">Tags</dt>
                <dd className="flex flex-wrap gap-2 mt-1">
                  {tags.filter(tag => tag?.id && tag?.name).length > 0 ? (
                    tags.filter(tag => tag?.id && tag?.name).map(tag => (
                      <span
                        key={tag.id}
                        className="inline-block bg-[#f7e6f7] text-[#572a57] px-2 py-0.5 rounded text-xs font-medium border border-[#e0b2e0]"
                      >
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
          <div className="flex items-center gap-2 mt-4">
            <Avatar avatarUrl={avatarUrl} email={email} name={name} size={32} />
            <div>
              <div className="font-medium text-[#2a4257]">{name}</div>
              {email && <div className="text-xs text-gray-400">{email}</div>}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Content</h2>
        <div className="prose max-w-none dark:prose-invert bg-[#f9f9f9] dark:bg-[#23272f] p-4 rounded border">
          {post.content ? post.content : <span className="text-gray-400">No content</span>}
        </div>
      </div>
      {actions && <div className="mt-6 flex gap-2">{actions}</div>}
    </section>
  );
} 