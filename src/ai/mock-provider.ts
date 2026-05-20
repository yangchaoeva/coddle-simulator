import {
  emergencyAnalysisFallback,
  finalReviewFallback,
  girlfriendReplyFallback,
  inputValidationFallback,
  neutralSkillScores,
  roundScoreFallback,
} from "@/ai/fallbacks";
import {
  EmergencyAnalysisSchema,
  FinalReviewSchema,
  GirlfriendReplySchema,
  InputValidationSchema,
  RoundScoreSchema,
  type EmergencyAnalysisResult,
  type FinalReviewResult,
  type GirlfriendReplyResult,
  type InputValidationResult,
  type RoundScoreResult,
  type SkillScores,
} from "@/ai/schemas";
import type {
  AIProvider,
  EmergencyAnalysisParams,
  FinalReviewParams,
  GirlfriendReplyParams,
  RoundScoreParams,
  ValidateUserInputParams,
} from "@/ai/provider";
import type { CharacterType } from "@/types/character";

const empathyWords = ["理解", "感受", "难受", "委屈", "失望", "在乎", "认真听", "明白"];
const accountabilityWords = ["对不起", "抱歉", "是我", "我没", "我忽略", "我做错"];
const repairWords = ["以后", "下次", "现在", "安排", "补上", "陪你", "改", "确认"];
const harmfulWords = ["你想太多", "随便", "有病", "闭嘴", "矫情", "烦死了"];
const offTopicWords = ["股票", "彩票", "天气", "编程", "游戏攻略", "汇率"];

function withSchemaFallback<T>(
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } },
  value: unknown,
  fallback: T,
): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function inferRelationshipState(score: number): GirlfriendReplyResult["relationshipState"] {
  if (score >= 18) {
    return "willing_to_continue";
  }
  if (score >= 6) {
    return "softening";
  }
  if (score <= -18) {
    return "worsened";
  }
  if (score <= -6) {
    return "shutting_down";
  }
  return "tense";
}

function inferTone(characterType: CharacterType, score: number) {
  if (score >= 18) {
    return characterType === "cold_suppressed" ? "克制但愿意继续" : "缓和但还在观察";
  }
  if (score >= 6) {
    return "有所松动";
  }
  if (score <= -18) {
    return characterType === "emotionally_expressive" ? "被激怒" : "更失望了";
  }
  if (score <= -6) {
    return characterType === "cold_suppressed" ? "冷下来并收回表达" : "防备更重";
  }
  return "紧绷";
}

function buildSkillScores(input: string, totalDelta: number): SkillScores {
  const text = input.trim();
  const hasEmpathy = includesAny(text, empathyWords);
  const hasAccountability = includesAny(text, accountabilityWords);
  const hasRepair = includesAny(text, repairWords);
  const explanationPenalty = (text.match(/但是|可是|其实/g) ?? []).length * 10;

  return {
    emotionRecognition: clamp(50 + (hasEmpathy ? 24 : 0) + (text.includes("为什么") ? -10 : 0) + totalDelta, 0, 100),
    empathy: clamp(52 + (hasEmpathy ? 28 : 0) + totalDelta, 0, 100),
    responsibility: clamp(50 + (hasAccountability ? 30 : 0) + Math.round(totalDelta / 2), 0, 100),
    explanationControl: clamp(78 - explanationPenalty + (hasEmpathy ? 6 : 0), 0, 100),
    actionClarity: clamp(48 + (hasRepair ? 30 : 0) + Math.round(totalDelta / 3), 0, 100),
    relationshipRepair: clamp(50 + totalDelta, 0, 100),
  };
}

