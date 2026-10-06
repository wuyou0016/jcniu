# 机场牛（jcniu.com）

机场推荐排行榜与资料站：把机场按资料透明度分成夯、顶级、人上人、NPC、路人五档，另设拉完了名单。

- 技术栈：Astro 7（静态输出）+ TypeScript，部署在 Cloudflare Workers Static Assets
- 本地开发：`npm install && npm run dev`
- 构建：`npm run build`（产物在 `dist/`，构建后会自动给正文外链补 `rel`）
- 部署：推送到 `main` 分支后，Cloudflare Workers Builds 自动执行 `npm run build` 与 `npx wrangler deploy`；也可以本地手动 `npx wrangler deploy`
- 内容校验：`node scripts/check-content.mjs`，全站审计：`node scripts/audit-dist.mjs`

站点内容、档位与价格资料以 `jcniu.com` 线上为准。
