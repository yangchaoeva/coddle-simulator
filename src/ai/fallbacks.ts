import type {
  EmergencyAnalysisResult,
  FinalReviewResult,
  GirlfriendReplyResult,
  InputValidationResult,
  RoundScoreResult,
  SkillScores,
} from "@/ai/schemas";

export const neutralSkillScores: SkillScores = {
  emotionRecognition: 60,
  empathy: 60,
  responsibility: 60,
  explanationControl: 60,
  actionClarity: 60,
  relationshipRepair: 60,
};

export const inputValidationFallback: InputValidationResult = {
  status: "low_quality",
  reason: "Input validation fallback was used because validation output was unavailable.",
  userMessageToShow: "这次回复可以继续训练，但建议先回应她的感受，再说明你的想法。",
  shouldProceed: true,
  suggestedRewrite: "先承认她现在不好受，再表达你愿意认真听她说。",
};

export const girlfriendReplyFallback: GirlfriendReplyResult = {
  girlfriendReply: "我现在有点乱，不知道该怎么接你的话。",
  tone: "迟疑",
  relationshipState: "shutting_down",
  fallback: true,
  errorType: "AI_OUTPUT_INVALID",
};

export const roundScoreFallback: RoundScoreResult = {
  emotionChange: 0,
  trustChange: 0,
  riskFlags: ["系统评分暂时不稳定"],
  skillScores: neutralSkillScores,
  roundFeedback: "这次回复可以继续优化，建议先承认对方感受，再表达你的责任和行动。",
  fallback: true,
  errorType: "SCHEMA_VALIDATION_FAILED",
};

export const finalReviewFallback: FinalReviewResult = {
  totalScore: 60,
  grade: "C",
  endingType: "failed",
  emotionRecognition: 60,
  empathy: 60,
  responsibility: 60,
  explanationControl: 60,
  actionClarity: 60,
  relationshipRepair: 60,
  summary: "这次训练已完成，但系统暂时无法生成完整复盘。",
  keyProblems: ["系统复盘暂时不稳定"],
  betterReply: "我刚才没有很好地理解你的感受，可以再给我一次机会认真听你说吗？",
  lesson: "沟通中应先理解情绪，再解释原因，最后给出行动。",
  fallback: true,
  errorType: "FINAL_REVIEW_FAILED",
};

export const emergencyAnalysisFallback: EmergencyAnalysisResult = {
  detectedEmotion: "情绪不明确",
  hiddenNeed: "她可能需要被认真倾听和确认。",
  riskWarnings: ["不要急着反驳", "不要使用攻击性表达"],
  replyStrategy: "先表达你愿意理解，再邀请对方说清楚最难受的点。",
  suggestedReply: "我可能还没有完全理解你的感受，但我愿意认真听你说。你可以告诉我刚才最让你不舒服的点是什么吗？",
  doNotSay: ["你想太多了", "随便你", "我没错"],
  canBeConvertedToTraining: false,
  fallback: true,
  errorType: "EMERGENCY_ANALYSIS_FAILED",
};
