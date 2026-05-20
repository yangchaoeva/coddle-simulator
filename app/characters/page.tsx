import Link from "next/link";
import { PageShell } from "@/components/shell";
import { getCharacters } from "@/lib/training";

export default function CharactersPage() {
  const characters = getCharacters();

  return (
    <PageShell
      eyebrow="Characters"
      title="角色选择"
      description="每个角色代表一种典型沟通难题。Stage 2 已改为读取正式本地角色配置，让你可以从这里开始跑完整个训练流程。"
    >
      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {characters.map((character) => (
          <article key={character.characterType} className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-coral">{character.relationshipStage}</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{character.characterName}</h2>
              </div>
              <p className="text-sm leading-7 text-ink/70">{character.coreNeed}</p>
              <dl className="space-y-3 text-sm leading-7 text-ink/72">
                <div>
                  <dt className="font-medium text-ink">性格关键词</dt>
                  <dd>{character.personalityKeywords.join("、")}</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">安抚机制</dt>
                  <dd>{character.comfortMechanism}</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">高危雷区</dt>
                  <dd>{character.dangerZones.join("、")}</dd>
                </div>
              </dl>
              <Link
                href={`/characters/${character.characterType}/levels`}
                className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-berry"
              >
                进入她的关卡
              </Link>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
