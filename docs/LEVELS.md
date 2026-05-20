# LEVELS.md

## 1. 文件目的

本文件用于定义《哄她模拟器》MVP 的 15 个关卡种子数据。

目标：

1. 为页面流程提供真实内容；
2. 为数据库 `levels` 表提供 seed 数据来源；
3. 为 AI 对话训练提供稳定场景；
4. 避免 Codex 做空壳页面；
5. 保证每个角色都有明确训练重点。

---

## 2. 关卡设计原则

MVP 关卡采用：

> 5 个女友角色 × 每个角色 3 个场景 = 15 个关卡

每个关卡必须明确：

1. 发生了什么；
2. 女友为什么不开心；
3. 女友第一句话是什么；
4. 用户本关要训练什么；
5. 哪些回复会踩雷；
6. 什么样的回复算有效。

---

## 3. 关卡字段说明

每个关卡建议包含：

| 字段 | 说明 |
|---|---|
| `levelKey` | 业务关卡 ID |
| `characterType` | 对应女友角色类型 |
| `sceneName` | 场景名称 |
| `background` | 关卡背景 |
| `openingLine` | 女友开场第一句话 |
| `taskTarget` | 本关任务目标 |
| `difficulty` | 难度，1-5 |
| `initialEmotionScore` | 初始情绪值 |
| `initialTrustScore` | 初始信任值 |
| `trainingFocus` | 训练重点 |
| `riskRules` | 高危踩雷点 |
| `referenceReplies` | 参考回复方向 |

补充约定：

1. `levelKey` 是业务关卡 ID，供页面路由、seed、本地缓存和游客合并使用；
2. 数据库主键仍使用 uuid，保存训练记录时通过 `levelKey` 查询对应的 `levels.id`。

---

# 4. 关卡总览

| 角色 | characterType | 关卡数量 |
|---|---|---|
| 缺安全感型 | `insecure` | 3 |
| 高期待型 | `high_expectation` | 3 |
| 理性独立型 | `rational_independent` | 3 |
| 情绪外放型 | `emotionally_expressive` | 3 |
| 冷淡压抑型 | `cold_suppressed` | 3 |
| 合计 | - | 15 |

---

# 5. 缺安全感型 insecure

## Level 1：忙到很晚没回消息

```ts
{
  levelKey: "insecure_001",
  characterType: "insecure",
  sceneName: "忙到很晚没回消息",
  background: "你晚上一直在忙，几个小时没有回复她。她看到你后来上线了，但你还是没有主动解释。",
  openingLine: "你忙吧，不用回我了。",
  taskTarget: "让她感受到你不是故意忽略她，并愿意继续沟通。",
  difficulty: 1,
  initialEmotionScore: -60,
  initialTrustScore: 45,
  trainingFocus: ["及时回应", "承认忽略", "给确定感"],
  riskRules: [
    "不要说你想多了",
    "不要只解释自己很忙",
    "不要反问她怎么又生气",
    "不要继续冷处理"
  ],
  referenceReplies: [
    "我刚才确实忽略你了，对不起。不是你不重要，是我没有处理好回复这件事。",
    "你这样说我知道你其实很失落。我现在先认真陪你说会儿。"
  ]
}
```

---

## Level 2：临时取消约会

```ts
{
  levelKey: "insecure_002",
  characterType: "insecure",
  sceneName: "临时取消约会",
  background: "你原本答应今晚陪她吃饭，但临时因为工作取消，只简单发了一句：今天不行了，改天吧。",
  openingLine: "没事，反正你也不是第一次这样了。",
  taskTarget: "承认临时取消给她造成的失落，并给出具体补救安排。",
  difficulty: 2,
  initialEmotionScore: -65,
  initialTrustScore: 40,
  trainingFocus: ["承认失落", "避免敷衍", "具体补救"],
  riskRules: [
    "不要说工作没办法",
    "不要说改天再说",
    "不要把她的不开心说成不懂事",
    "不要只道歉不给安排"
  ],
  referenceReplies: [
    "这次是我没有提前处理好安排，让你期待落空了。不是一句改天就能带过去。",
    "我想重新约一个确定时间补回来，而不是让你一直等我。"
  ]
}
```

