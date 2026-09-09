"use client";

import { useActionState } from "react";
import { createStaff, type StaffFormState } from "@/app/admin/(protected)/staff/actions";
import { FormField, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: StaffFormState = {};

export function NewStaffForm() {
  const [state, formAction, isPending] = useActionState(createStaff, initialState);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <FormField label="Full name" htmlFor="name">
        <Input id="name" name="name" required minLength={2} maxLength={120} />
      </FormField>
      <FormField label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="off" />
      </FormField>
      <FormField label="Temporary password" htmlFor="password" hint="At least 8 characters. Share it with them securely and have them change it later.">
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </FormField>
      <FormField label="Role" htmlFor="role">
        <Select id="role" name="role" required defaultValue="ADMIN">
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
        </Select>
      </FormField>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
