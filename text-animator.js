// Dynamic Text Animation Controller - FIXED VERSION
// Adds beautiful animated effects to text throughout the interface

class TextAnimationController {
    constructor() {
        this.init();
    }

    init() {
        console.log('✨ Text Animation Controller Initialized!');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyAnimations());
        } else {
            this.applyAnimations();
        }
    }

    applyAnimations() {
        this.animateHeader();
        this.animateSectionTitles();
        this.animateButtons();
        this.setupScrollAnimations();
        this.addSparkles();
        this.animateAIBadge();
        this.setupHoverEffects();
    }

    // Animate main header with wave effect
    animateHeader() {
        const header = document.querySelector('header h1');
        if (!header) return;

        const text = header.textContent;
        header.innerHTML = '';

        // Split into characters and wrap each in span
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'wave-text';
            span.style.animationDelay = `${index * 0.05}s`;
            header.appendChild(span);
        });
    }

    // Animate section titles on scroll
    animateSectionTitles() {
        const sections = document.querySelectorAll('.section-title');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.1}s`;

            // Add icon rotation on hover
            const icon = section.querySelector('.section-icon');
            if (icon) {
                section.addEventListener('mouseenter', () => {
                    icon.style.animation = 'rotate 0.5s ease-in-out';
                });
                section.addEventListener('mouseleave', () => {
                    setTimeout(() => {
                        icon.style.animation = 'iconBounce 2s ease-in-out infinite';
                    }, 500);
                });
            }
        });
    }

    // Add dynamic button animations
    animateButtons() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        buttons.forEach(button => {
            // Add ripple effect on click
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });

            // Add pulse on hover
            button.addEventListener('mouseenter', () => {
                button.classList.add('pulse-scale');
            });
            button.addEventListener('mouseleave', () => {
                button.classList.remove('pulse-scale');
            });
        });
    }

    // Create ripple effect
    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            animation: rippleEffect 0.6s ease-out;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    // Setup scroll-triggered animations
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        // Observe all cards
        document.querySelectorAll('.glass-card').forEach(card => {
            card.classList.add('animate-on-scroll');
            observer.observe(card);
        });
    }

    // Add sparkle effects to important elements
    addSparkles() {
        const sparkleTargets = document.querySelectorAll('.btn-primary, .ai-badge');

        sparkleTargets.forEach(target => {
            // Create sparkle container
            const container = document.createElement('div');
            container.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            `;

            // Add sparkles
            for (let i = 0; i < 4; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = `${Math.random() * 100}%`;
                sparkle.style.top = `${Math.random() * 100}%`;
                sparkle.style.animationDelay = `${i * 0.3}s`;
                container.appendChild(sparkle);
            }

            target.style.position = 'relative';
            target.appendChild(container);
        });
    }

    // Animate AI badge
    animateAIBadge() {
        const badge = document.querySelector('.ai-badge');
        if (!badge) return;

        // Add typing effect to badge text
        const originalText = badge.textContent;
        badge.textContent = '';

        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < originalText.length) {
                badge.textContent += originalText[index];
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, 100);
    }

    // Setup hover effects
    setupHoverEffects() {
        // Add glow to cards on hover
        const cards = document.querySelectorAll('.template-card, .animation-card, .ai-suggestion-card');
        cards.forEach(card => {
            card.classList.add('hover-lift');

            card.addEventListener('mouseenter', () => {
                this.createGlowEffect(card);
            });
        });

        // Add lift effect to upload areas
        const uploadAreas = document.querySelectorAll('.upload-area');
        uploadAreas.forEach(area => {
            area.classList.add('hover-lift');
        });
    }

    // Create glow effect
    createGlowEffect(element) {
        element.style.transition = 'all 0.3s ease';
        element.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.6)';

        element.addEventListener('mouseleave', () => {
            element.style.boxShadow = '';
        }, { once: true });
    }

    // Show success animation
    showSuccessAnimation(message) {
        const notification = document.createElement('div');
        notification.className = 'notification zoom-in';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00C851, #007E33);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 200, 81, 0.4);
            z-index: 10000;
            font-weight: 600;
        `;
        notification.textContent = `✅ ${message}`;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('zoom-in');
            notification.classList.add('zoom-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Celebrate with confetti effect
    celebrate() {
        const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                opacity: 1;
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
                z-index: 10000;
            `;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }
    }
}

// Add animations
const animStyle = document.createElement('style');
animStyle.textContent = `
    @keyframes confettiFall {
        to {
            top: 100vh;
            opacity: 0;
            transform: translateX(${Math.random() * 200 - 100}px) rotate(${Math.random() * 720}deg);
        }
    }

    @keyframes rippleEffect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animStyle);

// Initialize on load
const textAnimator = new TextAnimationController();

// Export for use in other scripts
window.textAnimator = textAnimator;

// Add utility functions to window
window.showSuccess = (msg) => textAnimator.showSuccessAnimation(msg);
window.celebrate = () => textAnimator.celebrate();

console.log('🎨 Text animations ready! Use window.textAnimator for custom effects.');
