type ProviderMode = "mock" | "real";

export type AIDiagnosticRecord = {
  timestamp: string;
  action: string;
  providerMode: ProviderMode;
  agentName: string;
  durationMs?: number;
  apiStatus?: number;
  jsonParse: "success" | "failed" | "skipped";
  schemaValidation: "success" | "failed" | "skipped";
  fallbackUsed: boolean;
  errorType: string;
  zodErrorSummary?: string;
  contentPreview?: string;
};

const latestDiagnostics = new Map<string, AIDiagnosticRecord>();

export function setLatestAIDiagnostic(action: string, record: AIDiagnosticRecord) {
  latestDiagnostics.set(action, record);
}

export function getLatestAIDiagnostic(action: string) {
  return latestDiagnostics.get(action);
}
