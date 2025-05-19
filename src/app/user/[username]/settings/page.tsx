import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { UserSettingsPage } from "./UserSettingsPage"; // client component
import { prisma } from "@/lib/prisma";



export default async function SettingsPage({ params }: { params: { username: string } }) {
  const { username }= await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user?.username !== username) {
    redirect("/login");
  }

  // Fetch user data (customize fields as needed)
  const userData = await prisma.user.findUnique({
    where: { username: username },
    select: {
      email: true,
      username: true,
      profile: {
        select: {
          displayName: true,
        },
      },
    },
  });

  if (!userData) {
    redirect("/login");
  }

  // Pass session and userData to the client component
  return <UserSettingsPage session={session} userData={{
    email: userData.email,
    username: userData.username,
    displayName: userData.profile?.displayName ?? "",
  }} />;
}