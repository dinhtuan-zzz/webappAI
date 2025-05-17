export default function ProfileStats({ profile }: { profile: any }) {
  return (
    <div className="flex gap-6 mb-6">
      <div>
        <span className="font-bold">{profile.postCount}</span>
        <span className="ml-1 text-muted-foreground">Posts</span>
      </div>
      <div>
        <span className="font-bold">{profile.commentCount}</span>
        <span className="ml-1 text-muted-foreground">Comments</span>
      </div>
      {/* Add more stats if needed */}
    </div>
  );
} 