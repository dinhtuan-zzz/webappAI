import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileTabs from "@/components/profile/ProfileTabs";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

interface Props {
  params: { username: string };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function fetchProfile(username: string) {
  const res = await fetch(`${baseUrl}/api/users/${username}/profile`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function fetchPosts(username: string) {
  const res = await fetch(`${baseUrl}/api/users/${username}/posts`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const { username } = await params;
  const session = await getServerSession(authOptions);
  //const username = username;
  const profile = await fetchProfile(username);
  const posts = await fetchPosts(username);

  if (!profile) return notFound();

  // Check if this is the logged-in user's profile
  const isOwnProfile = !!(session?.user && (session.user.username === username || session.user.email === profile.email));

  // Modal state must be handled client-side
  // We'll use a client wrapper for EditProfileModal
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        // onEdit will be handled in client wrapper
      />
      <ProfileStats profile={profile} />
      <ProfileClient
        profile={profile}
        posts={posts?.posts}
        username={username}
        isOwnProfile={isOwnProfile}
      />
      {/* EditProfileModal can be conditionally rendered in ProfileHeader or a client wrapper if needed */}
    </div>
  );
} 