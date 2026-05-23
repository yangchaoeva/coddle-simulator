"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/shell";
import { getLatestTrainingResultByLevelKey } from "@/lib/storage";

export default function LegacyResultPage() {
  const params = useParams<{ levelKey: string }>();
  const router = useRouter();
  const [missingResult, setMissingResult] = useState(false);

  useEffect(() => {
    const result = getLatestTrainingResultByLevelKey(params.levelKey);

    if (result) {
      router.replace(`/training/result/${result.id}`);
      return;
    }

    setMissingResult(true);
  }, [params.levelKey, router]);

  if (!missingResult) {
    return (
      <PageShell
        eyebrow="Result"
        title="正在跳转结果页"
        description="旧结果页地址会自动跳转到按 resultId 精确定位的新结果页。"
      >
        <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card text-sm leading-7 text-ink/72">
          正在查找这次训练结果...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Result"
      title="没有找到结果"
      description="旧结果页地址没有匹配到本地训练记录，请重新完成一次训练。"
    >
      <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-card">
        <Link href="/characters" className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
          返回训练入口
        </Link>
      </div>
    </PageShell>
  );
}
