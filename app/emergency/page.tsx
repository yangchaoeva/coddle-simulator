"use client";

import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/shell";
import { analyzeEmergencyMessage } from "@/lib/training";
import type { EmergencyAnalysis } from "@/types/training";

export default function EmergencyPage() {
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState<EmergencyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(await analyzeEmergencyMessage(message));
    setLoading(false);
  };

  return (
    <PageShell
      eyebrow="Emergency"
      title="救急模式"
      description="输入一段真实聊天内容，系统会返回结构化的情绪分析、潜台词、风险提醒和建议回复方向。默认不保存真实聊天内容。"
    >
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5 rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-coral">输入真实聊天</p>
            <h2 className="text-2xl font-semibold text-ink">先分析，再决定怎么回</h2>
            <p className="text-sm leading-7 text-ink/70">
              贴一段她刚发来的话，系统会返回结构化的情绪分析、潜台词、风险提醒和建议回复方向。
            </p>
          </div>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="例如：算了，你忙你的吧。"
            className="min-h-48 w-full rounded-3xl border border-ink/12 bg-cream px-4 py-3 text-sm leading-7 text-ink outline-none transition focus:border-coral"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry"
            >
              {loading ? "分析中..." : "生成分析"}
            </button>
            <Link
              href="/characters"
              className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white"
            >
              去训练模式
            </Link>
          </div>

          <p className="text-xs leading-6 text-ink/55">
            当前接入真实 AI，输出仍会经过结构化校验和 fallback。
          </p>
        </div>

        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          {analysis ? (
            <div className="space-y-5">
              <section className="rounded-3xl bg-cream p-4">
                <p className="text-sm font-medium text-ink">她可能的情绪</p>
                <p className="mt-2 text-sm leading-7 text-ink/75">{analysis.detectedEmotion}</p>
              </section>

              <section className="rounded-3xl border border-ink/10 p-4">
                <p className="text-sm font-medium text-ink">潜台词 / 核心需要</p>
                <p className="mt-2 text-sm leading-7 text-ink/75">{analysis.hiddenNeed}</p>
              </section>

              <section className="rounded-3xl border border-ink/10 p-4">
                <p className="text-sm font-medium text-ink">当前雷区</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.riskWarnings.map((item) => (
                    <span key={item} className="rounded-full bg-coral/12 px-3 py-1 text-xs font-medium text-coral">
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-ink/10 p-4">
                <p className="text-sm font-medium text-ink">建议回复方向</p>
                <p className="mt-2 text-sm leading-7 text-ink/75">{analysis.replyStrategy}</p>
              </section>

              <section className="rounded-3xl bg-berry p-4 text-white">
                <p className="text-sm font-medium text-white/80">示例回复</p>
                <p className="mt-2 text-sm leading-7 text-white">{analysis.suggestedReply}</p>
              </section>

              <section className="rounded-3xl border border-ink/10 p-4">
                <p className="text-sm font-medium text-ink">不建议这样说</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.doNotSay.map((item) => (
                    <span key={item} className="rounded-full bg-ink/8 px-3 py-1 text-xs font-medium text-ink/75">
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-ink/10 p-4">
                <p className="text-sm font-medium text-ink">结构化判断</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-sage/18 px-3 py-1 text-xs font-medium text-ink">
                    {analysis.canBeConvertedToTraining ? "可转训练" : "暂不转训练"}
                  </span>
                  {analysis.matchedCharacterType ? (
                    <span className="rounded-full bg-berry/10 px-3 py-1 text-xs font-medium text-berry">
                      匹配角色：{analysis.matchedCharacterType}
                    </span>
                  ) : null}
                  {analysis.fallback ? (
                    <span className="rounded-full bg-coral/12 px-3 py-1 text-xs font-medium text-coral">
                      fallback
                    </span>
                  ) : null}
                </div>
              </section>
            </div>
          ) : (
            <div className="flex min-h-full items-center justify-center rounded-3xl border border-dashed border-ink/15 bg-cream/60 p-8 text-center text-sm leading-7 text-ink/60">
              这里会显示结构化分析结果。当前阶段不提供保存或转训练能力。
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
