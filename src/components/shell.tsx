"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-4xl border border-white/70 bg-white/85 p-5 shadow-card backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <Link href="/" className="inline-flex w-fit rounded-full bg-ink px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-berry">
                哄她模拟器 MVP
              </Link>
              {eyebrow ? <p className="text-sm font-medium uppercase tracking-[0.2em] text-berry/80">{eyebrow}</p> : null}
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1>
                <p className="max-w-3xl text-sm leading-7 text-ink/70 sm:text-base">{description}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <nav className="flex flex-wrap gap-2 text-sm text-ink/70">
                <Link className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 transition hover:border-ink/25 hover:bg-white hover:text-ink" href="/characters">
                  训练
                </Link>
                <Link className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 transition hover:border-ink/25 hover:bg-white hover:text-ink" href="/emergency">
                  救急
                </Link>
                <Link className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 transition hover:border-ink/25 hover:bg-white hover:text-ink" href="/history">
                  历史
                </Link>
                <Link className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 transition hover:border-ink/25 hover:bg-white hover:text-ink" href="/login">
                  登录
                </Link>
              </nav>

              <div className="flex flex-wrap items-center gap-2 text-sm text-ink/72">
                {isPending ? (
                  <span>正在检查登录状态...</span>
                ) : session?.user ? (
                  <>
                    <span className="rounded-full bg-sage/18 px-3 py-1 text-ink">
                      已登录：{session.user.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 transition hover:border-ink/25 hover:bg-white hover:text-ink"
                    >
                      退出
                    </button>
                  </>
                ) : (
                  <span>当前未登录</span>
                )}
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
