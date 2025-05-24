"use client";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * LogoutButton - Button to log out the current user.
 *
 * @returns {JSX.Element}
 */
export function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full text-red-600 hover:bg-red-50"
    >
      Logout
    </Button>
  );
} 