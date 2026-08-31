# LibreTV Portal

LibreTV 的官方门户网站 —— 一个美观、现代、**零外部依赖**的静态落地页，用于介绍 LibreTV 项目与提供部署指南。

🌐 **在线访问**: [https://libretv.is-an.org/](https://libretv.is-an.org/)

## ✨ 特性

- **零运行时 CDN 依赖**：移除了 AOS / Particles.js / Google Fonts 等第三方脚本与字体，改用系统字体栈、原生 `IntersectionObserver` 揭示动画与自研轻量 `<canvas>` 粒子背景，首屏更快、国内访问更稳定。
- **现代视觉**：暗色科技风配色、毛玻璃、渐变、视差与悬浮交互。
- **流畅动画**：滚动渐入（尊重 `prefers-reduced-motion`）、数字滚动计数、粒子背景。
- **完全可访问**：语义化标签、`<main>` 主体、`skip-link`、键盘可操作的移动端菜单（Esc / 点击外部关闭 / 焦点管理）、`:focus-visible` 焦点样式。
- **响应式设计**：移动优先，桌面 / 平板 / 手机三档断点。
- **PWA 就绪**：Service Worker（HTML network-first、静态资源 stale-while-revalidate）支持离线访问。
- **SEO / 社交分享**：Open Graph / Twitter Card（绝对 URL）、JSON-LD 结构化数据、`canonical`、`sitemap.xml`、`robots.txt`。
- **安全**：所有外链 `rel="noopener noreferrer"`、CSP / `X-Frame-Options` / `Referrer-Policy` 等响应头。

## 📁 项目结构

```
LibreTV-portal/
├── index.html          # 主页面（语义化、单入口、无重复脚本）
├── styles/
│   └── main.css        # 主样式（CSS 变量 / Grid / Flexbox / 响应式）
├── scripts/
│   └── main.js         # 主脚本（IIFE 模块化，无外部依赖）
├── assets/
│   ├── logo.png / logo-black.png
│   ├── nomedia.png
│   └── logos/          # Docker / Vercel / Netlify / Cloudflare 图标
├── sw.js               # Service Worker
├── vercel.json         # Vercel 配置（含安全响应头）
├── sitemap.xml / robots.txt
├── deploy.sh           # 本地开发/部署辅助脚本（bash）
├── package.json
└── README.md
```

## 🛠️ 技术栈

- **HTML5**：语义化标签、结构化数据。
- **CSS3**：CSS 变量、Grid / Flexbox、原生动画与过渡、响应式、`@media (prefers-reduced-motion)`。
- **JavaScript (ES6+)**：IIFE 模块、`IntersectionObserver`、Canvas 动画、`requestAnimationFrame`、Fetch + `AbortController`。
- **字体**：系统字体栈（无外部字体请求）。
- **库**：无（零运行时第三方库）。

## 📱 响应式设计

- **桌面端** (≥1200px)：完整多列布局。
- **平板端** (768px–1199px)：适配的两列布局。
- **移动端** (≤767px)：单列堆叠、汉堡菜单。

## ⚡ 性能与优化要点

- 首屏无阻塞脚本（脚本 `defer`、粒子用 Canvas 自绘）。
- 移动端 / 减弱动效偏好下自动降级（粒子数量减少、关闭无限动画）。
- 标签页隐藏时暂停粒子动画以节省 CPU。
- Service Worker 静态资源走 stale-while-revalidate，HTML 走 network-first，部署更新即时生效。
- 图片添加显式尺寸与 `fetchpriority`，减少布局偏移（CLS）。
- 代码复制使用 `navigator.clipboard`，并带 `execCommand` 回退与 Toast 反馈。

## 🧩 数据说明

首页的 GitHub Stars / Forks / 贡献者数量通过 GitHub API 实时获取（带 10 分钟本地缓存与失败兜底，失败时显示 `—`，**不展示任何编造数据**）。"正常运行率" 并非真实公开指标，故保留为占位符。

## 🚀 本地开发

```bash
npm install
npm run dev      # 启动本地服务器 http://localhost:3000
# 或
npx serve . -l 3000
```

## 📦 部署

支持 Vercel / Netlify / Cloudflare Pages / Docker，详见站点内「快速部署」板块。

## 🤝 贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

基于 Apache-2.0 许可证开源 —— 查看 [LICENSE](LICENSE) 了解详情。

## 🙏 致谢

- [Vercel](https://vercel.com/) 部署平台
- LibreTV 社区贡献者

---

**LibreTV Portal** - 自由观影，畅享精彩 🎬
