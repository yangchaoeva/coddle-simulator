"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/shell";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000/history",
      });
    } catch {
      setError("Google 登录未完成。请检查回调地址和 Google OAuth 配置。");
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  return (
    <PageShell
      eyebrow="Login"
      title="Google 登录"
      description="Stage 6A 只接入 BetterAuth + Google OAuth。当前不开放邮箱密码登录，不保存训练记录，不做游客合并。"
    >
      <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
        {isPending ? (
          <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">正在确认当前登录状态...</div>
        ) : session?.user ? (
          <div className="space-y-4">
            <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
              <p className="font-medium text-ink">已登录</p>
              <p>{session.user.name}</p>
              <p>{session.user.email}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/history"
                className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-berry"
              >
                去历史页
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white"
              >
                退出登录
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
              <p className="font-medium text-ink">当前范围</p>
              <p>这一阶段只验证 Google 登录闭环，暂时不会保存训练、救急、游客数据。</p>
            </div>
            {error ? (
              <div className="rounded-3xl border border-coral/30 bg-coral/8 p-4 text-sm leading-7 text-ink/78">{error}</div>
            ) : null}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry disabled:bg-ink/40"
            >
              {submitting ? "正在跳转 Google..." : "使用 Google 登录"}
            </button>
          </div>
        )}
      </section>
    </PageShell>
  );
}
