import Link from "next/link";
import { PageShell } from "@/components/shell";

export default function HistoryPage() {
  return (
    <PageShell
      eyebrow="History"
      title="历史记录占位页"
      description="当前阶段仍只保留占位。Stage 3 不接 BetterAuth、不接数据库，所以这里暂不展示正式历史记录。"
    >
      <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
        <div className="space-y-4">
          <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
            <p className="font-medium text-ink">当前状态</p>
            <p>历史记录需要后续阶段接入登录态和保存逻辑后才会开放。现在这个页面只用于占位和流程验证。</p>
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
      </section>
    </PageShell>
  );
}
