"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/shell";
import { authClient } from "@/lib/auth-client";

function getSafeCallbackPath(callbackUrl: string | null) {
  if (!callbackUrl) {
    return "/history";
  }

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/history";
  }

  if (callbackUrl.toLowerCase().startsWith("/javascript:")) {
    return "/history";
  }

  if (callbackUrl === "/" || callbackUrl === "/history") {
    return callbackUrl;
  }

  if (/^\/training\/result\/[^/?#]+$/.test(callbackUrl)) {
    return callbackUrl;
  }

  return "/history";
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callbackPath, setCallbackPath] = useState("/history");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackPath(getSafeCallbackPath(params.get("callbackUrl")));
  }, []);

  const handleGoogleSignIn = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${callbackPath}`,
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
      description="当前通过 BetterAuth + Google OAuth 登录。登录成功后会回到安全校验通过的站内页面。"
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
                href={callbackPath}
                className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-berry"
              >
                返回目标页
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
              <p>登录完成后会回到当前训练结果页或默认历史页。当前阶段不做自动静默合并。</p>
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