export async function mockValidateUserInput(input: ValidateUserInputParams): Promise<InputValidationResult> {
  const text = input.userInput.trim();
  let result: InputValidationResult;

  if (!text) {
    result = {
      status: "low_quality",
      reason: "User input is empty.",
      userMessageToShow: "你的回复太短了，本轮可以继续，但会明显影响评分。",
      shouldProceed: true,
      suggestedRewrite: "先回应她现在的感受，再说你打算怎么补救。",
    };
  } else if (text.length <= 3) {
    result = {
      status: "low_quality",
      reason: "User input is too short to回应情绪。",
      userMessageToShow: "你的回复有些敷衍，本轮会继续推进，但评分会受影响。",
      shouldProceed: true,
      suggestedRewrite: "试着先承认她为什么不舒服，再表达你的责任。",
    };
  } else if (includesAny(text, harmfulWords)) {
    result = {
      status: "harmful",
      reason: "User input contains insulting or manipulative language.",
      userMessageToShow: "这类表达会直接加剧冲突。请换一种更尊重对方感受的说法。",
      shouldProceed: false,
      suggestedRewrite: "先说你愿意理解她现在为什么难受，而不是反击她。",
    };
  } else if (includesAny(text, offTopicWords)) {
    result = {
      status: "off_topic",
      reason: "User input is unrelated to the current relationship scene.",
      userMessageToShow: "这句话和当前沟通任务无关，本轮不会计分。请尝试回应她刚才表达的感受。",
      shouldProceed: false,
      suggestedRewrite: "回到她此刻的不开心，别转移话题。",
    };
  } else {
    result = {
      status: includesAny(text, empathyWords) || includesAny(text, accountabilityWords) ? "valid" : "low_quality",
      reason: "Input stays within the relationship scene.",
      userMessageToShow: includesAny(text, empathyWords) || includesAny(text, accountabilityWords)
        ? "可以进入下一轮。"
        : "方向还可以，但建议更明确地回应她的感受和你的责任。",
      shouldProceed: true,
      suggestedRewrite: includesAny(text, empathyWords) || includesAny(text, accountabilityWords)
        ? undefined
        : "先承认她不舒服的原因，再说你会怎么改。",
    };
  }

  return withSchemaFallback(InputValidationSchema, result, inputValidationFallback);
}

