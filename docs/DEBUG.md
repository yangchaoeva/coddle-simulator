Google OAuth 调试经验：
1. redirect_uri_mismatch 优先查 Google Console 的 Authorized redirect URIs。
2. 本地 redirect URI 必须是 http://localhost:3000/api/auth/callback/google。
3. 浏览器能访问 Google 不代表 Node/Next 服务端能访问 oauth2.googleapis.com。
4. 如果 callback 中 hasCookie/hasState/hasCode 都为 true，但仍 invalid_code，要检查服务端网络代理。
5. OAuth secret、DATABASE_URL、ARK_API_KEY 不得截图或提交。
6. Stage 6A 只做登录闭环，不做训练保存。