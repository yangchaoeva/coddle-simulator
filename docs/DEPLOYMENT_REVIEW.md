# Coddle Simulator 部署复盘

## 1. 背景

- 项目通过 GitHub 仓库连接到 Vercel 部署。
- 身份认证使用 BetterAuth + Google OAuth。
- 数据存储使用 Neon PostgreSQL。
- 线上最终域名为 `https://coddle-simulator.vercel.app`。
- 本次复盘覆盖的重点是：部署链路稳定性、OAuth 配置链路、线上训练保存链路、结果页保存状态一致性。

## 2. 部署过程中遇到的问题

### 2.1 npm `ERESOLVE` peer dependency 冲突

- 在安装依赖或调整版本时，出现 `ERESOLVE`，导致依赖安装中断。
- 这类问题直接影响本地验证和云端构建一致性。

### 2.2 Next.js vulnerable version 被 Vercel 拦截

- 线上部署阶段因为 Next.js 版本存在安全风险而被平台拦截。
- 即使业务代码无误，构建也无法继续推进。

### 2.3 Vercel 旧 deployment redeploy 导致一直部署旧 commit

- 在 Vercel 控制台中对旧 deployment 执行 redeploy，会重复部署旧的 Source commit。
- 表面看像“重新部署了”，实际线上代码并没有更新到 GitHub 最新提交。

### 2.4 Google OAuth redirect URI 配置问题

- Google 登录链路依赖精确匹配的 redirect URI。
- 本地、预览、生产环境中任一 URI 配置不完整，都会导致登录失败或回跳异常。

### 2.5 本地 Node 访问 `oauth2.googleapis.com` 超时

- 本地调试 Google OAuth 时，出现 Node 侧访问 Google OAuth 相关域名超时。
- 该问题容易误判成 OAuth 代码错误，但实际可能是本机网络环境问题。

### 2.6 线上训练保存成功但 `/history` 未被正确确认

- 早期线上问题表现为：训练完成后结果页仍提示“可以保存到账号”，同时需要确认 `/history` 是否真的新增。
- 这是部署后最关键的一次业务链路验收问题。

## 3. 每个问题的根因与修复

### 3.1 npm `ERESOLVE` peer dependency 冲突

#### 现象

- `npm install` 或依赖调整过程中报 `ERESOLVE`。

#### 判断

- 问题不在业务代码，而在包版本之间的 peer dependency 约束不兼容。

#### 根因

- 依赖树中存在对 React、Next.js、类型包或工具链版本的兼容范围要求不一致。

#### 修复

- 优先统一核心依赖版本。
- 避免“先装能跑再说”的临时跳过策略进入长期分支。
- 在必要时升级到与平台约束一致的稳定版本组合。

#### 验证方式

- 本地依赖安装无冲突。
- `npm run build` 可稳定通过。

#### 后续避免方式

- 涉及核心框架升级时，先检查 peer dependency 约束。
- 升级尽量成组进行，不要零散碰撞。

### 3.2 Next.js vulnerable version 被 Vercel 拦截

#### 现象

- Vercel 构建阶段提示当前 Next.js 版本存在安全问题，部署被阻止。

#### 判断

- 平台阻断并非构建脚本错误，而是依赖版本不满足平台安全要求。

#### 根因

- 项目锁定的 Next.js 版本低于平台可接受范围。

#### 修复

- 升级到满足平台要求的安全版本。
- 提交后重新触发新的 GitHub → Vercel 部署。

#### 验证方式

- Vercel 构建恢复正常。
- 最新 deployment 成功完成并可访问。

#### 后续避免方式

- 关注平台对关键框架版本的限制。
- 安全补丁类升级优先处理，不要拖到部署前再集中修。

### 3.3 Vercel 旧 deployment redeploy 导致一直部署旧 commit

#### 现象

- 看起来做了 redeploy，但线上行为始终停留在旧版本。

#### 判断

