// LibreTV Portal - Main JavaScript (ES module pattern, no external deps)
(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    /* ---------------------------------------------------------------- *
     * Utilities
     * ---------------------------------------------------------------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    function debounce(fn, wait) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    function safeStorageGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function safeStorageSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }

    /* ---------------------------------------------------------------- *
     * Particles background (lightweight self-contained canvas)
     * ---------------------------------------------------------------- */
    function initParticles() {
        const canvas = document.getElementById('particles-js');
        if (!canvas || prefersReducedMotion) return;

        const ctx = canvas.getContext('2d');
        let width, height, dpr, particles = [];
        const COUNT = isMobile ? 36 : 80;
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
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 1
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
                ctx.fillStyle = `rgba(${COLOR}, 0.25)`;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = `rgba(${COLOR}, ${0.12 * (1 - dist / 140)})`;
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

        // Pause when tab hidden to save CPU
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(rafId);
            } else if (!prefersReducedMotion) {
                rafId = requestAnimationFrame(step);
            }
        });
    }

    /* ---------------------------------------------------------------- *
     * Mobile navigation
     * ---------------------------------------------------------------- */
    function initNavigation() {
        const toggle = document.getElementById('nav-toggle');
        const menu = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        function closeMenu() {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
        function openMenu() {
            menu.classList.add('active');
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
        }

        toggle.addEventListener('click', () => {
            if (menu.classList.contains('active')) closeMenu(); else openMenu();
        });

        // Close on link click
        $$('.nav-link', menu).forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                closeMenu();
                toggle.focus();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active') && !menu.contains(e.target) && !toggle.contains(e.target)) {
                closeMenu();
            }
        });
    }

    /* ---------------------------------------------------------------- *
     * Reveal-on-scroll (replaces AOS)
     * ---------------------------------------------------------------- */
    function initReveal() {
        const items = $$('.reveal');
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            items.forEach(el => el.classList.add('in'));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        items.forEach(el => observer.observe(el));
    }

    /* ---------------------------------------------------------------- *
     * Scroll-driven UI (single rAF scheduler)
     * ---------------------------------------------------------------- */
    function initScrollUI() {
        const navbar = $('.navbar');
        const backToTop = document.getElementById('backToTop');
        const navLinks = $$('.nav-link').filter(l => l.getAttribute('href').startsWith('#'));
        const sections = navLinks.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
        const heroMockup = $('.hero-mockup');

        let ticking = false;

        function onScroll() {
            const y = window.scrollY;
            const limit = 80;

            if (navbar) navbar.classList.toggle('scrolled', y > limit);
            if (backToTop) backToTop.classList.toggle('visible', y > 500);

            // Active link highlight
            if (sections.length) {
                const pos = y + 120;
                let activeIdx = -1;
                sections.forEach((sec, i) => {
                    if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) activeIdx = i;
                });
                navLinks.forEach((l, i) => l.classList.toggle('active', i === activeIdx));
            }

            // Subtle parallax on hero mockup (inner element, no transform conflict)
            if (heroMockup && !prefersReducedMotion && y < window.innerHeight) {
                heroMockup.style.setProperty('--py', (y * 0.06) + 'px');
            }

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(onScroll);
            }
        }, { passive: true });

        onScroll();

        if (backToTop) {
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        }
    }

    /* ---------------------------------------------------------------- *
     * Smooth anchor scrolling + focus management
     * ---------------------------------------------------------------- */
    function initSmoothScroll() {
        $$('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const id = link.getAttribute('href');
                if (id === '#' || id.length < 2) return;
                const target = $(id);
                if (!target) return;
                e.preventDefault();
                const offset = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: offset, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                // Update hash + move focus for a11y (non-jumpy)
                history.replaceState(null, '', id);
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            });
        });
    }

    /* ---------------------------------------------------------------- *
     * Animated counters (rAF based, async-data safe)
     * ---------------------------------------------------------------- */
    const counted = new WeakSet();

    function formatNum(n) {
        return Number(n).toLocaleString();
    }

    function renderStat(el) {
        const target = parseInt(el.dataset.target, 10);
        if (Number.isNaN(target) || counted.has(el)) return;
        counted.add(el);
        // Skip the count-up when the page is hidden: rAF is suspended in
        // background tabs and the animation would never run or finish.
        if (prefersReducedMotion || document.hidden) {
            el.textContent = formatNum(target);
            return;
        }
        const duration = 1600;
        const start = performance.now();
        function frame(now) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            el.textContent = formatNum(Math.floor(eased * target));
            if (t < 1) requestAnimationFrame(frame);
            else el.textContent = formatNum(target);
        }
        requestAnimationFrame(frame);
    }

    function initCounters() {
        const counters = $$('.stat-number');
        if (!('IntersectionObserver' in window)) {
            counters.forEach(renderStat);
            return;
        }
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) renderStat(e.target); });
        }, { threshold: 0.5 });
        counters.forEach(el => obs.observe(el));
    }

    /* ---------------------------------------------------------------- *
     * GitHub stats (AbortController, accurate contributor count, fallback)
     * ---------------------------------------------------------------- */
    async function updateStatsWithGitHubData() {
        const cacheKey = 'github_stats_cache';
        const cacheTimeKey = 'github_stats_cache_time';
        const EXPIRE = 10 * 60 * 1000;

        const cached = safeStorageGet(cacheKey);
        const cachedTime = safeStorageGet(cacheTimeKey);
        if (cached && cachedTime && (Date.now() - parseInt(cachedTime, 10)) < EXPIRE) {
            applyStats(JSON.parse(cached));
            return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const opts = { signal: controller.signal };

        try {
            const [repoRes, contribRes, pkgRes] = await Promise.all([
                fetch('https://api.github.com/repos/LibreSpark/LibreTV', opts),
                fetch('https://api.github.com/repos/LibreSpark/LibreTV/contributors?per_page=1&anon=true', opts),
                fetch('https://api.github.com/repos/LibreSpark/LibreTV/contents/package.json', opts)
            ]);
            clearTimeout(timeout);

            if (!repoRes.ok) throw new Error('repo ' + repoRes.status);
            const repo = await repoRes.json();

            let contributors = 0;
            const link = contribRes.headers.get('Link');
            if (contribRes.ok && link) {
                const match = link.match(/&page=(\d+)>;\s*rel="last"/);
                contributors = match ? parseInt(match[1], 10) : (contribRes.ok ? 1 : 0);
            } else if (contribRes.ok) {
                const arr = await contribRes.json();
                contributors = Array.isArray(arr) ? arr.length : 0;
            }

            let version = '';
            if (pkgRes.ok) {
                const pkgFile = await pkgRes.json();
                try {
                    const pkg = JSON.parse(atob(pkgFile.content.replace(/\n/g, '')));
                    version = typeof pkg.version === 'string' ? pkg.version : '';
                } catch (e) { /* keep empty on parse failure */ }
            }

            const stats = {
                forks: repo.forks_count || 0,
                stars: repo.stargazers_count || 0,
                contributors: contributors,
                version: version
            };
            applyStats(stats);
            safeStorageSet(cacheKey, JSON.stringify(stats));
            safeStorageSet(cacheTimeKey, Date.now().toString());
        } catch (err) {
            clearTimeout(timeout);
            // Keep existing "—" placeholder; do not show fake numbers
            console.warn('GitHub stats unavailable, keeping placeholder:', err.message);
        }
    }

    function applyStats(stats) {
        setStat('fork-count', stats.forks);
        setStat('star-count', stats.stars);
        setStat('contributor-count', stats.contributors);
        // Version is not a number: write it directly, no count-up animation
        $$('[data-stat="version"]').forEach(el => {
            el.textContent = stats.version ? 'v' + stats.version : '—';
        });
    }

    function setStat(id, value) {
        $$('[data-stat="' + id + '"]').forEach(el => {
            el.dataset.target = value;
            // Render immediately only if already in view; otherwise the
            // IntersectionObserver from initCounters renders on scroll.
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) renderStat(el);
        });
    }

    /* ---------------------------------------------------------------- *
     * Copy-to-clipboard
     * ---------------------------------------------------------------- */
    function initCopy() {
        $$('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const block = btn.closest('.code-block');
                const code = block ? block.querySelector('code') : null;
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

                showCopyFeedback(btn, ok);
            });
        });
    }

    function showCopyFeedback(btn, ok) {
        const original = btn.innerHTML;
        btn.innerHTML = ok
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        btn.classList.toggle('copied', ok);
        showToast(ok ? '已复制 ✓' : '复制失败，请手动选择');
        setTimeout(() => { btn.innerHTML = original; btn.classList.remove('copied'); }, 2000);
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
     * External link hardening
     * ---------------------------------------------------------------- */
    function initExternalLinks() {
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (!a || a.target !== '_blank') return;
            if (!/noopener/.test(a.rel)) {
                a.setAttribute('rel', (a.rel ? a.rel + ' ' : '') + 'noopener noreferrer');
            }
        });
    }

    /* ---------------------------------------------------------------- *
     * Misc
     * ---------------------------------------------------------------- */
    function initMisc() {
        const year = document.getElementById('currentYear');
        if (year) year.textContent = new Date().getFullYear();
    }

    function initServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(() => { /* no-op */ });
        });
    }

    /* ---------------------------------------------------------------- *
     * Boot
     * ---------------------------------------------------------------- */
    function boot() {
        initParticles();
        initNavigation();
        initReveal();
        initScrollUI();
        initSmoothScroll();
        initCounters();
        initCopy();
        initExternalLinks();
        initMisc();
        initServiceWorker();
        updateStatsWithGitHubData();
        window.__libretvReady = true;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
