"use client";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Or your preferred toast/snackbar lib

export function SessionManager({ username }: { username: string }) {
  //console.log("SessionManager username:", username);
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error, isLoading, mutate } = useSWR(
    username ? `/api/users/${username}/sessions` : null,
    fetcher
  );
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  if (isLoading) return <div>Loading sessions...</div>;
  if (error) return <div className="text-red-600">Failed to load sessions.</div>;
  const sessions = data?.sessions || [];
  //console.log("SessionManager sessions:", sessions, "data:", data);
  if (sessions.length === 0) return <div>No active sessions found.</div>;

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      const res = await fetch(`/api/users/${username}/sessions/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        toast.success("Session revoked.");
        mutate();
      } else {
        toast.error(result.error || "Failed to revoke session.");
      }
    } catch {
      toast.error("Failed to revoke session.");
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      const res = await fetch(`/api/users/${username}/sessions?allOthers=true`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        toast.success("All other sessions revoked.");
        mutate();
      } else {
        toast.error(result.error || "Failed to revoke sessions.");
      }
    } catch {
      toast.error("Failed to revoke sessions.");
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <div>
      <ul className="space-y-2 mb-2">
        {sessions.map((sess: any) => (
          <li
            key={sess.id}
            className={`flex flex-col sm:flex-row sm:justify-between sm:items-center border rounded p-2 ${
              sess.isCurrent ? "bg-green-50 border-green-300" : ""
            }`}
          >
            <div>
              <div className="font-medium">{sess.device}</div>
              <div className="text-xs text-muted-foreground">
                {sess.ip} {sess.location && `• ${sess.location}`} • Last active:{" "}
                {new Date(sess.lastActive).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 sm:mt-0">
              {sess.isCurrent ? (
                <span className="text-xs text-green-600 font-semibold">
                  Current Session
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRevoke(sess.id)}
                  disabled={revoking === sess.id}
                >
                  {revoking === sess.id ? "Revoking..." : "Revoke"}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleRevokeAll}
        disabled={revokingAll}
      >
        {revokingAll ? "Revoking..." : "Log out of all other sessions"}
      </Button>
    </div>
  );
}