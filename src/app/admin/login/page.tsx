import { businessConfig } from "@/lib/business.config";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const sp = await searchParams;
  const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : "/admin";

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-1 text-lg font-semibold">{businessConfig.name} Admin</h1>
        <p className="mb-6 text-sm text-zinc-500">Sign in to manage products, orders, inventory and quotes.</p>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
