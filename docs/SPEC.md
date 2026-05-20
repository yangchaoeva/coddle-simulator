# SPEC 1.0

## Core Principle

本产品不是 PUA 工具，不教操控、欺骗、冷暴力或套路话术。

产品目标是帮助用户学习：

1. 识别情绪；
2. 理解需求；
3. 真诚回应；
4. 承担责任；
5. 修复关系。

核心原则：

不是教你骗她原谅，而是教你真正听懂她。

***

# 1. Problem Statement（问题陈述）

很多恋爱中的男生在女友情绪波动、冷淡、生气、失望、说反话时，往往不知道如何回应。

他们常见的问题不是“不会说漂亮话”，而是：

1. 读不懂女友真实情绪；

2. 听不出话里的潜台词；

3. 一着急就解释、反驳、讲道理；

4. 不知道什么时候该共情、什么时候该道歉、什么时候该给行动；

5. 缺少安全的练习环境，只能在真实关系里不断试错。

因此，产品要解决的核心问题是：

> 帮助恋爱中的男生在模拟场景中训练恋爱沟通能力，让他们学会识别情绪、理解需求、真诚回应和修复关系。

产品不是单纯生成“哄女友话术”，而是训练用户形成真实沟通判断力。

核心价值观：

> **不是教你骗她原谅，而是教你真正听懂她。**

***

# 2. Proposed Solution（方案描述）

## 2.1 产品定位

产品名称暂定：

> **哄她模拟器**

外层包装是游戏化的“哄她闯关”，内核是恋爱沟通训练器。

产品主定位：

> 外层是哄她游戏，内核是恋爱沟通训练。

用户入口：

> 先救急，后训练。

也就是说，用户可能因为真实聊天问题进入产品，但产品最终要把他引导到长期训练体系中。

***

## 2.2 目标用户

核心用户：

> 正在恋爱中、情商偏低、不懂女友情绪、不知道怎么回复女朋友消息的年轻男生。

典型用户状态：

1. 女朋友生气了，不知道怎么回；

2. 女朋友说“没事”“随便你”“你忙吧”，但明显不是真的没事；

3. 自己经常越解释越糟；

4. 想学习怎么更好地理解和安抚女友；

5. 愿意通过游戏化训练提升恋爱沟通能力。

***

## 2.3 MVP 核心模式

MVP 第一版采用：

> **训练模式为主，救急模式为辅。**

首页有两个入口：

1. **模拟闯关训练**

2. **真实聊天救急**

但第一版重点打磨训练模式。

***

## 2.4 训练模式

训练模式主流程：

> 选择女友角色 → 选择沟通场景 → 开始三轮对话 → 获得评分和复盘 → 保存成长记录

训练模式的核心价值：

> 让用户在安全模拟场景中练习真实沟通，而不是在真实关系中反复试错。

***

## 2.5 救急模式

用户手动输入女朋友发来的一句话或一段话，系统即时分析：

1. 她可能的情绪；

2. 话里的潜台词；

3. 当前高危雷区；

4. 建议回复方向；

5. 示例回复。

救急模式默认不保存真实聊天内容。

只有用户主动勾选：

> 保存到我的复盘记录

系统才允许保存该内容。

***

## 2.6 救急模式转训练关卡

V1.2 将其定义为：

> **增强功能，建议预留入口，但不作为 MVP 必须完成项。**

增强逻辑：

1. 用户输入真实聊天；

2. 系统分析情绪和冲突类型；

3. 系统判断更接近 5 个女友角色中的哪一类；

4. 系统将真实冲突抽象成一个临时模拟关卡；

5. 用户可以在模拟环境中继续练习；

6. 默认不保存真实原文，只保存抽象后的训练记录。

按钮文案示例：

> 把这次问题转成模拟训练

***

# 3. 核心训练链路

每一关训练完整沟通链路：

