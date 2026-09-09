"use client";

import { useActionState, useState } from "react";
import { createProduct, updateProduct, type ProductFormState } from "@/app/admin/(protected)/products/actions";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type CategoryOption = { id: string; name: string };
type BulkTier = { minQuantity: number; priceMajor: number };

export type ProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  brand: string;
  categoryId: string;
  packageType: string;
  packageSize: string;
  priceMajor: number;
  lowStockThreshold: number;
  minOrderQuantity: number;
  bulkQuoteThreshold: number | "";
  imageUrl: string;
  isFeatured: boolean;
  bulkPrices: BulkTier[];
};

const PACKAGE_TYPES = ["BAG", "CARTON", "BOTTLE", "PACK", "SACK", "BOX"];

const initialState: ProductFormState = {};

export function ProductForm({ categories, initial, productId }: { categories: CategoryOption[]; initial?: ProductFormValues; productId?: string }) {
  const isEdit = !!productId;
  const action = isEdit ? updateProduct.bind(null, productId!) : createProduct;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [bulkPrices, setBulkPrices] = useState<BulkTier[]>(initial?.bulkPrices ?? []);

  const values = initial ?? {
    name: "",
    slug: "",
    sku: "",
    description: "",
    brand: "",
    categoryId: categories[0]?.id ?? "",
    packageType: "BAG",
    packageSize: "",
    priceMajor: 0,
    lowStockThreshold: 10,
    minOrderQuantity: 1,
    bulkQuoteThreshold: "",
    imageUrl: "",
    isFeatured: false,
    bulkPrices: [],
  };

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <input type="hidden" name="bulkPrices" value={JSON.stringify(bulkPrices)} />

      <FormField label="Product name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={values.name} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Slug" htmlFor="slug" hint="Used in the product URL, e.g. royal-stallion-rice-50kg">
          <Input id="slug" name="slug" required defaultValue={values.slug} />
        </FormField>
        <FormField label="SKU" htmlFor="sku">
          <Input id="sku" name="sku" required defaultValue={values.sku} />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="description">
        <Textarea id="description" name="description" required rows={3} defaultValue={values.description} />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Brand (optional)" htmlFor="brand">
          <Input id="brand" name="brand" defaultValue={values.brand} />
        </FormField>
        <FormField label="Category" htmlFor="categoryId">
          <Select id="categoryId" name="categoryId" required defaultValue={values.categoryId}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Package type" htmlFor="packageType">
          <Select id="packageType" name="packageType" required defaultValue={values.packageType}>
            {PACKAGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Package size" htmlFor="packageSize" hint='e.g. "50kg Bag"'>
          <Input id="packageSize" name="packageSize" required defaultValue={values.packageSize} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Price (₦)" htmlFor="priceMajor">
          <Input id="priceMajor" name="priceMajor" type="number" min={0} step="0.01" required defaultValue={values.priceMajor} />
        </FormField>
        {!isEdit && (
          <FormField label="Initial stock" htmlFor="initialStock">
            <Input id="initialStock" name="initialStock" type="number" min={0} defaultValue={0} />
          </FormField>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Low stock threshold" htmlFor="lowStockThreshold">
          <Input id="lowStockThreshold" name="lowStockThreshold" type="number" min={0} required defaultValue={values.lowStockThreshold} />
        </FormField>
        <FormField label="Minimum order quantity" htmlFor="minOrderQuantity">
          <Input id="minOrderQuantity" name="minOrderQuantity" type="number" min={1} required defaultValue={values.minOrderQuantity} />
        </FormField>
      </div>

      <FormField label="Bulk-quote threshold (optional)" htmlFor="bulkQuoteThreshold" hint="Quantities at or above this show 'Request a quote' instead of an instant price">
        <Input id="bulkQuoteThreshold" name="bulkQuoteThreshold" type="number" min={1} defaultValue={values.bulkQuoteThreshold} />
      </FormField>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Bulk price tiers (optional)</p>
        {bulkPrices.map((tier, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <Input
              type="number"
              min={1}
              placeholder="Min qty"
              value={tier.minQuantity}
              onChange={(e) => setBulkPrices((prev) => prev.map((t, idx) => (idx === i ? { ...t, minQuantity: Number(e.target.value) } : t)))}
              className="w-28"
            />
            <span className="text-sm text-stone-500">units at ₦</span>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Price"
              value={tier.priceMajor}
              onChange={(e) => setBulkPrices((prev) => prev.map((t, idx) => (idx === i ? { ...t, priceMajor: Number(e.target.value) } : t)))}
              className="w-28"
            />
            <span className="text-sm text-stone-500">each</span>
            <button type="button" onClick={() => setBulkPrices((prev) => prev.filter((_, idx) => idx !== i))} className="text-xs text-stone-500 underline">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setBulkPrices((prev) => [...prev, { minQuantity: 10, priceMajor: values.priceMajor }])} className="self-start text-sm text-brand-primary-dark underline">
          + Add tier
        </button>
      </div>

      <FormField label="Product photo (optional)" htmlFor="imageUrl" hint="Falls back to a category illustration when no photo is set.">
        <ImageUploadField name="imageUrl" defaultValue={values.imageUrl} />
      </FormField>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={values.isFeatured} />
        Feature on homepage
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
