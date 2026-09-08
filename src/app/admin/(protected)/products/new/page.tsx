import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  await requirePermission("products:manage");
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