> 识别情绪 → 判断潜台词 → 选择回应策略 → 输入回复 → 女友反馈 → 评分复盘

产品不是只让用户选标准答案，而是让用户练习：

> 我自己到底应该怎么说。

***

# 4. 女友角色设计

## 4.1 角色设计原则

MVP 第一版设计 5 个女友角色。

角色设计采用：

> 性格 + 核心关系需求结合。

每个角色都要有稳定的：

1. 性格特征；

2. 情绪表达方式；

3. 核心关系需求；

4. 高危雷区；

5. 和好机制；

6. 典型语言风格。

***

## 4.2 五个初版角色方向

角色类型

核心难题

用户要训练的能力

缺安全感型

怕被忽视、怕不被重视

及时回应、给确定感

高期待型

希望你主动懂她

主动观察、表达在意

理性独立型

不吃油腻话术

尊重边界、真诚沟通

情绪外放型

情绪来得快、容易升级

降温、接住情绪

冷淡压抑型

不吵但会慢慢失望

识别沉默、主动修复

***

## 4.3 角色卡字段

每个女友角色至少需要一张角色卡。

角色卡字段包括：

字段

说明

characterId

角色 ID

characterName

角色名称

characterType

角色类型

relationshipStage

关系阶段

personalityKeywords

性格关键词

coreNeed

核心关系需求

emotionalTriggers

情绪触发点

expressionStyle

常见表达方式

comfortMechanism

被安抚的关键机制

dangerZones

高危雷区

forbiddenBehaviors

用户不应采取的行为

languageExamples

典型语言风格示例

consistencyRules

角色一致性规则

***

## 4.4 人物一致性要求

AI 每次生成女友回复时，都必须遵守角色卡。

要求：

1. 同一个角色的语言风格前后一致；

2. 同一个角色的核心需求不随意变化；

3. 不允许突然变成另一个角色的性格；

4. 不允许女友说出教学解释；

5. 不允许女友直接说评分逻辑；

6. 不允许女友跳出角色说“系统认为你错了”。

***

# 5. 关卡设计

## 5.1 MVP 内容规模

MVP 第一版内容规模：

> 5 个女友角色 × 每个角色 3 个场景 = 15 个关卡。

***

## 5.2 单关结构

每关采用：

> 三轮对话 + 明确任务目标。

环节

内容

关卡背景

发生了什么事

任务目标

本关要修复到什么程度

初始状态

初始情绪值、初始信任值

第 1 轮

女友表达初始情绪，用户回应

第 2 轮

女友根据用户回复继续反应

第 3 轮

用户尝试修复关系

结局

和好 / 缓和 / 失败 / 关系恶化

复盘

评分、踩雷点、更优回复、沟通原则

***

## 5.3 关卡目标示例

关卡目标不能只写“哄好她”，而要具体化。

示例：

1. 让她愿意继续沟通；

2. 让她感受到你不是敷衍；

3. 避免急着解释；

4. 承认她的感受；

5. 给出具体补救行动；

6. 不逃避责任；

7. 不用油腻话术强行安抚。

***

# 6. 用户操作方式

每一关采用：

> **选择题 + 自由输入结合。**

用户可以：

1. 自己输入回复；

2. 查看参考回复选项；

3. 对比自己的表达和更优表达；

4. 获得 AI 评分和复盘。

产品重点不是让用户背标准答案，而是训练用户形成判断力。

***

# 7. 自由输入越界处理机制

## 7.1 为什么需要越界处理

因为用户可以自由输入，所以必须处理以下情况：

1. 用户乱输；

2. 用户问无关问题；

3. 用户输入攻击性内容；

4. 用户输入过短、敷衍内容；

5. 用户试图绕开关卡目标。

否则会导致：

1. 关卡剧情失控；

2. AI 角色跑偏；

3. 三轮训练结构失效；

4. 评分失去意义。

***

## 7.2 输入状态分类

用户每轮输入后，系统先进行输入有效性判断。

