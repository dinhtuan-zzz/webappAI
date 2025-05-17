"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileTabs from "@/components/profile/ProfileTabs";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { useState } from "react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading: loadingProfile } = useSWR(
    username ? `/api/users/${username}/profile` : null,
    fetcher
  );
  const { data: posts, isLoading: loadingPosts } = useSWR(
    username ? `/api/users/${username}/posts` : null,
    fetcher
  );
  // TODO: Add comments/bookmarks fetch if needed

  const [editOpen, setEditOpen] = useState(false);

  if (loadingProfile) return <div>Loading profile...</div>;
  if (!profile) return <div>User not found.</div>;

  // TODO: Replace with your own logic to check if this is the logged-in user
  const isOwnProfile = false;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={() => setEditOpen(true)}
      />
      <ProfileStats profile={profile} />
      <ProfileTabs
        posts={posts?.posts}
        loadingPosts={loadingPosts}
        username={username}
        // comments={...}
        // bookmarks={...}
      />
      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        // onSave={...}
      />
    </div>
  );
} 