---

## Level 3：她看到你和朋友玩却没回她

```ts
{
  levelKey: "insecure_003",
  characterType: "insecure",
  sceneName: "和朋友玩却没回她",
  background: "你说自己很忙没时间回消息，但她看到你朋友发的动态里有你在聚会。",
  openingLine: "原来你不是没时间，只是没时间回我。",
  taskTarget: "处理信任受损，让她感受到你愿意解释并承担责任。",
  difficulty: 3,
  initialEmotionScore: -75,
  initialTrustScore: 30,
  trainingFocus: ["信任修复", "不辩解", "明确重视"],
  riskRules: [
    "不要说只是刚好拍到",
    "不要转移话题",
    "不要怪她查你动态",
    "不要说她小题大做"
  ],
  referenceReplies: [
    "你这样想是有原因的。我说忙却没有主动说明，确实会让你觉得自己被放在后面。",
    "我不想用解释把这件事糊弄过去，我应该先承认我让你没有安全感了。"
  ]
}
```

---

# 6. 高期待型 high_expectation

## Level 4：忘记纪念日

```ts
{
  levelKey: "high_expectation_001",
  characterType: "high_expectation",
  sceneName: "忘记纪念日",
  background: "今天是你们的重要纪念日，但你完全忘记了。她等了一天，最后发现你没有任何准备。",
  openingLine: "算了，说出来就没意思了。",
  taskTarget: "让她感受到你理解她在意的不是礼物，而是你有没有用心。",
  difficulty: 2,
  initialEmotionScore: -70,
  initialTrustScore: 40,
  trainingFocus: ["理解期待", "承认不用心", "补救态度"],
  riskRules: [
    "不要说不就是个日子吗",
    "不要说你想要什么直接说",
    "不要只说我补你一个礼物",
    "不要把问题归结为她要求高"
  ],
  referenceReplies: [
    "我知道你不是在意一个形式，而是在意我有没有把这天放在心上。",
    "这次是我没有提前用心准备，不是你要求太多。"
  ]
}
```

---

## Level 5：礼物很敷衍

```ts
{
  levelKey: "high_expectation_002",
  characterType: "high_expectation",
  sceneName: "礼物很敷衍",
  background: "她之前提过自己喜欢一个小众香薰，但你临时买了一个普通礼盒，还说女生应该都喜欢。",
  openingLine: "你真的有认真听过我说话吗？",
  taskTarget: "承认自己没有认真记住她的偏好，而不是用礼物价值辩解。",
  difficulty: 2,
  initialEmotionScore: -65,
  initialTrustScore: 45,
  trainingFocus: ["倾听细节", "承认敷衍", "主动补救"],
  riskRules: [
    "不要说这个也不便宜",
    "不要说女生不都喜欢这个吗",
    "不要说你怎么这么挑",
    "不要只强调自己花了钱"
  ],
  referenceReplies: [
    "你不舒服的不是这个礼物本身，而是我没有认真记住你说过的话。",
    "这次确实是我敷衍了，我应该更认真了解你喜欢什么。"
  ]
}
```

---

## Level 6：她希望你主动安排约会

```ts
{
  levelKey: "high_expectation_003",
  characterType: "high_expectation",
  sceneName: "从不主动安排约会",
  background: "每次约会都是她提议、她选地方、她安排时间。今天她又问你周末怎么安排，你回：都行，你定吧。",
  openingLine: "每次都是我定，你就不能主动一次吗？",
  taskTarget: "理解她期待的是你的主动投入，而不是简单配合。",
  difficulty: 3,
  initialEmotionScore: -60,
  initialTrustScore: 42,
  trainingFocus: ["主动性", "关系投入", "具体安排"],
  riskRules: [
    "不要说我都听你的还不好吗",
    "不要说你喜欢什么你定",
    "不要觉得配合就是用心",
    "不要把主动责任全部推给她"
  ],
  referenceReplies: [
    "你说得对，我以前总觉得听你的就是尊重你，但其实我没有主动投入。",
    "这次我来安排，时间、地点和行程我先想好，再和你确认。"
  ]
}
```

