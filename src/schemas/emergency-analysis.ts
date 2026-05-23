import { z } from "zod";
import { EmergencyAnalysisSchema } from "@/ai/schemas";

export const SaveEmergencyAnalysisPayloadSchema = z.object({
  userInput: z.string().trim().min(1),
  analysis: EmergencyAnalysisSchema,
});

export type SaveEmergencyAnalysisPayload = z.infer<typeof SaveEmergencyAnalysisPayloadSchema>;
