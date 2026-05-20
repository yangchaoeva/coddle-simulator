import { setLatestAIDiagnostic } from "@/ai/diagnostics";
import {
  emergencyAnalysisFallback,
  finalReviewFallback,
  girlfriendReplyFallback,
  inputValidationFallback,
  roundScoreFallback,
} from "@/ai/fallbacks";
import type {
  AIProvider,
  EmergencyAnalysisParams,
  FinalReviewParams,
  GirlfriendReplyParams,
  RoundScoreParams,
  ValidateUserInputParams,
} from "@/ai/provider";
import {
  EmergencyAnalysisSchema,
  FinalReviewSchema,
  GirlfriendReplySchema,
  InputValidationSchema,
  RoundScoreSchema,
} from "@/ai/schemas";
import type { CharacterConfig } from "@/types/character";
import type { LevelSeed } from "@/types/level";
import { z } from "zod";

const arkResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.union([
            z.string(),
            z.array(
              z.object({
                type: z.string(),
                text: z.string().optional(),
              }),
            ),
          ]),
        }),
      }),
    )
    .min(1),
});

type ProviderAction =
  | "validate"
  | "girlfriend-reply"
  | "score-round"
  | "final-review"
  | "emergency-analysis";

type AgentName =
  | "InputValidationAgent"
  | "GirlfriendResponseAgent"
  | "JudgeScoringAgent"
  | "FinalReviewAgent"
  | "EmergencyAnalysisAgent";

function getArkConfig() {
  const apiKey = process.env.ARK_API_KEY;
  const model = process.env.ARK_MODEL;
  const baseUrl = process.env.ARK_BASE_URL;

  return {
    apiKey,
    model,
    endpoint: baseUrl?.endsWith("/chat/completions") ? baseUrl : `${baseUrl ?? ""}/chat/completions`,
    isReady: Boolean(apiKey && model && baseUrl),
  };
}

function serializeCharacter(character: CharacterConfig) {
  return {
    characterType: character.characterType,
    characterName: character.characterName,
    relationshipStage: character.relationshipStage,
    personalityKeywords: character.personalityKeywords,
    coreNeed: character.coreNeed,
    emotionalTriggers: character.emotionalTriggers,
    expressionStyle: character.expressionStyle,
    dangerZones: character.dangerZones,
    forbiddenBehaviors: character.forbiddenBehaviors,
    comfortMechanism: character.comfortMechanism,
    languageExamples: character.languageExamples,
    consistencyRules: character.consistencyRules,
  };
}

function serializeLevel(level: LevelSeed) {
  return {
    levelKey: level.levelKey,
    sceneName: level.sceneName,
    background: level.background,
    openingLine: level.openingLine,
    taskTarget: level.taskTarget,
    difficulty: level.difficulty,
    initialEmotionScore: level.initialEmotionScore,
    initialTrustScore: level.initialTrustScore,
    trainingFocus: level.trainingFocus,
    riskRules: level.riskRules,
    referenceReplies: level.referenceReplies,
  };
}

function extractTextContent(content: z.infer<typeof arkResponseSchema>["choices"][number]["message"]["content"]) {
  if (typeof content === "string") {
    return content;
  }

  return content
    .map((item) => item.text ?? "")
    .join("")
    .trim();
}

function extractJsonCandidate(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    return text.trim();
  }

  return text.slice(first, last + 1);
}

function truncateForDebug(text: string, maxLength = 300) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }
  return value;
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === "string" && value.trim() !== "") {
    return [value.trim()];
  }
  return value;
}

function normalizeInputValidation(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };

  if (typeof candidate.status === "string") {
    candidate.status = candidate.status.trim().toLowerCase();
  }

  candidate.shouldProceed = toBoolean(candidate.shouldProceed);

  if (candidate.suggestedRewrite === null || candidate.suggestedRewrite === "") {
    delete candidate.suggestedRewrite;
  }

  return candidate;
}

function normalizeRoundScore(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };
  candidate.emotionChange = toNumber(candidate.emotionChange);
  candidate.trustChange = toNumber(candidate.trustChange);
  candidate.riskFlags = toStringArray(candidate.riskFlags);

  if (candidate.skillScores && typeof candidate.skillScores === "object" && !Array.isArray(candidate.skillScores)) {
    const skillScores = { ...(candidate.skillScores as Record<string, unknown>) };
    skillScores.emotionRecognition = toNumber(skillScores.emotionRecognition);
    skillScores.empathy = toNumber(skillScores.empathy);
    skillScores.responsibility = toNumber(skillScores.responsibility);
    skillScores.explanationControl = toNumber(skillScores.explanationControl);
    skillScores.actionClarity = toNumber(skillScores.actionClarity);
    skillScores.relationshipRepair = toNumber(skillScores.relationshipRepair);
    candidate.skillScores = skillScores;
  }

  if (typeof candidate.roundFeedback === "string") {
    candidate.roundFeedback = candidate.roundFeedback.trim();
  }

  if (Array.isArray(candidate.riskFlags)) {
    candidate.riskFlags = candidate.riskFlags.map((item) => String(item).trim());
  }

  return candidate;
}

