// ==================== DOM ELEMENTS ====================
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');
const eyeIcon = document.getElementById('eye-icon');
const eyeOffIcon = document.getElementById('eye-off-icon');
const rememberMeCheckbox = document.getElementById('remember-me');
const btnSubmit = document.getElementById('btn-submit');
const btnBack = document.getElementById('btn-back');
const btnGoogleLogin = document.getElementById('btn-google-login');
const btnFacebookLogin = document.getElementById('btn-facebook-login');
const btnAppleLogin = document.getElementById('btn-apple-login');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const signupLink = document.getElementById('signup-link');

// ==================== PASSWORD TOGGLE ====================
togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';

    // Toggle input type
    passwordInput.type = isPassword ? 'text' : 'password';

    // Toggle icons
    eyeIcon.classList.toggle('hidden');
    eyeOffIcon.classList.toggle('hidden');

    // Update aria-label
    togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');

    // Add animation
    togglePasswordBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        togglePasswordBtn.style.transform = 'scale(1)';
    }, 150);
});

// ==================== FORM VALIDATION ====================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(input, message) {
    // Add error class
    input.classList.add('error');

    // Remove existing error message
    const existingError = input.parentElement.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentElement.parentElement.appendChild(errorDiv);

    // Remove error on input
    input.addEventListener('input', function removeErrorHandler() {
        input.classList.remove('error');
        const errorMsg = input.parentElement.parentElement.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
        input.removeEventListener('input', removeErrorHandler);
    });
}

// ==================== LOGIN AUTHENTICATION ====================
const VALID_CREDENTIALS = {
    email: 'teste@enem.com',
    password: '123456'
};

loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Clear previous errors
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');

    // Validate inputs
    if (!email || !password) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        if (!email) emailInput.classList.add('error');
        if (!password) passwordInput.classList.add('error');
        return;
    }

    // Check credentials
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
        showNotification('Login realizado com sucesso! 🎉', 'success');

        // Save user data
        const userData = {
            email: email,
            name: 'Estudante ENEM',
            loginTime: new Date().toISOString()
        };

        if (rememberMeCheckbox.checked) {
            localStorage.setItem('enemflash_user', JSON.stringify(userData));
            localStorage.setItem('rememberedEmail', email);
        } else {
            sessionStorage.setItem('enemflash_user', JSON.stringify(userData));
        }

        // Redirect after delay
        btnSubmit.classList.add('loading');
        btnSubmit.disabled = true;

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } else {
        showNotification('Email ou senha incorretos!', 'error');
        emailInput.classList.add('error');
        passwordInput.classList.add('error');

        // Shake animation
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);
    }
});

// Simulate login API call
function simulateLogin(email, password, rememberMe) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Login attempt:', { email, rememberMe });

            // Simulate successful login
            resolve({ success: true });

            // Uncomment to simulate error:
            // reject({ message: 'Email ou senha incorretos' });
        }, 1500);
    });
}

// ==================== SOCIAL LOGIN ====================
btnGoogleLogin.addEventListener('click', () => {
    handleSocialLogin('Google');
});

btnFacebookLogin.addEventListener('click', () => {
    handleSocialLogin('Facebook');
});

btnAppleLogin.addEventListener('click', () => {
    handleSocialLogin('Apple');
});

function handleSocialLogin(provider) {
    addRippleEffect(event.currentTarget);
    showNotification(`Conectando com ${provider}...`, 'info');

    setTimeout(() => {
        console.log(`Initiating ${provider} OAuth flow`);
        // window.location.href = `/auth/${provider.toLowerCase()}`;
    }, 500);
}

// ==================== NAVIGATION ====================
btnBack.addEventListener('click', () => {
    console.log('Navigating back to home');
    window.location.href = 'index.html';
});

forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Redirecionando para recuperação de senha...', 'info');
    setTimeout(() => {
        console.log('Navigating to forgot password');
        // window.location.href = '/forgot-password';
    }, 500);
});

signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Redirecionando para cadastro...', 'info');
    setTimeout(() => {
        console.log('Navigating to signup');
        // window.location.href = '/signup';
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

// Add ripple styles
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
        max-width: 320px;
    }
    
    .notification.info::before {
        content: 'ℹ️';
        font-size: 1.25rem;
    }
    
    .notification.success::before {
        content: '✅';
        font-size: 1.25rem;
    }
    
    .notification.error::before {
        content: '❌';
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

// ==================== AUTO-FOCUS ====================
emailInput.focus();

// ==================== REMEMBER ME ====================
// Check if user previously selected "remember me"
window.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
        passwordInput.focus();
    }
});

rememberMeCheckbox.addEventListener('change', () => {
    if (!rememberMeCheckbox.checked) {
        localStorage.removeItem('rememberedEmail');
    }
});

// Save email if remember me is checked (on successful login)
function saveRememberedEmail(email) {
    if (rememberMeCheckbox.checked) {
        localStorage.setItem('rememberedEmail', email);
    }
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // ESC to go back
    if (e.key === 'Escape') {
        btnBack.click();
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

// ==================== CONSOLE WELCOME ====================
console.log('%c🔐 Login - MERCADOFLASH', 'font-size: 18px; font-weight: bold; color: #f97316;');
console.log('%cBem-vindo de volta!', 'font-size: 14px; color: #d1d5db;');

// ==================== READY STATE ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Login page loaded successfully!');
});
