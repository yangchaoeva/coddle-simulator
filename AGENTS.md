<br />

## 1. 项目说明

本项目是「哄她模拟器」网页版 MVP。

它是一个恋爱沟通训练产品，通过游戏化三轮对话关卡，帮助恋爱中的男生练习：

* 识别情绪
* 理解潜台词
* 真诚回应
* 承担责任
* 修复关系

核心原则：

> 不是教你骗她原谅，而是教你真正听懂她。

本项目不是 PUA 工具，不是情感操控工具，不是万能话术生成器。

***

## 2. 开发前必须阅读

开发前必须先阅读：

1. `docs/SPEC.md`
2. `AGENTS.md`

如果任务、代码实现和 `docs/SPEC.md` 冲突，优先遵守 `docs/SPEC.md`。

如果需求不清楚，不要自行扩展功能，应先说明问题并给出建议。

***

## 3. 技术栈

本项目 MVP 使用：

* Next.js
* React
* TypeScript
* Tailwind CSS
* Neon PostgreSQL
* Drizzle ORM
* BetterAuth
* Vercel AI SDK
* Zod

如无明确要求，不要替换技术栈。

***

## 4. MVP 核心范围

MVP 只做单人训练闭环：

1. 角色选择
2. 关卡选择
3. 三轮对话训练
4. AI 女友反馈
5. AI 裁判评分
6. 最终复盘
7. 登录后保存训练记录
8. 救急模式即时分析

不要主动扩展 SPEC 之外的功能。

***

## 5. 产品红线

必须遵守：

* 不教 PUA、操控、欺骗、冷暴力或套路话术
* 不鼓励用户逃避责任
* 不承诺百分百哄好女友
* 不替代心理咨询、婚恋咨询或亲密关系诊断
* 不自动代发消息给真实联系人
* 不默认保存真实聊天内容
* 只有用户主动确认保存时，才允许保存救急模式中的真实聊天内容

***

## 6. MVP 明确不做

除非用户明确要求，MVP 不要实现：

* 无限自由聊天
* 自动代发消息
* 微信聊天记录导入
* 截图 OCR
* 社区
* 排行榜
* 用户 PK
* 多人互动
* 付费会员
* 积分商城
* 分销邀请
* 复杂管理后台
* 多模型复杂调度
* SPEC 之外的新功能

***

## 7. AI 架构规则

必须采用双 Step AI 架构：

### Step 1：Girlfriend Response Agent

只负责根据角色卡、关卡背景、当前轮次、情绪值、信任值和用户回复，生成女友下一句回复。

不要让它负责评分、教学解释或分数计算。

### Step 2：Judge Scoring Agent

负责判断用户回复质量，并输出：

* emotionChange
* trustChange
* riskFlags
* skillScores
* roundFeedback

角色扮演和评分必须分离。

***

## 8. AI 输出规则

所有 AI 输出必须经过 Zod Schema 校验。

禁止直接：

```ts
JSON.parse(aiResponse)
```

***

## 9. Current Stage Status (2026-05-23)

已完成：

* Stage 1：页面骨架 + Mock 流程
* Stage 2：角色卡 + 15 个关卡
* Stage 3：AI Schema + Mock Provider
* Stage 4：真实 AI Provider
* Stage 4.5：AI 响应速度与 loading 优化
* Stage 5：Neon + Drizzle 数据库基础层
* Stage 6A：BetterAuth + Google 登录
* Stage 6B：登录用户训练保存 + history

未完成：

* Stage 7：游客训练结果登录后合并
* Stage 8：救急模式保存

## 10. Current Capability Boundary

当前系统已经支持：

* 三轮训练闭环
* Step 1 女友回复 Agent
* Step 2 裁判评分 Agent
* 最终复盘
* Google 登录
* 登录用户训练结果写入 `training_sessions`、`dialogue_turns`、`score_results`
* `/history` 按当前登录用户读取训练历史

当前系统仍然不支持：

* 游客训练结果登录后自动合并
* 救急模式保存到数据库
* `user_progress` 统计更新
* 社区、排行榜、多人互动、会员、支付

## 11. Hard Rules

当前必须继续遵守：

* 前端不能传 `userId`
* `userId` 必须只来自 BetterAuth `session.user.id`
* `/history` 必须只按当前 session 查询
* `.env.local` 不得提交
* 不得提前做游客合并
* `emergency_analyses` 的正式保存留到 Stage 8
* 未登录用户训练结果仍只本地展示，不写数据库

## 12. Next Stage Gate

下一阶段建议是 Stage 7：游客训练结果登录后合并。

进入 Stage 7 前必须先做设计评审，至少明确：

1. `localStorage` 数据结构
2. 合并触发时机
3. 幂等策略
4. 游客结果与正式 `sessionId` 的映射方式
5. 合并失败后的回滚与重试策略

***

## 13. Additional Hard Rules (Docs / Stability Review)

����������أ�

1. ǰ�˲��ô� `userId`��
2. ��ʽд��� `userId` �������� BetterAuth `session.user.id`��
3. `.env.local`��`DATABASE_URL`��`GOOGLE_CLIENT_SECRET`��`BETTER_AUTH_SECRET`��`ARK_API_KEY` ���ö�ȡ��������ύ��
4. ������ǰ���οͺϲ���
5. ������ǰ�� `emergency_analyses` ���档
6. ���ݿ����̱������أ�
   `schema -> db:generate -> ��� migration -> db:migrate -> seed`
7. `db:migrate`��`db:push`��`db:seed` ������û�ȷ�Ϻ����ִ�С�
8. OAuth ���Բ���äĿ�ع��������Ȱ���·��λ��

***

## 14. Skill Summary

��ǰ��Ŀ�Ѿ���������¿ɸ��� Skill��

1. �׶�ʽ AI ����������ȼƻ�����ִ�С�����顢�����ա����ύ��
2. Codex ִ�н����飺����ļ���Χ��Խ�硢secret��Σ�����tsc/build���˹����ա�
3. ���ݿ�Ǩ�ư�ȫ���ϸ����� `schema -> db:generate -> ��� migration -> db:migrate -> seed`��
4. OAuth / Google ��¼���ԣ��Ȳ� Google Console���ٲ� callback �������ٲ��ն���ʵ����� Node ����������
5. ��֤���û����ݰ�ȫ��ǰ�˲��ô� `userId`����ʽ�û�д��������� BetterAuth `session.user.id`��
6. AI Provider �ȶ����룺�� Schema���� Mock���� Real Provider���ұ��뱣�� fallback��
