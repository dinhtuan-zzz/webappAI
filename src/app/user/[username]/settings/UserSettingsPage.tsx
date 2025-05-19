'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as usePasswordForm } from "react-hook-form";
import { z as zPassword, ZodType as ZodTypePassword } from "zod";
import { zodResolver as zodPasswordResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import useSWR from "swr";
import { SessionManager } from "@/components/SessionManager";

const accountSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  displayName: z.string().optional(),
});

type AccountForm = z.infer<typeof accountSchema>;

const passwordSchema = zPassword.object({
  currentPassword: zPassword.string().min(1, "Current password is required"),
  newPassword: zPassword.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: zPassword.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordForm = zPassword.infer<typeof passwordSchema>;

export function UserSettingsPage({ session, userData }: { session: any, userData: any }) {
  const initialValues = useRef({
    email: userData?.email || "",
    username: userData?.username || "",
    displayName: userData?.displayName || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    mode: "onChange",
    defaultValues: initialValues.current,
  });

  const watched = watch();
  const isChanged = isDirty && (
    watched.email !== initialValues.current.email ||
    watched.username !== initialValues.current.username ||
    watched.displayName !== initialValues.current.displayName
  );

  if (isChanged && !showCancel) setShowCancel(true);
  if (!isChanged && showCancel) setShowCancel(false);

  const onSubmit = async (data: AccountForm) => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/users/${data.username}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("Account updated!");
        initialValues.current = {
          ...data,
          displayName: data.displayName ?? ""
        };
        reset({ ...data, displayName: data.displayName ?? "" }, { keepDirty: false });
        setShowCancel(false);
      } else {
        setError(result.error || "Failed to update account");
      }
    } catch (err) {
      setError("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    reset(initialValues.current, { keepDirty: false });
    setShowCancel(false);
    setMessage("");
    setError("");
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-2">
      <div className="w-full max-w-lg bg-white dark:bg-muted rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">User Settings</h2>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <Input type="email" {...register("email")} disabled={saving} />
                {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email.message}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Username</label>
                <Input {...register("username")} disabled={saving} />
                {errors.username && <div className="text-red-600 text-xs mt-1">{errors.username.message}</div>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Display Name</label>
                <Input {...register("displayName")} disabled={saving} />
                {errors.displayName && <div className="text-red-600 text-xs mt-1">{errors.displayName.message}</div>}
              </div>
              <div className="flex gap-2 items-center">
                <Button type="submit" disabled={saving || !isValid || !isChanged}>
                  {saving ? <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full inline-block" /> : null}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                {showCancel && (
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
                )}
              </div>
              {message && <div className="text-green-600 text-sm mt-2">{message}</div>}
              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            </form>
          </TabsContent>
          <TabsContent value="password">
            <PasswordTab username={(userData as any)?.username || ""} />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationTab username={(userData as any)?.username || ""} />
          </TabsContent>
          <TabsContent value="security">
            <SecurityTab username={(userData as any)?.username || ""} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PasswordTab({ username }: { username: string }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = usePasswordForm<PasswordForm>({
    resolver: zodPasswordResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const watched = watch();
  const isChanged = isDirty && (watched.currentPassword || watched.newPassword || watched.confirmPassword);
  if (isChanged && !showCancel) setShowCancel(true);
  if (!isChanged && showCancel) setShowCancel(false);

  const onSubmit = async (data: PasswordForm) => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/users/${username}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("Password changed successfully");
        reset();
        setShowCancel(false);
      } else {
        setError(result.error || "Failed to change password");
      }
    } catch (err) {
      setError("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    setShowCancel(false);
    setMessage("");
    setError("");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block mb-1 font-medium">Current Password</label>
        <Input type="password" autoComplete="current-password" {...register("currentPassword")} disabled={saving} />
        {errors.currentPassword && <div className="text-red-600 text-xs mt-1">{errors.currentPassword.message}</div>}
      </div>
      <div>
        <label className="block mb-1 font-medium">New Password</label>
        <Input type="password" autoComplete="new-password" {...register("newPassword")} disabled={saving} />
        {errors.newPassword && <div className="text-red-600 text-xs mt-1">{errors.newPassword.message}</div>}
      </div>
      <div>
        <label className="block mb-1 font-medium">Confirm New Password</label>
        <Input type="password" autoComplete="new-password" {...register("confirmPassword")} disabled={saving} />
        {errors.confirmPassword && <div className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</div>}
      </div>
      <div className="flex gap-2 items-center">
        <Button type="submit" disabled={saving || !isValid || !isChanged}>
          {saving ? <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full inline-block" /> : null}
          {saving ? "Saving..." : "Change Password"}
        </Button>
        {showCancel && (
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
        )}
      </div>
      {message && <div className="text-green-600 text-sm mt-2">{message}</div>}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </form>
  );
}

function NotificationTab({ username }: { username: string }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, isLoading, mutate } = useSWR(
    username ? `/api/users/${username}/notifications` : null,
    fetcher
  );
  const initialValues = useRef<{ [key: string]: boolean }>({
    emailComment: true,
    emailReply: true,
    emailFollower: false,
    emailMention: false,
    emailNewsletter: false,
  });
  useEffect(() => {
    if (data?.preferences) {
      initialValues.current = {
        emailComment: !!data.preferences.emailComment,
        emailReply: !!data.preferences.emailReply,
        emailFollower: !!data.preferences.emailFollower,
        emailMention: !!data.preferences.emailMention,
        emailNewsletter: !!data.preferences.emailNewsletter,
      };
      reset(initialValues.current, { keepDirty: false });
    }
  }, [data]);
  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
    watch,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: initialValues.current,
  });
  const watched = watch() as { [key: string]: boolean };
  const isChanged = isDirty && Object.keys(initialValues.current).some(
    key => watched[key] !== initialValues.current[key]
  );
  if (isChanged && !showCancel) setShowCancel(true);
  if (!isChanged && showCancel) setShowCancel(false);

  const onSubmit = async (formData: any) => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/users/${username}/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("Preferences saved!");
        initialValues.current = formData;
        reset(formData, { keepDirty: false });
        setShowCancel(false);
        mutate();
      } else {
        setError(result.error || "Failed to update preferences");
      }
    } catch (err) {
      setError("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    reset(initialValues.current, { keepDirty: false });
    setShowCancel(false);
    setMessage("");
    setError("");
  };

  if (isLoading) return <div>Loading preferences...</div>;

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h4 className="font-semibold mb-2">Post Activity</h4>
        <div className="flex items-center gap-2 mb-2">
          <Switch checked={watched.emailComment} onCheckedChange={v => setValue("emailComment", v, { shouldDirty: true })} />
          <span>New comment on my post</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Switch checked={watched.emailReply} onCheckedChange={v => setValue("emailReply", v, { shouldDirty: true })} />
          <span>Reply to my comment</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Switch checked={watched.emailMention} onCheckedChange={v => setValue("emailMention", v, { shouldDirty: true })} />
          <span>Mentions</span>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Account Activity</h4>
        <div className="flex items-center gap-2 mb-2">
          <Switch checked={watched.emailFollower} onCheckedChange={v => setValue("emailFollower", v, { shouldDirty: true })} />
          <span>New follower</span>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Newsletter</h4>
        <div className="flex items-center gap-2 mb-2">
          <Switch checked={watched.emailNewsletter} onCheckedChange={v => setValue("emailNewsletter", v, { shouldDirty: true })} />
          <span>Newsletter & announcements</span>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <Button type="submit" disabled={saving || !isChanged}>
          {saving ? <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full inline-block" /> : null}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {showCancel && (
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>Cancel</Button>
        )}
      </div>
      {message && <div className="text-green-600 text-sm mt-2">{message}</div>}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </form>
  );
}

