# ROADMAP

## 1. Current Stage Status

As of 2026-05-23:

| Stage | Status | Summary |
|---|---|---|
| Stage 1 | Done | 页面骨架 + Mock 流程 |
| Stage 2 | Done | 角色卡 + 15 个关卡 |
| Stage 3 | Done | AI Schema + Mock Provider |
| Stage 4 | Done | 真实 AI Provider |
| Stage 4.5 | Done | AI latency + loading improvements |
| Stage 5 | Done | Neon + Drizzle database foundation |
| Stage 6A | Done | BetterAuth + Google login |
| Stage 6B | Done | logged-in training save + history |
| Stage 7 | Not Started | 游客训练结果登录后合并 |
| Stage 8 | Not Started | 救急分析保存 |

## 2. Current System Boundary

当前已完成能力：

* 真实 AI 可用
* Google 登录可用
* 登录用户训练保存可用
* `/history` 当前用户历史可用

当前未做：

* 游客合并未做
* emergency 保存未做
* `user_progress` 统计未做
* 付费、管理员、复杂权限未做

## 3. Hard Rules

当前必须持续遵守：

* 前端不能传 `userId`
* `userId` 必须来自 BetterAuth `session.user.id`
* `.env.local` 不得提交
* Stage 7 之前不得做游客合并
* Stage 8 之前不得保存 `emergency_analyses`

## 4. Data Chain

当前数据链路：

`schema -> migration -> migrate -> seed -> repository -> API/server page -> UI`

解释：

* schema：表结构图纸
* migration：SQL 施工文件
* migrate：真正改 Neon
* seed：写初始数据
* repository：数据库读写封装
* API/server page：业务入口
* UI：最终展示

## 5. Next Stages

下一阶段：

* Stage 7：游客训练结果登录后合并
* Stage 8：救急分析保存

进入 Stage 7 前必须先做设计评审。

在 Stage 8 之前不得保存 `emergency_analyses`。
