import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Link from "next/link";
import { UserMenuClient } from "./UserMenuClient";

export default async function UserMenuServer() {
  const session = await getServerSession(authOptions);
  return <UserMenuClient session={session} />;
//   if (!session) {
//     return <Link href="/login">Login</Link>;
//   }

//   return (
//     <div className="flex items-center gap-2">
//       <img
//         src={session.user?.image ?? "/default-avatar.png"}
//         alt="avatar"
//         className="w-8 h-8 rounded-full"
//       />
//       <span>{session.user?.name ?? session.user?.email}</span>
//     </div>
//   );
} 