export async function mockGenerateGirlfriendReply(input: GirlfriendReplyParams): Promise<GirlfriendReplyResult> {
  const text = input.userInput.trim();
  const hasEmpathy = includesAny(text, empathyWords);
  const hasAccountability = includesAny(text, accountabilityWords);
  const hasRepair = includesAny(text, repairWords);
  const totalDelta = (hasEmpathy ? 10 : -6) + (hasAccountability ? 10 : -6) + (hasRepair ? 8 : input.roundNumber >= 2 ? -4 : 0);
  const relationshipState = inferRelationshipState(totalDelta);
  const tone = inferTone(input.character.characterType, totalDelta);

  const responseMap: Record<CharacterType, Record<number, Record<GirlfriendReplyResult["relationshipState"], string>>> = {
    insecure: {
      1: {
        tense: "我不是想跟你吵，我只是会觉得自己好像总被放在后面。",
        softening: "你这样说，我能感觉到你不是在敷衍我，但我还是有点难受。",
        willing_to_continue: "至少你现在是在认真听我说，不是在急着把这件事带过去。",
        shutting_down: "你还是没有接住我真正难受的地方，我现在更不想说了。",
        worsened: "如果你还是这样回，我只会更觉得自己不重要。",
      },
      2: {
        tense: "我现在卡住的不是一句道歉，是我不知道还能不能继续相信你。",
        softening: "如果你真的是这么想的，那你准备怎么把这件事补上？",
        willing_to_continue: "好，那你具体说说你接下来会怎么做，我愿意继续听。",
        shutting_down: "我听不出你是真的明白，还是只是想让我快点消气。",
        worsened: "你越这样说，我越觉得你根本没把我放在心上。",
      },
      3: {
        tense: "我还没有完全过去，但至少我愿意继续看你怎么做。",
        softening: "我情绪缓一点了，但我更在意你之后能不能做到。",
        willing_to_continue: "这次我愿意继续和你往下聊，因为你终于没有只顾着解释自己。",
        shutting_down: "我现在没有被安到，反而更想把话收回去。",
        worsened: "我还是觉得这段关系里，只有我在认真在乎。",
      },
    },
    high_expectation: {
      1: {
        tense: "我在意的不是形式，是你有没有真的把这件事放在心上。",
        softening: "你这样说，至少有在回应我的失望，而不是只说你不是故意的。",
        willing_to_continue: "如果你真懂我在意什么，那就继续说下去。",
        shutting_down: "你还是在讲表面，我失望的点你没碰到。",
        worsened: "你越解释，我越觉得你根本没认真想过我在意什么。",
      },
      2: {
        tense: "我不想每次都等到我开口了，你才开始补救。",
        softening: "方向对了一点，但我还想知道你以后怎么做到主动。",
        willing_to_continue: "好，那你说说你之后准备怎么提前用心。",
        shutting_down: "你现在像是在补答案，不像是真的理解了。",
        worsened: "如果还是这样，我只会觉得我每次期待都落空。",
      },
      3: {
        tense: "我还没有完全被说服，但至少不是原地打转了。",
        softening: "我会看你之后是不是能做到主动，而不是只会这次说得好听。",
        willing_to_continue: "这次我愿意继续往下走，因为你终于在回应态度问题。",
        shutting_down: "我还是没感觉到你真的把关系放在心上。",
        worsened: "再这样下去，我只会慢慢降低对你的期待。",
      },
    },
    rational_independent: {
      1: {
        tense: "我需要的是你正面回应问题，而不是把它说轻。",
        softening: "这次你至少开始在回应问题本身了。",
        willing_to_continue: "好，继续说具体一点，别绕开重点。",
        shutting_down: "你还是没有真正回应到问题，我不想被糊弄。",
        worsened: "如果你继续这样带过去，我们没必要再谈。",
      },
      2: {
        tense: "我不是要你哄我，我是要你认真面对这件事。",
        softening: "如果你能把改法说清楚，我愿意继续听。",
        willing_to_continue: "这样就对了，具体讲你接下来怎么处理。",
        shutting_down: "你现在更像在灭火，不像在解决问题。",
        worsened: "你越回避重点，我越不会信任这段沟通。",
      },
      3: {
        tense: "我会先看行动，不会因为一句话就当问题解决了。",
        softening: "至少这次你的态度比一开始更像在平等沟通。",
        willing_to_continue: "我愿意继续谈下去，因为你终于没有拿话术代替回应。",
        shutting_down: "我现在还是觉得这段沟通没有实质推进。",
        worsened: "如果还是这样，那只会让我更想退出这场对话。",
      },
    },
    emotionally_expressive: {
      1: {
        tense: "我现在最难受的就是你刚刚根本没有接住我。",
        softening: "好，至少你现在不是继续跟我顶着来。",
        willing_to_continue: "你先别跟我争对错，这样说我还能继续讲下去。",
        shutting_down: "你这句话只会让我更炸，我现在根本不想听。",
        worsened: "你越这样回，我越觉得你根本不在乎我为什么这么难受。",
      },
      2: {
        tense: "我情绪还在，但如果你真愿意听，我可以继续说。",
        softening: "你这样回应，我能稍微降一点温，但你还得更具体。",
        willing_to_continue: "好，你继续说，我现在愿意听你怎么补救。",
        shutting_down: "我现在被你说得更堵了，根本不想继续。",
        worsened: "你又把我顶回去了，这就是我现在最受不了的地方。",
      },
      3: {
        tense: "我气还没完全下去，但至少不是一开始那样了。",
        softening: "我能感觉到你在努力接住我，这比刚开始好很多。",
        willing_to_continue: "这次我愿意继续跟你往下谈，因为你终于先看见我的情绪了。",
        shutting_down: "我还是觉得自己没有被真正接住。",
        worsened: "如果还是这种回应，我只会越来越不想再说了。",
      },
    },
    cold_suppressed: {
      1: {
        tense: "我不是没事，只是之前说了也没什么变化。",
        softening: "你现在这样说，至少让我觉得你有在认真看这件事。",
        willing_to_continue: "好，我可以继续说，但我更在意你后面会不会做到。",
        shutting_down: "如果还是这样，我就不想再把话展开了。",
        worsened: "你这样回，只会让我更想把话收回去。",
      },
      2: {
        tense: "我现在在意的不是一句安慰，是你是不是真的看到问题了。",
        softening: "方向是对的，但我还需要看到更稳一点的改变。",
        willing_to_continue: "如果你能说清楚后面怎么改，我愿意继续听。",
        shutting_down: "我现在还是不太想继续讲，因为感觉没有被真正理解。",
        worsened: "再这样下去，我只会更确定说了也没用。",
      },
      3: {
        tense: "我不会一下就放下，但至少这次不是毫无推进。",
        softening: "我还需要时间，不过你这次的回应比以前认真。",
        willing_to_continue: "这次我愿意继续谈下去，因为你终于没有把我的沉默当成没事。",
        shutting_down: "我现在还是更想先停在这里。",
        worsened: "如果还是这样，我会更不想再对这段关系投入。",
      },
    },
  };

  const roundResponses = responseMap[input.character.characterType][input.roundNumber] ?? responseMap[input.character.characterType][3];
  const response = {
    girlfriendReply: roundResponses[relationshipState],
    tone,
    relationshipState,
  };

  return withSchemaFallback(GirlfriendReplySchema, response, girlfriendReplyFallback);
}

