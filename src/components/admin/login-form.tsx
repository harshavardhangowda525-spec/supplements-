"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { signIn, type ActionResult } from "@/lib/admin/actions";
import { fzButton } from "@/components/brand/button-styles";
import { Field, FormMessage, TextInput } from "@/components/forms/fields";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionResult, FormData>(signIn, { ok: false });
  return (
    <form action={action} className="space-y-4">
      <Field label="Email" name="email">
        <TextInput name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label="Password" name="password">
        <TextInput name="password" type="password" autoComplete="current-password" required minLength={6} />
      </Field>
      {state.message && <FormMessage status="error" message={state.message} />}
      <button type="submit" disabled={pending} className={fzButton("primary", "md", "w-full")}>
        <LogIn /> {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
