import { NextResponse } from "next/server";
import { getLatestAIDiagnostic } from "@/ai/diagnostics";
import { getServerAIProvider, getServerAIProviderMode } from "@/ai/server-provider";
import type {
  EmergencyAnalysisParams,
  FinalReviewParams,
  GirlfriendReplyParams,
  RoundScoreParams,
  ValidateUserInputParams,
} from "@/ai/provider";

type RouteContext = {
  params: Promise<{
    action: string;
  }>;
};

const agentNameByAction: Record<string, string> = {
  validate: "InputValidationAgent",
  "girlfriend-reply": "GirlfriendResponseAgent",
  "score-round": "JudgeScoringAgent",
  "final-review": "FinalReviewAgent",
  "emergency-analysis": "EmergencyAnalysisAgent",
};

function buildJsonResponse(action: string, providerMode: string, result: unknown) {
  const fallbackUsed = typeof result === "object" && result !== null && "fallback" in result ? Boolean(result.fallback) : false;
  const errorType =
    typeof result === "object" && result !== null && "errorType" in result && typeof result.errorType === "string"
      ? result.errorType
      : "";
  const diagnostic = getLatestAIDiagnostic(action);

  console.info("[ai-route]", {
    timestamp: new Date().toISOString(),
    action,
    providerMode,
    agentName: agentNameByAction[action] ?? "UnknownAgent",
    fallbackUsed,
    errorType,
    zodErrorSummary: diagnostic?.zodErrorSummary,
  });

  return NextResponse.json(result, {
    headers: {
      "x-ai-action": action,
      "x-ai-provider-mode": providerMode,
      "x-ai-fallback-used": String(fallbackUsed),
      "x-ai-error-type": errorType,
      "x-ai-json-parse": diagnostic?.jsonParse ?? "skipped",
      "x-ai-schema-validation": diagnostic?.schemaValidation ?? "skipped",
      "x-ai-api-status": diagnostic?.apiStatus ? String(diagnostic.apiStatus) : "",
      "x-ai-zod-summary": diagnostic?.zodErrorSummary ?? "",
      "x-ai-timestamp": diagnostic?.timestamp ?? "",
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { action } = await context.params;
  const providerMode = getServerAIProviderMode();
  const provider = getServerAIProvider();
  const payload = await request.json();

  switch (action) {
    case "validate":
      return buildJsonResponse(action, providerMode, await provider.validateUserInput(payload as ValidateUserInputParams));
    case "girlfriend-reply":
      return buildJsonResponse(action, providerMode, await provider.generateGirlfriendReply(payload as GirlfriendReplyParams));
    case "score-round":
      return buildJsonResponse(action, providerMode, await provider.scoreRound(payload as RoundScoreParams));
    case "final-review":
      return buildJsonResponse(action, providerMode, await provider.generateFinalReview(payload as FinalReviewParams));
    case "emergency-analysis":
      return buildJsonResponse(action, providerMode, await provider.analyzeEmergencyMessage(payload as EmergencyAnalysisParams));
    default:
      return NextResponse.json({ error: "Unknown AI action." }, { status: 404 });
  }
}
