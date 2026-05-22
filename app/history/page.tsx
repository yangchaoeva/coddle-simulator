import Link from "next/link";
import { headers } from "next/headers";
import { PageShell } from "@/components/shell";
import { getTrainingHistoryForUser } from "@/db/repositories/training-sessions";
import { auth } from "@/lib/auth";

function formatDate(value: Date | string | null) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function HistoryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <PageShell
        eyebrow="History"
        title="训练历史"
        description="登录后才会从服务端读取你的训练历史。未登录状态下不会查询数据库，也不会展示其他用户数据。"
      >
        <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-4">
            <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
              <p className="font-medium text-ink">需要先登录</p>
              <p>历史记录只会按当前 BetterAuth session 读取当前用户自己的训练数据。</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-berry">
                去登录
              </Link>
              <Link href="/characters" className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white">
                回到训练入口
              </Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const history = await getTrainingHistoryForUser(session.user.id);

  return (
    <PageShell
      eyebrow="History"
      title="训练历史"
      description="这里只展示当前登录用户自己的训练记录，查询条件固定为服务端 session.user.id。"
    >
      <section className="space-y-4 rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
        <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
          <p className="font-medium text-ink">{session.user.name}</p>
          <p>{session.user.email}</p>
        </div>

        {history.length === 0 ? (
          <div className="rounded-3xl border border-ink/10 p-5 text-sm leading-7 text-ink/72">
            当前账号还没有已保存的训练记录。
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <article key={item.sessionId} className="rounded-3xl border border-ink/10 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-ink">{item.sceneName}</p>
                    <p className="text-sm text-ink/68">
                      {item.characterType} · {item.levelKey}
                    </p>
                    <p className="text-sm text-ink/68">完成时间：{formatDate(item.completedAt ?? item.createdAt)}</p>
                  </div>
                  <div className="rounded-3xl bg-cream px-4 py-3 text-right text-sm text-ink/78">
                    <p className="font-medium text-ink">{item.totalScore}</p>
                    <p>
                      {item.grade} · {item.endingType}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
