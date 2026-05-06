document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Glass & Shrink Effect (Apple Style)
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
        }, { passive: true });
    }

    // 2. Spotlight Hover Effect for Cards (Dynamic Mouse Tracking)
    // Selects all major card components across the site
    const cards = document.querySelectorAll('.feature-card, .price-card, .addon-card, .tutorial-card, .stat-card, .info-card, .security-card, .glass-panel');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 3. Apple-style Scroll Parallax, Blur, and Scale for Hero Sections
    const heroTitle = document.querySelector('.hero h1, .page-title');
    const heroDesc = document.querySelector('.hero p, .page-subtitle');
    const heroSubtitle = document.querySelector('.hero h2');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        // Apply effect only when near the top to save performance
        if (scrollY < 800) {
            if (heroTitle) {
                // Parallax shift down, scale down slightly, fade out, blur
                heroTitle.style.transform = `translateY(${scrollY * 0.35}px) scale(${1 - scrollY * 0.0003})`;
                heroTitle.style.opacity = 1 - (scrollY / 400);
                heroTitle.style.filter = `blur(${scrollY / 60}px)`;
            }
            if (heroSubtitle) {
                heroSubtitle.style.transform = `translateY(${scrollY * 0.25}px)`;
                heroSubtitle.style.opacity = 1 - (scrollY / 350);
                heroSubtitle.style.filter = `blur(${scrollY / 80}px)`;
            }
            if (heroDesc) {
                heroDesc.style.transform = `translateY(${scrollY * 0.15}px)`;
                heroDesc.style.opacity = 1 - (scrollY / 300);
            }
        }
    }, { passive: true });

    // 4. Enhance AOS by triggering a refresh on dynamic content loads if needed
    // (AOS is already initialized in HTML, this just ensures perfect alignment)
    setTimeout(() => {
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }, 500);
});
