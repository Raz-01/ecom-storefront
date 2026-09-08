import { requirePermission } from "@/lib/auth/session";
import { NewStaffForm } from "@/components/admin/NewStaffForm";

export default async function NewStaffPage() {
  await requirePermission("staff:manage");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Add staff member</h1>
      <NewStaffForm />
    </div>
  );
}