---

# 7. 理性独立型 rational_independent

## Level 7：替她做决定

```ts
{
  levelKey: "rational_independent_001",
  characterType: "rational_independent",
  sceneName: "替她做决定",
  background: "你没有提前问她，就帮她拒绝了一个朋友聚会，还觉得自己是在为她好。",
  openingLine: "你为什么不先问我，就替我决定？",
  taskTarget: "承认自己越过了边界，并表达以后会先确认她的想法。",
  difficulty: 2,
  initialEmotionScore: -55,
  initialTrustScore: 50,
  trainingFocus: ["尊重边界", "承认越界", "平等沟通"],
  riskRules: [
    "不要说我是为你好",
    "不要说这有什么区别",
    "不要用亲密关系合理化替她决定",
    "不要转移到自己很委屈"
  ],
  referenceReplies: [
    "你说得对，这件事我不该替你做决定。就算我是好意，也应该先问你。",
    "以后涉及你的安排，我会先和你确认，而不是默认我可以替你决定。"
  ]
}
```

---

## Level 8：用油腻话术糊弄问题

```ts
{
  levelKey: "rational_independent_002",
  characterType: "rational_independent",
  sceneName: "用甜言蜜语糊弄问题",
  background: "她认真指出你最近总是迟到，你没有回应问题，只说：宝贝别生气了，我最爱你了。",
  openingLine: "你能不能认真回答问题，不要每次都这样带过去？",
  taskTarget: "停止用甜言蜜语回避问题，认真回应具体行为。",
  difficulty: 2,
  initialEmotionScore: -60,
  initialTrustScore: 45,
  trainingFocus: ["认真回应", "不油腻", "解决具体问题"],
  riskRules: [
    "不要继续撒娇",
    "不要用我爱你代替道歉",
    "不要说你怎么这么理性",
    "不要把她的问题说成不懂浪漫"
  ],
  referenceReplies: [
    "你说得对，我刚才是在逃避问题。迟到这件事确实是我没有尊重你的时间。",
    "我不应该用哄你的话把事情带过去，我需要认真改。"
  ]
}
```

---

## Level 9：边界感争议

```ts
{
  levelKey: "rational_independent_003",
  characterType: "rational_independent",
  sceneName: "和异性边界感争议",
  background: "你和一个异性朋友聊天频繁，还说只是朋友。她不是要求你断绝社交，而是希望你有边界。",
  openingLine: "我不是不让你交朋友，我是在说边界感。",
  taskTarget: "理解她在意的是关系边界，而不是控制你社交。",
  difficulty: 4,
  initialEmotionScore: -70,
  initialTrustScore: 35,
  trainingFocus: ["边界感", "不反咬控制", "建立规则"],
  riskRules: [
    "不要说你就是不信任我",
    "不要说普通朋友有什么问题",
    "不要反过来说她控制欲强",
    "不要回避具体边界"
  ],
  referenceReplies: [
    "我明白你不是要控制我，而是希望我在亲密关系里有分寸。",
    "这件事我应该和你一起确认边界，而不是只用一句普通朋友带过去。"
  ]
}
```

---

# 8. 情绪外放型 emotionally_expressive

## Level 10：她情绪爆发时你讲道理