function normalizeEmergencyAnalysis(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };
  if (typeof candidate.detectedEmotion === "string") {
    candidate.detectedEmotion = candidate.detectedEmotion.trim();
  }
  if (typeof candidate.hiddenNeed === "string") {
    candidate.hiddenNeed = candidate.hiddenNeed.trim();
  }
  candidate.riskWarnings = toStringArray(candidate.riskWarnings);
  if (Array.isArray(candidate.riskWarnings)) {
    candidate.riskWarnings = candidate.riskWarnings.map((item) => String(item).trim());
  }
  if (typeof candidate.replyStrategy === "string") {
    candidate.replyStrategy = candidate.replyStrategy.trim();
  }
  if (typeof candidate.suggestedReply === "string") {
    candidate.suggestedReply = candidate.suggestedReply.trim();
  }
  candidate.doNotSay = toStringArray(candidate.doNotSay);
  if (Array.isArray(candidate.doNotSay)) {
    candidate.doNotSay = candidate.doNotSay.map((item) => String(item).trim());
  }
  candidate.canBeConvertedToTraining = toBoolean(candidate.canBeConvertedToTraining);

  if (candidate.matchedCharacterType === null || candidate.matchedCharacterType === "") {
    delete candidate.matchedCharacterType;
  }

  return candidate;
}

function normalizeFinalReview(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const candidate = { ...(value as Record<string, unknown>) };
  candidate.totalScore = toNumber(candidate.totalScore);
  candidate.emotionRecognition = toNumber(candidate.emotionRecognition);
  candidate.empathy = toNumber(candidate.empathy);
  candidate.responsibility = toNumber(candidate.responsibility);
  candidate.explanationControl = toNumber(candidate.explanationControl);
  candidate.actionClarity = toNumber(candidate.actionClarity);
  candidate.relationshipRepair = toNumber(candidate.relationshipRepair);
  candidate.keyProblems = toStringArray(candidate.keyProblems);

  if (typeof candidate.grade === "string") {
    candidate.grade = candidate.grade.trim().toUpperCase();
  }

  if (typeof candidate.endingType === "string") {
    candidate.endingType = candidate.endingType.trim().toLowerCase();
  }

  return candidate;
}

function summarizeZodError(error: z.ZodError) {
  return error.issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");
}

function logProviderEvent(args: {
  agentName: AgentName;
  action: ProviderAction;
  errorType: string;
  apiStatus?: number;
  fallbackUsed?: boolean;
  jsonParse?: "success" | "failed" | "skipped";
  schemaValidation?: "success" | "failed" | "skipped";
  zodSummary?: string;
  contentPreview?: string;
}) {
  const record = {
    timestamp: new Date().toISOString(),
    providerMode: "real",
    agentName: args.agentName,
    action: args.action,
    apiStatus: args.apiStatus,
    jsonParse: args.jsonParse ?? "skipped",
    schemaValidation: args.schemaValidation ?? "skipped",
    fallbackUsed: args.fallbackUsed ?? true,
    errorType: args.errorType,
    zodErrorSummary: args.zodSummary,
    contentPreview: args.contentPreview,
  } as const;

  setLatestAIDiagnostic(args.action, record);
  console.warn("[ai-provider]", record);
}

