"use client";

import { useTransition } from "react";
import { updateStaffRole } from "@/app/admin/(protected)/staff/actions";
import { Select } from "@/components/ui/Field";
import type { AdminRole } from "@prisma/client";

const ROLES: AdminRole[] = ["OWNER", "ADMIN", "WAREHOUSE_STAFF"];

export function StaffRoleSelect({ staffId, role, disabled }: { staffId: string; role: AdminRole; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={role}
      disabled={disabled || isPending}
      onChange={(e) => startTransition(() => updateStaffRole(staffId, e.target.value as AdminRole))}
      className="w-40"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </Select>
  );
}
