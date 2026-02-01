// ==================== DOM ELEMENTS ====================
const btnGoogle = document.getElementById('btn-google');
const btnFacebook = document.getElementById('btn-facebook');
const btnSignup = document.getElementById('btn-signup');
const btnGuest = document.getElementById('btn-guest');

// ==================== BUTTON CLICK HANDLERS ====================
btnGoogle.addEventListener('click', () => {
    handleSocialLogin('Google');
});

btnFacebook.addEventListener('click', () => {
    handleSocialLogin('Facebook');
});

btnSignup.addEventListener('click', () => {
    handleAction('Criar Conta');
});

btnGuest.addEventListener('click', () => {
    handleAction('Visitante');
});

// ==================== FUNCTIONS ====================
function handleSocialLogin(platform) {
    // Add click animation
    addRippleEffect(event.currentTarget);
    
    // Show loading state
    showNotification(`Conectando com ${platform}...`, 'info');
    
    // Simulate OAuth redirect (in production, this would redirect to OAuth provider)
    setTimeout(() => {
        console.log(`Iniciando login com ${platform}`);
        // window.location.href = `/auth/${platform.toLowerCase()}`;
    }, 500);
}

function handleAction(action) {
    // Add click animation
    addRippleEffect(event.currentTarget);
    
    // Show notification
    showNotification(`Redirecionando para ${action}...`, 'success');
    
    // Simulate navigation (in production, this would navigate to the respective page)
    setTimeout(() => {
        console.log(`Navegando para: ${action}`);
        // window.location.href = action === 'Criar Conta' ? '/signup' : '/guest';
    }, 500);
}

// ==================== RIPPLE EFFECT ====================
function addRippleEffect(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple styles dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    button {
        position: relative;
        overflow: hidden;
    }
    
    .notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: hsl(240, 15%, 20%);
        backdrop-filter: blur(20px);
        border: 1px solid hsla(0, 0%, 100%, 0.15);
        border-radius: 1rem;
        color: white;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        box-shadow: 0 8px 32px hsla(0, 0%, 0%, 0.3);
        z-index: 1000;
        animation: slideInRight 0.4s ease, slideOutRight 0.4s ease 2.1s;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification.info::before {
        content: 'ℹ️';
        font-size: 1.25rem;
    }
    
    .notification.success::before {
        content: '✅';
        font-size: 1.25rem;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2500);
}

// ==================== PARALLAX EFFECT ====================
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.feature-card');
    const heroImage = document.querySelector('.hero-image');
    
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    // Parallax for hero image
    if (heroImage) {
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        heroImage.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
    
    // Parallax for feature cards
    cards.forEach((card, index) => {
        const moveX = (mouseX - 0.5) * (10 + index * 2);
        const moveY = (mouseY - 0.5) * (10 + index * 2);
        card.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

// ==================== INTERSECTION OBSERVER ====================
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// ==================== ACCESSIBILITY ENHANCEMENTS ====================
// Add keyboard navigation support
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            button.click();
        }
    });
});

// ==================== PERFORMANCE OPTIMIZATION ====================
// Debounce function for performance
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

// Apply debounce to parallax effect for better performance
const debouncedMouseMove = debounce((e) => {
    document.dispatchEvent(new MouseEvent('mousemove', {
        clientX: e.clientX,
        clientY: e.clientY
    }));
}, 16); // ~60fps

// ==================== CONSOLE WELCOME MESSAGE ====================
console.log('%c🔥 MERCADOFLASH', 'font-size: 24px; font-weight: bold; color: #a855f7;');
console.log('%cBem-vindo ao MERCADOFLASH!', 'font-size: 14px; color: #d1d5db;');
console.log('%cTudo que você precisa, em um só lugar! 🛒', 'font-size: 12px; color: #9ca3af;');

// ==================== READY STATE ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ MERCADOFLASH carregado com sucesso!');
    
    // Add initial animations
    const heroCard = document.querySelector('.hero-card');
    if (heroCard) {
        heroCard.style.opacity = '0';
        heroCard.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            heroCard.style.transition = 'all 0.8s ease';
            heroCard.style.opacity = '1';
            heroCard.style.transform = 'translateY(0)';
        }, 100);
    }
});
