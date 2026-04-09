"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [age18, setAge18] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setError("");
      if (mode === "signup") {
        if (!age18) {
          setError("You must confirm you are 18 or older.");
          return;
        }
        if (!acceptTerms) {
          setError("Please accept the Terms & Conditions and Privacy Policy.");
          return;
        }
      }
      const authUser =
        mode === "login"
          ? await login(username, password)
          : await signup(username, password, passwordConfirm);
      router.push(authUser.role === "admin" ? "/admin" : "/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const signupDisabled =
    isAuthSubmitting || !age18 || !acceptTerms || !username.trim() || !password || !passwordConfirm;

  return (
    <AppShell>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Login" : "Signup"}</CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Single login for users and admins. Redirect is role-based."
              : "Only a username and password. You must be 18+."}
          </CardDescription>
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
          {mode === "signup" && (
            <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                className="mt-1 rounded border-zinc-400"
                checked={age18}
                onChange={(e) => setAge18(e.target.checked)}
              />
              <span>I am 18 years of age or older and legally allowed to bet in my jurisdiction.</span>
            </label>
          )}
          {mode === "signup" && (
            <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                className="mt-1 rounded border-zinc-400"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <span>
                I have read and agree to the{" "}
                <Link href="/terms" className="font-medium text-indigo-600 underline dark:text-indigo-400">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-indigo-600 underline dark:text-indigo-400">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={mode === "signup" ? signupDisabled : isAuthSubmitting}
              onClick={() => void submit()}
            >
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
