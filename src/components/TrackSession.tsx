"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

/**
 * TrackSession - Tracks the current user's session for analytics or security purposes.
 *
 * @returns {null}
 */
export function TrackSession() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      // Try both possible cookie names for session token
      const match =
        typeof document !== "undefined"
          ? document.cookie.match(/(?:^|; )(__Secure-)?next-auth\.session-token=([^;]*)/)
          : null;
      const sessionToken = match?.[2];
      if (sessionToken) {
        fetch("/api/auth/track-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken }),
        });
      }
    }
  }, [status]);

  return null;
}