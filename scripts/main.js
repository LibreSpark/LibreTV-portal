// LibreTV Portal - Main JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize all components
    initParticles();
    initNavigation();
    initScrollAnimations();
    
    // Update stats with GitHub data before initializing counters
    await updateStatsWithGitHubData();
    initCounters();
    
    initBackToTop();
    initSmoothScroll();
    initLazyLoad();
    
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }
});

// Particles.js Configuration
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#00ccff'
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.2,
                    random: true
                },
                size: {
                    value: 3,
                    random: true
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00ccff',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true,
                    out_mode: 'out'
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                }
            }
        });
    }
}

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navToggle && navMenu) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Highlight active nav link on scroll
    window.addEventListener('scroll', function() {
        const scrollPos = window.scrollY + 100;
        
        navLinks.forEach(link => {
            const section = document.querySelector(link.getAttribute('href'));
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navLinks.forEach(navLink => navLink.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
        
        // Navbar background on scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .deployment-card, .stat-item');
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Animated counters
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const isPercentage = counter.getAttribute('data-stat') === 'uptime-rate';
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps
                
                let current = 0;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    
                    // Format number with commas for thousands
                    const formattedNumber = Math.floor(current).toLocaleString();
                    counter.textContent = formattedNumber + (isPercentage ? '%' : '');
                }, 16);
                
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Back to top button
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Lazy loading for images
function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('loading');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        img.classList.add('loading');
        imageObserver.observe(img);
    });
}

// GitHub API Data Update
async function updateStatsWithGitHubData() {
    try {
        // Check if we have cached data that's still fresh (less than 10 minutes old)
        const cacheKey = 'github_stats_cache';
        const cacheTimeKey = 'github_stats_cache_time';
        const cacheExpiration = 10 * 60 * 1000; // 10 minutes in milliseconds
        
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);
        
        if (cachedData && cacheTime && 
            (Date.now() - parseInt(cacheTime)) < cacheExpiration) {
            // Use cached data
            const stats = JSON.parse(cachedData);
            updateStatsFromData(stats);
            console.log('Using cached GitHub stats');
            return;
        }
        
        // GitHub API endpoint for repository information
        const repoUrl = 'https://api.github.com/repos/LibreSpark/LibreTV';
        const contributorsUrl = 'https://api.github.com/repos/LibreSpark/LibreTV/contributors';
        
        // Fetch repository data with timeout
        const fetchWithTimeout = (url, timeout = 5000) => {
            return Promise.race([
                fetch(url),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout')), timeout)
                )
            ]);
        };
        
        const [repoResponse, contributorsResponse] = await Promise.all([
            fetchWithTimeout(repoUrl),
            fetchWithTimeout(contributorsUrl)
        ]);
        
        if (repoResponse.ok && contributorsResponse.ok) {
            const repoData = await repoResponse.json();
            const contributorsData = await contributorsResponse.json();
            
            const stats = {
                forks: repoData.forks_count || 100,
                stars: repoData.stargazers_count || 500,
                contributors: contributorsData.length || 20,
                uptime: 99
            };
            
            // Cache the data
            localStorage.setItem(cacheKey, JSON.stringify(stats));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
            
            updateStatsFromData(stats);
            console.log('GitHub stats updated successfully:', stats);
        } else {
            console.warn('Failed to fetch GitHub data, using fallback values');
            setFallbackStats();
        }
    } catch (error) {
        console.warn('Error fetching GitHub data:', error.message);
        setFallbackStats();
    }
}

// Update stats from data object
function updateStatsFromData(stats) {
    updateStatElement('fork-count', stats.forks);
    updateStatElement('star-count', stats.stars);
    updateStatElement('contributor-count', stats.contributors);
    updateStatElement('uptime-rate', stats.uptime);
}

// Update individual stat element
function updateStatElement(id, value) {
    const elements = document.querySelectorAll(`[data-stat="${id}"]`);
    elements.forEach(element => {
        element.setAttribute('data-target', value);
        // Don't set the text content here, let the counter animation handle it
    });
}

// Set fallback stats if GitHub API fails
function setFallbackStats() {
    const fallbackStats = {
        forks: 100,
        stars: 500,
        contributors: 20,
        uptime: 99
    };
    updateStatsFromData(fallbackStats);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Performance optimizations
const debouncedResize = debounce(function() {
    // Handle window resize
    if (typeof particlesJS !== 'undefined') {
        particlesJS.refresh();
    }
}, 250);

const throttledScroll = throttle(function() {
    // Handle scroll events
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroImage = hero.querySelector('.hero-image');
        if (heroImage && scrollTop < hero.offsetHeight) {
            const parallaxSpeed = 0.5;
            heroImage.style.transform = `translateY(${scrollTop * parallaxSpeed}px)`;
        }
    }
}, 16);

// Event listeners
window.addEventListener('resize', debouncedResize);
window.addEventListener('scroll', throttledScroll);

// Loading states
document.addEventListener('DOMContentLoaded', function() {
    // Remove loading class from body
    document.body.classList.remove('loading');
    
    // Fade in main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('fade-in');
    }
});

// Handle external links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.hostname !== window.location.hostname) {
        e.target.setAttribute('rel', 'noopener noreferrer');
    }
});

// Intersection Observer for animations
const createObserver = (callback, options = {}) => {
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Error handling
window.addEventListener('error', function(e) {
    console.error('LibreTV Portal Error:', e.error);
    // Could send error to analytics here
});

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Copy code functionality
document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Find the closest code element
        const code = this.parentElement.querySelector('code').textContent;
        
        // Create a textarea element to help with copying
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';  // Avoid scrolling to bottom
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            // Execute copy command
            document.execCommand('copy');
            
            // Visual feedback that copy was successful
            this.classList.add('copied');
            
            // Change the SVG to a checkmark temporarily
            const originalSVG = this.innerHTML;
            this.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>`;
            
            // Revert back after 2 seconds
            setTimeout(() => {
                this.classList.remove('copied');
                this.innerHTML = originalSVG;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        
        document.body.removeChild(textarea);
    });
});

// Export functions for external use
window.LibreTVPortal = {
    initParticles,
    initNavigation,
    initScrollAnimations,
    initCounters,
    initBackToTop,
    initSmoothScroll,
    initLazyLoad,
    debounce,
    throttle,
    createObserver
};
window.LibreTVPortal = {
    initParticles,
    initNavigation,
    initScrollAnimations,
    initCounters,
    initBackToTop,
    initSmoothScroll,
    initLazyLoad,
    debounce,
    throttle,
    createObserver
};
