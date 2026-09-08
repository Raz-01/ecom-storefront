import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { StockBadge } from "@/components/domain/StockBadge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { AdjustStockForm } from "@/components/admin/AdjustStockForm";

export default async function AdminInventoryPage() {
  await requirePermission("inventory:manage");

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Inventory</h1>
      <Table>
        <Thead>
          <Tr>
            <Th>Product</Th>
            <Th>SKU</Th>
            <Th className="text-right">Stock</Th>
            <Th className="text-right">Threshold</Th>
            <Th>Status</Th>
            <Th>Adjust</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((product) => (
            <Tr key={product.id}>
              <Td>
                <Link href={`/admin/inventory/${product.id}`} className="font-medium hover:underline">
                  {product.name}
                </Link>
                <div className="text-xs text-stone-500">{product.packageSize}</div>
              </Td>
              <Td className="text-xs text-stone-500">{product.sku}</Td>
              <Td className="text-right font-medium">{product.stock}</Td>
              <Td className="text-right text-stone-500">{product.lowStockThreshold}</Td>
              <Td>
                <StockBadge stock={product.stock} lowStockThreshold={product.lowStockThreshold} />
              </Td>
              <Td>
                <AdjustStockForm productId={product.id} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
