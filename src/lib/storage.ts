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

export function isTrainingResultSynced(result: TrainingResult | null) {
  return result?.syncStatus === "saved_to_account";
}

export function markTrainingResultAsSynced(resultId: string, sessionId: string) {
  if (!canUseStorage()) {
    return null;
  }

  const current = getAllTrainingResults();
  const target = current.find((item) => item.id === resultId);

  if (!target) {
    return null;
  }

  const nextResult: TrainingResult = {
    ...target,
    syncStatus: "saved_to_account",
    savedSessionId: sessionId,
    savedAt: new Date().toISOString(),
  };

  const next = current.map((item) => (item.id === resultId ? nextResult : item));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return nextResult;
}

export function getLatestTrainingResultByLevelKey(levelKey: string) {
  // Compatibility helper for the legacy `/training/[levelKey]/result` route.
  // The primary result route is `/training/result/[resultId]`.
  return getAllTrainingResults().find((item) => item.levelKey === levelKey) ?? null;
}