function safeParseModelObject<T>(args: {
  text: string;
  schema: z.ZodType<T>;
  fallback: T;
  agentName: AgentName;
  action: ProviderAction;
  normalize?: (value: unknown) => unknown;
}) {
  try {
    const parsed = JSON.parse(extractJsonCandidate(args.text)) as unknown;
    const normalized = args.normalize ? args.normalize(parsed) : parsed;
    const validated = args.schema.safeParse(normalized);

    if (!validated.success) {
      logProviderEvent({
        agentName: args.agentName,
        action: args.action,
        jsonParse: "success",
        schemaValidation: "failed",
        fallbackUsed: true,
        errorType: "SCHEMA_VALIDATION_FAILED",
        zodSummary: summarizeZodError(validated.error),
        contentPreview: truncateForDebug(extractJsonCandidate(args.text)),
      });
      return { ...args.fallback, fallback: true, errorType: "SCHEMA_VALIDATION_FAILED" } as T;
    }

    logProviderEvent({
      agentName: args.agentName,
      action: args.action,
      jsonParse: "success",
      schemaValidation: "success",
      fallbackUsed: false,
      errorType: "",
    });

    return validated.data;
  } catch {
    logProviderEvent({
      agentName: args.agentName,
      action: args.action,
      jsonParse: "failed",
      schemaValidation: "skipped",
      fallbackUsed: true,
      errorType: "JSON_PARSE_FAILED",
      contentPreview: truncateForDebug(args.text),
    });
    return { ...args.fallback, fallback: true, errorType: "JSON_PARSE_FAILED" } as T;
  }
}

async function requestStructuredObject<T>(args: {
  agentName: AgentName;
  action: ProviderAction;
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodType<T>;
  fallback: T;
  temperature?: number;
  normalize?: (value: unknown) => unknown;
}) {
  const config = getArkConfig();

  if (!config.isReady || !config.apiKey || !config.model || !config.endpoint) {
    logProviderEvent({
      agentName: args.agentName,
      action: args.action,
      fallbackUsed: true,
      errorType: "MISSING_ENV_CONFIG",
    });
    return { ...args.fallback, fallback: true, errorType: "MISSING_ENV_CONFIG" } as T;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        temperature: args.temperature ?? 0.4,
        messages: [
          { role: "system", content: args.systemPrompt },
          { role: "user", content: args.userPrompt },
        ],
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      logProviderEvent({
        agentName: args.agentName,
        action: args.action,
        apiStatus: response.status,
        jsonParse: "skipped",
        schemaValidation: "skipped",
        fallbackUsed: true,
        errorType: `HTTP_${response.status}${errorText ? "_REQUEST_REJECTED" : ""}`,
        contentPreview: errorText ? truncateForDebug(errorText) : undefined,
      });
      return { ...args.fallback, fallback: true, errorType: `HTTP_${response.status}` } as T;
    }

    const rawJson = await response.json();
    const parsedResponse = arkResponseSchema.safeParse(rawJson);

    if (!parsedResponse.success) {
      logProviderEvent({
        agentName: args.agentName,
        action: args.action,
        apiStatus: response.status,
        jsonParse: "skipped",
        schemaValidation: "skipped",
        fallbackUsed: true,
        errorType: "ARK_RESPONSE_INVALID",
        zodSummary: summarizeZodError(parsedResponse.error),
      });
      return { ...args.fallback, fallback: true, errorType: "ARK_RESPONSE_INVALID" } as T;
    }

    const content = extractTextContent(parsedResponse.data.choices[0].message.content);
    return safeParseModelObject({
      text: content,
      schema: args.schema,
      fallback: args.fallback,
      agentName: args.agentName,
      action: args.action,
      normalize: args.normalize,
    });
  } catch (error) {
    const errorType = error instanceof Error && error.name === "AbortError" ? "TIMEOUT" : "REQUEST_FAILED";
    logProviderEvent({
      agentName: args.agentName,
      action: args.action,
      jsonParse: "skipped",
      schemaValidation: "skipped",
      fallbackUsed: true,
      errorType,
    });
    return { ...args.fallback, fallback: true, errorType } as T;
  }
}

function buildInputValidationPrompts(input: ValidateUserInputParams) {
  return {
    systemPrompt: [
      "You are the InputValidationAgent for a relationship communication training product.",
      "Your job is only to validate whether the user reply is safe and relevant for the current training round.",
      "Return exactly one JSON object.",
      "Do not return Markdown, code fences, commentary, or extra text.",
      "Required fields: status, reason, userMessageToShow, shouldProceed, suggestedRewrite.",
      "status must be one of: valid, low_quality, off_topic, harmful.",
      "If the reply is manipulative, insulting, threatening, abusive, or coercive, set status=harmful and shouldProceed=false.",
      "If the reply is clearly irrelevant to the scene, set status=off_topic and shouldProceed=false.",
      "If the reply is weak but still on-topic, use low_quality and shouldProceed=true.",
      'Output example: {"status":"valid","reason":"The reply acknowledges her feeling and stays on topic.","userMessageToShow":"这次回复可以继续训练。","shouldProceed":true,"suggestedRewrite":"先接住她的感受，再补充你的行动。"}',
    ].join("\n"),
    userPrompt: JSON.stringify(
      {
        character: serializeCharacter(input.character),
        level: serializeLevel(input.level),
        roundNumber: input.roundNumber,
        history: input.history,
        emotionScore: input.emotionScore,
        trustScore: input.trustScore,
        userInput: input.userInput,
      },
      null,
      2,
    ),
  };
}

