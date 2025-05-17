import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function EditProfileModal({ open, onOpenChange, profile }: {
  open: boolean, onOpenChange: (open: boolean) => void, profile: any
}) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);

  // TODO: Add avatar upload, handle submit, etc.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={e => {
            e.preventDefault();
            // TODO: Call API to update profile
            onOpenChange(false);
          }}
          className="space-y-4"
        >
          <div>
            <label>Display Name</label>
            <input
              className="input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label>Bio</label>
            <textarea
              className="textarea"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>
          {/* TODO: Avatar upload */}
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 