```ts
{
  levelKey: "emotionally_expressive_001",
  characterType: "emotionally_expressive",
  sceneName: "她情绪爆发时你讲道理",
  background: "你们因为一件小事吵起来。她情绪很激动，你马上开始分析谁对谁错。",
  openingLine: "我现在是想听你讲道理吗？",
  taskTarget: "先接住情绪，降低对抗感，而不是立刻争对错。",
  difficulty: 2,
  initialEmotionScore: -75,
  initialTrustScore: 45,
  trainingFocus: ["情绪降温", "不急着讲道理", "先听她说"],
  riskRules: [
    "不要说你冷静点",
    "不要说我跟你讲道理",
    "不要纠正她每个细节",
    "不要在情绪高点争输赢"
  ],
  referenceReplies: [
    "我先不跟你争对错，我知道你现在真的很生气。",
    "你先把最不舒服的点说出来，我认真听。"
  ]
}
```

---

## Level 11：她说你根本不在乎

```ts
{
  levelKey: "emotionally_expressive_002",
  characterType: "emotionally_expressive",
  sceneName: "她说你根本不在乎",
  background: "她连续表达不满，你觉得她太激动，就沉默了一会儿。她情绪更高了。",
  openingLine: "你根本就不在乎我的感受！",
  taskTarget: "在高情绪下表达重视，避免防御和沉默。",
  difficulty: 3,
  initialEmotionScore: -80,
  initialTrustScore: 38,
  trainingFocus: ["接住强情绪", "表达重视", "避免防御"],
  riskRules: [
    "不要说我怎么不在乎了",
    "不要沉默冷处理",
    "不要说你太夸张了",
    "不要反驳她的感受"
  ],
  referenceReplies: [
    "我听到你说这句话，说明你真的很委屈。刚才我沉默让你更难受了。",
    "我不是不在乎，但我刚才的反应确实没有让你感受到被在乎。"
  ]
}
```

---

## Level 12：她连续翻旧账

```ts
{
  levelKey: "emotionally_expressive_003",
  characterType: "emotionally_expressive",
  sceneName: "她连续翻旧账",
  background: "你们因为今天的事吵起来，她又提起了之前几次类似问题，你觉得她在翻旧账。",
  openingLine: "因为你每次都这样！以前也是，现在还是！",
  taskTarget: "理解旧账背后是重复失望，不要只指责她翻旧账。",
  difficulty: 4,
  initialEmotionScore: -85,
  initialTrustScore: 32,
  trainingFocus: ["重复问题识别", "不反击", "长期修复"],
  riskRules: [
    "不要说你又翻旧账",
    "不要说以前的事还提干嘛",
    "不要只处理今天这一件事",
    "不要否认她长期累积的感受"
  ],
  referenceReplies: [
    "你提以前的事，是因为这不是第一次让你失望。我不能只说今天这件事。",
    "我先承认这是重复问题，不是你在无理取闹。"
  ]
}
```

---

# 9. 冷淡压抑型 cold_suppressed

## Level 13：她突然变冷淡

```ts
{
  levelKey: "cold_suppressed_001",
  characterType: "cold_suppressed",
  sceneName: "她突然变冷淡",
  background: "最近两天她回复明显变少，不主动分享，也不再像以前一样热情。你问她怎么了，她只说没事。",
  openingLine: "没事。",
  taskTarget: "识别沉默背后的失望，不逼问，但主动表达愿意修复。",
  difficulty: 2,
  initialEmotionScore: -55,
  initialTrustScore: 42,
  trainingFocus: ["识别沉默", "温和询问", "主动修复"],
  riskRules: [
    "不要说你不说我怎么知道",
    "不要逼她马上解释",
    "不要把没事当真没事",
    "不要表现得不耐烦"
  ],
  referenceReplies: [
    "我感觉你这两天话少了很多，可能不是没事。我不逼你马上说，但我想认真知道是不是我哪里让你失望了。",
    "如果你现在不想说也可以，我会在这儿，不会当作什么都没发生。"
  ]
}
```

---

## Level 14：她说之前说过很多次了

