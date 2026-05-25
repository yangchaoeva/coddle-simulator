import Link from "next/link";
import { headers } from "next/headers";
import { PageShell } from "@/components/shell";
import { getTrainingSessionDetailForUser } from "@/db/repositories/training-sessions";
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

function SkillScoreList({ skillScores }: { skillScores: Record<string, number> | null }) {
  if (!skillScores || Object.keys(skillScores).length === 0) {
    return <p className="text-sm text-ink/60">无</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(skillScores).map(([key, value]) => (
        <span key={key} className="rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-ink">
          {key}: {value}
        </span>
      ))}
    </div>
  );
}

export default async function TrainingHistoryDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <PageShell
        eyebrow="Training Detail"
        title="训练详情"
        description="登录后才会读取当前账号下的训练详情。未登录状态不会查询业务数据。"
      >
        <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-4">
            <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
              <p className="font-medium text-ink">需要先登录</p>
              <p>训练详情页只会按当前 BetterAuth session 查询当前用户自己的训练记录。</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-berry">
                去登录
              </Link>
              <Link
                href="/history"
                className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white"
              >
                返回历史记录
              </Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const detail = await getTrainingSessionDetailForUser(session.user.id, sessionId);

  if (!detail) {
    return (
      <PageShell
        eyebrow="Training Detail"
        title="训练详情"
        description="记录不存在，或当前账号无权限查看该训练详情。"
      >
        <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-4">
            <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/72">
              <p className="font-medium text-ink">记录不存在或无权限查看</p>
              <p>请返回训练历史，确认当前登录账号和所选记录是否一致。</p>
            </div>
            <Link
              href="/history"
              className="inline-flex rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white"
            >
              返回历史记录
            </Link>
          </div>
        </section>
      </PageShell>
    );
  }

  const completedAt = detail.session.completedAt ?? detail.session.createdAt;

  return (
    <PageShell
      eyebrow="Training Detail"
      title={detail.level.sceneName}
      description="训练历史详情页只读取当前登录用户自己的单条训练记录，用于查看完整三轮对话、评分和最终复盘。"
    >
      <section className="space-y-6">
        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-coral">训练摘要</p>
              <h2 className="text-2xl font-semibold text-ink">{detail.level.sceneName}</h2>
              <p className="text-sm text-ink/68">
                {detail.level.characterType} · {detail.level.levelKey}
              </p>
              <p className="text-sm text-ink/68">完成时间：{formatDate(completedAt)}</p>
            </div>
            <Link
              href="/history"
              className="inline-flex rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white"
            >
              返回 /history
            </Link>
          </div>
        </div>

        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-coral">关卡信息</p>
              <h3 className="text-xl font-semibold text-ink">背景与目标</h3>
            </div>
            <div className="rounded-3xl bg-cream p-5 text-sm leading-7 text-ink/78">
              <p className="font-medium text-ink">背景</p>
              <p>{detail.level.background}</p>
            </div>
            <div className="rounded-3xl border border-ink/10 p-5 text-sm leading-7 text-ink/78">
              <p className="font-medium text-ink">本关目标</p>
              <p>{detail.level.taskTarget}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.level.trainingFocus.map((item) => (
                <span key={item} className="rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-ink">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-coral">最终结果</p>
              <h3 className="text-xl font-semibold text-ink">总分与复盘</h3>
            </div>

            {detail.scoreResult ? (
              <div className="space-y-4">
                <div className="rounded-3xl bg-cream p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-4xl font-semibold text-ink">{detail.scoreResult.totalScore}</p>
                      <p className="mt-2 text-sm text-ink/68">
                        {detail.scoreResult.grade} · {detail.scoreResult.endingType}
                      </p>
                    </div>
                    <div className="text-sm text-ink/60">
                      <p>sessionId：{detail.session.sessionId}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-3xl border border-ink/10 p-4 text-sm text-ink/78">情绪识别：{detail.scoreResult.emotionRecognition}</div>
                  <div className="rounded-3xl border border-ink/10 p-4 text-sm text-ink/78">共情表达：{detail.scoreResult.empathy}</div>
                  <div className="rounded-3xl border border-ink/10 p-4 text-sm text-ink/78">责任承担：{detail.scoreResult.responsibility}</div>
                  <div className="rounded-3xl border border-ink/10 p-4 text-sm text-ink/78">解释克制：{detail.scoreResult.explanationControl}</div>
                  <div className="rounded-3xl border border-ink/10 p-4 text-sm text-ink/78">行动清晰：{detail.scoreResult.actionClarity}</div>
                  <div className="rounded-3xl border border-ink/10 p-4 text-sm text-ink/78">关系修复：{detail.scoreResult.relationshipRepair}</div>
                </div>

                <div className="rounded-3xl border border-ink/10 p-5 text-sm leading-7 text-ink/78">
                  <p className="font-medium text-ink">结论</p>
                  <p>{detail.scoreResult.summary}</p>
                </div>

                {detail.scoreResult.keyProblems.length > 0 ? (
                  <div className="rounded-3xl border border-ink/10 p-5 text-sm leading-7 text-ink/78">
                    <p className="font-medium text-ink">本次关键提醒</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {detail.scoreResult.keyProblems.map((item) => (
                        <span key={item} className="rounded-full bg-coral/12 px-3 py-1 text-xs font-medium text-coral">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {detail.scoreResult.betterReply ? (
                  <div className="rounded-3xl border border-ink/10 p-5 text-sm leading-7 text-ink/78">
                    <p className="font-medium text-ink">更优表达</p>
                    <p>{detail.scoreResult.betterReply}</p>
                  </div>
                ) : null}

                {detail.scoreResult.lesson ? (
                  <div className="rounded-3xl border border-ink/10 p-5 text-sm leading-7 text-ink/78">
                    <p className="font-medium text-ink">沟通原则</p>
                    <p>{detail.scoreResult.lesson}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-3xl border border-ink/10 p-5 text-sm leading-7 text-ink/72">
                最终评分记录暂时缺失，但基础训练记录仍可查看。
              </div>
            )}
          </div>
        </div>

        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-coral">三轮记录</p>
              <h3 className="text-xl font-semibold text-ink">完整对话时间线</h3>
            </div>

            {detail.turns.length === 0 ? (
              <div className="rounded-3xl border border-ink/10 p-5 text-sm leading-7 text-ink/72">
                当前记录下没有可展示的对话轮次。
              </div>
            ) : (
              <div className="space-y-4">
                {detail.turns.map((turn) => (
                  <article key={turn.roundNumber} className="rounded-3xl border border-ink/10 p-5">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-lg font-medium text-ink">第 {turn.roundNumber} 轮</p>
                        <p className="text-sm text-ink/60">输入状态：{turn.inputStatus}</p>
                      </div>

                      <div className="rounded-3xl bg-cream p-4 text-sm leading-7 text-ink/78">
                        <p className="font-medium text-ink">用户回复</p>
                        <p>{turn.userRawInput}</p>
                      </div>

                      <div className="rounded-3xl border border-ink/10 p-4 text-sm leading-7 text-ink/78">
                        <p className="font-medium text-ink">AI 女友回复</p>
                        <p>{turn.girlfriendResponse}</p>
                      </div>

                      <div className="rounded-3xl border border-ink/10 p-4 text-sm leading-7 text-ink/78">
                        <p className="font-medium text-ink">本轮反馈</p>
                        <p>{turn.roundFeedback ?? "无"}</p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-3xl border border-ink/10 p-4 text-sm text-ink/78">
                          <p className="font-medium text-ink">情绪值变化</p>
                          <p>
                            {turn.emotionBefore} / {turn.emotionChange} / {turn.emotionAfter}
                          </p>
                        </div>
                        <div className="rounded-3xl border border-ink/10 p-4 text-sm text-ink/78">
                          <p className="font-medium text-ink">信任值变化</p>
                          <p>
                            {turn.trustBefore} / {turn.trustChange} / {turn.trustAfter}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-ink/10 p-4 text-sm text-ink/78">
                        <p className="font-medium text-ink">风险提示</p>
                        {turn.riskFlags.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {turn.riskFlags.map((item) => (
                              <span key={item} className="rounded-full bg-coral/12 px-3 py-1 text-xs font-medium text-coral">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-ink/60">无</p>
                        )}
                      </div>

                      <div className="rounded-3xl border border-ink/10 p-4 text-sm text-ink/78">
                        <p className="font-medium text-ink">技能评分</p>
                        <div className="mt-3">
                          <SkillScoreList skillScores={turn.skillScores} />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
