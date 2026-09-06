// LibreTV Portal - Wiki 同步构建脚本
// 从 LibreSpark/LibreTV.wiki.git 拉取 markdown，渲染为套用本站样式的静态 HTML。
// 产物提交进仓库后由 GitHub Pages / Vercel 直接托管，线上仍是零运行时依赖。
//
// 用法：npm run wiki:sync
// CI：.github/workflows/wiki-sync.yml 每日定时执行。

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const WIKI_REPO = 'https://github.com/LibreSpark/LibreTV.wiki.git';
const RAW_BASE = 'https://raw.githubusercontent.com/wiki/LibreSpark/LibreTV/';
const SITE_BASE = 'https://libretv.is-an.org/wiki/';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WIKI_DIR = path.join(ROOT, 'wiki');
const TEMPLATE = fs.readFileSync(path.join(WIKI_DIR, '_template.html'), 'utf8');

/* ------------------------------------------------------------------ *
 * 1. 拉取 wiki 仓库（shallow clone 到临时目录）
 * ------------------------------------------------------------------ */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'libretv-wiki-'));
console.log(`Cloning ${WIKI_REPO} ...`);
execFileSync('git', ['clone', '--depth', '1', '--quiet', WIKI_REPO, tmp], { stdio: 'inherit' });

/* ------------------------------------------------------------------ *
 * 2. 解析页面与 _Sidebar.md 导航
 * ------------------------------------------------------------------ */
const mdFiles = fs.readdirSync(tmp).filter(f => f.endsWith('.md'));
const sidebarRaw = fs.readFileSync(path.join(tmp, '_Sidebar.md'), 'utf8');
const pages = new Map(); // pageName -> { file, md }
for (const f of mdFiles) {
    const base = path.basename(f, '.md');
    if (base.startsWith('_')) continue;
    pages.set(base, { file: f, md: fs.readFileSync(path.join(tmp, f), 'utf8') });
}

// 解析侧栏链接：- [首页](Home) / - [部署](Deployment.md) / - [外部](https://...)
const nav = [];
for (const line of sidebarRaw.split('\n')) {
    const m = line.match(/^\s*[-*]\s+\[([^\]]+)\]\(([^)\s]+)[^)]*\)/);
    if (!m) continue;
    const [, label, href] = m;
    if (/^https?:\/\//i.test(href)) {
        nav.push({ label, external: true, href });
    } else {
        nav.push({ label, external: false, page: normalizePageName(href) });
    }
}
// 侧栏未收录的页面追加到导航末尾
for (const name of pages.keys()) {
    if (!nav.some(n => !n.external && n.page === name)) {
        nav.push({ label: name, external: false, page: name });
    }
}

/* ------------------------------------------------------------------ *
 * 3. marked 渲染器：链接/图片改写 + 标题锚点
 * ------------------------------------------------------------------ */
function normalizePageName(href) {
    let name = decodeURIComponent(href);
    name = name.split('#')[0].replace(/\.md$/i, '');
    return name;
}

function siteHref(href) {
    // 返回本站相对链接；无法识别为本站页面时返回 null
    if (/^(https?:)?\/\//i.test(href) || href.startsWith('mailto:')) return null;
    if (href.startsWith('#')) return href;
    const [base, hash] = href.split('#');
    const name = base ? normalizePageName(base) : '';
    if (!name) return hash ? `#${hash}` : null;
    const out = name === 'Home' ? 'index.html' : `${encodeURIComponent(name)}.html`;
    return hash ? `${out}#${hash}` : out;
}

function slugify(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s\-_]/gu, '')
        .replace(/\s+/g, '-');
}

const escapeHtml = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const stripTags = (html) => html.replace(/<[^>]*>/g, '');

