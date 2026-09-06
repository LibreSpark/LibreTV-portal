# LibreTV Portal

LibreTV 的官方门户网站 —— 一个美观、现代、**零外部依赖**的静态落地页，用于介绍 LibreTV（v2.x Next.js 全栈版）项目与提供部署指南，并内置与主仓库 Wiki 自动同步的文档站。

🌐 **在线访问**: [https://libretv.is-an.org/](https://libretv.is-an.org/) · 📖 **使用文档**: [https://libretv.is-an.org/wiki/](https://libretv.is-an.org/wiki/)

## ✨ 特性

- **零运行时 CDN 依赖**：移除了 AOS / Particles.js / Google Fonts 等第三方脚本与字体，改用系统字体栈、原生 `IntersectionObserver` 揭示动画与自研轻量 `<canvas>` 粒子背景，首屏更快、国内访问更稳定。
- **现代视觉**：暗色科技风配色、毛玻璃、渐变、视差与悬浮交互。
- **流畅动画**：滚动渐入（尊重 `prefers-reduced-motion`）、数字滚动计数、粒子背景。
- **完全可访问**：语义化标签、`<main>` 主体、`skip-link`、键盘可操作的移动端菜单（Esc / 点击外部关闭 / 焦点管理）、`:focus-visible` 焦点样式。
- **响应式设计**：移动优先，桌面（≥993px）/ 平板（≤992px 堆叠）/ 手机（≤768px）/ 小屏（≤480px）四档断点。
- **PWA 就绪**：Service Worker（HTML network-first、静态资源 stale-while-revalidate）支持离线访问。
- **SEO / 社交分享**：Open Graph / Twitter Card（绝对 URL）、JSON-LD 结构化数据、`canonical`、`sitemap.xml`、`robots.txt`。
- **安全**：所有外链 `rel="noopener noreferrer"`、CSP / `X-Frame-Options` / `Referrer-Policy` 等响应头。

## 📁 项目结构

```
LibreTV-portal/
├── index.html          # 主页面（语义化、单入口、无重复脚本）
├── wiki/               # 文档站（由 scripts/build-wiki.mjs 自动生成，勿手改）
│   └── _template.html  #   文档页模板（下划线开头，Jekyll 不发布）
├── styles/
│   ├── main.css        # 主样式（CSS 变量 / Grid / Flexbox / 响应式）
│   └── wiki.css        # 文档站样式（与 main.css 同一套设计令牌）
├── scripts/
│   ├── main.js         # 主脚本（IIFE 模块化，无外部依赖）
│   ├── wiki.js         # 文档页交互（侧栏抽屉 / TOC scrollspy / 复制）
│   └── build-wiki.mjs  # Wiki 同步构建脚本（唯一 devDependency：marked）
├── assets/
│   ├── logo.png / logo-black.png
│   ├── nomedia.png
│   └── logos/          # Docker 图标
├── .github/workflows/
│   ├── static.yml      # GitHub Pages 部署
│   └── wiki-sync.yml   # 每日同步主仓库 Wiki
├── sw.js               # Service Worker
├── vercel.json         # 部署平台配置（含安全响应头与缓存策略）
├── sitemap.xml / robots.txt
├── deploy.sh           # 本地开发/部署辅助脚本（bash）
├── package.json
└── README.md
```

## 📖 文档站（Wiki 同步）

文档站的内容**维护在主仓库 [LibreSpark/LibreTV 的 Wiki](https://github.com/LibreSpark/LibreTV/wiki)**（9 个页面 + `_Sidebar.md` 导航），本仓库不手写文档内容：

- **自动同步**：`.github/workflows/wiki-sync.yml` 每日定时（UTC 3:00，可手动触发）执行 `scripts/build-wiki.mjs`，shallow clone `LibreTV.wiki.git`，将 markdown 渲染为套用本站样式的静态 HTML 写入 `wiki/`，有变更时提交到 `main`，随后 Pages / Vercel 自动部署。
- **手动同步**：本地运行 `npm run wiki:sync`。
- **构建期转换**：`marked` 仅为 devDependency，线上产物仍是纯静态 HTML，运行时零依赖。脚本会改写 wiki 内部链接为站内链接、图片指向 `raw.githubusercontent.com`、将 GitHub `[!NOTE]` 等 alert 语法转换为提示卡片，并自动生成页内目录、上一篇/下一篇与 `sitemap.xml`。
- **注意**：`wiki/*.html` 均为生成产物，请勿手改；改内容请去主仓库 Wiki。

## 🛠️ 技术栈

- **HTML5**：语义化标签、结构化数据。
- **CSS3**：CSS 变量、Grid / Flexbox、原生动画与过渡、响应式、`@media (prefers-reduced-motion)`。
- **JavaScript (ES6+)**：IIFE 模块、`IntersectionObserver`、Canvas 动画、`requestAnimationFrame`、Fetch + `AbortController`。
- **字体**：系统字体栈（无外部字体请求）。
- **库**：无（零运行时第三方库）。

## 📱 响应式设计

- **桌面端** (≥993px)：完整多列布局。
- **平板端** (768px–992px)：双列布局降级为堆叠。
- **移动端** (≤767px)：单列堆叠、汉堡菜单。
- **小屏** (≤480px)：进一步收紧字号与间距。

## ⚡ 性能与优化要点

- 首屏无阻塞脚本（脚本 `defer`、粒子用 Canvas 自绘）。
- 移动端 / 减弱动效偏好下自动降级（粒子数量减少、关闭无限动画）。
- 标签页隐藏时暂停粒子动画以节省 CPU。
- Service Worker 静态资源走 stale-while-revalidate，HTML 走 network-first，部署更新即时生效。
- 图片添加显式尺寸与 `fetchpriority`，减少布局偏移（CLS）。
- 代码复制使用 `navigator.clipboard`，并带 `execCommand` 回退与 Toast 反馈。

## 🧩 数据说明

首页的 GitHub Stars / Forks / 贡献者数量与当前版本号均通过 GitHub API 实时获取（版本号读取主分支 `package.json`，带 10 分钟本地缓存与失败兜底，失败时显示 `—`，**不展示任何编造数据**）。

## 🚀 本地开发

```bash
npm install
npm run dev      # 启动本地服务器 http://localhost:3000
# 或
npx serve . -l 3000
```

## 📦 部署

本门户为纯静态站点，任意静态托管均可；LibreTV 本体支持 Docker / Docker Compose / 源码运行，详见站点内「快速部署」板块。

## 🤝 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

基于 AGPL-3.0-or-later 许可证开源 —— 查看 [LICENSE](LICENSE) 了解详情。

## 🙏 致谢

- LibreTV 社区贡献者

---

**LibreTV Portal** - 免费在线视频聚合搜索与观看平台 🎬
