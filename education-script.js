// ==================== DOM ELEMENTS ====================
const areaGeral = document.getElementById('area-geral');
const areaFisico = document.getElementById('area-fisico');
const areaOrganica = document.getElementById('area-organica');
const btnQuiz = document.getElementById('btn-quiz');
const btnReview = document.getElementById('btn-review');
const btnLogin = document.getElementById('btn-login');
const btnGuest = document.getElementById('btn-guest');
const heroImage = document.getElementById('hero-image');

// ==================== NAVEGAÇÃO DAS ÁREAS ====================
areaGeral?.addEventListener('click', () => {
    addRippleEffect(areaGeral);
    showNotification('Abrindo Química Geral...', 'success');
    setTimeout(() => {
        window.location.href = 'quimica-geral.html';
    }, 500);
});

areaFisico?.addEventListener('click', () => {
    addRippleEffect(areaFisico);
    showNotification('🧪 Abrindo PhysChem Lab...', 'success');
    setTimeout(() => {
        window.location.href = 'physichem.html';
    }, 500);
});

areaOrganica?.addEventListener('click', () => {
    addRippleEffect(areaOrganica);
    showNotification('🧬 Abrindo Orgânica Play...', 'success');
    setTimeout(() => {
        window.location.href = 'organica.html';
    }, 500);
});

// ==================== MAIN ACTIONS ====================
btnQuiz.addEventListener('click', () => {
    handleAction('Quiz', btnQuiz);
});

btnReview.addEventListener('click', () => {
    handleAction('Revisão', btnReview);
});

function handleAction(action, element) {
    addRippleEffect(element);
    showNotification(`Iniciando ${action}...`, 'success');

    setTimeout(() => {
        console.log(`Opening ${action}`);
        // window.location.href = `/${action.toLowerCase()}`;
    }, 500);
}

// ==================== AÇÃO DE LOGIN ====================
document.getElementById('btn-login')?.addEventListener('click', () => {
    window.location.href = 'login.html';
});

btnGuest.addEventListener('click', () => {
    addRippleEffect(btnGuest);
    showNotification('Entrando como visitante...', 'success');

    setTimeout(() => {
        console.log('Guest mode activated');
        // window.location.href = '/guest-dashboard';
    }, 500);
});

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
    const cards = document.querySelectorAll('.stat-card, .area-card');

    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    // Parallax for hero image
    if (heroImage) {
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        heroImage.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    // Parallax for cards
    cards.forEach((card, index) => {
        const moveX = (mouseX - 0.5) * (8 + index * 1);
        const moveY = (mouseY - 0.5) * (8 + index * 1);
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
document.querySelectorAll('.stat-card, .area-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

// ==================== PROGRESS TRACKING (LocalStorage) ====================
function loadProgress() {
    const completed = JSON.parse(localStorage.getItem('completedAreas') || '[]');

    completed.forEach(areaId => {
        const element = document.getElementById(areaId);
        if (element) {
            element.classList.add('completed');
        }
    });
}

function markAreaAsCompleted(areaId) {
    const completed = JSON.parse(localStorage.getItem('completedAreas') || '[]');

    if (!completed.includes(areaId)) {
        completed.push(areaId);
        localStorage.setItem('completedAreas', JSON.stringify(completed));

        const element = document.getElementById(areaId);
        if (element) {
            element.classList.add('completed');
        }
    }
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // Press 1 for Química Geral
    if (e.key === '1') {
        areaGeral.click();
    }
    // Press 2 for Físico-Química
    if (e.key === '2') {
        areaFisico.click();
    }
    // Press 3 for Orgânica
    if (e.key === '3') {
        areaOrganica.click();
    }
    // Press Q for Quiz
    if (e.key === 'q' || e.key === 'Q') {
        btnQuiz.click();
    }
    // Press R for Review
    if (e.key === 'r' || e.key === 'R') {
        btnReview.click();
    }
});

// ==================== ACCESSIBILITY ENHANCEMENTS ====================
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (button.type !== 'submit') {
                e.preventDefault();
                button.click();
            }
        }
    });
});

// ==================== CONSOLE WELCOME MESSAGE ====================
console.log('%c🔥 ENEM FLASH', 'font-size: 24px; font-weight: bold; color: #a855f7;');
console.log('%cBem-vindo ao ENEM FLASH!', 'font-size: 14px; color: #d1d5db;');
console.log('%cDomine a Química, Arrasa no ENEM! 🧪', 'font-size: 12px; color: #9ca3af;');
console.log('%c\nAtalhos de teclado:', 'font-size: 12px; font-weight: bold; color: #f97316;');
console.log('%c1 - Química Geral | 2 - Físico-Química | 3 - Orgânica', 'font-size: 11px; color: #9ca3af;');
console.log('%cQ - Quiz | R - Revisão', 'font-size: 11px; color: #9ca3af;');

// ==================== READY STATE ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ ENEM FLASH carregado com sucesso!');
    loadProgress();

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

// ==================== MOTIVATIONAL MESSAGES ====================
const motivationalMessages = [
    '💪 Você está no caminho certo!',
    '🎯 Foco e determinação!',
    '⚡ Continue assim!',
    '🔥 Arrasando nos estudos!',
    '🚀 Rumo à aprovação!',
    '📚 Conhecimento é poder!',
    '✨ Cada questão é um passo!',
    '🌟 Você consegue!'
];

function showMotivationalMessage() {
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    showNotification(randomMessage, 'success');
}

// Show motivational message every 5 minutes
setInterval(showMotivationalMessage, 300000);