marked.use({
    gfm: true,
    breaks: false,
    renderer: {
        heading(token) {
            const html = this.parser.parseInline(token.tokens);
            const slug = slugify(stripTags(html));
            return `<h${token.depth} id="${slug}">${html}</h${token.depth}>\n`;
        },
        link(token) {
            const text = this.parser.parseInline(token.tokens);
            const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
            const internal = siteHref(token.href);
            if (internal === null) {
                return `<a href="${escapeHtml(token.href)}"${title} target="_blank" rel="noopener noreferrer">${text}</a>`;
            }
            return `<a href="${internal}"${title}>${text}</a>`;
        },
        image(token) {
            let href = token.href || '';
            if (!/^(https?:|data:)/i.test(href)) {
                // wiki 相对路径图片 → raw.githubusercontent.com 绝对地址
                href = RAW_BASE + href.replace(/^\.\//, '').split('#')[0];
            }
            const alt = escapeHtml(stripTags(token.text || ''));
            const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
            return `<img src="${escapeHtml(href)}" alt="${alt}"${title} loading="lazy">`;
        }
    }
});

function renderMarkdown(md) {
    // GitHub wiki 的 [[Page]] / [[Page|别名]] 语法 → 标准 markdown 链接
    const pre = md.replace(/\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g, (_, target, label) =>
        `[${(label || target).trim()}](${target.trim()})`);
    return marked.parse(pre);
}

// GitHub alerts（> [!NOTE] 等）→ callout 卡片
const CALLOUT_LABELS = { NOTE: 'Note', TIP: 'Tip', IMPORTANT: 'Important', WARNING: 'Warning', CAUTION: 'Caution' };
function applyCallouts(html) {
    return html.replace(
        /<blockquote>\s*(?:<p>|)\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*?)<\/blockquote>/gi,
        (_, type, rest) => {
            const key = type.toUpperCase();
            const inner = rest.replace(/<\/p>\s*$/, '').trim();
            return `<blockquote class="callout callout-${key.toLowerCase()}">` +
                `<p class="callout-title">${CALLOUT_LABELS[key]}</p>\n<p>${inner}</p></blockquote>`;
        });
}

/* ------------------------------------------------------------------ *
 * 4. 页面装配
 * ------------------------------------------------------------------ */
function fill(template, map) {
    let out = template;
    for (const [k, v] of Object.entries(map)) out = out.split(`{{${k}}}`).join(v);
    return out;
}

function extractTitle(md) {
    const m = md.match(/^#\s+(.+?)\s*$/m);
    return m ? m[1].trim() : '';
}

function extractDescription(md) {
    const plain = md
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`([^`]*)`/g, '$1')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/^#{1,6}\s+.*$/gm, ' ')
        .replace(/[>*_~-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return plain.slice(0, 150) || 'LibreTV 项目文档';
}

function buildToc(html) {
    const items = [];
    const re = /<h([23]) id="([^"]*)">([\s\S]*?)<\/h\1>/g;
    let m;
    while ((m = re.exec(html)) !== null) {
        items.push({ depth: m[1], id: m[2], text: stripTags(m[3]).trim() });
    }
    if (!items.length) return '<!-- 无小节 -->';
    const lis = items.map(i =>
        `            <li class="toc-h${i.depth}"><a href="#${i.id}">${escapeHtml(i.text)}</a></li>`).join('\n');
    return `<ul>\n${lis}\n            </ul>`;
}

function buildSidebarNav(currentPage) {
    return nav.map(n => {
        if (n.external) {
            return `                            <li><a class="nav-external" href="${escapeHtml(n.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(n.label)} ↗</a></li>`;
        }
        const href = n.page === 'Home' ? 'index.html' : `${encodeURIComponent(n.page)}.html`;
        const active = n.page === currentPage ? ' class="active"' : '';
        return `                            <li><a href="${href}"${active}>${escapeHtml(n.label)}</a></li>`;
    }).join('\n');
}

