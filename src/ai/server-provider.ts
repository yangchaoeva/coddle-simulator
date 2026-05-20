import type { AIProvider } from "@/ai/provider";
import { mockAIProvider } from "@/ai/mock-provider";
import { realAIProvider } from "@/ai/real-provider";

export type AIProviderMode = "mock" | "real";

export function getServerAIProviderMode(): AIProviderMode {
  return process.env.AI_PROVIDER === "real" ? "real" : "mock";
}

export function getServerAIProvider(): AIProvider {
  return getServerAIProviderMode() === "real" ? realAIProvider : mockAIProvider;
}