输入类型

示例

处理方式

正常回复

“我刚才确实忽略你了，对不起。”

进入女友响应 + 评分流程

低质量回复

“哦”“随便”“你想多了”

推进剧情，但低分并提示问题

完全越界回复

“明天股票会涨吗？”

不推进剧情，不计分，要求重新输入

攻击/侮辱性回复

“你有病吧”

可推进为严重失败，也可触发风险提醒

诱导操控类回复

“怎么让她听我的？”

拒绝操控方向，引导真诚沟通

***

## 7.3 越界反馈示例

当用户输入完全无关内容时：

> 这句话和当前沟通任务无关，本轮不会计分。请尝试回应她刚才表达的感受。

当用户输入过于敷衍时：

> 你的回复过于简短，没有回应她的情绪。本轮会继续推进，但评分会受到影响。

当用户输入攻击性内容时：

> 这类表达会加剧冲突。你可以重新组织一句更尊重对方感受的回复。

***

# 8. 评分系统

评分系统采用：

> 多维评分 + 游戏数值结合。

***

## 8.1 前端展示指标

前端可以展示：

1. 总分；

2. 等级，例如 C / B / B+ / A / S；

3. 情绪值变化；

4. 信任值变化；

5. 关系修复进度；

6. 是否通关；

7. 结局类型；

8. 本轮关键提醒。

***

## 8.2 底层评分维度

维度

说明

情绪识别

是否看懂她真正的不开心

共情表达

是否先接住情绪，而不是讲道理

责任承担

是否承认自己的问题

解释克制

是否避免过度辩解

具体行动

是否给出可执行的补救

关系修复

是否让关系向缓和方向发展

***

## 8.3 游戏数值

每关至少包含两个动态数值：

数值

说明

emotionScore

女友情绪状态，越高越缓和

trustScore

女友对用户的信任状态，越高越信任

可选扩展：

数值

说明

repairProgress

关系修复进度

riskLevel

冲突升级风险

patienceLevel

女友愿意继续沟通的程度

***

## 8.4 结局类型

建议初版支持 4 类结局：

结局

说明

和好

情绪明显缓和，信任提升明显

缓和

冲突没有完全解决，但愿意继续沟通

失败

用户没有接住情绪，沟通停滞

关系恶化

用户踩雷，导致冲突升级

***

## 8.5 评分结果示例

> 本关得分：82 分\
> 等级：B+\
> 情绪值：-60 → -15\
> 信任值：45 → 62\
> 评价：你已经识别到她是因为被忽视而失落，但你的补救行动还不够具体。下次不要只说“我以后注意”，要说清楚你准备怎么做。

***

# 9. AI 方案

## 9.1 总体方案

MVP 采用：

> 半固定剧情 + 双 Step AI 动态反馈。

固定部分：

1. 角色卡；

2. 关卡背景；

3. 任务目标；

4. 初始情绪值；

5. 初始信任值；

6. 评分规则；

7. 安全边界。

动态部分：

1. 女友每轮反应；

2. 用户回复评分；

3. 情绪值变化；

4. 信任值变化；

5. 最终复盘；

6. 更优回复建议。

产品本质是：

> **受控模拟对话系统。**

不是无限自由聊天。

***

## 9.2 双 Step AI 架构

每轮用户回复后，不让同一个 Prompt 同时完成角色扮演和评分。

采用两个步骤：

1. **Step 1：女友响应 Agent**

2. **Step 2：裁判评分 Agent**

***

## 9.3 Step 1：女友响应 Agent

### 职责

女友响应 Agent 只负责：

> 根据角色卡、关卡背景、当前轮次、当前情绪值、当前信任值和用户回复，生成女友下一句话。

### 不负责

女友响应 Agent 不负责：

1. 打分；

2. 解释教学逻辑；

3. 输出用户哪里错；

4. 计算情绪值；

5. 计算信任值；

