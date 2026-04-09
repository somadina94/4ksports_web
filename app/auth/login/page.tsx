"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/src/components/layout/app-shell";
import { useSportsbook } from "@/src/hooks/useSportsbook";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import ToastStack from "@/src/components/ui/toast-stack";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, isAuthSubmitting, toasts, dismissToast } = useSportsbook();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setError("");
      const authUser =
        mode === "login"
          ? await login(username, password)
          : await signup(username, password, passwordConfirm);
      router.push(authUser.role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AppShell>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Login" : "Signup"}</CardTitle>
          <CardDescription>Single login page for users and admins. Redirect is role-based.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {mode === "signup" && (
            <Input
              type="password"
              placeholder="Confirm Password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <Button disabled={isAuthSubmitting} onClick={() => submit().catch(() => {})}>
              {isAuthSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </Button>
            <Button variant="secondary" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              Switch to {mode === "login" ? "Signup" : "Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
