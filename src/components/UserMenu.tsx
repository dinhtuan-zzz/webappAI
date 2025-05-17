"use client";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";

export function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;
  const avatarUrl = user?.image || user?.avatarUrl;
  const email = user?.email;
  const displayName = user?.name || user?.username || "User";
  console.log("Session:", session);

  if (!user) {
    return (
      <Link href="/login">
        <Button className="bg-[#6bb7b7] hover:bg-[#4e9a9a] text-white font-semibold shadow-md" size="sm">
          Login
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 focus:outline-none">
          <Avatar avatarUrl={avatarUrl} email={email} name={displayName} size={32} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-3 py-2 text-sm text-[#2a4257] font-semibold">
          {displayName}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/user/${user.username}`}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my-posts">My Posts</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/user/${user.username}/settings`}>Account Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600 cursor-pointer">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 