export async function mockScoreRound(input: RoundScoreParams): Promise<RoundScoreResult> {
  const text = input.userInput.trim();
  const hasEmpathy = includesAny(text, empathyWords);
  const hasAccountability = includesAny(text, accountabilityWords);
  const hasRepair = includesAny(text, repairWords);
  const harmful = includesAny(text, harmfulWords);

  let emotionChange = 0;
  let trustChange = 0;
  const riskFlags: string[] = [];

  if (harmful) {
    emotionChange -= 20;
    trustChange -= 18;
    riskFlags.push("攻击性表达");
  } else {
    if (hasEmpathy) {
      emotionChange += 10;
      trustChange += 6;
    } else {
      emotionChange -= 6;
      riskFlags.push("没有先接住情绪");
    }

    if (hasAccountability) {
      emotionChange += 6;
      trustChange += 10;
    } else {
      trustChange -= 6;
      riskFlags.push("责任承担不够明确");
    }

    if (hasRepair) {
      emotionChange += 5;
      trustChange += 8;
    } else if (input.roundNumber >= 2) {
      riskFlags.push("补救行动不够具体");
    }
  }

  if (text.length <= 6) {
    emotionChange -= 4;
    trustChange -= 4;
    riskFlags.push("表达偏短");
  }

  if ((text.match(/但是|可是|其实/g) ?? []).length > 0) {
    trustChange -= 3;
    riskFlags.push("解释冲动偏强");
  }

  emotionChange = clamp(emotionChange, -30, 30);
  trustChange = clamp(trustChange, -30, 30);

  const totalDelta = emotionChange + trustChange;
  const skillScores = buildSkillScores(text, totalDelta);
  const roundFeedback =
    totalDelta >= 18
      ? "这轮回应先看见了她的感受，也承担了责任，并开始给出补救方向。"
      : totalDelta >= 6
        ? "方向基本正确，但还可以更具体，尤其是行动承诺部分。"
        : totalDelta >= -4
          ? "这轮没有明显恶化，但你还没有真正接住她最在意的地方。"
          : "这类回应会让对方更难继续沟通，建议先停下解释和反击，回到她此刻的感受。";

  const score = {
    emotionChange,
    trustChange,
    riskFlags,
    skillScores,
    roundFeedback,
  };

  return withSchemaFallback(RoundScoreSchema, score, roundScoreFallback);
}

function averageSkillScores(scores: SkillScores[]): SkillScores {
  if (scores.length === 0) {
    return neutralSkillScores;
  }

  const sum = scores.reduce(
    (acc, item) => ({
      emotionRecognition: acc.emotionRecognition + item.emotionRecognition,
      empathy: acc.empathy + item.empathy,
      responsibility: acc.responsibility + item.responsibility,
      explanationControl: acc.explanationControl + item.explanationControl,
      actionClarity: acc.actionClarity + item.actionClarity,
      relationshipRepair: acc.relationshipRepair + item.relationshipRepair,
    }),
    {
      emotionRecognition: 0,
      empathy: 0,
      responsibility: 0,
      explanationControl: 0,
      actionClarity: 0,
      relationshipRepair: 0,
    },
  );

  return {
    emotionRecognition: Math.round(sum.emotionRecognition / scores.length),
    empathy: Math.round(sum.empathy / scores.length),
    responsibility: Math.round(sum.responsibility / scores.length),
    explanationControl: Math.round(sum.explanationControl / scores.length),
    actionClarity: Math.round(sum.actionClarity / scores.length),
    relationshipRepair: Math.round(sum.relationshipRepair / scores.length),
  };
}

