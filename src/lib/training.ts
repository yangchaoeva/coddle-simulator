import {
  characterCards,
  levels,
  type CharacterCard,
  type EmergencyAnalysis,
  type FinalReview,
  type LevelConfig,
  type RoundRecord,
  type TrainingResult,
} from "@/data/mock";

type ScoreSummary = {
  deltaEmotion: number;
  deltaTrust: number;
  roundFeedback: string;
  riskFlags: string[];
  quality: "good" | "mixed" | "bad";
};

const empathyWords = ["理解", "感受", "难受", "委屈", "失望", "在乎", "听你", "明白"];
const accountabilityWords = ["对不起", "抱歉", "是我", "我没有", "我忽略", "我做错"];
const repairWords = ["以后", "下次", "现在", "安排", "补上", "会", "改", "陪你"];
const harmfulWords = ["你想太多", "随便", "有病", "烦", "矫情", "闭嘴"];

export function getCharacters() {
  return characterCards;
}

export function getCharacterByType(characterType: string): CharacterCard | null {
  return characterCards.find((item) => item.type === characterType) ?? null;
}

export function getLevelsByCharacter(characterType: string) {
  return levels.filter((item) => item.characterType === characterType);
}

export function getLevelByKey(levelKey: string): LevelConfig | null {
  return levels.find((item) => item.levelKey === levelKey) ?? null;
}

export function generateResultId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `result-${Date.now()}`;
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function judgeReply(input: string, roundNumber: number): ScoreSummary {
  const normalized = input.trim();

  if (!normalized) {
    return {
      deltaEmotion: -6,
      deltaTrust: -5,
      roundFeedback: "这轮几乎没有真正回应她的感受，关系会继续往下掉。",
      riskFlags: ["回复过短"],
      quality: "bad",
    };
  }

  if (includesAny(normalized, harmfulWords)) {
    return {
      deltaEmotion: -18,
      deltaTrust: -16,
      roundFeedback: "这类表达会直接加剧冲突，先停下反击，重新组织更尊重的回应。",
      riskFlags: ["攻击性表达"],
      quality: "bad",
    };
  }

  const hasEmpathy = includesAny(normalized, empathyWords);
  const hasAccountability = includesAny(normalized, accountabilityWords);
  const hasRepair = includesAny(normalized, repairWords);

  let deltaEmotion = 0;
  let deltaTrust = 0;
  const riskFlags: string[] = [];

  if (hasEmpathy) {
    deltaEmotion += 10;
    deltaTrust += 6;
  } else {
    riskFlags.push("没有先接住情绪");
  }

  if (hasAccountability) {
    deltaEmotion += 6;
    deltaTrust += 10;
  } else {
    riskFlags.push("责任承担不够明确");
  }

  if (hasRepair) {
    deltaEmotion += 5;
    deltaTrust += 8;
  } else if (roundNumber >= 2) {
    riskFlags.push("补救行动不够具体");
  }

  if (normalized.length < 8) {
    deltaEmotion -= 4;
    deltaTrust -= 4;
    riskFlags.push("表达偏短");
  }

  if (!hasEmpathy && !hasAccountability && !hasRepair) {
    deltaEmotion -= 8;
    deltaTrust -= 8;
  }

  const total = deltaEmotion + deltaTrust;

  if (total >= 18) {
    return {
      deltaEmotion,
      deltaTrust,
      roundFeedback: "这轮做得比较稳，先理解她，再承担问题，也给出了修复方向。",
      riskFlags,
      quality: "good",
    };
  }

  if (total >= 4) {
    return {
      deltaEmotion,
      deltaTrust,
      roundFeedback: "方向是对的，但还可以更具体一些，尤其是行动承诺部分。",
      riskFlags,
      quality: "mixed",
    };
  }

  return {
    deltaEmotion,
    deltaTrust,
    roundFeedback: "回应还没有真正缓和关系，建议先承认她的感受，再明确你准备怎么补救。",
    riskFlags,
    quality: "bad",
  };
}

function getGirlfriendReply(
  character: CharacterCard,
  level: LevelConfig,
  roundNumber: number,
  quality: ScoreSummary["quality"],
) {
  if (roundNumber === 1) {
    if (quality === "good") {
      return `我知道你是在认真听我说，可我现在还是有点别扭，因为这件事确实让我很${character.type === "expressive" ? "上头" : "失望"}。`;
    }
    if (quality === "mixed") {
      return "你这样说比刚才好一点，但我还是会担心你只是在安抚我，没有真的明白。";
    }
    return "你还是在回避重点，我难受的根本不是表面这件事。";
  }

  if (roundNumber === 2) {
    if (quality === "good") {
      return `好，至少我能感觉到你没有急着为自己开脱。那你准备怎么把“${level.taskTarget}”这件事真的做到？`;
    }
    if (quality === "mixed") {
      return "我能听到一点诚意，但还是不够落地，我需要的不是一句以后注意。";
    }
    return "如果你还是这样讲，我真的会越来越不想继续说下去。";
  }

  if (quality === "good") {
    return "这次我愿意继续跟你往下聊，因为你终于不是只顾着解释自己了。";
  }
  if (quality === "mixed") {
    return "我没有完全被说服，但至少比一开始更愿意听你继续修复。";
  }
  return `${character.name}沉默了几秒，只回了一句：“你还是没懂。”`;
}