- 如果 Vercel 的 Source commit 不是 GitHub 最新 commit，那么 redeploy 旧 deployment 不会得到新代码。

#### 根因

- 操作对象是历史 deployment，而不是让 Vercel从仓库重新拉取最新提交。

#### 修复

- 以 GitHub 最新 commit 为准触发新部署。
- 在 Vercel 中确认 Source 对应的是预期 commit。

#### 验证方式

- 对比 GitHub 最新 commit 与 Vercel deployment 的 Source commit。
- 线上页面行为与最新提交一致。

#### 后续避免方式

- 不要把“redeploy 旧 deployment”当成“部署最新代码”。
- 每次线上异常先看 Source commit，再看日志。

### 3.4 Google OAuth redirect URI 配置问题

#### 现象

- Google 登录回跳失败、登录后无法建立会话、或出现 redirect mismatch。

#### 判断

- OAuth 问题优先按链路定位：发起地址、回调地址、BetterAuth 配置、Google 控制台配置是否一致。

#### 根因

- redirect URI 配置不完整或环境域名不一致。

#### 修复

- 补齐并校验本地、预览、生产环境需要的回调 URI。
- 确认 BetterAuth 对外回调地址与 Google 侧完全一致。

#### 验证方式

- 从登录按钮发起授权后，能够成功回跳并建立登录态。
- 线上顶部可见已登录状态。

#### 后续避免方式

- 每新增域名或环境，都把 OAuth URI 检查作为必做项。
- 不在没有链路证据时盲目重构 OAuth 代码。

### 3.5 本地 Node 访问 `oauth2.googleapis.com` 超时

#### 现象

- 本地调试登录时，请求 Google OAuth 域名超时。

#### 判断

- 如果线上链路正常、本地浏览器可访问、但本地 Node 超时，优先怀疑本机网络、代理、DNS 或区域访问问题。

#### 根因

- 本地运行环境到 Google OAuth 服务的网络连通性不稳定，不一定是应用逻辑错误。

#### 修复

- 将问题与应用逻辑分离验证。
- 优先用线上环境和浏览器链路确认 OAuth 是否本身可用。

#### 验证方式

- 线上登录正常。
- 本地网络恢复后，Node 侧访问恢复正常。

#### 后续避免方式

- 区分“本地网络问题”和“应用代码问题”。
- 避免因为本地超时就直接改认证业务代码。

### 3.6 线上训练保存问题

#### 现象

- 已登录用户完成三轮训练后，需要确认是否真的保存成功。
- 早期表现包括：
  - 结果页仍显示“当前已登录，可以把这一条训练结果保存到你的账号”
  - 结果页仍显示“保存到我的账号”按钮
  - 需要确认 `/history` 是否新增记录

#### 判断

- 该问题要分成两个层面看：
  - 服务端是否真正写入
  - 结果页本地状态是否同步

#### 根因

- 第一阶段问题：前端保存链路对登录身份判断过度依赖客户端状态，导致自动保存不稳定。
- 第二阶段问题：即使服务端已保存成功，本地 `TrainingResult` 没有及时标记为已同步，结果页 UI 仍按“未同步”展示。

#### 修复

- 修复 1：训练完成后直接请求 `POST /api/training-sessions`，由服务端基于 session 判断用户身份，不再依赖前端传 `userId`。
- 修复 2：当自动保存返回 `created` 或 `completed` 后，调用 `markTrainingResultAsSynced`，将本地结果标记为 `saved_to_account`。

#### 验证方式

- 线上已登录状态下完成三轮训练。
- 自动保存链路成功。
- 跳转结果页后显示“已保存到当前账号”。
- 结果页不再显示“保存到我的账号”按钮。
- `/history` 顶部新增该条训练记录。

#### 后续避免方式

- 保存是否成功，优先以服务端写入结果为准。
- 结果页展示状态不能只依赖“刚刚发起过保存”，必须有明确的本地同步标记。

## 4. 训练保存问题专项复盘

### 4.1 原问题