6. 生成最终复盘。

### 输入

1. 角色卡；

2. 关卡背景；

3. 当前轮次；

4. 当前情绪值；

5. 当前信任值；

6. 用户本轮回复；

7. 历史对话摘要；

8. 角色一致性规则。

### 输出结构

```
{
  "girlfriendReply": "你每次都说下次，可是我真的不知道还能不能信你。",
  "tone": "失望但愿意继续沟通",
  "relationshipState": "softening"
}
```

***

## 9.4 Step 2：裁判评分 Agent

### 职责

裁判评分 Agent 负责：

1. 判断用户回复是否有效；

2. 判断用户是否识别情绪；

3. 判断是否踩雷；

4. 更新情绪值变化；

5. 更新信任值变化；

6. 给出本轮反馈；

7. 为最终复盘积累数据。

### 输入

1. 角色卡；

2. 关卡目标；

3. 用户回复；

4. 女友回复；

5. 当前轮次；

6. 前一轮情绪值；

7. 前一轮信任值；

8. 评分规则；

9. 风险规则。

### 输出结构

```
{
  "emotionChange": 15,
  "trustChange": 10,
  "riskFlags": ["补救行动不够具体"],
  "skillScores": {
    "emotionRecognition": 80,
    "empathy": 85,
    "responsibility": 75,
    "explanationControl": 70,
    "actionClarity": 65,
    "relationshipRepair": 78
  },
  "roundFeedback": "你已经承认了她的失落感，但还需要给出更具体的补救行动。"
}
```

***

## 9.5 最终复盘 Agent

第三轮完成后，系统生成最终复盘。

最终复盘可以由裁判评分 Agent 承担，也可以作为单独 Step。

输出结构：

```
{
  "totalScore": 82,
  "grade": "B+",
  "endingType": "softened",
  "emotionRecognition": 80,
  "empathy": 85,
  "responsibility": 75,
  "explanationControl": 70,
  "actionClarity": 65,
  "relationshipRepair": 78,
  "summary": "你基本接住了她的情绪，但具体行动不足。",
  "keyProblems": ["补救行动不够具体", "第二轮解释偏多"],
  "betterReply": "我刚刚确实忽略了你的感受，对不起。我现在先认真听你说。",
  "lesson": "先承认感受，再解释原因，最后给出行动。"
}
```

***

# 10. AI 结构化输出与兜底机制

## 10.1 核心原则

AI 输出不能直接进入前端。

所有 AI 输出必须经过：

> 模型结构化输出 → Schema 校验 → 业务兜底 → 前端消费

***

## 10.2 技术要求

建议使用：

1. Vercel AI SDK；

2. Zod Schema；

3. 结构化输出；

4. try-catch 兜底；

5. 服务端日志记录。

不允许：

```
JSON.parse(aiResponse)
```

直接裸解析后返回给前端。

***

## 10.3 Schema 校验要求

每一种 AI 输出都必须有独立 Schema：

1. `GirlfriendReplySchema`

2. `RoundScoreSchema`

3. `FinalReviewSchema`

4. `EmergencyAnalysisSchema`

5. `InputValidationSchema`

如果 AI 输出缺字段、字段类型错误、枚举值错误，后端必须兜底处理。

***

## 10.4 AI 失败兜底对象

### 女友响应失败兜底

```
{
  "girlfriendReply": "我现在有点乱，不知道该怎么接你的话。",
  "tone": "不确定",
  "relationshipState": "shutting_down",
  "fallback": true,
  "errorType": "AI_OUTPUT_INVALID"
}
```

### 本轮评分失败兜底

```
{
  "emotionChange": 0,
  "trustChange": 0,
  "riskFlags": ["系统评分暂时不稳定"],
  "skillScores": {
    "emotionRecognition": 60,
    "empathy": 60,
    "responsibility": 60,
    "explanationControl": 60,
    "actionClarity": 60,
    "relationshipRepair": 60
  },
  "roundFeedback": "这次回复可以继续优化，建议先承认对方感受，再表达自己的想法。",
  "fallback": true,
  "errorType": "SCHEMA_VALIDATION_FAILED"
}
```