```ts
{
  levelKey: "cold_suppressed_002",
  characterType: "cold_suppressed",
  sceneName: "她说之前说过很多次了",
  background: "你终于意识到她不开心，问她怎么了。她平静地说，这些问题她以前已经说过很多次。",
  openingLine: "我之前说过很多次了，只是你没当回事。",
  taskTarget: "承认长期忽略，而不是要求她再解释一遍。",
  difficulty: 3,
  initialEmotionScore: -70,
  initialTrustScore: 30,
  trainingFocus: ["承认长期忽略", "不要求重复解释", "持续改变"],
  riskRules: [
    "不要说那你再说一次",
    "不要说我真的不知道",
    "不要马上要求她给机会",
    "不要只保证以后会改"
  ],
  referenceReplies: [
    "你说得对，如果你已经说过很多次，那问题不是你没表达，是我没有真正重视。",
    "我不该再要求你重复解释，我需要先想清楚之前哪些地方一直没改。"
  ]
}
```

---

## Level 15：分手边缘的冷静表达

```ts
{
  levelKey: "cold_suppressed_003",
  characterType: "cold_suppressed",
  sceneName: "分手边缘的冷静表达",
  background: "她没有大吵大闹，只是很平静地说最近很累，觉得这段关系好像没有继续的必要。",
  openingLine: "我有点累了，可能我们真的不太合适。",
  taskTarget: "在高风险关系节点中，避免慌乱挽留，真诚承认问题并表达愿意改变。",
  difficulty: 5,
  initialEmotionScore: -90,
  initialTrustScore: 20,
  trainingFocus: ["高风险修复", "不情绪绑架", "真诚承认", "尊重对方"],
  riskRules: [
    "不要说你不能离开我",
    "不要情绪绑架",
    "不要马上承诺一堆做不到的事",
    "不要指责她太冷血",
    "不要用过去回忆强行挽留"
  ],
  referenceReplies: [
    "听你这么平静地说，我知道你可能已经失望很久了。我不会用情绪逼你留下。",
    "如果还有机会，我想先认真承认我长期没有做好的地方，而不是只说我会改。"
  ]
}
```

---

# 10. 种子数据使用建议

确认本文件后，可转成：

```txt
src/seed/levels.ts
```

建议结构：

```ts
export const levelSeeds = [
  {
    levelKey: "insecure_001",
    characterType: "insecure",
    sceneName: "忙到很晚没回消息",
    background: "...",
    openingLine: "...",
    taskTarget: "...",
    difficulty: 1,
    initialEmotionScore: -60,
    initialTrustScore: 45,
    trainingFocus: [],
    riskRules: [],
    referenceReplies: [],
  },
];
```

---

# 11. 给 Codex 的实现提醒

执行关卡相关开发时，请遵守：

1. 先阅读 `AGENTS.md`、`docs/SPEC.md`、`docs/CHARACTERS.md`、`docs/LEVELS.md`；
2. MVP 阶段一共 15 个关卡；
3. 每个角色必须有 3 个关卡；
4. 关卡数据先作为 seed 数据；
5. 不要临场生成关卡内容；
6. 不要新增 SPEC 之外的角色；
7. 不要新增无限聊天关卡；
8. 每个关卡必须有明确任务目标；
9. 每个关卡必须有踩雷规则；
10. 每个关卡必须能服务三轮对话训练。

---

# 12. 验收标准

关卡种子数据至少满足：

1. 共 15 个关卡；
2. 覆盖 5 个女友角色；
3. 每个角色 3 个关卡；
4. 每个关卡有清晰背景；
5. 每个关卡有女友开场句；
6. 每个关卡有明确任务目标；
7. 每个关卡有初始情绪值；
8. 每个关卡有初始信任值；
9. 每个关卡有踩雷规则；
10. 每个关卡有参考回复方向；
11. 关卡难度有基本区分；
12. 可直接转成 `src/seed/levels.ts`。
