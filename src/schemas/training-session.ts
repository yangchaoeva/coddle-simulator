import { z } from "zod";
import {
  FinalReviewSchema,
  GirlfriendReplySchema,
  InputStatusEnum,
  RoundScoreSchema,
} from "@/ai/schemas";

const SaveRoundSchema = z.object({
  roundNumber: z.number().int().min(1).max(3),
  userReply: z.string().min(1),
  validation: z.object({
    status: InputStatusEnum,
  }),
  girlfriendReply: GirlfriendReplySchema.pick({
    girlfriendReply: true,
    fallback: true,
    errorType: true,
  }),
  score: RoundScoreSchema.pick({
    emotionChange: true,
    trustChange: true,
    riskFlags: true,
    skillScores: true,
    roundFeedback: true,
    fallback: true,
    errorType: true,
  }),
  emotionBefore: z.number().int(),
  emotionAfter: z.number().int(),
  trustBefore: z.number().int(),
  trustAfter: z.number().int(),
});

export const SaveTrainingSessionPayloadSchema = z
  .object({
    resultId: z.string().uuid(),
    levelKey: z.string().min(1),
    rounds: z.array(SaveRoundSchema).length(3),
    finalReview: FinalReviewSchema.pick({
      totalScore: true,
      grade: true,
      endingType: true,
      emotionRecognition: true,
      empathy: true,
      responsibility: true,
      explanationControl: true,
      actionClarity: true,
      relationshipRepair: true,
      summary: true,
      keyProblems: true,
      betterReply: true,
      lesson: true,
      fallback: true,
      errorType: true,
    }),
  })
  .superRefine((payload, ctx) => {
    const expectedRounds = [1, 2, 3];
    payload.rounds.forEach((round, index) => {
      if (round.roundNumber !== expectedRounds[index]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Rounds must be ordered as 1, 2, 3.",
          path: ["rounds", index, "roundNumber"],
        });
      }
    });
  });

export type SaveTrainingSessionPayload = z.infer<typeof SaveTrainingSessionPayloadSchema>;
