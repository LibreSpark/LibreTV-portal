// LibreTV Portal - Wiki Pages JavaScript (IIFE, no external deps)
// 与 main.js 同一套交互哲学：复制按钮 / toast / 移动菜单 / 回到顶部。
// 文档页专属：侧栏抽屉、页内目录 scrollspy、轻量粒子（仅文档首页）。
(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    function debounce(fn, wait) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    /* ---------------------------------------------------------------- *
     * Particles background (仅文档首页存在 canvas；弱化版：更少更淡)
     * ---------------------------------------------------------------- */
    function initParticles() {
        const canvas = document.getElementById('particles-js');
        if (!canvas || prefersReducedMotion) return;

        const ctx = canvas.getContext('2d');
        let width, height, dpr, particles = [];
        const COUNT = isMobile ? 24 : 48;
        const COLOR = '0, 204, 255';

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function makeParticles() {
            particles = Array.from({ length: COUNT }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.6 + 0.8
            }));
        }

        function step() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${COLOR}, 0.18)`;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dist = Math.hypot(p.x - q.x, p.y - q.y);
                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = `rgba(${COLOR}, ${0.08 * (1 - dist / 140)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            rafId = requestAnimationFrame(step);
        }

        let rafId;
        resize();
        makeParticles();
        step();

        window.addEventListener('resize', debounce(() => { resize(); makeParticles(); }, 250), { passive: true });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(rafId);
            } else if (!prefersReducedMotion) {
                rafId = requestAnimationFrame(step);
            }
        });
    }

    /* ---------------------------------------------------------------- *
     * Navbar (scrolled 效果 + 移动菜单)
     * ---------------------------------------------------------------- */
    function initNavigation() {
        const navbar = $('.navbar');
        const toggle = document.getElementById('nav-toggle');
        const menu = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        function closeMenu() {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }

        toggle.addEventListener('click', () => {
            if (menu.classList.contains('active')) closeMenu();
            else {
                menu.classList.add('active');
                toggle.classList.add('active');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });

        $$('.nav-link', menu).forEach(link => link.addEventListener('click', closeMenu));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
                closeSidebar();
            }
        });

        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active') && !menu.contains(e.target) && !toggle.contains(e.target)) {
                closeMenu();
            }
        });

        window.addEventListener('scroll', () => {
            if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 80);
        }, { passive: true });
    }

    /* ---------------------------------------------------------------- *
     * Sidebar drawer (mobile)
     * ---------------------------------------------------------------- */
    function closeSidebar() {
        const sidebar = document.getElementById('wiki-sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');
        const toggleBtn = document.getElementById('sidebarToggle');
        if (!sidebar || !sidebar.classList.contains('open')) return;
        sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('show');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }

    function initSidebar() {
        const sidebar = document.getElementById('wiki-sidebar');
        const toggleBtn = document.getElementById('sidebarToggle');
        const closeBtn = document.getElementById('sidebarClose');
        const backdrop = document.getElementById('sidebarBackdrop');
        if (!sidebar || !toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            const open = sidebar.classList.toggle('open');
            if (backdrop) backdrop.classList.toggle('show', open);
            toggleBtn.setAttribute('aria-expanded', String(open));
        });

        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (backdrop) backdrop.addEventListener('click', closeSidebar);

        // 点击侧栏链接后收起抽屉
        $$('.wiki-nav a', sidebar).forEach(a => a.addEventListener('click', closeSidebar));
    }

    /* ---------------------------------------------------------------- *
     * TOC scrollspy + smooth scroll
     * ---------------------------------------------------------------- */
    function initToc() {
        const tocLinks = $$('.wiki-toc a');
        if (!tocLinks.length) return;

        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const id = link.getAttribute('href');
                if (!id || id.length < 2) return;
                const target = document.getElementById(id.slice(1));
                if (!target) return;
                e.preventDefault();
                const offset = target.getBoundingClientRect().top + window.scrollY - 90;
                window.scrollTo({ top: offset, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                history.replaceState(null, '', id);
            });
        });

        if (!('IntersectionObserver' in window)) return;
        const headings = $$('h2[id], h3[id]', $('.wiki-body') || document);
        const active = () => {
            let current = null;
            const pos = window.scrollY + 100;
            for (const h of headings) {
                if (h.offsetTop <= pos) current = h;
            }
            tocLinks.forEach(l => l.classList.toggle('active', current ? l.getAttribute('href') === '#' + current.id : false));
        };
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(() => { active(); ticking = false; });
            }
        }, { passive: true });
        active();
    }

    /* ---------------------------------------------------------------- *
     * Copy-to-clipboard (为每个代码块注入复制按钮)
     * ---------------------------------------------------------------- */
    function initCopy() {
        const iconCopy = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>';

        $$('.wiki-body pre').forEach(pre => {
            if (pre.querySelector('.copy-btn')) return;
            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.type = 'button';
            btn.title = '复制代码';
            btn.setAttribute('aria-label', '复制代码');
            btn.innerHTML = iconCopy;
            pre.appendChild(btn);

            btn.addEventListener('click', async () => {
                const code = pre.querySelector('code');
                if (!code) return;
                const text = code.textContent;

                let ok = false;
                try {
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(text);
                        ok = true;
                    } else {
                        const ta = document.createElement('textarea');
                        ta.value = text;
                        ta.style.position = 'fixed';
                        ta.style.opacity = '0';
                        document.body.appendChild(ta);
                        ta.select();
                        ok = document.execCommand('copy');
                        document.body.removeChild(ta);
                    }
                } catch (e) {
                    ok = false;
                }

                btn.innerHTML = ok
                    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                btn.classList.toggle('copied', ok);
                showToast(ok ? '已复制 ✓' : '复制失败，请手动选择');
                setTimeout(() => { btn.innerHTML = iconCopy; btn.classList.remove('copied'); }, 2000);
            });
        });
    }

    let toastTimer;
    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    /* ---------------------------------------------------------------- *
     * Misc: back-to-top / external links / year
     * ---------------------------------------------------------------- */
    function initMisc() {
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            window.addEventListener('scroll', () => {
                backToTop.classList.toggle('visible', window.scrollY > 500);
            }, { passive: true });
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        }

        document.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (!a || a.target !== '_blank') return;
            if (!/noopener/.test(a.rel)) {
                a.setAttribute('rel', (a.rel ? a.rel + ' ' : '') + 'noopener noreferrer');
            }
        });

        const year = document.getElementById('currentYear');
        if (year) year.textContent = new Date().getFullYear();
    }

    function boot() {
        initParticles();
        initNavigation();
        initSidebar();
        initToc();
        initCopy();
        initMisc();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
