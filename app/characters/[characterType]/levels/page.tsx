"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/shell";
import { getCharacterByType, getLevelsByCharacter } from "@/lib/training";

function difficultyLabel(value: number) {
  return value === 1 ? "入门" : value === 2 ? "进阶" : "挑战";
}

export default function LevelsPage() {
  const params = useParams<{ characterType: string }>();
  const character = getCharacterByType(params.characterType);
  const characterLevels = getLevelsByCharacter(params.characterType);

  if (!character) {
    return (
      <PageShell eyebrow="Levels" title="角色不存在" description="当前角色类型没有匹配到 mock 数据，请回到角色页重新选择。">
        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
          <Link href="/characters" className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
            返回角色选择
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={character.title}
      title={`${character.name}的 3 个训练关卡`}
      description={`她的表达风格是：${character.voice} 当前只做 Stage 1 mock 流程，因此这里展示 3 个本地关卡，全部都可以直接进入三轮训练。`}
    >
      <section className="grid gap-5 xl:grid-cols-3">
        {characterLevels.map((level) => (
          <article key={level.levelKey} className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-coral">{difficultyLabel(level.difficulty)}</p>
                <span className="rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-ink">三轮对话</span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-ink">{level.sceneName}</h2>
                <p className="mt-2 text-sm leading-7 text-ink/70">{level.background}</p>
              </div>
              <div className="rounded-3xl bg-cream p-4 text-sm leading-7 text-ink/75">
                <p className="font-medium text-ink">本关目标</p>
                <p>{level.taskTarget}</p>
              </div>
              <Link
                href={`/training/${level.levelKey}`}
                className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry"
              >
                开始这一关
              </Link>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