- 训练自动保存链路早期受前端登录态判断影响。
- 结果页展示是否已保存，依赖本地 `syncStatus`，不是实时查询服务端。

### 4.2 修复 1：训练完成后直接由服务端判断身份

- 训练完成后直接 `POST /api/training-sessions`。
- 服务端使用 session 判断当前用户身份。
- 前端不传 `userId`，符合项目硬规则。

### 4.3 修复 2：保存成功后同步本地状态

- 当 `saveTrainingSessionResult(result)` 返回：
  - `created`
  - `completed`
- 即调用 `markTrainingResultAsSynced(result.id, sessionId)`。

### 4.4 验证结果

- 已登录用户完成三轮训练后，自动保存成功。
- 实际验收结果为：
  - `saveStatus = created`
  - 结果页显示“已保存到当前账号”
  - 不再显示“保存到我的账号”按钮
  - `/history` 新增本次训练记录

### 4.5 日志策略

- 为了线上验收，曾临时加入 `[training-flow]` 诊断日志。
- 验收完成后，这些临时 `console.info` 已删除。
- 真实错误日志 `[training-save]` 予以保留，用于后续定位真实保存异常。

### 4.6 经验沉淀

- 登录保存链路必须以服务端 session 为唯一可信身份来源。
- 自动保存成功与结果页 UI 一致性，属于两个独立问题，必须分别验证。
- `/history` 是否新增是最终结果验证，不应只看前端提示文案。

## 5. 最终稳定状态

- Google 登录可用。
- 已登录训练自动保存可用。
- 游客结果页可手动保存。
- `/history` 可显示当前用户训练记录。
- 结果页保存状态正确。
- 自动保存成功后，结果页不会再误显示保存按钮。

## 6. 后续部署检查清单

### 6.1 Git 与部署来源

- 确认 GitHub 最新 commit 是否已 push。
- 确认 Vercel deployment 的 Source commit 是否与 GitHub 最新 commit 一致。
- 不要把 redeploy 旧 deployment 当成部署最新代码。

### 6.2 环境变量检查

- 仅检查是否已配置必需项。
- 不在日志、文档、截图或对话中记录任何真实值。
- 重点确认认证、数据库、AI 调用相关变量是否在目标环境存在。

### 6.3 Google OAuth 检查

- 确认生产域名回调 URI 已配置。
- 如有预览域名或本地域名需求，分别独立核对。
- 登录异常时先看回跳链路，不要先改业务代码。

### 6.4 本地构建与类型检查

- 优先执行：
  - `npm.cmd run build`
  - `npm.cmd exec tsc -- --noEmit --pretty false`
- 如果 `tsc` 偶发报 `.next/types` 缺失，先判断是生成/缓存问题还是源码问题。

### 6.5 Network 验证

- 已登录完成一次完整三轮训练。
- 检查训练完成后是否请求保存接口。
- 检查返回状态是否为成功。
- 检查是否跳转到 `/training/result/[resultId]`。

### 6.6 Vercel Logs

- 构建失败先看 build logs。
- 线上接口异常再看 runtime logs。
- 避免只看前端提示就下结论。

### 6.7 Neon 数据验证

- 仅在需要时验证训练记录是否真正写入。
- 优先核对“当前登录用户是否能在 `/history` 看到自己的训练记录”。
- 如需进一步确认，再做受控的数据侧验证，不在文档中记录任何敏感连接信息。

## 7. 沉淀原则

- 先确认部署的 commit 对不对，再看功能对不对。
- 先区分平台问题、网络问题、配置问题、业务代码问题，再决定修改方向。
- 认证链路优先按“浏览器发起 → OAuth 回跳 → session 建立 → 服务端鉴权”顺序排查。
- 保存链路优先按“服务端是否写入成功 → 本地状态是否同步 → 结果页是否正确展示 → `/history` 是否可见”顺序排查。
- 临时诊断日志可以加，但必须在验收完成后及时移除。
