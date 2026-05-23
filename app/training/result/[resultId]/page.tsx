"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/shell";
import { authClient } from "@/lib/auth-client";
import { getTrainingResultById, isTrainingResultSynced, markTrainingResultAsSynced } from "@/lib/storage";
import { getLevelsByCharacter, saveTrainingSessionResult } from "@/lib/training";
import type { TrainingResult } from "@/types/training";

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

type SaveUiState = "idle" | "saving" | "save_failed";

export default function ResultPage() {
  const params = useParams<{ resultId: string }>();
  const { data: session, isPending } = authClient.useSession();
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [saveUiState, setSaveUiState] = useState<SaveUiState>("idle");

  useEffect(() => {
    setResult(getTrainingResultById(params.resultId));
  }, [params.resultId]);

  const synced = isTrainingResultSynced(result);
  const loginHref = useMemo(
    () => `/login?callbackUrl=${encodeURIComponent(`/training/result/${params.resultId}`)}`,
    [params.resultId],
  );

  const handleSaveToAccount = async () => {
    if (!result || saveUiState === "saving" || synced) {
      return;
    }

    setSaveUiState("saving");

    try {
      const response = await saveTrainingSessionResult(result);
      const nextResult = markTrainingResultAsSynced(result.id, response.sessionId);
      if (nextResult) {
        setResult(nextResult);
      }
      setSaveUiState("idle");
    } catch {
      setSaveUiState("save_failed");
    }
  };

  if (!result) {
    return (
      <PageShell
        eyebrow="Result"
        title="没有找到这次训练结果"
        description="当前结果页按 resultId 精确读取本地结果。没有找到对应记录时，请重新完成一次训练。"
      >
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
      description="当前已接入真实 AI，训练回复、评分和复盘会经过 Schema 校验与 fallback。未登录用户仍只在本地展示结果；已登录用户会在服务端保存训练记录，并可在 history 查看。"
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

          <div className="space-y-3 rounded-3xl border border-ink/10 p-4">
            <p className="text-sm font-medium text-ink">结果保存状态</p>
            {isPending ? (
              <p className="text-sm leading-7 text-ink/68">正在确认当前登录状态...</p>
            ) : !session?.user ? (
              <div className="space-y-3">
                <p className="text-sm leading-7 text-ink/68">登录后可将这一条训练结果保存到你的账号。</p>
                <p className="text-sm leading-7 text-ink/60">建议从本页入口登录，登录后会回到本页继续保存这次训练。</p>
                <Link href={loginHref} className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry">
                  登录后可保存到账号
                </Link>
              </div>
            ) : synced ? (
              <div className="space-y-2 text-sm leading-7 text-ink/68">
                <p className="font-medium text-ink">已保存到当前账号</p>
                <p>这条本地训练结果已经完成同步，不会重复显示主保存按钮。</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm leading-7 text-ink/68">
                  {saveUiState === "saving"
                    ? "正在保存这条训练结果到你的账号。"
                    : saveUiState === "save_failed"
                      ? "保存失败，可直接重试。失败不会把本地结果标记为已同步。"
                      : "当前已登录，可以把这一条训练结果保存到你的账号。"}
                </p>
                {saveUiState === "save_failed" ? (
                  <div className="rounded-3xl border border-coral/30 bg-coral/8 p-4 text-sm leading-7 text-ink/78">
                    保存失败。请稍后重试，或先确认当前登录状态是否有效。
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleSaveToAccount}
                  disabled={saveUiState === "saving"}
                  className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry disabled:bg-ink/40"
                >
                  {saveUiState === "saving" ? "正在保存" : saveUiState === "save_failed" ? "重试保存到我的账号" : "保存到我的账号"}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {nextLevel ? (
              <Link href={`/training/${nextLevel.levelKey}`} className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-berry">
                继续下一关
              </Link>
            ) : null}
            <Link href="/characters" className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white">
              换个角色继续
            </Link>
            <Link href="/history" className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white">
              查看历史
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
                  <span className="font-medium text-ink">她的回复：</span>
                  {round.girlfriendReply.girlfriendReply}
                </p>
                <p className="mt-2 text-sm leading-7 text-ink/68">{round.score.roundFeedback}</p>
              </article>
            ))}
          </section>
        </div>
      </section>
    </PageShell>
  );
}