function SecurityTab({ username }: { username: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  const { data: sessionsData, isLoading: loadingSessions, mutate: mutateSessions } = useSWR(
    username ? `/api/users/${username}/sessions` : null,
    (url) => fetch(url).then(res => res.json())
  );
  const sessions = sessionsData?.sessions || [];

  const { data: activityData, isLoading: loadingActivity } = useSWR(
    username ? `/api/users/${username}/security-activity` : null,
    (url) => fetch(url).then(res => res.json())
  );
  const activity = activityData?.activity || [];

  const handleEnable2FA = () => {
    setShow2FASetup(true);
    setMessage("");
    setError("");
  };
  const handleDisable2FA = () => {
    setSaving(true);
    setTimeout(() => {
      setTwoFAEnabled(false);
      setMessage("2FA disabled.");
      setSaving(false);
    }, 1000);
  };
  const handleVerify2FA = () => {
    setSaving(true);
    setTimeout(() => {
      setTwoFAEnabled(true);
      setShow2FASetup(false);
      setMessage("2FA enabled!");
      setSaving(false);
    }, 1000);
  };

  const handleRevokeSession = async (id: string) => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/users/${username}/sessions/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        setMessage("Session revoked.");
        mutateSessions();
      } else {
        setError(result.error || "Failed to revoke session");
      }
    } catch (err) {
      setError("Failed to revoke session");
    } finally {
      setSaving(false);
    }
  };
  const handleRevokeAll = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`/api/users/${username}/sessions?allOthers=true`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        setMessage("All other sessions revoked.");
        mutateSessions();
      } else {
        setError(result.error || "Failed to revoke sessions");
      }
    } catch (err) {
      setError("Failed to revoke sessions");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-muted/50">
        <h4 className="font-semibold mb-2">Two-Factor Authentication (2FA)</h4>
        <div className="mb-2">Status: <span className={twoFAEnabled ? "text-green-600" : "text-red-600"}>{twoFAEnabled ? "Enabled" : "Disabled"}</span></div>
        {!twoFAEnabled && !show2FASetup && (
          <Button onClick={handleEnable2FA}>Enable 2FA</Button>
        )}
        {twoFAEnabled && !show2FASetup && (
          <Button variant="destructive" onClick={handleDisable2FA} disabled={saving}>{saving ? "Disabling..." : "Disable 2FA"}</Button>
        )}
        {show2FASetup && (
          <div className="mt-4 space-y-2">
            <div>Scan this QR code with your authenticator app:</div>
            <div className="w-32 h-32 bg-gray-300 rounded flex items-center justify-center">QR</div>
            <div>Or enter this secret: <span className="font-mono">ABC123SECRET</span></div>
            <div>
              <label className="block mb-1 font-medium">Verification Code</label>
              <Input type="text" className="w-40" />
            </div>
            <Button onClick={handleVerify2FA} disabled={saving}>{saving ? "Verifying..." : "Verify & Enable 2FA"}</Button>
            <Button variant="outline" onClick={() => setShow2FASetup(false)} disabled={saving}>Cancel</Button>
          </div>
        )}
      </div>
      <div className="border rounded-lg p-4 bg-muted/50">
        <h4 className="font-semibold mb-2">Active Sessions</h4>
        <SessionManager username={username} />
      </div>
      <div className="border rounded-lg p-4 bg-muted/50">
        <h4 className="font-semibold mb-2">Recent Security Activity</h4>
        {loadingActivity ? (
          <div>Loading activity...</div>
        ) : (
          <ul className="space-y-2">
            {activity.map((act: any) => (
              <li key={act.id} className="flex justify-between items-center">
                <span>{act.action}</span>
                <span className="text-xs text-muted-foreground">{new Date(act.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {(message || error) && <div className={message ? "text-green-600" : "text-red-600"}>{message || error}</div>}
    </div>
  );
} 