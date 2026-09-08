import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { formatMoney } from "@/lib/currency";
import { StockBadge } from "@/components/domain/StockBadge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { ToggleActiveButton } from "@/components/admin/ToggleActiveButton";

export default async function AdminProductsPage() {
  await requirePermission("products:manage");

  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className={buttonClasses("primary", "md")}>
          New product
        </Link>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th className="text-right">Price</Th>
            <Th className="text-right">Stock</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((product) => (
            <Tr key={product.id}>
              <Td>
                <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">
                  {product.name}
                </Link>
                <div className="text-xs text-stone-500">
                  {product.sku} · {product.packageSize}
                </div>
              </Td>
              <Td className="text-stone-500">{product.category.name}</Td>
              <Td className="text-right">{formatMoney(product.priceMinor)}</Td>
              <Td className="text-right">{product.stock}</Td>
              <Td className="flex flex-wrap gap-1">
                <StockBadge stock={product.stock} lowStockThreshold={product.lowStockThreshold} />
                {!product.isActive && <Badge tone="neutral">Inactive</Badge>}
                {product.isFeatured && <Badge tone="brand">Featured</Badge>}
              </Td>
              <Td>
                <ToggleActiveButton productId={product.id} isActive={product.isActive} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