### 最终复盘失败兜底

```
{
  "totalScore": 60,
  "grade": "C",
  "endingType": "failed",
  "emotionRecognition": 60,
  "empathy": 60,
  "responsibility": 60,
  "explanationControl": 60,
  "actionClarity": 60,
  "relationshipRepair": 60,
  "summary": "这次训练已完成，但系统暂时无法生成完整复盘。",
  "keyProblems": ["系统复盘暂时不稳定"],
  "betterReply": "我刚刚没有很好地理解你的感受，可以再给我一次机会认真听你说吗？",
  "lesson": "沟通中应先理解情绪，再解释原因，最后给出行动。",
  "fallback": true,
  "errorType": "FINAL_REVIEW_FAILED"
}
```

***

# 11. 账号、游客与历史记录

## 11.1 账号方案

账号采用：

> 可选账号。

用户不登录也可以体验部分关卡。

登录后可以保存：

1. 训练进度；

2. 关卡得分；

3. 角色解锁状态；

4. 历史复盘；

5. 能力维度变化；

6. 成长报告基础数据。

认证系统使用：

> **BetterAuth**

***

## 11.2 游客权限

游客可以：

1. 体验部分关卡；

2. 完成一关训练；

3. 查看当次评分和复盘；

4. 在评分页点击“登录保存”。

游客不能：

1. 跨设备保存记录；

2. 查看长期成长报告；

3. 保存完整历史记录；

4. 解锁全部长期训练数据。

***

## 11.3 登录用户权限

登录用户可以：

1. 保存训练记录；

2. 查看历史关卡；

3. 查看能力成长；

4. 查看角色进度；

5. 保存主动授权的救急分析；

6. 删除自己保存的救急记录。

***

# 12. 游客数据合并机制

## 12.1 设计原则

游客数据默认不写入数据库。

游客训练数据临时保存在：

> localStorage

登录后，用户可主动保存刚才的训练记录。

***

## 12.2 游客本地数据结构

```
{
  "guestSessionId": "uuid",
  "levelKey": "insecure_001",
  "characterType": "insecure",
  "turns": [],
  "scoreResult": {},
  "createdAt": "2026-05-19T20:00:00+08:00"
}
```

***

## 12.3 登录后合并流程

用户路径：

> 游客完成关卡 → 点击登录保存 → BetterAuth 登录成功 → 返回评分页 → 调用 mergeGuestProgress → 写入数据库 → 清除 localStorage

后端接口：

```
mergeGuestProgress()
```

接口职责：

1. 校验当前用户登录态；

2. 接收游客本地训练数据；

3. 校验数据结构；

4. 写入 training\_sessions；

5. 写入 dialogue\_turns；

6. 写入 score\_results；

7. 返回保存成功状态；

8. 前端清除 localStorage。

***

## 12.4 合并成功提示

保存成功后提示：

> 已保存到你的训练记录。

可跳转：

1. 训练报告页；

2. 历史记录页；

3. 下一关推荐页。

***

# 13. 隐私设计

## 13.1 隐私原则

> 默认不保存真实聊天，用户主动选择才保存。

***

## 13.2 训练模式数据

训练模式可以保存：

1. 关卡 ID；

2. 用户回复；

3. AI 女友反馈；

4. AI 评分；

5. 复盘结果；

6. 维度分数；

7. 通关状态。

***

## 13.3 救急模式数据

救急模式默认只即时分析，不保存用户输入的真实聊天内容。

只有当用户主动勾选：

> 保存到我的复盘记录

系统才保存该内容。

***

## 13.4 救急数据保存字段

保存时需要记录：

1. 用户 ID；

