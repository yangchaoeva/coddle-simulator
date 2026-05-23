# RELEASE CHECKLIST

## 1. 部署平台环境变量

上线前确认以下变量已在部署平台配置完成：

- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`
- `DATABASE_URL_MIGRATION`
- `AI_PROVIDER`
- `ARK_API_KEY`
- `ARK_MODEL`
- `ARK_BASE_URL`

额外要求：

- `BETTER_AUTH_URL` 线上必须是正式域名，不能是 `localhost`
- `AI_PROVIDER` 线上应为 `real`
- 不得把 `.env.local` 上传到部署平台代码目录，也不得提交到 Git

## 2. Google OAuth 配置

在 Google Cloud Console 中确认：

- `Authorized JavaScript origins`：已包含正式域名
- `Authorized redirect URIs`：已包含 `正式域名 + /api/auth/callback/google`

提醒：

- 本地 `localhost` 回调和线上正式域名回调都可以保留
- 但线上必须新增正式域名回调
- redirect URI 必须与实际回调地址完全一致

## 3. Neon 数据库检查

上线前确认以下表已存在：

- `user`
- `session`
- `account`
- `verification`
- `levels`
- `training_sessions`
- `dialogue_turns`
- `score_results`
- `user_progress`
- `emergency_analyses`

额外确认：

- migration 已执行
- `levels` 已 seed
- `levels` 表共有 15 条
- 每个角色 3 条

## 4. 线上人工验收流程

上线前按顺序验收：

- Google 登录成功
- 刷新后登录状态保持
- 退出登录成功
- 三轮训练完整跑通
- 已登录训练自动保存成功
- 游客训练结果登录后可手动保存
- `/history` 可看到训练历史
- `/emergency` 可生成分析
- 已登录救急分析可手动保存
- `/emergency/history` 可看到救急历史
- 换账号后训练历史与救急历史都正确隔离

## 5. 已知风险

- `tsc` 首次可能受 `.next/types` 时序影响，`build` 后重跑 `tsc` 可通过
- 浏览器能访问第三方，不代表 Node 服务端能访问第三方
- `.env.example` 当前 `AI_PROVIDER=mock`，线上不能直接照抄
