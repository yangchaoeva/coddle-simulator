import { NextResponse } from "next/server";
import { getLatestAIDiagnostic } from "@/ai/diagnostics";
import { getServerAIProvider, getServerAIProviderMode } from "@/ai/server-provider";
import { checkAndConsumeAIQuotaForUser } from "@/db/repositories/ai-usage-counters";
import { auth } from "@/lib/auth";
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

const quotaConsumingActions = new Set(["final-review", "emergency-analysis"]);

function buildJsonResponse(action: string, providerMode: string, result: unknown, durationMs: number) {
  const fallbackUsed = typeof result === "object" && result !== null && "fallback" in result ? Boolean(result.fallback) : false;
  const errorType =
    typeof result === "object" && result !== null && "errorType" in result && typeof result.errorType === "string"
      ? result.errorType
      : "";
  const diagnostic = getLatestAIDiagnostic(action);
  const timestamp = new Date().toISOString();

  console.info("[ai-route]", {
    timestamp,
    action,
    providerMode,
    durationMs,
    agentName: agentNameByAction[action] ?? "UnknownAgent",
    fallbackUsed,
    errorType,
    jsonParse: diagnostic?.jsonParse ?? "skipped",
    schemaValidation: diagnostic?.schemaValidation ?? "skipped",
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
      "x-ai-duration-ms": String(durationMs),
      "x-ai-timestamp": diagnostic?.timestamp ?? timestamp,
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { action } = await context.params;
  const providerMode = getServerAIProviderMode();
  const provider = getServerAIProvider();
  const payload = await request.json();
  const startedAt = Date.now();
  const withDuration = (result: unknown) => buildJsonResponse(action, providerMode, result, Date.now() - startedAt);

  let sessionUserId: string | null = null;

  if (providerMode === "real") {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "AI_LOGIN_REQUIRED",
          message: "登录后才能使用真实 AI",
        },
        { status: 401 },
      );
    }

    sessionUserId = session.user.id;

    if (quotaConsumingActions.has(action)) {
      const quotaResult = await checkAndConsumeAIQuotaForUser(sessionUserId);

      if (!quotaResult.allowed) {
        return NextResponse.json(
          {
            error: "AI_QUOTA_EXCEEDED",
            message: "免费 AI 体验次数已用完",
          },
          { status: 429 },
        );
      }
    }
  }

  switch (action) {
    case "validate":
      return withDuration(await provider.validateUserInput(payload as ValidateUserInputParams));
    case "girlfriend-reply":
      return withDuration(await provider.generateGirlfriendReply(payload as GirlfriendReplyParams));
    case "score-round":
      return withDuration(await provider.scoreRound(payload as RoundScoreParams));
    case "final-review":
      return withDuration(await provider.generateFinalReview(payload as FinalReviewParams));
    case "emergency-analysis":
      return withDuration(await provider.analyzeEmergencyMessage(payload as EmergencyAnalysisParams));
    default:
      return NextResponse.json({ error: "Unknown AI action." }, { status: 404 });
  }
}
