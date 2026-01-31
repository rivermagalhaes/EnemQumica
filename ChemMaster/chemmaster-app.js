// ==================== STATE MANAGEMENT ====================
const AppState = {
    user: {
        xp: 0,
        level: 1,
        completedQuizzes: [],
        achievements: [],
        viewedElements: []
    },
    quiz: {
        currentQuestion: 0,
        questions: [],
        answers: [],
        score: 0,
        startTime: null
    }
};

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('chemmaster_state');
    if (saved) {
        Object.assign(AppState.user, JSON.parse(saved));
        updateProfileWidget();
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('chemmaster_state', JSON.stringify(AppState.user));
}

// ==================== PERIODIC TABLE ====================
function renderPeriodicTable() {
    const tableContainer = document.getElementById('periodic-table-grid');
    if (!tableContainer) return;

    tableContainer.innerHTML = '';

    ELEMENTS_DATA.forEach(element => {
        const cell = document.createElement('div');
        cell.className = 'element-cell';
        cell.setAttribute('data-category', element.category);
        cell.style.gridRow = element.row;
        cell.style.gridColumn = element.col;

        cell.innerHTML = `
            <div class="element-number">${element.number}</div>
            <div class="element-symbol">${element.symbol}</div>
            <div class="element-name">${element.name}</div>
        `;

        cell.addEventListener('click', () => showElementDetails(element));

        tableContainer.appendChild(cell);
    });
}

// Show element details in modal
function showElementDetails(element) {
    const modal = document.getElementById('element-modal');
    const detailsContainer = document.getElementById('element-details');

    // Track viewed elements
    if (!AppState.user.viewedElements.includes(element.symbol)) {
        AppState.user.viewedElements.push(element.symbol);
        addXP(5);

        // Check for explorer achievement
        if (AppState.user.viewedElements.length >= 20) {
            checkAchievement('explorer');
        }
    }

    const details = ELEMENT_DETAILS_TEMPLATE[element.symbol] || {};

    detailsContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 4rem; font-family: var(--font-display); color: var(--gold);">
                ${element.symbol}
            </div>
            <h2 style="font-size: 2rem; margin: 0.5rem 0;">${element.name}</h2>
            <p style="color: var(--text-secondary);">Número Atômico: ${element.number} | Massa Atômica: ${element.mass}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
            <div>
                <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Ponto de Fusão</h4>
                <p>${details.meltingPoint || 'N/A'}</p>
            </div>
            <div>
                <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Ponto de Ebulição</h4>
                <p>${details.boilingPoint || 'N/A'}</p>
            </div>
            <div>
                <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Densidade</h4>
                <p>${details.density || 'N/A'}</p>
            </div>
            <div>
                <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Estado</h4>
                <p>${details.state || 'Desconhecido'}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Configuração Eletrônica</h4>
            <p style="font-family: monospace; background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 0.5rem;">
                ${details.electronConfig || 'N/A'}
            </p>
        </div>
        
        ${details.uses ? `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Usos Principais</h4>
                <ul style="padding-left: 1.5rem;">
                    ${details.uses.map(use => `<li>${use}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        ${details.facts ? `
            <div>
                <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Fatos Interessantes</h4>
                <ul style="padding-left: 1.5rem;">
                    ${details.facts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        ${details.discoverer ? `
            <p style="margin-top: 1.5rem; color: var(--text-secondary); font-style: italic;">
                Descoberto por ${details.discoverer} em ${details.discovered}
            </p>
        ` : ''}
    `;

    modal.classList.remove('hidden');
}

// ==================== QUIZ SYSTEM ====================
function startQuiz() {
    // Initialize quiz
    AppState.quiz.currentQuestion = 0;
    AppState.quiz.questions = shuffleArray([...QUIZ_QUESTIONS]).slice(0, 10);
    AppState.quiz.answers = [];
    AppState.quiz.score = 0;
    AppState.quiz.startTime = Date.now();

    // Hide home, show quiz
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.querySelector('.periodic-preview').style.display = 'none';
    document.getElementById('quiz').classList.remove('hidden');

    showQuestion();
}

function showQuestion() {
    const question = AppState.quiz.questions[AppState.quiz.currentQuestion];

    document.getElementById('current-question').textContent = AppState.quiz.currentQuestion + 1;
    document.getElementById('quiz-points').textContent = AppState.quiz.score;
    document.getElementById('question-text').textContent = question.question;

    const answersGrid = document.getElementById('answers-grid');
    answersGrid.innerHTML = '';

    question.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.addEventListener('click', () => selectAnswer(index));
        answersGrid.appendChild(btn);
    });

    document.getElementById('submit-answer').classList.remove('hidden');
    document.getElementById('next-question').classList.add('hidden');
}

