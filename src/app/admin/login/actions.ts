"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginFormState = { error?: string };

export async function login(_prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: (formData.get("callbackUrl") as string) || "/admin",
    });
    return {};
  } catch (err) {
    // Auth.js's `signIn` throws a framework redirect signal on success —
    // that must propagate, not be swallowed as a login failure. Only an
    // actual `AuthError` (bad credentials) is ours to handle here.
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
}
