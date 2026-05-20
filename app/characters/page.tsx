import Link from "next/link";
import { PageShell } from "@/components/shell";
import { getCharacters } from "@/lib/training";

export default function CharactersPage() {
  const characters = getCharacters();

  return (
    <PageShell
      eyebrow="Characters"
      title="角色选择"
      description="每个角色代表一种典型沟通难题。Stage 1 先用 mock 角色卡和 mock 关卡，让你可以从这里开始跑完整个训练流程。"
    >
      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {characters.map((character) => (
          <article key={character.type} className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-coral">{character.title}</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{character.name}</h2>
              </div>
              <p className="text-sm leading-7 text-ink/70">{character.tagline}</p>
              <dl className="space-y-3 text-sm leading-7 text-ink/72">
                <div>
                  <dt className="font-medium text-ink">核心需求</dt>
                  <dd>{character.coreNeed}</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">训练重点</dt>
                  <dd>{character.trainingFocus}</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">高危雷区</dt>
                  <dd>{character.dangerZone}</dd>
                </div>
              </dl>
              <Link
                href={`/characters/${character.type}/levels`}
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