export async function mockGenerateFinalReview(input: FinalReviewParams): Promise<FinalReviewResult> {
  const skillScores = averageSkillScores(input.history.map((item) => (item as { skillScores?: SkillScores }).skillScores ?? neutralSkillScores));
  const totalScore = clamp(
    Math.round(
      skillScores.emotionRecognition * 0.15 +
        skillScores.empathy * 0.2 +
        skillScores.responsibility * 0.2 +
        skillScores.explanationControl * 0.1 +
        skillScores.actionClarity * 0.15 +
        skillScores.relationshipRepair * 0.2,
    ),
    0,
    100,
  );

  let grade: FinalReviewResult["grade"] = "D";
  if (totalScore >= 90) {
    grade = "S";
  } else if (totalScore >= 82) {
    grade = "A";
  } else if (totalScore >= 74) {
    grade = "B+";
  } else if (totalScore >= 66) {
    grade = "B";
  } else if (totalScore >= 58) {
    grade = "C";
  }

  let endingType: FinalReviewResult["endingType"] = "failed";
  if (input.finalTrustScore >= 75 && input.finalEmotionScore >= -10) {
    endingType = "reconciled";
  } else if (input.finalTrustScore >= 55 && input.finalEmotionScore >= -35) {
    endingType = "softened";
  } else if (input.finalTrustScore <= 25 || input.finalEmotionScore <= -75) {
    endingType = "worsened";
  }

  const riskFlags = Array.from(
    new Set(
      input.history
        .flatMap((item) => ((item as { riskFlags?: string[] }).riskFlags ?? []))
        .filter(Boolean),
    ),
  );

  const review = {
    totalScore,
    grade,
    endingType,
    ...skillScores,
    summary:
      endingType === "reconciled"
        ? "你整体做到了先理解她的情绪，再承担责任，并给出更可信的修复动作。"
        : endingType === "softened"
          ? "关系已经明显缓和，但你还需要把承诺说得更具体，才能继续累积信任。"
          : endingType === "worsened"
            ? "这次沟通没有接住她真正难受的地方，解释和防御压过了理解与修复。"
            : "这次训练有部分正确方向，但修复动作和责任承担还不够稳定。",
    keyProblems: riskFlags.length > 0 ? riskFlags.slice(0, 3) : ["补救动作还可以更具体"],
    betterReply: "我刚才的做法确实让你觉得自己没有被重视。对不起。我先不急着替自己解释，先把你最难受的地方听清楚，再把我接下来会怎么改说具体。",
    lesson: "先承认感受，再承担责任，最后给出能执行的行动，比急着解释更能修复关系。",
  };

  return withSchemaFallback(FinalReviewSchema, review, finalReviewFallback);
}

function detectCharacterType(message: string): CharacterType | undefined {
  if (message.includes("不重要") || message.includes("忙你的")) {
    return "insecure";
  }
  if (message.includes("态度") || message.includes("不用我提醒")) {
    return "high_expectation";
  }
  if (message.includes("边界") || message.includes("认真回答")) {
    return "rational_independent";
  }
  if (message.includes("每次都这样") || message.includes("根本不在乎")) {
    return "emotionally_expressive";
  }
  if (message.includes("没事") || message.includes("说了也没用")) {
    return "cold_suppressed";
  }
  return undefined;
}

export async function mockAnalyzeEmergencyMessage(input: EmergencyAnalysisParams): Promise<EmergencyAnalysisResult> {
  const text = input.message.trim();

  if (!text) {
    return withSchemaFallback(EmergencyAnalysisSchema, emergencyAnalysisFallback, emergencyAnalysisFallback);
  }

  const matchedCharacterType = detectCharacterType(text);
  const analysis = {
    detectedEmotion: text.includes("算了")
      ? "表面退让，实际失望"
      : text.includes("生气") || text.includes("烦")
        ? "明显生气和委屈"
        : text.includes("没事")
          ? "压着不说的失望"
          : "希望被认真理解",
    hiddenNeed: matchedCharacterType === "high_expectation"
      ? "她在意的是你有没有主动用心，而不是事后补一句道歉。"
      : matchedCharacterType === "rational_independent"
        ? "她更需要你正面回应问题和边界，而不是用话术安抚。"
        : matchedCharacterType === "cold_suppressed"
          ? "她可能已经失望一段时间了，需要被主动看见而不是被追问。"
          : "她希望你先看见她为什么难受，而不是马上替自己解释。",
    riskWarnings: ["不要急着反驳", "不要把她的情绪定义成无理取闹", "不要只解释自己为什么忙"],
    replyStrategy: "先承认她现在的不舒服，再说明你听懂了哪一部分，最后给一个当下可执行的补救动作。",
    suggestedReply: "我能感觉到你现在不是单纯在说这句话本身，而是真的有点失望。刚才那件事是我没处理好。你先把最难受的地方告诉我，我认真听，然后把我接下来会怎么补上说清楚。",
    doNotSay: ["你想太多了", "我不是都解释了吗", "随便你怎么想"],
    canBeConvertedToTraining: true,
    matchedCharacterType,
  };

  return withSchemaFallback(EmergencyAnalysisSchema, analysis, emergencyAnalysisFallback);
}

export const mockAIProvider: AIProvider = {
  validateUserInput: mockValidateUserInput,
  generateGirlfriendReply: mockGenerateGirlfriendReply,
  scoreRound: mockScoreRound,
  generateFinalReview: mockGenerateFinalReview,
  analyzeEmergencyMessage: mockAnalyzeEmergencyMessage,
};
