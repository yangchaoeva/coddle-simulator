"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/shell";
import { authClient } from "@/lib/auth-client";
import { buildTrainingResult, getCharacterByType, getLevelByKey, runTrainingRound, saveTrainingSessionResult } from "@/lib/training";
import { saveTrainingResult } from "@/lib/storage";
import type { RoundRecord } from "@/types/training";

function StatBar({ label, value, min }: { label: string; value: number; min?: number }) {
  const maxValue = min === -100 ? 100 : 100;
  const percent = min === -100 ? ((value + 100) / 200) * 100 : (value / maxValue) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-ink/72">
        <span>{label}</span>
        <span className="font-medium text-ink">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-coral transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function getStageMessage(stage: "validate" | "girlfriend-reply" | "score-round") {
  switch (stage) {
    case "validate":
      return "正在理解你的回复...";
    case "girlfriend-reply":
      return "正在生成她的反应...";
    case "score-round":
      return "正在进行本轮评分...";
  }
}

export default function TrainingPage() {
  const params = useParams<{ levelKey: string }>();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const level = getLevelByKey(params.levelKey);
  const character = level ? getCharacterByType(level.characterType) : null;
  const submitLockRef = useRef(false);

  const [reply, setReply] = useState("");
  const [rounds, setRounds] = useState<RoundRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [slowHintVisible, setSlowHintVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationRewrite, setValidationRewrite] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!submitting) {
      setSlowHintVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setSlowHintVisible(true);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [submitting]);

  const initialEmotion = level?.initialEmotionScore ?? -45;
  const initialTrust = level?.initialTrustScore ?? 42;
  const currentRound = rounds.length + 1;
  const emotionValue = rounds.at(-1)?.emotionAfter ?? initialEmotion;
  const trustValue = rounds.at(-1)?.trustAfter ?? initialTrust;

  const currentPrompt = useMemo(() => {
    if (!level) {
      return "";
    }

    if (rounds.length === 0) {
      return level.openingLine;
    }

    return rounds.at(-1)?.girlfriendReply.girlfriendReply ?? level.openingLine;
  }, [level, rounds]);

  if (!level || !character) {
    return (
      <PageShell eyebrow="Training" title="关卡不存在" description="没有找到对应的本地关卡数据，请回到角色页重新选择。">
        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <Link href="/characters" className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
            返回角色选择
          </Link>
        </div>
      </PageShell>
    );
  }

  const handleSubmit = async () => {
    if (submitLockRef.current || submitting || currentRound > 3 || !reply.trim()) {
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setLoadingMessage("正在理解你的回复...");
    setSlowHintVisible(false);
    setValidationMessage(null);
    setValidationRewrite(null);
    setFallbackNotice(null);

    try {
      const outcome = await runTrainingRound({
        roundNumber: currentRound,
        userReply: reply,
        emotionBefore: emotionValue,
        trustBefore: trustValue,
        level,
        character,
        rounds,
        onStageChange: (stage) => {
          setLoadingMessage(getStageMessage(stage));
        },
      });

      if (outcome.status === "blocked") {
        setValidationMessage(outcome.validation.userMessageToShow);
        setValidationRewrite(outcome.validation.suggestedRewrite ?? null);
        return;
      }

      const nextRounds = [...rounds, outcome.record];
      setRounds(nextRounds);
      setReply("");
      setValidationMessage(outcome.record.validation.userMessageToShow);
      setValidationRewrite(outcome.record.validation.suggestedRewrite ?? null);

      if (outcome.record.score.fallback || outcome.record.girlfriendReply.fallback) {
        setFallbackNotice("本次分析不太稳定，已为你生成基础建议。");
      }

      if (currentRound === 3) {
        setLoadingMessage("正在生成完整复盘，可能需要几秒...");
        const result = await buildTrainingResult(level.levelKey, nextRounds);
        if (result) {
          if (result.finalReview.fallback) {
            setFallbackNotice("本次分析不太稳定，已为你生成基础建议。");
          }
          saveTrainingResult(result);
          if (session?.user?.id) {
            try {
              await saveTrainingSessionResult(result);
            } catch (error) {
              console.error("[training-save]", error);
            }
          }
          router.push(`/training/${level.levelKey}/result`);
        }
      }
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
      setLoadingMessage(null);
    }
  };

  return (
    <PageShell
      eyebrow="Training"
      title={`${character.characterName} · ${level.sceneName}`}
      description="当前已接入真实 AI。训练会依次进行输入校验、角色回复、本轮评分与最终复盘，并保持三轮训练流程不变。"
    >
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <aside className="space-y-5 rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-coral">关卡信息</p>
            <h2 className="text-2xl font-semibold text-ink">{level.sceneName}</h2>
            <p className="text-sm leading-7 text-ink/70">{level.background}</p>
          </div>

          <div className="rounded-3xl bg-cream p-4 text-sm leading-7 text-ink/75">
            <p className="font-medium text-ink">本关目标</p>
            <p>{level.taskTarget}</p>
          </div>

          <div className="space-y-4 rounded-3xl border border-ink/10 p-4">
            <p className="text-sm font-medium text-ink">当前状态</p>
            <StatBar label="情绪值" value={emotionValue} min={-100} />
            <StatBar label="信任值" value={trustValue} />
            <p className="text-sm text-ink/60">当前轮次：第 {Math.min(currentRound, 3)} / 3 轮</p>
          </div>

          <div className="space-y-3 rounded-3xl border border-ink/10 p-4">
            <p className="text-sm font-medium text-ink">训练重点</p>
            <div className="flex flex-wrap gap-2">
              {level.trainingFocus.map((item) => (
                <span key={item} className="rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-ink">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-ink/10 p-4">
            <p className="text-sm font-medium text-ink">风险提醒</p>
            <ul className="space-y-2 text-sm leading-7 text-ink/68">
              {level.riskRules.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 rounded-3xl border border-ink/10 p-4">
            <p className="text-sm font-medium text-ink">参考回应方向</p>
            <ul className="space-y-2 text-sm leading-7 text-ink/68">
              {level.referenceReplies.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="space-y-5 rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="rounded-3xl bg-berry p-5 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">她现在说</p>
            <p className="mt-3 text-lg leading-8">{currentPrompt}</p>
          </div>

          {loadingMessage ? (
            <div className="rounded-3xl border border-berry/20 bg-berry/6 p-4 text-sm leading-7 text-ink/78">
              <p>{loadingMessage}</p>
              {slowHintVisible ? <p className="mt-2 text-ink/60">AI 分析稍慢，请再等几秒。</p> : null}
            </div>
          ) : null}

          {fallbackNotice ? (
            <div className="rounded-3xl border border-sage/30 bg-sage/14 p-4 text-sm leading-7 text-ink/78">
              {fallbackNotice}
            </div>
          ) : null}

          {validationMessage ? (
            <div className="rounded-3xl border border-coral/30 bg-coral/8 p-4 text-sm leading-7 text-ink/78">
              <p>{validationMessage}</p>
              {validationRewrite ? <p className="mt-2 text-ink/62">建议改写：{validationRewrite}</p> : null}
            </div>
          ) : null}

          {rounds.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] text-coral">已完成轮次</p>
              {rounds.map((round) => (
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
                  <p className="mt-2 text-sm leading-7 text-ink/68">
                    <span className="font-medium text-ink">本轮反馈：</span>
                    {round.score.roundFeedback}
                  </p>
                  {round.score.fallback ? (
                    <p className="mt-2 text-sm text-ink/60">本次分析不太稳定，已为你生成基础建议。</p>
                  ) : null}
                  {round.score.riskFlags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {round.score.riskFlags.map((flag) => (
                        <span key={flag} className="rounded-full bg-coral/12 px-3 py-1 text-xs font-medium text-coral">
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {currentRound <= 3 ? (
            <div className="space-y-4 rounded-3xl border border-ink/10 p-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-ink">输入你的回应</span>
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  disabled={submitting}
                  placeholder="先接住她的感受，再承担责任，最后给具体补救。"
                  className="min-h-36 w-full rounded-3xl border border-ink/12 bg-cream px-4 py-3 text-sm leading-7 text-ink outline-none transition focus:border-coral disabled:cursor-not-allowed disabled:opacity-70"
                />
              </label>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !reply.trim()}
                className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry disabled:bg-ink/40"
              >
                {submitting ? "分析中..." : currentRound === 3 ? "提交并查看复盘" : "提交这一轮"}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
