# ROADMAP

## 1. Current Stage Status

As of 2026-05-23:

| Stage | Status | Summary |
|---|---|---|
| Stage 1 | Done | 页面骨架 + Mock 流程 |
| Stage 2 | Done | 角色卡 + 15 个关卡 |
| Stage 3 | Done | AI Schema + Mock Provider |
| Stage 4 | Done | 真实 AI Provider |
| Stage 4.5 | Done | AI 响应速度与 loading 优化 |
| Stage 5 | Done | Neon + Drizzle 数据库基础层 |
| Stage 6A | Done | BetterAuth + Google 登录 |
| Stage 6B | Done | 登录用户训练保存 + history |
| Stage 7 | Not Started | 游客训练结果登录后合并 |
| Stage 8 | Not Started | 救急模式保存 |

## 2. Current System Boundary

当前系统已经支持：

* 角色选择
* 关卡选择
* 三轮训练
* Step 1：Girlfriend Response Agent
* Step 2：Judge Scoring Agent
* 最终复盘
* Google 登录
* 登录用户训练结果保存
* `/history` 按当前登录用户读取训练历史

当前系统明确还不支持：

* 游客训练结果登录后自动合并
* 救急模式保存到数据库
* `user_progress` 统计更新
* 任何自动代发消息
* 社区、排行榜、多人互动、会员、支付

## 3. Hard Rules

当前必须持续遵守：

* 前端不能传 `userId`
* `userId` 必须来自 BetterAuth `session.user.id`
* `/history` 必须只按当前 session 查询
* `.env.local` 不得提交
* 不得提前做游客合并
* emergency 保存留到 Stage 8

## 4. Database Scope

当前数据库相关范围：

* 已落库 BetterAuth 认证表
* 已落库业务表：
  * `levels`
  * `training_sessions`
  * `dialogue_turns`
  * `score_results`
  * `user_progress`
  * `emergency_analyses`
* Stage 6B 已使用：
  * `training_sessions`
  * `dialogue_turns`
  * `score_results`

当前明确不做：

* 不提前写 `emergency_analyses`
* 不提前更新 `user_progress`
* 不提前做游客合并写库

## 5. Stage 4-6 Stability Notes

Stage 4 到 Stage 6 的实现顺序已经验证有效：

1. 先把 AI 输出 Schema 和 fallback 打稳
2. 再接真实 AI Provider
3. 再处理 loading 和响应速度
4. 再接数据库基础层
5. 最后接 BetterAuth 和正式保存

这个顺序后续不要反过来。尤其不要在登录、保存、游客合并还没定清楚前改动数据库边界。

## 6. Next Recommended Stage

下一阶段建议：

* Stage 7：游客训练结果登录后合并

但进入 Stage 7 前，必须先做设计评审。

设计评审至少要明确：

1. 游客结果在 `localStorage` 的结构
2. 合并触发入口和时机
3. 幂等键设计
4. 游客结果与正式 `training_sessions.id` 的映射关系
5. 合并失败后的回滚和重试策略

## 7. Current Non-Goals

在 Stage 7 之前不要主动实现：

* 游客训练补写数据库
* 游客自动合并
* 救急模式保存
* `user_progress` 聚合统计
* 任何 Stage 8 之后的话题扩展
