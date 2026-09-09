import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/permissions";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB — comfortably covers a product photo without inviting abuse

/**
 * Product-photo upload, used by the admin product form's file picker.
 * Stores the file in Vercel Blob (public access — product photos need to
 * be viewable on the storefront, unauthenticated) and returns its URL,
 * which the form then submits as `Product.imageUrl` — the schema and
 * every place that renders a photo already just take a URL, so this is
 * the only place that needed to change to support real uploads instead of
 * pasting a link.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, "products:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Use JPEG, PNG, WebP or GIF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large. Maximum size is 5MB." }, { status: 400 });
  }

  try {
    const extension = file.name.split(".").pop() || "jpg";
    const blob = await put(`products/${crypto.randomUUID()}.${extension}`, file, {
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Product image upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
