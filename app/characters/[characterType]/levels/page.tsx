"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/shell";
import { getCharacterByType, getLevelsByCharacter } from "@/lib/training";

function difficultyLabel(value: number) {
  if (value === 1) return "入门";
  if (value === 2) return "进阶";
  if (value === 3) return "挑战";
  if (value === 4) return "高压";
  return "极限";
}

export default function LevelsPage() {
  const params = useParams<{ characterType: string }>();
  const character = getCharacterByType(params.characterType);
  const characterLevels = getLevelsByCharacter(params.characterType);

  if (!character) {
    return (
      <PageShell eyebrow="Levels" title="角色不存在" description="当前角色类型没有匹配到本地角色配置，请回到角色页重新选择。">
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
      eyebrow={character.characterName}
      title={`${character.characterName}的 3 个训练关卡`}
      description={`她的表达风格包括：${character.expressionStyle.join(" · ")}。当前为 Stage 3：关卡继续读取本地数据，训练内回复与评分由 mock AI provider 生成。`}
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
              <div className="text-sm leading-7 text-ink/70">
                <p className="font-medium text-ink">训练重点</p>
                <p>{level.trainingFocus.join(" · ")}</p>
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
