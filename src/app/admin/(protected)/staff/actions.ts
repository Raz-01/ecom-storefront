"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import type { AdminRole } from "@prisma/client";

export type StaffFormState = { error?: string };

const newStaffSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["OWNER", "ADMIN", "WAREHOUSE_STAFF"]),
});

export async function createStaff(_prevState: StaffFormState, formData: FormData): Promise<StaffFormState> {
  await requirePermission("staff:manage");

  const parsed = newStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.adminUser.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: parsed.data.role },
  });

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function toggleStaffActive(staffId: string, isActive: boolean): Promise<void> {
  const session = await requirePermission("staff:manage");
  if (session.user.id === staffId) return; // never let an owner deactivate their own account by mistake
  await prisma.adminUser.update({ where: { id: staffId }, data: { isActive } });
  revalidatePath("/admin/staff");
}

export async function updateStaffRole(staffId: string, role: AdminRole): Promise<void> {
  const session = await requirePermission("staff:manage");
  if (session.user.id === staffId) return; // never let an owner demote themselves out of the only owner seat by mistake
  await prisma.adminUser.update({ where: { id: staffId }, data: { role } });
  revalidatePath("/admin/staff");
}
