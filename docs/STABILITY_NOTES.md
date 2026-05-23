# STABILITY NOTES

## 1. Current Baseline

当前项目已完成：

* Stage 1：页面骨架 + Mock
* Stage 2：角色与关卡
* Stage 3：AI Schema + Mock Provider
* Stage 4：真实 AI Provider
* Stage 4.5：AI loading + latency
* Stage 5：Neon + Drizzle
* Stage 6A：BetterAuth + Google 登录
* Stage 6B：登录用户训练保存 + `/history`
* Stage 7.0：结果页按 `resultId` 精确定位
* Stage 7A：游客结果登录后手动保存
* Stage 7B：游客保存状态与体验优化
* Stage 8A：救急分析保存
* Stage 8B：救急分析历史查看

## 2. 文档分工

* `AGENTS.md`：执行规则
* `SKILLS.md`：方法库
* `DEBUG.md`：排错手册
* `ARCHITECTURE.md`：架构决策记录
* `STABILITY_NOTES.md`：当前系统状态

## 3. Stage 7 当前稳定状态

已完成：

* 结果页按 `resultId` 精确定位
* 旧 `/training/[levelKey]/result` 仅作为兼容入口
* 游客结果登录后可手动保存到账号
* 保存成功后本地标记 `saved_to_account`
* 保存失败可重试
* `/history` 可看到保存后的训练记录

未完成：

* 不支持批量合并所有游客历史
* 不做自动静默合并
* 不更新 `user_progress`
* 不保存 `emergency_analyses`

## 4. Stage 8 当前稳定状态

已完成：

* `/emergency` 可生成真实 AI 救急分析
* 登录用户可手动保存救急分析
* 救急分析写入 `emergency_analyses`
* `/emergency/history` 可查看当前用户自己的救急历史
* 未登录用户可使用救急分析，但不会自动写库
* `/history` 仍只保留训练历史，没有混合救急记录

未完成：

* 不支持删除救急记录
* 不支持编辑救急记录
* 不支持搜索、筛选、标签
* 不支持救急分析详情页
* 不更新 `user_progress`
* 不做管理员、付费

## 5. 稳定交付模式

当前已验证有效的交付顺序：

1. 先计划
2. 再执行
3. 再审查
4. 再验收
5. 再提交

分工建议：

* Codex：执行
* ChatGPT：审查
* 用户：决策

## 6. 当前非目标

当前仍未做：

* 救急分析删除
* 救急分析编辑
* 救急分析搜索 / 筛选 / 标签
* 救急分析详情页
* `user_progress` 统计
* 管理员、付费、复杂权限