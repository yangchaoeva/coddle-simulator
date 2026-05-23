import Link from "next/link";
import { headers } from "next/headers";
import { PageShell } from "@/components/shell";
import { getEmergencyHistoryForUser } from "@/db/repositories/emergency-analyses";
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

function summarize(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

export default async function EmergencyHistoryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <PageShell
        eyebrow="Emergency History"
        title="救急历史"
        description="登录后才会从服务端读取你保存过的救急分析记录。未登录状态下不会查询数据库。"
      >
        <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-4">
            <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
              <p className="font-medium text-ink">需要先登录</p>
              <p>救急历史只会按当前 BetterAuth session 读取当前用户自己的 emergency_analyses 记录。</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-berry">
                去登录
              </Link>
              <Link href="/emergency" className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white">
                返回救急模式
              </Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const history = await getEmergencyHistoryForUser(session.user.id);

  return (
    <PageShell
      eyebrow="Emergency History"
      title="救急历史"
      description="这里只展示当前登录用户自己保存过的救急分析记录，查询条件固定为服务端 session.user.id。"
    >
      <section className="space-y-4 rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
        <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
          <p className="font-medium text-ink">{session.user.name}</p>
          <p>{session.user.email}</p>
        </div>

        {history.length === 0 ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-ink/10 p-5 text-sm leading-7 text-ink/72">
              当前账号还没有已保存的救急分析记录。
            </div>
            <Link href="/emergency" className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry">
              去生成新的救急分析
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <article key={item.analysisId} className="rounded-3xl border border-ink/10 p-5">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-ink">救急分析记录</p>
                      <p className="text-sm text-ink/68">保存时间：{formatDate(item.createdAt)}</p>
                    </div>
                    <div className="rounded-3xl bg-cream px-4 py-3 text-sm text-ink/78">
                      <p>{item.matchedCharacterType ? `匹配角色：${item.matchedCharacterType}` : "未匹配角色"}</p>
                    </div>
                  </div>

                  <section className="rounded-3xl bg-cream p-4 text-sm leading-7 text-ink/78">
                    <p className="font-medium text-ink">用户原始输入摘要</p>
                    <p>{summarize(item.userInput, 120)}</p>
                  </section>

                  <section className="rounded-3xl border border-ink/10 p-4 text-sm leading-7 text-ink/78">
                    <p className="font-medium text-ink">情绪判断 / 潜台词摘要</p>
                    <p>{summarize(item.emotionAnalysis, 100)}</p>
                    {item.hiddenNeed ? <p className="mt-2">{summarize(item.hiddenNeed, 100)}</p> : null}
                  </section>

                  <section className="rounded-3xl border border-ink/10 p-4 text-sm leading-7 text-ink/78">
                    <p className="font-medium text-ink">建议回复摘要</p>
                    <p>{item.suggestedReply ? summarize(item.suggestedReply, 120) : "暂无建议回复。"}</p>
                  </section>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
