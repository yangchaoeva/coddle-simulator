import type { TrainingResult } from "@/types/training";

const STORAGE_KEY = "coddle-stage1-results";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveTrainingResult(result: TrainingResult) {
  if (!canUseStorage()) {
    return;
  }

  const current = getAllTrainingResults();
  const next = [result, ...current.filter((item) => item.id !== result.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getAllTrainingResults(): TrainingResult[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as TrainingResult[];
  } catch {
    return [];
  }
}

export function getTrainingResultById(resultId: string) {
  return getAllTrainingResults().find((item) => item.id === resultId) ?? null;
}

export function getLatestTrainingResultByLevelKey(levelKey: string) {
  // TODO(Stage 1 mock): keep this helper only for the temporary `/training/[levelKey]/result` flow.
  // TODO(Stage 7): result lookup should move back to `/training/[resultId]/result`,
  // where `resultId` is `guestSessionId` before login-save and formal `sessionId` after merge.
  return getAllTrainingResults().find((item) => item.levelKey === levelKey) ?? null;
}