function selectAnswer(index) {
    // Remove previous selection
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Mark new selection
    document.querySelectorAll('.answer-btn')[index].classList.add('selected');
    AppState.quiz.selectedAnswer = index;
}

function submitAnswer() {
    const question = AppState.quiz.questions[AppState.quiz.currentQuestion];
    const selected = AppState.quiz.selectedAnswer;

    if (selected === undefined) return;

    const answerBtns = document.querySelectorAll('.answer-btn');
    const isCorrect = selected === question.correct;

    // Show correct/incorrect
    answerBtns[question.correct].classList.add('correct');
    if (!isCorrect) {
        answerBtns[selected].classList.add('incorrect');
    }

    // Update score
    if (isCorrect) {
        const questionTime = (Date.now() - AppState.quiz.startTime) / 1000;
        const questionScore = questionTime < 5 ? 15 : 10; // Bonus for speed
        AppState.quiz.score += questionScore;

        if (questionTime < 5) {
            checkAchievement('speedster');
        }
    }

    AppState.quiz.answers.push({ questionId: question.id, correct: isCorrect });

    document.getElementById('submit-answer').classList.add('hidden');
    document.getElementById('next-question').classList.remove('hidden');
}

function nextQuestion() {
    AppState.quiz.currentQuestion++;
    AppState.quiz.selectedAnswer = undefined;

    if (AppState.quiz.currentQuestion < AppState.quiz.questions.length) {
        showQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    const correctAnswers = AppState.quiz.answers.filter(a => a.correct).length;
    const totalQuestions = AppState.quiz.questions.length;
    const xpEarned = AppState.quiz.score;

    // Add XP
    addXP(xpEarned);

    // Check achievements
    checkAchievement('first_quiz');
    if (correctAnswers === totalQuestions) {
        checkAchievement('perfect_score');
    }

    // Show results
    const quizContainer = document.querySelector('.quiz-container');
    quizContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <h2 style="font-size: 3rem; margin-bottom: 1rem;">
                ${correctAnswers === totalQuestions ? '🎉 Perfeito!' : '✅ Quiz Concluído!'}
            </h2>
            <p style="font-size: 1.5rem; margin-bottom: 2rem; color: var(--text-secondary);">
                Você acertou ${correctAnswers} de ${totalQuestions} questões
            </p>
            <div style="background: rgba(255,255,255,0.05); padding: 2rem; border-radius: 1rem; margin-bottom: 2rem;">
                <div style="font-size: 2.5rem; color: var(--gold); margin-bottom: 0.5rem;">
                    +${xpEarned} XP
                </div>
                <p style="color: var(--text-secondary);">Pontos de experiência ganhos!</p>
            </div>
            <button class="btn-primary" onclick="location.reload()">
                Voltar ao Início
            </button>
        </div>
    `;
}

// ==================== GAMIFICATION ====================
function addXP(amount) {
    AppState.user.xp += amount;

    // Check for level up
    const newLevel = calculateLevel(AppState.user.xp);
    if (newLevel > AppState.user.level) {
        AppState.user.level = newLevel;
        showLevelUpNotification(newLevel);

        if (newLevel >= 10) {
            checkAchievement('master');
        }
    }

    updateProfileWidget();
    saveState();
}

function calculateLevel(xp) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].xpRequired) {
            return LEVELS[i].level;
        }
    }
    return 1;
}

function updateProfileWidget() {
    const currentLevel = AppState.user.level;
    const currentLevelData = LEVELS.find(l => l.level === currentLevel);
    const nextLevelData = LEVELS.find(l => l.level === currentLevel + 1);

    document.getElementById('user-level').textContent = currentLevel;

    if (nextLevelData) {
        const xpInLevel = AppState.user.xp - currentLevelData.xpRequired;
        const xpForNextLevel = nextLevelData.xpRequired - currentLevelData.xpRequired;
        const percentage = (xpInLevel / xpForNextLevel) * 100;

        document.getElementById('xp-fill').style.width = `${percentage}%`;
        document.getElementById('xp-text').textContent =
            `${xpInLevel} / ${xpForNextLevel} XP`;
    } else {
        document.getElementById('xp-fill').style.width = '100%';
        document.getElementById('xp-text').textContent = 'Nível Máximo!';
    }
}

function checkAchievement(achievementId) {
    if (AppState.user.achievements.includes(achievementId)) return;

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    AppState.user.achievements.push(achievementId);
    showAchievementNotification(achievement);
    addXP(achievement.xp);
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        background: rgba(26, 26, 46, 0.95);
        backdrop-filter: blur(20px);
        border: 2px solid var(--gold);
        border-radius: 1rem;
        padding: 1.5rem;
        z-index: 9999;
        animation: slideInRight 0.5s ease;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    `;
    notification.innerHTML = `
        <div style="font-size: 3rem; text-align: center;">${achievement.icon}</div>
        <h4 style="margin: 0.5rem 0;">Conquista Desbloqueada!</h4>
        <p style="margin: 0; color: var(--gold); font-weight: 600;">${achievement.name}</p>
        <p style="margin: 0.5rem 0 0; font-size: 0.875rem; color: var(--text-secondary);">
            ${achievement.description}
        </p>
        <p style="margin: 0.5rem 0 0; color: var(--argon);">+${achievement.xp} XP</p>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

function showLevelUpNotification(level) {
    const levelData = LEVELS.find(l => l.level === level);

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(26, 26, 46, 0.98);
        backdrop-filter: blur(20px);
        border: 3px solid var(--gold);
        border-radius: 2rem;
        padding: 3rem;
        z-index: 9999;
        text-align: center;
        animation: scaleIn 0.5s ease;
        box-shadow: 0 30px 60px rgba(0,0,0,0.7);
    `;
    notification.innerHTML = `
        <div style="font-size: 5rem;">🎉</div>
        <h2 style="font-size: 3rem; margin: 1rem 0; color: var(--gold);">Subiu de Nível!</h2>
        <p style="font-size: 2rem; font-family: var(--font-display); margin: 0;">Nível ${level}</p>
        <p style="font-size: 1.25rem; color: var(--text-secondary); margin: 1rem 0 0;">
            ${levelData.title}
        </p>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'scaleOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ==================== UTILITY FUNCTIONS ====================
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    renderPeriodicTable();

    // Navigation
    document.getElementById('start-learning')?.addEventListener('click', startQuiz);
    document.getElementById('explore-table')?.addEventListener('click', () => {
        document.getElementById('periodic-table').scrollIntoView({ behavior: 'smooth' });
    });

    // Modal
    document.getElementById('modal-close')?.addEventListener('click', () => {
        document.getElementById('element-modal').classList.add('hidden');
    });
    document.getElementById('modal-overlay')?.addEventListener('click', () => {
        document.getElementById('element-modal').classList.add('hidden');
    });

    // Quiz
    document.getElementById('quiz-back')?.addEventListener('click', () => location.reload());
    document.getElementById('submit-answer')?.addEventListener('click', submitAnswer);
    document.getElementById('next-question')?.addEventListener('click', nextQuestion);

    // Feature buttons
    document.querySelectorAll('.btn-feature').forEach(btn => {
        btn.addEventListener('click', function () {
            const feature = this.getAttribute('data-feature');
            if (feature === 'quiz') {
                startQuiz();
            } else if (feature === 'periodic-table') {
                document.getElementById('periodic-table').scrollIntoView({ behavior: 'smooth' });
            } else {
                alert(`Feature "${feature}" em desenvolvimento! 🚧`);
            }
        });
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes scaleIn {
        from {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes scaleOut {
        from {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        to {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('%c⚛️ ChemMaster', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cBem-vindo ao ChemMaster!', 'font-size: 14px; color: #b0b8c4;');
console.log('%cDomine a química de forma interativa! 🧪', 'font-size: 12px; color: #4facfe;');