function buildGirlfriendReplyPrompts(input: GirlfriendReplyParams) {
  return {
    systemPrompt: [
      "You are the GirlfriendResponseAgent for a relationship communication training product.",
      "Your job is only to generate the girlfriend's next reply based on character, level, round, scores, and the user's message.",
      "Do not score the user. Do not teach. Do not explain the rules. Do not break character.",
      "Return exactly one JSON object.",
      "Do not return Markdown, code fences, commentary, or extra text.",
      "Required fields: girlfriendReply, tone, relationshipState.",
      "relationshipState must be one of: tense, softening, willing_to_continue, shutting_down, worsened.",
    ].join("\n"),
    userPrompt: JSON.stringify(
      {
        character: serializeCharacter(input.character),
        level: serializeLevel(input.level),
        roundNumber: input.roundNumber,
        history: input.history,
        emotionScore: input.emotionScore,
        trustScore: input.trustScore,
        userInput: input.userInput,
      },
      null,
      2,
    ),
  };
}

function buildRoundScorePrompts(input: RoundScoreParams) {
  return {
    systemPrompt: [
      "You are the JudgeScoringAgent for a relationship communication training product.",
      "Your job is only to score the user's reply quality for this round. You are not the girlfriend.",
      "Return exactly one strict JSON object and nothing else.",
      "Do not return Markdown.",
      "Do not return code fences.",
      "Do not return explanations before or after the JSON.",
      "Use exactly these top-level fields: emotionChange, trustChange, riskFlags, skillScores, roundFeedback.",
      "emotionChange must be a number from -30 to 30.",
      "trustChange must be a number from -30 to 30.",
      "riskFlags must be an array of strings.",
      "skillScores must be an object with exactly six numeric fields from 0 to 100: emotionRecognition, empathy, responsibility, explanationControl, actionClarity, relationshipRepair.",
      "roundFeedback must be a short coaching string in Simplified Chinese.",
      "riskFlags must use Simplified Chinese.",
      "Any user-facing feedback text must use Simplified Chinese only.",
      "Do not output English.",
      "Do not mix Chinese and English in roundFeedback or riskFlags.",
      "Do not include relationshipState, grade, endingType, fallback, or any other extra field.",
      'Output example: {"emotionChange":8,"trustChange":10,"riskFlags":[],"skillScores":{"emotionRecognition":78,"empathy":82,"responsibility":74,"explanationControl":69,"actionClarity":72,"relationshipRepair":80},"roundFeedback":"你先接住了她的失落，再表达愿意修复，这让对话明显降温。"}',
    ].join("\n"),
    userPrompt: JSON.stringify(
      {
        character: serializeCharacter(input.character),
        level: serializeLevel(input.level),
        roundNumber: input.roundNumber,
        history: input.history,
        emotionScore: input.emotionScore,
        trustScore: input.trustScore,
        userInput: input.userInput,
        girlfriendReply: input.girlfriendReply,
      },
      null,
      2,
    ),
  };
}

function buildFinalReviewPrompts(input: FinalReviewParams) {
  return {
    systemPrompt: [
      "You are the FinalReviewAgent for a relationship communication training product.",
      "Summarize the three-round training and return the final structured review only.",
      "Return exactly one JSON object.",
      "Do not return Markdown, code fences, commentary, or extra text.",
      "Required fields: totalScore, grade, endingType, emotionRecognition, empathy, responsibility, explanationControl, actionClarity, relationshipRepair, summary, keyProblems, betterReply, lesson.",
      "totalScore must be a number from 0 to 100.",
      "grade must be one of: S, A, B+, B, C, D.",
      "endingType must be one of: reconciled, softened, failed, worsened.",
      "emotionRecognition, empathy, responsibility, explanationControl, actionClarity, relationshipRepair must each be a number from 0 to 100.",
      "keyProblems must be an array of strings.",
      "summary, betterReply, and lesson must be non-empty strings.",
      "Do not include fallback, errorType, markdown, code fences, or any extra fields.",
      'Output example: {"totalScore":84,"grade":"A","endingType":"softened","emotionRecognition":86,"empathy":88,"responsibility":90,"explanationControl":79,"actionClarity":82,"relationshipRepair":83,"summary":"The three-round conversation showed clear emotional acknowledgment, ownership, and a believable repair plan.","keyProblems":["The first round lacked a concrete repair step."],"betterReply":"我知道你最难受的是我让你觉得自己不重要了。下次我会先说明情况，不让你一个人胡思乱想。","lesson":"先接情绪，再承担责任，最后给出具体且可执行的修复动作。"}',
    ].join("\n"),
    userPrompt: JSON.stringify(
      {
        character: serializeCharacter(input.character),
        level: serializeLevel(input.level),
        history: input.history,
        finalEmotionScore: input.finalEmotionScore,
        finalTrustScore: input.finalTrustScore,
      },
      null,
      2,
    ),
  };
}

