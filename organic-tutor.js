// ==================== ORGANIC TUTOR MODULE ====================
// Handles Dashboard, Progress, and AI Interaction

const TutorState = {
    currentModule: null,
    chatHistory: []
};

// Global Supabase Client
const supabase = window.supabaseClient;

// ==================== CORE FUNCTIONS ====================

async function initTutor() {
    console.log("Initializing AI Tutor...");

    // Check Auth
    if (!supabase) {
        console.warn("Supabase not initialized. Tutor features limited.");
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        document.getElementById('tutor-auth-warning').classList.remove('hidden');
        document.getElementById('tutor-dashboard-content').classList.add('hidden');
        return;
    }

    // Load Data
    await loadStudentProfile(user.id);
    await loadCurriculumModules();
    await updateDashboardStats(user.id);
}

// ==================== DASHBOARD UI ====================

async function updateDashboardStats(userId) {
    // Fetch progress from Supabase
    const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

    const completed = progressData?.filter(p => p.is_completed).length || 0;
    const totalModules = Object.keys(ORGANIC_CURRICULUM).length;
    const completionRate = Math.round((completed / totalModules) * 100);

    // Update UI
    const ring = document.querySelector('.progress-ring-circle');
    if (ring) {
        const radius = ring.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (completionRate / 100) * circumference;
        ring.style.strokeDashoffset = offset;
    }
    document.getElementById('dashboard-percent').textContent = `${completionRate}%`;
    document.getElementById('dashboard-completed').textContent = `${completed}/${totalModules}`;

    // Calculate total time (mock for now, or sum from DB)
    const totalTime = progressData?.reduce((acc, curr) => acc + (curr.time_spent || 0), 0) || 0;
    document.getElementById('dashboard-time').textContent = `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`;
}

async function loadCurriculumModules() {
    const container = document.getElementById('module-list');
    if (!container) return;

    container.innerHTML = Object.values(ORGANIC_CURRICULUM).map(module => `
        <div class="module-item" onclick="openModuleContent('${module.id}')">
            <div class="module-info">
                <strong>${module.title}</strong>
                <p>${module.description}</p>
            </div>
            <div class="module-meta">
                <span>⏱️ ${module.estimated_time} min</span>
                <span>${'★'.repeat(module.difficulty)}</span>
            </div>
        </div>
    `).join('');
}

// ==================== AI CHAT FUNCTIONS ====================

// Configuration (In production, use edge functions!)
const OPENAI_API_KEY = ''; // TODO: Insert Key Here for Demo

async function sendTutorMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    // Add User Message
    addChatMessage(message, 'user');
    input.value = '';

    // Show Loading
    const loadingId = addChatMessage('Pensando...', 'ai', true);

    // Mock Mode Check
    if (!OPENAI_API_KEY) {
        setTimeout(() => {
            const mockResponses = [
                "🤖 [Modo Demo] O petróleo é formado pela decomposição de matéria orgânica (plâncton) soterrada sob alta pressão e temperatura por milhões de anos.",
                "🤖 [Modo Demo] Os alcanos são hidrocarbonetos saturados, ou seja, possuem apenas ligações simples entre os carbonos. Exemplo: Metano (CH4).",
                "🤖 [Modo Demo] A regra de nomenclatura IUPAC prioriza a cadeia carbônica principal mais longa e a menor numeração para as ramificações.",
                "🤖 [Modo Demo] Essa funcionalidade requer uma chave de API real da OpenAI. No modo demonstração, eu dou respostas pré-definidas!"
            ];
            const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

            removeChatMessage(loadingId);
            addChatMessage(randomResponse, 'ai');

            // Save to History (Mock)
            TutorState.chatHistory.push({ role: "user", content: message });
            TutorState.chatHistory.push({ role: "assistant", content: randomResponse });
        }, 1500);
        return;
    }

    try {
        // Call OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Você é um tutor de Química Orgânica amigável e didático. Responda de forma concisa e use emojis."
                    },
                    ...TutorState.chatHistory.slice(-5), // Context window
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Update Chat
        removeChatMessage(loadingId);
        addChatMessage(aiResponse, 'ai');

        // Save to History
        TutorState.chatHistory.push({ role: "user", content: message });
        TutorState.chatHistory.push({ role: "assistant", content: aiResponse });

    } catch (error) {
        removeChatMessage(loadingId);
        addChatMessage(`Erro: ${error.message}`, 'ai');
    }
}

function addChatMessage(text, sender, isLoading = false) {
    const chat = document.getElementById('chat-messages');
    const div = document.createElement('div');
    const id = Date.now();

    div.id = `msg-${id}`;
    div.className = `message ${sender}-message ${isLoading ? 'loading-msg' : ''}`;
    div.textContent = text;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    return id;
}

function removeChatMessage(id) {
    const el = document.getElementById(`msg-${id}`);
    if (el) el.remove();
}

// ==================== MODULE CONTENT VIEWER ====================

function openModuleContent(moduleId) {
    const module = ORGANIC_CURRICULUM[moduleId];
    if (!module) return;

    const modal = document.getElementById('module-modal');
    modal.classList.remove('hidden');

    document.getElementById('module-modal-title').textContent = module.title;

    // Render Sections
    const contentHtml = module.content.sections.map(section => `
        <div class="content-section">
            <h4>${section.title}</h4>
            <div class="content-text">${section.content.replace(/\n/g, '<br>')}</div>
            ${section.examples ? `
                <div class="content-examples">
                    <strong>Exemplos:</strong>
                    <ul>${section.examples.map(e => `<li>${e}</li>`).join('')}</ul>
                </div>
            ` : ''}
        </div>
    `).join('');

    document.getElementById('module-modal-body').innerHTML = contentHtml;
}

function closeModuleModal() {
    document.getElementById('module-modal').classList.add('hidden');
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    // Initial Setup
});
