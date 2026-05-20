export type CharacterType =
  | "insecure"
  | "high-expectation"
  | "rational"
  | "expressive"
  | "withdrawn";

export type CharacterCard = {
  type: CharacterType;
  name: string;
  title: string;
  tagline: string;
  coreNeed: string;
  trainingFocus: string;
  dangerZone: string;
  voice: string;
};

export type LevelConfig = {
  levelKey: string;
  characterType: CharacterType;
  sceneName: string;
  difficulty: 1 | 2 | 3;
  background: string;
  taskTarget: string;
  openingLine: string;
  referenceReplies: string[];
};

export type RoundRecord = {
  roundNumber: number;
  userReply: string;
  girlfriendReply: string;
  emotionBefore: number;
  emotionAfter: number;
  trustBefore: number;
  trustAfter: number;
  roundFeedback: string;
  riskFlags: string[];
  scoreDelta: number;
};

export type FinalReview = {
  totalScore: number;
  grade: string;
  endingType: string;
  summary: string;
  keyProblems: string[];
  betterReply: string;
  lesson: string;
  emotionRecognition: number;
  empathy: number;
  responsibility: number;
  explanationControl: number;
  actionClarity: number;
  relationshipRepair: number;
};

export type TrainingResult = {
  id: string;
  levelKey: string;
  characterType: CharacterType;
  characterName: string;
  levelName: string;
  taskTarget: string;
  createdAt: string;
  emotionStart: number;
  emotionEnd: number;
  trustStart: number;
  trustEnd: number;
  rounds: RoundRecord[];
  finalReview: FinalReview;
};

export type EmergencyAnalysis = {
  emotion: string;
  hiddenNeed: string;
  riskWarnings: string[];
  replyStrategy: string;
  suggestedReply: string;
  doNotSay: string[];
};

export const characterCards: CharacterCard[] = [
  {
    type: "insecure",
    name: "小雯",
    title: "缺安全感型",
    tagline: "她在意的不是道理，是你有没有把她放在心上。",
    coreNeed: "被重视、被及时回应、被确认关系稳定",
    trainingFocus: "先接住失落，再给明确行动和时间感",
    dangerZone: "敷衍、失联、把她说成“想太多”",
    voice: "失落里带一点试探，想确认你是否在乎。",
  },
  {
    type: "high-expectation",
    name: "嘉宁",
    title: "高期待型",
    tagline: "她并不是爱挑剔，只是对你的主动性要求更高。",
    coreNeed: "被提前想到、被主动照顾、被认真准备",
    trainingFocus: "少解释，多体现你真的有观察和在意",
    dangerZone: "临时抱佛脚、空口承诺、把标准说成矫情",
    voice: "表达直接，失望时会把细节讲得很清楚。",
  },
  {
    type: "rational",
    name: "知夏",
    title: "理性独立型",
    tagline: "她不吃油腻话术，更看重尊重和真诚。",
    coreNeed: "被平等对待、被理解边界、被认真沟通",
    trainingFocus: "承认问题，少套路，给清晰而不夸张的回应",
    dangerZone: "情绪绑架、夸张示爱、转移责任",
    voice: "冷静克制，但一旦失望会迅速拉开距离。",
  },
  {
    type: "expressive",
    name: "可可",
    title: "情绪外放型",
    tagline: "情绪来得快，也需要你先帮关系降温。",
    coreNeed: "被看见情绪、被稳定接住、被认真回应",
    trainingFocus: "先降温再修复，避免硬碰硬",
    dangerZone: "顶嘴、反击、上价值讲道理",
    voice: "反应强烈，话重但核心是委屈和受伤。",
  },
  {
    type: "withdrawn",
    name: "阿梨",
    title: "冷淡压抑型",
    tagline: "她不是没事，只是慢慢把失望收回去了。",
    coreNeed: "被主动觉察、被耐心追问、被长期兑现",
    trainingFocus: "识别沉默背后的失望，主动修复而不是等待",
    dangerZone: "默认她没事、拖着不聊、只说以后注意",
    voice: "话少、克制，越失望越容易沉默。",
  },
];