function buildEmergencyPrompts(input: EmergencyAnalysisParams) {
  return {
    systemPrompt: [
      "You are the EmergencyAnalysisAgent for a relationship communication training product.",
      "Analyze the message and produce structured emotional insight and a safe reply direction.",
      "Return exactly one JSON object.",
      "Do not return Markdown, code fences, commentary, or extra text.",
      "Required fields: detectedEmotion, hiddenNeed, riskWarnings, replyStrategy, suggestedReply, doNotSay, canBeConvertedToTraining, matchedCharacterType.",
      "detectedEmotion must be written in Simplified Chinese.",
      "hiddenNeed must be written in Simplified Chinese.",
      "Each item in riskWarnings must be written in Simplified Chinese.",
      "replyStrategy must be written in Simplified Chinese.",
      "suggestedReply must be written in Simplified Chinese.",
      "Each item in doNotSay must be written in Simplified Chinese.",
      "matchedCharacterType must be one of: insecure, high_expectation, rational_independent, emotionally_expressive, cold_suppressed, or be omitted.",
      "matchedCharacterType is the only field that may use English.",
      "Do not output English in any other user-facing field.",
      "Do not mix Chinese and English.",
      "Do not encourage manipulation, coercion, insults, threats, or cold violence.",
      'Output example: {"detectedEmotion":"She sounds disappointed and defensive.","hiddenNeed":"She wants to feel prioritized and emotionally acknowledged.","riskWarnings":["Do not argue about whether she is overreacting."],"replyStrategy":"Acknowledge the hurt first, then invite her to say what felt worst.","suggestedReply":"刚才是我忽略了你的感受，对不起。你最难受的是哪一点，我先认真听你说。","doNotSay":["你想太多了"],"canBeConvertedToTraining":true,"matchedCharacterType":"insecure"}',
    ].join("\n"),
    userPrompt: JSON.stringify({ message: input.message }, null, 2),
  };
}

export const realAIProvider: AIProvider = {
  async validateUserInput(input) {
    const prompts = buildInputValidationPrompts(input);
    return requestStructuredObject({
      agentName: "InputValidationAgent",
      action: "validate",
      ...prompts,
      schema: InputValidationSchema,
      fallback: inputValidationFallback,
      temperature: 0.1,
      normalize: normalizeInputValidation,
    });
  },

  async generateGirlfriendReply(input) {
    const prompts = buildGirlfriendReplyPrompts(input);
    return requestStructuredObject({
      agentName: "GirlfriendResponseAgent",
      action: "girlfriend-reply",
      ...prompts,
      schema: GirlfriendReplySchema,
      fallback: girlfriendReplyFallback,
      temperature: 0.7,
    });
  },

  async scoreRound(input) {
    const prompts = buildRoundScorePrompts(input);
    return requestStructuredObject({
      agentName: "JudgeScoringAgent",
      action: "score-round",
      ...prompts,
      schema: RoundScoreSchema,
      fallback: roundScoreFallback,
      temperature: 0.2,
      normalize: normalizeRoundScore,
    });
  },

  async generateFinalReview(input) {
    const prompts = buildFinalReviewPrompts(input);
    return requestStructuredObject({
      agentName: "FinalReviewAgent",
      action: "final-review",
      ...prompts,
      schema: FinalReviewSchema,
      fallback: finalReviewFallback,
      temperature: 0.2,
      normalize: normalizeFinalReview,
    });
  },

  async analyzeEmergencyMessage(input) {
    const prompts = buildEmergencyPrompts(input);
    return requestStructuredObject({
      agentName: "EmergencyAnalysisAgent",
      action: "emergency-analysis",
      ...prompts,
      schema: EmergencyAnalysisSchema,
      fallback: emergencyAnalysisFallback,
      temperature: 0.3,
      normalize: normalizeEmergencyAnalysis,
    });
  },
};
