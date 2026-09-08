import type { AdminRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

/** Augments Auth.js's Session/User/JWT with the fields our Credentials provider actually returns — role and id — so they're typed everywhere `auth()`/`useSession()` is used instead of falling back to `any`. */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AdminRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: AdminRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
  }
}
