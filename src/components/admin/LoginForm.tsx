"use client";

import { useActionState } from "react";
import { login, type LoginFormState } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

const initialState: LoginFormState = {};

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <FormField label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="username" autoFocus />
      </FormField>

      <FormField label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </FormField>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