export function playMockRound(args: {
  roundNumber: number;
  userReply: string;
  emotionBefore: number;
  trustBefore: number;
  level: LevelConfig;
  character: CharacterCard;
}): RoundRecord {
  const judged = judgeReply(args.userReply, args.roundNumber);
  const emotionAfter = Math.max(-100, Math.min(100, args.emotionBefore + judged.deltaEmotion));
  const trustAfter = Math.max(0, Math.min(100, args.trustBefore + judged.deltaTrust));

  return {
    roundNumber: args.roundNumber,
    userReply: args.userReply,
    girlfriendReply: getGirlfriendReply(args.character, args.level, args.roundNumber, judged.quality),
    emotionBefore: args.emotionBefore,
    emotionAfter,
    trustBefore: args.trustBefore,
    trustAfter,
    roundFeedback: judged.roundFeedback,
    riskFlags: judged.riskFlags,
    scoreDelta: judged.deltaEmotion + judged.deltaTrust,
  };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function buildFinalReview(rounds: RoundRecord[]): FinalReview {
  const emotionEnd = rounds.at(-1)?.emotionAfter ?? -50;
  const trustEnd = rounds.at(-1)?.trustAfter ?? 50;
  const totalTrend = rounds.reduce((sum, round) => sum + round.scoreDelta, 0);
  const totalScore = clampScore(62 + totalTrend);

  let grade = "C";
  let endingType = "failed";

  if (totalScore >= 88) {
    grade = "A";
    endingType = "和缓";
  } else if (totalScore >= 76) {
    grade = "B+";
    endingType = "缓和";
  } else if (totalScore >= 66) {
    grade = "B";
    endingType = "继续沟通";
  }

  const riskFlags = Array.from(new Set(rounds.flatMap((round) => round.riskFlags)));

  const emotionRecognition = clampScore(55 + rounds.filter((item) => item.userReply.includes("感受") || item.userReply.includes("难受") || item.userReply.includes("失望")).length * 12);
  const empathy = clampScore(58 + rounds.filter((item) => item.userReply.includes("理解") || item.userReply.includes("委屈") || item.userReply.includes("在乎")).length * 12);
  const responsibility = clampScore(54 + rounds.filter((item) => item.userReply.includes("对不起") || item.userReply.includes("是我") || item.userReply.includes("我没有")).length * 14);
  const explanationControl = clampScore(78 - rounds.filter((item) => item.userReply.includes("但是") || item.userReply.includes("可是")).length * 10);
  const actionClarity = clampScore(50 + rounds.filter((item) => item.userReply.includes("会") || item.userReply.includes("安排") || item.userReply.includes("现在")).length * 13);
  const relationshipRepair = clampScore(Math.round((emotionEnd + 100) / 2 * 0.4 + trustEnd * 0.6));

  const summary =
    totalScore >= 76
      ? "你整体做到了先理解她、再承担问题，关系已经出现明显缓和。"
      : totalScore >= 66
        ? "你有在往正确方向走，但修复动作还不够稳定，容易停在道歉而不是落实。"
        : "这次训练里，你还没有稳定地接住情绪和承担责任，关系修复力度偏弱。";

  const betterReply =
    "我刚才的做法确实让你觉得自己不被重视，这不是你想太多。对不起。现在我先认真听你说完，然后把我接下来会怎么改讲清楚。";

  const lesson =
    "先承认感受，再承担责任，最后给具体行动。不要急着解释自己为什么那样做。";

  return {
    totalScore,
    grade,
    endingType,
    summary,
    keyProblems: riskFlags.length > 0 ? riskFlags : ["补救动作可以更具体"],
    betterReply,
    lesson,
    emotionRecognition,
    empathy,
    responsibility,
    explanationControl,
    actionClarity,
    relationshipRepair,
  };
}

export function buildTrainingResult(levelKey: string, rounds: RoundRecord[]): TrainingResult | null {
  const level = getLevelByKey(levelKey);
  if (!level) {
    return null;
  }

  const character = getCharacterByType(level.characterType);
  if (!character) {
    return null;
  }

  return {
    id: generateResultId(),
    levelKey: level.levelKey,
    characterType: level.characterType,
    characterName: character.name,
    levelName: level.sceneName,
    taskTarget: level.taskTarget,
    createdAt: new Date().toISOString(),
    emotionStart: -45,
    emotionEnd: rounds.at(-1)?.emotionAfter ?? -45,
    trustStart: 42,
    trustEnd: rounds.at(-1)?.trustAfter ?? 42,
    rounds,
    finalReview: buildFinalReview(rounds),
  };
}

export function analyzeEmergencyMessage(message: string): EmergencyAnalysis {
  const text = message.trim();

  if (!text) {
    return {
      emotion: "情绪信息不足",
      hiddenNeed: "先把对方原话补充完整，再分析会更准。",
      riskWarnings: ["当前输入为空，无法判断语气和情境。"],
      replyStrategy: "先不要急着回，先整理出对方原话和前因后果。",
      suggestedReply: "我先把你刚才那句话认真看明白，再决定怎么回。",
      doNotSay: ["你想多了", "有事直说"],
    };
  }

  const emotion = text.includes("算了")
    ? "表面退让，实际失望"
    : text.includes("烦") || text.includes("生气")
      ? "明显生气和委屈"
      : text.includes("随便")
        ? "带刺的失望"
        : "需要被认真理解";

  const hiddenNeed = text.includes("忙")
    ? "她可能想确认自己不是一直被排在后面。"
    : "她更想被听懂，而不是马上被说服。";

  return {
    emotion,
    hiddenNeed,
    riskWarnings: [
      "不要立刻解释自己为什么这么做。",
      "不要把她的情绪定义成无理取闹。",
    ],
    replyStrategy: "先接住她当下的感受，再用一句责任承担说明你听懂了，最后给一个具体且当下可执行的补救动作。",
    suggestedReply:
      "我能感觉到你现在不是单纯在说这句话本身，而是真的有点失望。刚才那件事是我没处理好。我先认真听你说完，再把我接下来怎么补上讲清楚。",
    doNotSay: ["你别上纲上线", "我已经很累了你还要怎样", "这有什么好生气的"],
  };
}
