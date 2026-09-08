import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { StaffRoleSelect } from "@/components/admin/StaffRoleSelect";
import { ToggleStaffActiveButton } from "@/components/admin/ToggleStaffActiveButton";

export default async function AdminStaffPage() {
  const session = await requirePermission("staff:manage");
  const staff = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Staff</h1>
        <Link href="/admin/staff/new" className={buttonClasses("primary", "md")}>
          Add staff member
        </Link>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Last login</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {staff.map((member) => {
            const isSelf = member.id === session.user.id;
            return (
              <Tr key={member.id}>
                <Td className="font-medium">
                  {member.name} {isSelf && <span className="text-xs text-zinc-500">(you)</span>}
                </Td>
                <Td className="text-zinc-500">{member.email}</Td>
                <Td>
                  <StaffRoleSelect staffId={member.id} role={member.role} disabled={isSelf} />
                </Td>
                <Td>{member.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}</Td>
                <Td className="text-xs text-zinc-500">{member.lastLoginAt ? member.lastLoginAt.toLocaleString() : "Never"}</Td>
                <Td>
                  <ToggleStaffActiveButton staffId={member.id} isActive={member.isActive} disabled={isSelf} />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <p className="text-xs text-zinc-500">Role labels: {Object.entries(ROLE_LABELS).map(([k, v]) => `${k} = ${v}`).join(" · ")}</p>
    </div>
  );
}