2. 用户输入内容；

3. AI 分析结果；

4. 用户是否主动授权保存；

5. 保存时间；

6. 删除状态；

7. 是否转为训练关卡。

***

# 14. Technical Constraints（技术约束）

## 14.1 技术栈

模块

技术选择

前端框架

Next.js

UI

React + Tailwind

数据库

Neon PostgreSQL

ORM

Drizzle

认证

BetterAuth

AI 调用

可替换 AI Provider

AI 输出校验

Zod Schema

AI SDK

建议 Vercel AI SDK

部署

Vercel 优先

***

## 14.2 BetterAuth 认证约束

BetterAuth 至少需要支持：

1. 用户注册；

2. 用户登录；

3. 用户退出；

4. 登录态保持；

5. 服务端获取当前用户；

6. 保护需要登录的接口；

7. 将训练记录绑定到 userId；

8. 游客体验部分关卡；

9. 登录后保存完整训练进度。

BetterAuth 相关表建议包含：

1. user；

2. session；

3. account；

4. verification。

具体表名以 BetterAuth + Drizzle 实际配置为准。

***

## 14.3 AI Provider 设计

AI 调用层需要设计成可替换。

不要在业务代码中直接绑定某一个模型，而是抽象成统一接口，例如：

```
generateGirlfriendReply()
scoreUserReply()
generateFinalReview()
analyzeEmergencyMessage()
validateUserInput()
```

第一版可以先接一个模型，但结构上要允许未来切换或扩展到其他模型。

***

## 14.4 内容管理方式

采用混合方案：

1. 核心角色卡写在代码中；

2. 评分规则写在代码中；

3. AI Prompt 框架写在代码中；

4. 关卡内容存入 Neon 数据库；

5. 第一版暂不做内容管理后台；

6. 后续再扩展后台管理。

这样可以兼顾：

1. 角色一致性；

2. 评分稳定性；

3. 关卡扩展性。

***

# 15. 数据库设计建议

## 15.1 核心业务表

初版建议支持：

1. BetterAuth 认证相关表；

2. levels；

3. training\_sessions；

4. dialogue\_turns；

5. score\_results；

6. user\_progress；

7. emergency\_analyses。

***

## 15.2 levels 关卡表

