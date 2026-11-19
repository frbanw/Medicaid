// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Get theme based on time of day (6am-6pm = light, 6pm-6am = dark)
function getTimeBasedTheme() {
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'light' : 'dark';
}

// Get system preference (dark/light mode from OS/browser)
function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return null; // No system preference
}

// Get the appropriate theme based on priority: saved > system > time-based
function getTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    
    const systemTheme = getSystemTheme();
    if (systemTheme) return systemTheme;
    
    return getTimeBasedTheme();
}

// Apply theme
function applyTheme() {
    html.setAttribute('data-theme', getTheme());
}

// Initial theme application
applyTheme();

// Check every minute for time-based theme changes (only if no saved preference and no system preference)
setInterval(() => {
    if (!localStorage.getItem('theme') && !getSystemTheme()) {
        html.setAttribute('data-theme', getTimeBasedTheme());
    }
}, 60000);

// Listen for system theme changes (user changes OS dark mode while on site)
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (!localStorage.getItem('theme')) {
            applyTheme();
        }
    });
}

// Manual toggle saves preference to localStorage
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ===== FAQ ACCORDION =====
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        faqItems.forEach(i => i.classList.remove('active'));

        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        } else {
            question.setAttribute('aria-expanded', 'false');
        }
    });
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// ===== HUBSPOT FORM SUBMISSION =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.form-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        const formData = {
            fields: [
                { name: 'firstname', value: document.getElementById('firstname').value },
                { name: 'lastname', value: document.getElementById('lastname').value },
                { name: 'email', value: document.getElementById('email').value },
                { name: 'phone', value: document.getElementById('phone').value },
                { name: 'brief_description_of_legal_issue', value: document.getElementById('message').value },
                { name: 'i_agree_to_the__a_href__https___frblaw_com_terms_conditions___terms__amp__conditions__a__and__a_hre', value: document.getElementById('consent').checked ? 'true' : 'false' }
            ],
            context: {
                pageUri: window.location.href,
                pageName: document.title
            }
        };

        try {
            const response = await fetch(
                'https://api.hsforms.com/submissions/v3/integration/submit/49074578/a57a356c-1372-4243-acbd-51a8bb553e41',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                }
            );

            if (response.ok) {
                window.location.href = 'https://frblaw.com/confirmation/';
            } else {
                const errorBody = await response.json().catch(() => null);
                console.error('HubSpot submission error:', response.status, errorBody);
                const detail = errorBody?.errors?.[0]?.message || errorBody?.message || '';
                throw new Error(detail || 'Submission failed');
            }
        } catch (error) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            console.error('Form submission error:', error);
            alert('There was an error submitting the form. Please try again or call us directly.');
        }
    });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== TRACKING PLACEHOLDER =====
// TODO: Replace with actual Google Analytics event tracking
/*
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
        gtag('event', 'cta_click', {
            'button_text': btn.textContent.trim(),
            'button_location': btn.closest('section')?.id || 'header'
        });
    });
});

document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
        gtag('event', 'phone_click', {'event_category': 'contact'});
    });
});

document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
        gtag('event', 'email_click', {'event_category': 'contact'});
    });
});
*/
