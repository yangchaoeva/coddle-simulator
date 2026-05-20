import Link from "next/link";
import { PageShell } from "@/components/shell";
import { getCharacterOverview, getCharacters } from "@/lib/training";

export default function HomePage() {
  const characters = getCharacters().map(getCharacterOverview);

  return (
    <PageShell
      eyebrow="Stage 4 Real AI Provider"
      title="不是教你骗她原谅，而是教你真正听懂她。"
      description="当前已接入真实 AI，训练回复、评分和复盘会经过 Schema 校验与 fallback。当前仍不接数据库、不接 BetterAuth，不保存训练记录。"
    >
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-coral/15 px-3 py-1 text-sm font-medium text-coral">训练闭环</span>
            <h2 className="text-2xl font-semibold text-ink">首页直达完整流程</h2>
            <p className="text-sm leading-7 text-ink/70">
              路径固定为 <span className="font-medium text-ink">首页 → 角色 → 关卡 → 三轮训练 → 结果复盘</span>。
              当前已接入真实 AI，但仍不接数据库、不接 BetterAuth，也不保存训练记录。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/characters" className="rounded-full bg-ink px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-berry">
                开始模拟训练
              </Link>
              <Link href="/emergency" className="rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-center text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white">
                先用救急模式
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-berry/10 bg-berry p-6 text-white shadow-card">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Stage 4 说明</p>
            <ul className="space-y-3 text-sm leading-7 text-white/88">
              <li>当前已接入真实 AI，用于训练回复、评分、复盘和救急分析。</li>
              <li>所有训练和救急结果都会经过结构化 Schema 校验与 fallback。</li>
              <li>当前仍不接数据库、不接 BetterAuth，也不保存训练记录。</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-berry/80">角色入口</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">先选一种沟通难题开始练</h2>
          </div>
          <Link href="/characters" className="hidden rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white sm:inline-flex">
            查看全部角色
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {characters.map((character) => (
            <Link
              key={character.type}
              href={`/characters/${character.type}/levels`}
              className="rounded-3xl border border-ink/10 bg-cream p-5 transition hover:-translate-y-0.5 hover:border-coral/40"
            >
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-coral">{character.title}</p>
                  <h3 className="mt-1 text-xl font-semibold text-ink">{character.keywords.join(" / ")}</h3>
                </div>
                <p className="text-sm leading-7 text-ink/72">{character.summary}</p>
                <p className="text-sm text-ink/60">训练重点：{character.trainingFocus}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
