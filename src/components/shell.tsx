import Link from "next/link";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-4xl border border-white/70 bg-white/80 p-5 shadow-card backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <Link href="/" className="inline-flex w-fit rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
                哄她模拟器 MVP
              </Link>
              {eyebrow ? <p className="text-sm font-medium uppercase tracking-[0.2em] text-berry/80">{eyebrow}</p> : null}
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1>
                <p className="max-w-3xl text-sm leading-7 text-ink/70 sm:text-base">{description}</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-2 text-sm text-ink/70">
              <Link className="rounded-full border border-ink/10 px-4 py-2 hover:border-ink/25 hover:text-ink" href="/characters">
                训练
              </Link>
              <Link className="rounded-full border border-ink/10 px-4 py-2 hover:border-ink/25 hover:text-ink" href="/emergency">
                救急
              </Link>
              <Link className="rounded-full border border-ink/10 px-4 py-2 hover:border-ink/25 hover:text-ink" href="/history">
                历史
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
