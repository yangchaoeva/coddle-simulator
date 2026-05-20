"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/shell";
import {
  buildTrainingResult,
  getCharacterByType,
  getLevelByKey,
  playMockRound,
} from "@/lib/training";
import { saveTrainingResult } from "@/lib/storage";
import type { RoundRecord } from "@/data/mock";

const initialEmotion = -45;
const initialTrust = 42;

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

export default function TrainingPage() {
  const params = useParams<{ levelKey: string }>();
  const router = useRouter();
  const level = getLevelByKey(params.levelKey);
  const character = level ? getCharacterByType(level.characterType) : null;
  const [reply, setReply] = useState("");
  const [rounds, setRounds] = useState<RoundRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);

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

    return rounds.at(-1)?.girlfriendReply ?? level.openingLine;
  }, [level, rounds]);

  if (!level || !character) {
    return (
      <PageShell eyebrow="Training" title="关卡不存在" description="没有找到对应的 mock 关卡，请回到角色页重新选择。">
        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <Link href="/characters" className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
            返回角色选择
          </Link>
        </div>
      </PageShell>
    );
  }

  const handleSubmit = async () => {
    if (submitting || currentRound > 3) {
      return;
    }

    setSubmitting(true);

    const round = playMockRound({
      roundNumber: currentRound,
      userReply: reply,
      emotionBefore: emotionValue,
      trustBefore: trustValue,
      level,
      character,
    });

    const nextRounds = [...rounds, round];
    setRounds(nextRounds);
    setReply("");

    if (currentRound === 3) {
      const result = buildTrainingResult(level.levelKey, nextRounds);
      if (result) {
        saveTrainingResult(result);
        // TODO(Stage 1 mock): `/training/[levelKey]/result` is a temporary result route.
        // TODO(Stage 7): switch back to `docs/PAGE_FLOW.md` route `/training/[resultId]/result`.
        // TODO(Stage 7): `resultId` should be `guestSessionId` for guests, then the formal `sessionId` after login-save.
        router.push(`/training/${level.levelKey}/result`);
      }
    }

    setSubmitting(false);
  };

  return (
    <PageShell
      eyebrow="Training"
      title={`${character.name} · ${level.sceneName}`}
      description={`Stage 1 这里使用 mock 女友回复和 mock 评分。你需要完成 3 轮回应，每轮都会更新情绪值与信任值，并在第 3 轮后自动跳转到结果页。`}
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
            <p className="text-sm font-medium text-ink">参考回应方向</p>
            <ul className="space-y-2 text-sm leading-7 text-ink/68">
              {level.referenceReplies.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="space-y-5 rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="rounded-3xl bg-berry p-5 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">她现在说</p>
            <p className="mt-3 text-lg leading-8">{currentPrompt}</p>
          </div>

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
                    <span className="font-medium text-ink">她的反馈：</span>
                    {round.girlfriendReply}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-ink/68">{round.roundFeedback}</p>
                  {round.riskFlags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {round.riskFlags.map((flag) => (
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
                  placeholder="先接住她的感受，再承担责任，最后给具体补救。"
                  className="min-h-36 w-full rounded-3xl border border-ink/12 bg-cream px-4 py-3 text-sm leading-7 text-ink outline-none transition focus:border-coral"
                />
              </label>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry disabled:cursor-not-allowed disabled:bg-ink/40"
              >
                {currentRound === 3 ? "提交并查看复盘" : "提交这一轮"}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
