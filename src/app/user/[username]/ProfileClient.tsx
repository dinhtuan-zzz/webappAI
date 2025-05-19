"use client";
import ProfileTabs from "@/components/profile/ProfileTabs";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { useState } from "react";

export default function ProfileClient({ profile, posts, username, isOwnProfile }: any) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      {/* You can pass onEdit to ProfileHeader if needed */}
      <ProfileTabs
        posts={posts}
        loadingPosts={false}
        username={username}
      />
      {isOwnProfile && (
        <EditProfileModal
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
        />
      )}
    </>
  );
}