import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";

export default function ProfileHeader({ profile, isOwnProfile, onEdit }: {
  profile: any, isOwnProfile: boolean, onEdit?: () => void
}) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <Avatar
        avatarUrl={profile.avatarUrl}
        email={profile.email}
        name={profile.displayName}
        size={48}
      />
      <div>
        <h2 className="text-2xl font-bold">{profile.displayName}</h2>
        <p className="text-muted-foreground">@{profile.username}</p>
        <p className="mt-1">{profile.bio}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Joined {new Date(profile.joined).toLocaleDateString()}
        </p>
      </div>
      {isOwnProfile && onEdit && (
        <Button className="ml-auto" onClick={onEdit}>Edit Profile</Button>
      )}
    </div>
  );
} 