```
export const levels = pgTable("levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  levelKey: varchar("level_key", { length: 50 }).notNull().unique(),
  characterType: varchar("character_type", { length: 50 }).notNull(),
  sceneName: text("scene_name").notNull(),
  background: text("background").notNull(),
  openingLine: text("opening_line").notNull(),
  taskTarget: text("task_target").notNull(),
  difficulty: integer("difficulty").default(1).notNull(),
  initialEmotionScore: integer("initial_emotion_score").default(-50).notNull(),
  initialTrustScore: integer("initial_trust_score").default(50).notNull(),
  trainingFocus: jsonb("training_focus"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

***

## 15.3 training\_sessions 训练会话表

MVP 推荐：

> 游客数据存在 localStorage，数据库只存登录用户数据。

因此 `userId` 建议不为空。

```
export const trainingSessions = pgTable("training_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  levelId: uuid("level_id").references(() => levels.id).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  finalScore: integer("final_score"),
  grade: varchar("grade", { length: 10 }),
  endingType: varchar("ending_type", { length: 30 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});
```

如果后续决定游客数据也写数据库，可增加：

```
guestId: text("guest_id")
```

并允许：

```
userId: text("user_id")
```

为空。

***

## 15.4 dialogue\_turns 对话轮次表

```
export const dialogueTurns = pgTable("dialogue_turns", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => trainingSessions.id).notNull(),
  roundNumber: integer("round_number").notNull(),

  userRawInput: text("user_raw_input").notNull(),
  girlfriendResponse: text("girlfriend_response").notNull(),

  emotionBefore: integer("emotion_before").notNull(),
  emotionChange: integer("emotion_change").notNull(),
  emotionAfter: integer("emotion_after").notNull(),

  trustBefore: integer("trust_before").notNull(),
  trustChange: integer("trust_change").notNull(),
  trustAfter: integer("trust_after").notNull(),

  riskFlags: jsonb("risk_flags"),
  roundFeedback: text("round_feedback"),

  inputStatus: varchar("input_status", { length: 30 }).default("valid").notNull(),
  aiFallbackUsed: boolean("ai_fallback_used").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

***

## 15.5 score\_results 最终评分表

```
export const scoreResults = pgTable("score_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => trainingSessions.id).notNull(),

  totalScore: integer("total_score").notNull(),
  grade: varchar("grade", { length: 10 }).notNull(),
  endingType: varchar("ending_type", { length: 30 }).notNull(),

  emotionRecognition: integer("emotion_recognition").notNull(),
  empathy: integer("empathy").notNull(),
  responsibility: integer("responsibility").notNull(),
  explanationControl: integer("explanation_control").notNull(),
  actionClarity: integer("action_clarity").notNull(),
  relationshipRepair: integer("relationship_repair").notNull(),

  summary: text("summary").notNull(),
  keyProblems: jsonb("key_problems"),
  betterReply: text("better_reply"),
  lesson: text("lesson"),

  aiFallbackUsed: boolean("ai_fallback_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

***

## 15.6 user\_progress 用户进度表

```
export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  characterType: varchar("character_type", { length: 50 }).notNull(),

  completedLevelCount: integer("completed_level_count").default(0).notNull(),
  averageScore: integer("average_score").default(0).notNull(),
  bestScore: integer("best_score").default(0).notNull(),

  emotionRecognitionAvg: integer("emotion_recognition_avg").default(0).notNull(),
  empathyAvg: integer("empathy_avg").default(0).notNull(),
  responsibilityAvg: integer("responsibility_avg").default(0).notNull(),
  explanationControlAvg: integer("explanation_control_avg").default(0).notNull(),
  actionClarityAvg: integer("action_clarity_avg").default(0).notNull(),
  relationshipRepairAvg: integer("relationship_repair_avg").default(0).notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

***

## 15.7 emergency\_analyses 救急分析表

只在用户主动保存时写入。

```
export const emergencyAnalyses = pgTable("emergency_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),

  userInput: text("user_input").notNull(),
  emotionAnalysis: text("emotion_analysis").notNull(),
  hiddenNeed: text("hidden_need"),
  riskWarnings: jsonb("risk_warnings"),
  replyStrategy: text("reply_strategy"),
  suggestedReply: text("suggested_reply"),
  doNotSay: jsonb("do_not_say"),
  matchedCharacterType: varchar("matched_character_type", { length: 50 }),

  userConsentedToSave: boolean("user_consented_to_save").default(false).notNull(),
  convertedToTraining: boolean("converted_to_training").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

***

# 16. 页面与功能范围

## 16.1 MVP 必做页面

页面

功能

首页

介绍产品，进入训练 / 救急

角色选择页

展示 5 个女友角色

关卡选择页

展示当前角色下的 3 个场景

训练对话页

三轮对话，自由输入 + 参考选项

评分复盘页

总分、等级、数值变化、复盘建议

登录 / 注册页

BetterAuth 认证

历史记录页

登录用户查看训练记录

救急分析页

输入真实聊天，获得即时分析

***

## 16.2 MVP 可选页面

页面

说明

成长报告页

展示各能力维度变化

临时训练关卡页

由救急模式转化而来

设置页

隐私设置、删除记录

***

# 17. Non-goals（明确不做的事）

MVP 第一版只做单人训练闭环，明确不做以下内容：

1. 不做付费会员；

2. 不做社区；

3. 不做排行榜；

4. 不做用户 PK；

5. 不做多人互动；

6. 不做自动代发消息；

7. 不做微信聊天记录导入；

8. 不做截图 OCR 识别；

9. 不做复杂内容管理后台；

10. 不做无限自由聊天；

11. 不做 PUA、操控、冷暴力、套路话术；

12. 不做心理咨询或亲密关系诊断替代；

13. 不承诺帮助用户“百分百哄好女友”；

14. 不默认保存真实聊天；

15. 不在 MVP 阶段做复杂权限系统；

16. 不在 MVP 阶段做复杂社交账号矩阵登录；

17. 不做多模型并行调度；

18. 不做复杂商业化系统。

***

# 18. Success Criteria（成功标准）

MVP 成功不以“页面能跑”为标准，而以以下综合指标判断。

***

## 18.1 流程成功

用户能够顺利完成完整训练流程：

> 选择角色 → 选择关卡 → 三轮对话 → 获得评分 → 查看复盘 → 登录保存或进入下一关

***

## 18.2 训练价值成功

用户完成训练后认为：

1. 我更理解她为什么生气；

2. 我知道刚才哪里回复错了；

3. 我知道下次应该怎么说；

4. 复盘不是空话，而是指出了具体问题。

***

## 18.3 游戏继续性成功

用户完成一关后愿意：

1. 继续挑战下一关；

2. 尝试另一个女友角色；

3. 登录保存训练记录；

4. 查看自己的能力成长。

***

## 18.4 AI 质量成功

AI 反馈需要满足：

1. 女友反应不明显跑偏；

2. 角色语言风格前后一致；

3. 评分结果能指出具体问题；

4. 不只说“多共情”，而要说明哪里没有共情；

5. 不输出操控、PUA、欺骗式建议；

6. 不鼓励用户逃避责任；

7. AI 输出结构稳定，不导致前端崩溃；

8. AI 失败时有兜底，不中断游戏流程。

***

## 18.5 认证与保存成功

BetterAuth 接入后，MVP 至少满足：

1. 用户可以注册 / 登录 / 退出；

2. 登录状态刷新页面后仍然保持；

3. 未登录用户可体验部分内容；

4. 登录用户可以保存训练记录；

5. 用户只能查看自己的训练记录；

6. 游客完成训练后可以登录保存；

7. 登录后游客数据可以合并；

8. 救急模式真实聊天默认不保存；

9. 用户主动确认后，才保存救急分析记录。

***

## 18.6 MVP 验收标准

验收项

标准

完整流程

用户能完成至少 1 个完整关卡

三轮机制

每关可以完成 3 轮对话

角色一致性

同一角色在 3 轮对话中性格稳定

自由输入

用户可以自己输入回复

越界处理

无关输入不会推进剧情

评分可解释

每次评分都能指出具体优点和问题

训练闭环

用户能看到更优回复和沟通原则

AI 结构化输出

AI 返回内容经过 Schema 校验

失败兜底

AI 输出异常时页面不崩溃

登录保存

BetterAuth 登录用户可以保存训练记录

游客合并

游客训练后登录可保存当次记录

隐私合规

真实聊天默认不保存，保存前需用户主动确认

***

# 19. MVP 第一版范围总结

第一版只聚焦一个核心闭环：

> **角色选择 → 关卡选择 → 三轮对话 → AI 动态反馈 → 多维评分 → 复盘建议 → 登录保存成长记录**

技术实现保持轻量但可扩展：

> **Next.js + React + Tailwind + Neon PostgreSQL + Drizzle + BetterAuth + Vercel AI SDK + Zod + 可替换 AI Provider**

V1.2 的关键工程原则：

> AI 输出必须可校验，角色扮演和评分必须分离，游客体验不能在登录时丢失，真实聊天默认不能保存。

一句话定义：

> 《哄她模拟器》是一个面向恋爱中男生的网页版沟通训练产品，用游戏化闯关方式，帮助用户在安全模拟场景中练习识别女友情绪、真诚回应和修复关系。