export const levels: LevelConfig[] = [
  {
    levelKey: "insecure-date-delay",
    characterType: "insecure",
    sceneName: "约会迟到没报备",
    difficulty: 1,
    background: "你下班晚了二十分钟才到，路上没有提前告诉她。",
    taskTarget: "先承认她被忽视的感受，再给具体补救。",
    openingLine: "你每次都这样，我在这边等到很烦，你连一句提前说都没有。",
    referenceReplies: ["我刚刚确实忽略你了，对不起。你等的时候一定很难受。", "这次是我没提前报备，待会我先陪你把饭吃好，再把回家时间都安排清楚。"],
  },
  {
    levelKey: "insecure-silent-night",
    characterType: "insecure",
    sceneName: "晚安消息断掉",
    difficulty: 2,
    background: "你前一晚打游戏到很晚，没有回她的晚安消息。",
    taskTarget: "让她感受到你不是消失，而是愿意修复信任。",
    openingLine: "你昨晚又突然不见了，我真的很讨厌这种被晾着的感觉。",
    referenceReplies: ["我明白你会很没安全感，这次是我没有把你放在前面。", "以后如果我来不及聊，我会先告诉你，不让你一直等。"],
  },
  {
    levelKey: "insecure-friend-priority",
    characterType: "insecure",
    sceneName: "朋友局优先于她",
    difficulty: 3,
    background: "你临时改去和朋友聚会，取消了原本答应陪她的视频。",
    taskTarget: "先承担失信，再修复“你是不是不重要”的担心。",
    openingLine: "你说改就改，那我在你这里到底算什么？",
    referenceReplies: ["你这样问不是矫情，是我做法真的让你觉得不被重视。", "我先把这次失约扛下来，也会重新约一个你能确定的时间。"],
  },
  {
    levelKey: "high-expectation-birthday",
    characterType: "high-expectation",
    sceneName: "生日准备太敷衍",
    difficulty: 1,
    background: "她生日当天，你只订了外卖和一句简单祝福。",
    taskTarget: "理解她在意的是你的用心程度，不是礼物价格。",
    openingLine: "我不是非要你花多少钱，我只是觉得你根本没有认真准备。",
    referenceReplies: ["我听懂了，你失望的是我的不用心，不是礼物本身。", "这次我没有提前准备好，是我让你觉得自己不值得被认真对待。"],
  },
  {
    levelKey: "high-expectation-anniversary",
    characterType: "high-expectation",
    sceneName: "纪念日忘记安排",
    difficulty: 2,
    background: "你记得纪念日，但直到当天晚上才想起要安排。",
    taskTarget: "少替自己辩解，更多回应她被忽视的失望。",
    openingLine: "你不是忘了，是你根本没把这件事放在心上。",
    referenceReplies: ["你这么说我能理解，因为我的行动确实像没放在心上。", "我不想靠解释糊过去，我更该补上我没做到的那部分。"],
  },
  {
    levelKey: "high-expectation-visit-plan",
    characterType: "high-expectation",
    sceneName: "见面计划总是她来推进",
    difficulty: 3,
    background: "最近每次见面安排都是她主动问，你很少主动提出计划。",
    taskTarget: "表达主动承担，而不是把她的期待打成压力。",
    openingLine: "我不想每次都是我在想什么时候见、怎么安排，你像在被动配合。",
    referenceReplies: ["你累的不是安排本身，是总觉得只有你在推动这段关系。", "这部分确实该由我多做，而不是等你开口。"],
  },
  {
    levelKey: "rational-boundary",
    characterType: "rational",
    sceneName: "越界查看她安排",
    difficulty: 1,
    background: "你未经同意追问她的行程，还翻看了她的工作安排。",
    taskTarget: "承认越界，不用“只是关心你”来合理化。",
    openingLine: "你那不叫关心，是没有边界感。我不喜欢被这样盯着。",
    referenceReplies: ["你说得对，这件事越界了，不能用关心当理由。", "我先承认我做错了，再谈我之后怎么尊重你的边界。"],
  },
  {
    levelKey: "rational-cancel-plan",
    characterType: "rational",
    sceneName: "临时取消还希望她理解",
    difficulty: 2,
    background: "你因为工作取消了原定计划，还希望她“体谅一下”。",
    taskTarget: "不要把责任外包给现实压力，要清楚承担失约影响。",
    openingLine: "我能理解你忙，但这不代表你就可以默认我必须接受。",
    referenceReplies: ["你不是不讲理，是我把你的配合当成了理所当然。", "这次取消给你带来的影响，我需要正面承担。"],
  },
  {
    levelKey: "rational-argument-mode",
    characterType: "rational",
    sceneName: "争执时只想证明自己没错",
    difficulty: 3,
    background: "你们吵架时你一直在列事实证明自己无辜。",
    taskTarget: "停止辩赢模式，先回到关系和感受。",
    openingLine: "你一直在证明你有道理，可你一点都没有在听我为什么不舒服。",
    referenceReplies: ["我刚刚确实在证明自己，而不是理解你。", "就算我有我的理由，也不代表你的不舒服不重要。"],
  },
  {
    levelKey: "expressive-public-embarrassment",
    characterType: "expressive",
    sceneName: "在朋友面前让她难堪",
    difficulty: 1,
    background: "聚会时你拿她的小失误开玩笑，场面很热闹，但她明显不开心。",
    taskTarget: "先降温并承认她当下的难堪，不反击她语气重。",
    openingLine: "你是不是觉得当着大家笑我很好玩？我当时真的很下不来台。",
    referenceReplies: ["我听见你的委屈了，这不是你太敏感，是我没顾到你的感受。", "我先不替自己找台阶，这次让你难堪是事实。"],
  },
  {
    levelKey: "expressive-repeat-mistake",
    characterType: "expressive",
    sceneName: "同样的问题反复发生",
    difficulty: 2,
    background: "你答应过的事又一次没做到，她情绪明显升级。",
    taskTarget: "先接情绪，再说明这次准备怎么避免重演。",
    openingLine: "你每次都说知道了，可最后还是一样，我真的很累。",
    referenceReplies: ["你生气不是因为这一件事，是因为它反复发生。", "我如果只说对不起，确实很难让你相信会变。"],
  },
  {
    levelKey: "expressive-cold-reply",
    characterType: "expressive",
    sceneName: "她情绪上来时你回得很冷",
    difficulty: 3,
    background: "她在表达委屈时，你只回了一句“那你想怎样”。",
    taskTarget: "修复被顶回去的受伤感，避免继续硬碰硬。",
    openingLine: "我最难受的不是那件事，是我已经难过了你还这样回我。",
    referenceReplies: ["这句话确实把你顶回去了，是我把你的求助听成了攻击。", "我先把那句伤人的话收回来，认真接住你现在的情绪。"],
  },
  {
    levelKey: "withdrawn-short-answers",
    characterType: "withdrawn",
    sceneName: "她开始只回很短",
    difficulty: 1,
    background: "最近她回复越来越短，你以为只是忙，但她已经在失望。",
    taskTarget: "识别沉默不是没事，主动表达愿意听。",
    openingLine: "没什么，你忙你的吧。",
    referenceReplies: ["我听出来你不是没事，是已经不太想再主动说了。", "如果你愿意，我想把这件事认真听完，不想继续装作没发生。"],
  },
  {
    levelKey: "withdrawn-reschedule",
    characterType: "withdrawn",
    sceneName: "一再改期让她失去期待",
    difficulty: 2,
    background: "你最近两次都把见面往后推，她表面平静但开始不再期待。",
    taskTarget: "别只说抱歉，要回应她已经慢慢撤回投入。",
    openingLine: "算了，反正你总有更重要的事。",
    referenceReplies: ["这句话背后不是算了，是你已经对我慢慢失望了。", "我不想再让你一直往后排，这次我会先把时间真正留出来。"],
  },
  {
    levelKey: "withdrawn-avoid-conversation",
    characterType: "withdrawn",
    sceneName: "她不再想吵也不再想说",
    difficulty: 3,
    background: "你们前几次问题都没有谈透，她现在选择沉默收回情绪。",
    taskTarget: "主动修复，不逼问，但要给出可信的沟通姿态。",
    openingLine: "我现在也不太想说了，说了好像也没什么用。",
    referenceReplies: ["你不想说，可能不是没内容，而是已经不相信会被认真听。", "这次我不急着让你立刻展开，但我会把态度先摆出来。"],
  },
];