function buildPager(currentPage) {
    const docPages = nav.filter(n => !n.external);
    const idx = docPages.findIndex(n => n.page === currentPage);
    const parts = [];
    if (idx > 0) {
        const p = docPages[idx - 1];
        const href = p.page === 'Home' ? 'index.html' : `${encodeURIComponent(p.page)}.html`;
        parts.push(`                    <a href="${href}"><span class="pager-label">← 上一篇</span><span class="pager-title">${escapeHtml(p.label)}</span></a>`);
    } else {
        parts.push('                    <span class="pager-spacer" aria-hidden="true"></span>');
    }
    if (idx >= 0 && idx < docPages.length - 1) {
        const n = docPages[idx + 1];
        const href = n.page === 'Home' ? 'index.html' : `${encodeURIComponent(n.page)}.html`;
        parts.push(`                    <a class="pager-next" href="${href}"><span class="pager-label">下一篇 →</span><span class="pager-title">${escapeHtml(n.label)}</span></a>`);
    }
    return parts.join('\n');
}

const generated = new Set();

for (const [pageName, page] of pages) {
    const isHome = pageName === 'Home';
    const title = extractTitle(page.md) || pageName;
    const description = extractDescription(page.md);

    let html = renderMarkdown(page.md);
    html = applyCallouts(html);

    // 正文首个 h1 由模板的 .wiki-title 承担，避免重复
    html = html.replace(/^<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');

    const outName = isHome ? 'index.html' : `${encodeURIComponent(pageName)}.html`;
    const outPath = path.join(WIKI_DIR, outName);
    const finalHtml = fill(TEMPLATE, {
        TITLE: escapeHtml(title),
        DESCRIPTION: escapeHtml(description),
        CANONICAL: SITE_BASE + (isHome ? '' : outName),
        PAGE_NAME: encodeURIComponent(pageName),
        SIDEBAR: buildSidebarNav(pageName),
        CONTENT: html,
        TOC: buildToc(html),
        PREV_NEXT: buildPager(pageName),
        PARTICLES: isHome ? '<canvas id="particles-js" aria-hidden="true"></canvas>' : ''
    });

    fs.writeFileSync(outPath, finalHtml);
    generated.add(outName);
    console.log(`  ✓ ${outName}  (${title})`);
}

// 清理 wiki 已下线的页面产物
for (const f of fs.readdirSync(WIKI_DIR)) {
    if (f.endsWith('.html') && f !== '_template.html' && !generated.has(f)) {
        fs.unlinkSync(path.join(WIKI_DIR, f));
        console.log(`  ✗ 已移除下线页面 ${f}`);
    }
}

fs.rmSync(tmp, { recursive: true, force: true });

/* ------------------------------------------------------------------ *
 * 5. sitemap.xml：仅在页面集合变化时重写，避免无意义 diff
 * ------------------------------------------------------------------ */
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const desiredLocs = new Set(['https://libretv.is-an.org/']);
for (const name of generated) {
    desiredLocs.add(name === 'index.html' ? SITE_BASE : SITE_BASE + name);
}

const existingLocs = new Set(
    fs.readFileSync(SITEMAP, 'utf8').match(/<loc>([^<]+)<\/loc>/g)?.map(s => s.replace(/<\/?loc>/g, '')) || []
);

const sameSet = existingLocs.size === desiredLocs.size && [...desiredLocs].every(u => existingLocs.has(u));
if (!sameSet) {
    const today = new Date().toISOString().slice(0, 10);
    const urls = ['https://libretv.is-an.org/', ...[...desiredLocs].filter(u => u !== 'https://libretv.is-an.org/').sort()]
        .map(loc => `    <url>\n        <loc>${loc}</loc>\n        <lastmod>${today}</lastmod>\n        <changefreq>weekly</changefreq>\n        <priority>${loc === 'https://libretv.is-an.org/' ? '1.0' : '0.8'}</priority>\n    </url>`)
        .join('\n');
    fs.writeFileSync(SITEMAP, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
    console.log('  ✓ sitemap.xml 已更新');
}

console.log(`\nDone: ${generated.size} pages generated from LibreTV wiki.`);
