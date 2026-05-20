"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/shell";
import { getLatestTrainingResultByLevelKey } from "@/lib/storage";
import { getLevelsByCharacter } from "@/lib/training";
import type { TrainingResult } from "@/data/mock";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-ink/72">
        <span>{label}</span>
        <span className="font-medium text-ink">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-coral" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ResultPage() {
  const params = useParams<{ levelKey: string }>();
  const [result, setResult] = useState<TrainingResult | null>(null);

  useEffect(() => {
    // TODO(Stage 1 mock): this result page reads by `levelKey` only as a temporary mock implementation.
    // TODO(Stage 7): switch back to `docs/PAGE_FLOW.md` route `/training/[resultId]/result`.
    // TODO(Stage 7): `resultId` should be `guestSessionId` for guests, then the formal `sessionId` after login-save.
    setResult(getLatestTrainingResultByLevelKey(params.levelKey));
  }, [params.levelKey]);

  if (!result) {
    return (
      <PageShell eyebrow="Result" title="没有找到这次训练结果" description="Stage 1 结果页依赖浏览器本地的 mock 结果缓存。你可以重新走一遍训练流程来生成结果。">
        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <Link href="/characters" className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
            返回角色选择
          </Link>
        </div>
      </PageShell>
    );
  }

  const nextLevel = getLevelsByCharacter(result.characterType).find((item) => item.levelKey !== result.levelKey);

  return (
    <PageShell
      eyebrow="Final Review"
      title={`${result.characterName} · ${result.levelName} 复盘`}
      description="这里展示的是 Stage 1 mock 结果结构，方便后续替换成真实 AI 输出和数据库记录。当前页不会触发登录保存。"
    >
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-5 rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-coral">最终结果</p>
            <h2 className="text-5xl font-semibold text-ink">{result.finalReview.totalScore}</h2>
            <p className="text-lg font-medium text-berry">
              {result.finalReview.grade} · {result.finalReview.endingType}
            </p>
          </div>

          <div className="rounded-3xl bg-cream p-4 text-sm leading-7 text-ink/72">
            <p className="font-medium text-ink">结论</p>
            <p>{result.finalReview.summary}</p>
          </div>

          <div className="space-y-4 rounded-3xl border border-ink/10 p-4">
            <ScoreBar label="情绪值变化" value={Math.round(((result.emotionEnd + 100) / 200) * 100)} />
            <ScoreBar label="信任值变化" value={result.trustEnd} />
          </div>

          <div className="flex flex-col gap-3">
            {nextLevel ? (
              <Link href={`/training/${nextLevel.levelKey}`} className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-berry">
                继续下一关
              </Link>
            ) : null}
            <Link href="/characters" className="rounded-full border border-ink/15 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30">
              换个角色继续
            </Link>
            <Link href="/history" className="rounded-full border border-ink/15 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30">
              查看历史页占位
            </Link>
          </div>
        </aside>

        <div className="space-y-5 rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <section className="grid gap-4 md:grid-cols-2">
            <ScoreBar label="情绪识别" value={result.finalReview.emotionRecognition} />
            <ScoreBar label="共情表达" value={result.finalReview.empathy} />
            <ScoreBar label="责任承担" value={result.finalReview.responsibility} />
            <ScoreBar label="解释克制" value={result.finalReview.explanationControl} />
            <ScoreBar label="行动清晰" value={result.finalReview.actionClarity} />
            <ScoreBar label="关系修复" value={result.finalReview.relationshipRepair} />
          </section>

          <section className="space-y-3 rounded-3xl border border-ink/10 p-4">
            <p className="text-sm font-medium text-ink">本次关键提醒</p>
            <div className="flex flex-wrap gap-2">
              {result.finalReview.keyProblems.map((item) => (
                <span key={item} className="rounded-full bg-coral/12 px-3 py-1 text-xs font-medium text-coral">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-3xl bg-cream p-4">
            <p className="text-sm font-medium text-ink">更优表达示例</p>
            <p className="text-sm leading-7 text-ink/80">{result.finalReview.betterReply}</p>
          </section>

          <section className="space-y-3 rounded-3xl border border-ink/10 p-4">
            <p className="text-sm font-medium text-ink">沟通原则</p>
            <p className="text-sm leading-7 text-ink/75">{result.finalReview.lesson}</p>
          </section>

          <section className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-coral">三轮记录</p>
            {result.rounds.map((round) => (
              <article key={round.roundNumber} className="rounded-3xl border border-ink/10 p-4">
                <p className="text-sm font-medium text-ink">第 {round.roundNumber} 轮</p>
                <p className="mt-2 text-sm leading-7 text-ink/80">
                  <span className="font-medium text-ink">你的回复：</span>
                  {round.userReply || "（空白回复）"}
                </p>
                <p className="mt-2 text-sm leading-7 text-ink/80">
                  <span className="font-medium text-ink">她的反馈：</span>
                  {round.girlfriendReply}
                </p>
                <p className="mt-2 text-sm leading-7 text-ink/68">{round.roundFeedback}</p>
              </article>
            ))}
          </section>
        </div>
      </section>
    </PageShell>
  );
}
