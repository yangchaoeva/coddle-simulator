"use client";

import Link from "next/link";
import { PageShell } from "@/components/shell";
import { authClient } from "@/lib/auth-client";

export default function HistoryPage() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <PageShell
      eyebrow="History"
      title="训练历史"
      description="Stage 6A 只验证登录态识别。历史训练记录展示会放到 Stage 6B，当前页面不会查询或写入训练数据。"
    >
      <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
        {isPending ? (
          <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">正在检查登录状态...</div>
        ) : !session?.user ? (
          <div className="space-y-4">
            <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
              <p className="font-medium text-ink">需要先登录</p>
              <p>Stage 6A 已经接入 Google 登录，但这里还不会查询训练历史。请先登录，Stage 6B 再开放历史数据展示。</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-berry">
                去 Google 登录
              </Link>
              <Link href="/characters" className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white">
                回到训练入口
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
              <p className="font-medium text-ink">已识别到当前登录用户</p>
              <p>{session.user.name}</p>
              <p>{session.user.email}</p>
              <p>Stage 6B 才会在这里展示当前用户的训练历史。当前阶段不查询 `training_sessions`、`dialogue_turns` 或 `score_results`。</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/characters" className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-berry">
                回到训练入口
              </Link>
              <Link href="/" className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white">
                返回首页
              </Link>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
