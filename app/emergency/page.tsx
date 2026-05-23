"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/shell";
import { authClient } from "@/lib/auth-client";
import { analyzeEmergencyMessage, saveEmergencyAnalysisResult } from "@/lib/training";
import type { EmergencyAnalysis } from "@/types/training";

type SaveUiState = "idle" | "saving" | "saved" | "save_failed";

export default function EmergencyPage() {
  const requestLockRef = useRef(false);
  const { data: session, isPending } = authClient.useSession();
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState<EmergencyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [slowHintVisible, setSlowHintVisible] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [saveUiState, setSaveUiState] = useState<SaveUiState>("idle");

  useEffect(() => {
    if (!loading) {
      setSlowHintVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setSlowHintVisible(true);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [loading]);

  const handleAnalyze = async () => {
    if (requestLockRef.current || loading || !message.trim()) {
      return;
    }

    requestLockRef.current = true;
    setLoading(true);
    setLoadingMessage("正在分析她的情绪和潜台词...");
    setSlowHintVisible(false);
    setFallbackNotice(null);
    setSaveUiState("idle");

    try {
      const nextAnalysis = await analyzeEmergencyMessage(message);
      setAnalysis(nextAnalysis);

      if (nextAnalysis.fallback) {
        setFallbackNotice("本次分析不太稳定，已为你生成基础建议。");
      }
    } finally {
      requestLockRef.current = false;
      setLoading(false);
      setLoadingMessage(null);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysis || !session?.user || saveUiState === "saving" || saveUiState === "saved") {
      return;
    }

    setSaveUiState("saving");

    try {
      await saveEmergencyAnalysisResult(message, analysis);
      setSaveUiState("saved");
    } catch {
      setSaveUiState("save_failed");
    }
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
            disabled={loading}
            placeholder="例如：算了，你忙你的吧。"
            className="min-h-48 w-full rounded-3xl border border-ink/12 bg-cream px-4 py-3 text-sm leading-7 text-ink outline-none transition focus:border-coral disabled:cursor-not-allowed disabled:opacity-70"
          />

          {loadingMessage ? (
            <div className="rounded-3xl border border-berry/20 bg-berry/6 p-4 text-sm leading-7 text-ink/78">
              <p>{loadingMessage}</p>
              {slowHintVisible ? <p className="mt-2 text-ink/60">正在生成建议回复，请稍等。</p> : null}
            </div>
          ) : null}

          {fallbackNotice ? (
            <div className="rounded-3xl border border-sage/30 bg-sage/14 p-4 text-sm leading-7 text-ink/78">{fallbackNotice}</div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !message.trim()}
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry disabled:bg-ink/40"
            >
              {loading ? "分析中..." : "生成分析"}
            </button>
            <Link
              href="/characters"
              className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white"
            >
              去训练模式
            </Link>
            <Link
              href="/emergency/history"
              className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white"
            >
              查看救急历史
            </Link>
          </div>

          <p className="text-xs leading-6 text-ink/55">当前接入真实 AI，输出仍会经过结构化校验和 fallback。</p>
        </div>

        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          {analysis ? (
            <div className="space-y-5">
              <section className="rounded-3xl bg-berry p-4 text-white">
                <p className="text-sm font-medium text-white/80">建议回复</p>
                <p className="mt-2 text-sm leading-7 text-white">{analysis.suggestedReply}</p>
              </section>

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
                </div>
              </section>

              <section className="space-y-3 rounded-3xl border border-ink/10 p-4">
                <p className="text-sm font-medium text-ink">保存到账号</p>
                {isPending ? (
                  <p className="text-sm leading-7 text-ink/68">正在确认当前登录状态...</p>
                ) : !session?.user ? (
                  <div className="space-y-3 text-sm leading-7 text-ink/68">
                    <p>登录后可保存后续分析。当前未登录状态下，这次救急分析不会自动写入数据库。</p>
                    <Link href="/login" className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry">
                      登录后可保存后续分析
                    </Link>
                  </div>
                ) : saveUiState === "saved" ? (
                  <div className="space-y-2 text-sm leading-7 text-ink/68">
                    <p className="font-medium text-ink">已保存到当前账号</p>
                    <p>这次救急分析已经写入 `emergency_analyses`，可在救急历史中查看。</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm leading-7 text-ink/68">
                      {saveUiState === "saving"
                        ? "正在保存这次救急分析到你的账号。"
                        : saveUiState === "save_failed"
                          ? "保存失败，可直接重试。失败不会被标记为已保存。"
                          : "当前已登录，可以把这次救急分析保存到你的账号。"}
                    </p>
                    {saveUiState === "save_failed" ? (
                      <div className="rounded-3xl border border-coral/30 bg-coral/8 p-4 text-sm leading-7 text-ink/78">
                        保存失败。请稍后重试，或先确认当前登录状态是否有效。
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleSaveAnalysis}
                      disabled={saveUiState === "saving"}
                      className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry disabled:bg-ink/40"
                    >
                      {saveUiState === "saving" ? "正在保存" : saveUiState === "save_failed" ? "重试保存到我的账号" : "保存到我的账号"}
                    </button>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="flex min-h-full items-center justify-center rounded-3xl border border-dashed border-ink/15 bg-cream/60 p-8 text-center text-sm leading-7 text-ink/60">
              这里会显示结构化分析结果。未登录用户可正常生成分析，但不会自动保存。
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
