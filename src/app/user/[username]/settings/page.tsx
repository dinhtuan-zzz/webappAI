"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const accountSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  displayName: z.string().optional(),
});

type AccountForm = z.infer<typeof accountSchema>;

export default function UserSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  // Use refs to store initial values for reset
  const initialValues = useRef({
    email: user?.email || "",
    username: (user as any)?.username || "",
    displayName: user?.name || "",
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

  // Watch for changes to enable Save/Cancel
  const watched = watch();
  const isChanged = isDirty && (
    watched.email !== initialValues.current.email ||
    watched.username !== initialValues.current.username ||
    watched.displayName !== initialValues.current.displayName
  );

  // Show Cancel button if any field is changed
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
        initialValues.current = data;
        reset(data, { keepDirty: false });
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
            <div>Password change form goes here.</div>
          </TabsContent>
          <TabsContent value="notifications">
            <div>Notification preferences go here.</div>
          </TabsContent>
          <TabsContent value="security">
            <div>Security settings go here.</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 