// ==================== CONFIGURAÇÃO SUPABASE ====================
// TODO: Substitua pelas suas credenciais reais do Supabase
// Você pode encontrá-las em: https://supabase.com/dashboard/project/_/settings/api
const SUPABASE_URL = 'https://pmmnvlmgrmvziswerogh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbW52bG1ncm12emlzd2Vyb2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MTY4NTksImV4cCI6MjA4NTM5Mjg1OX0.ylQLOqmoZNIzrr-tW3ClIQ-2zZydeuoK38F2nCOZyFE';

// Inicializa o cliente Supabase
let supabase;
try {
    if (window.supabase) {
        // Verifica se as chaves foram configuradas
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
            console.warn('⚠️ Credenciais do Supabase não configuradas. O login funcionará apenas em modo de simulação (erro).');
        } else {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabaseClient = supabase; // Expose globally for other scripts
            console.log('✅ Supabase inicializado com sucesso de login-script.js!');
        }
    } else {
        console.error('❌ Biblioteca Supabase não encontrada.');
    }
} catch (error) {
    console.error('Erro ao inicializar Supabase:', error);
}

// ==================== ELEMENTOS DO DOM ====================
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

// ==================== ALTERNAR SENHA ====================
togglePasswordBtn?.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';

    // Alternar tipo de input
    passwordInput.type = isPassword ? 'text' : 'password';

    // Alternar ícones
    eyeIcon.classList.toggle('hidden');
    eyeOffIcon.classList.toggle('hidden');

    // Atualizar aria-label
    togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');

    // Adicionar animação
    togglePasswordBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        togglePasswordBtn.style.transform = 'scale(1)';
    }, 150);
});

// ==================== VALIDAÇÃO & ERROS ====================
function showError(input, message) {
    // Adicionar classe de erro
    input.classList.add('error');

    // Remover mensagem existente
    const existingError = input.closest('.form-group').querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Criar e adicionar mensagem de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    // Inserir após o input-wrapper
    input.closest('.input-wrapper').after(errorDiv);

    // Remover erro ao digitar
    input.addEventListener('input', function removeErrorHandler() {
        input.classList.remove('error');
        const errorMsg = input.closest('.form-group').querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
        input.removeEventListener('input', removeErrorHandler);
    });
}

// ==================== AUTENTICAÇÃO DE LOGIN ====================
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Limpar erros anteriores
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    // Validação básica
    if (!email || !password) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        if (!email) emailInput.classList.add('error');
        if (!password) passwordInput.classList.add('error');
        return;
    }

    // Feedback visual de carregamento
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.classList.add('loading');
    btnSubmit.disabled = true;

    try {
        if (!supabase) {
            throw new Error('Supabase não configurado. Verifique as credenciais no script.');
        }

        // Login com Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        // Login bem-sucedido
        showNotification('Login realizado com sucesso! 🎉', 'success');

        // Salvar preferências (sem dados sensíveis)
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        // Redirecionamento seguro
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Erro de Login:', error);

        // Tratamento de mensagens de erro amigáveis
        let errorMessage = 'Erro ao realizar login. Tente novamente.';
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Email ou senha incorretos.';
        } else if (error.message.includes('not configured')) {
            errorMessage = 'Erro de configuração do sistema.';
        }

        showNotification(errorMessage, 'error');

        // Destacar campos
        emailInput.classList.add('error');
        passwordInput.classList.add('error');

        // Animação de erro
        loginForm.classList.add('shake');
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);

    } finally {
        // Restaurar botão
        btnSubmit.classList.remove('loading');
        btnSubmit.disabled = false;
    }
});

// ==================== LOGIN SOCIAL ====================
// Função genérica para login social
async function handleSocialLogin(provider) {
    if (!supabase) {
        showNotification('Login social indisponível (configuração pendente).', 'error');
        return;
    }

    showNotification(`Conectando com ${provider}...`, 'info');

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider.toLowerCase(),
            options: {
                redirectTo: window.location.origin + '/index.html'
            }
        });

        if (error) throw error;

    } catch (error) {
        console.error(`Erro login ${provider}:`, error);
        showNotification(`Erro ao conectar com ${provider}.`, 'error');
    }
}

// Event Listeners para Social
btnGoogleLogin?.addEventListener('click', (e) => {
    addRippleEffect(e.currentTarget);
    handleSocialLogin('Google');
});

btnFacebookLogin?.addEventListener('click', (e) => {
    addRippleEffect(e.currentTarget);
    handleSocialLogin('Facebook');
});

btnAppleLogin?.addEventListener('click', (e) => {
    addRippleEffect(e.currentTarget);
    handleSocialLogin('Apple');
});

// ==================== NAVEGAÇÃO ====================
btnBack?.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// ==================== UTILITÁRIOS (Ripple & Notification) ====================
// Efeito Ripple (Mantido Visual)
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

// Sistema de Notificações
function showNotification(message, type = 'info') {
    // Remove notificações anteriores para não empilhar muitas
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ==================== INICIALIZAÇÃO ====================
window.addEventListener('DOMContentLoaded', () => {
    // Focar no email ao carregar
    emailInput?.focus();

    // Recuperar e preencher email salvo ("Lembrar-me")
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
        passwordInput?.focus();
    }

    console.log('🔐 Login pronto para uso seguro.');
});

// Acessibilidade no Teclado
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
