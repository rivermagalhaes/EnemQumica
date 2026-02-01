// ==================== GAME STATE ====================
const GameState = {
    user: {
        xp: parseInt(localStorage.getItem('organica_xp')) || 0,
        achievements: JSON.parse(localStorage.getItem('organica_achievements')) || [],
        completedChallenges: JSON.parse(localStorage.getItem('organica_challenges')) || []
    },
    memory: {
        level: 1,
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        timer: 0,
        timerInterval: null
    },
    detective: {
        currentScene: 'kitchen',
        foundCompounds: []
    }
};

// ==================== DATA: ORGANIC FUNCTIONS ====================
const ORGANIC_FUNCTIONS = [
    // Level 1: Hydrocarbons
    { id: 1, name: 'Alcano', structure: 'CH₃-CH₃', example: 'Etano', level: 1, color: '#4caf50' },
    { id: 2, name: 'Alceno', structure: 'CH₂=CH₂', example: 'Eteno', level: 1, color: '#2196f3' },
    { id: 3, name: 'Alcino', structure: 'CH≡CH', example: 'Etino', level: 1, color: '#00bcd4' },
    { id: 4, name: 'Aromático', structure: 'C₆H₆', example: 'Benzeno', level: 1, color: '#9c27b0' },

    // Level 2: Oxygenated
    { id: 5, name: 'Álcool', structure: 'CH₃-OH', example: 'Metanol', level: 2, color: '#ff9800' },
    { id: 6, name: 'Fenol', structure: 'C₆H₅-OH', example: 'Fenol', level: 2, color: '#ff5722' },
    { id: 7, name: 'Éter', structure: 'CH₃-O-CH₃', example: 'Éter', level: 2, color: '#ffc107' },
    { id: 8, name: 'Aldeído', structure: 'CH₃-CHO', example: 'Etanal', level: 2, color: '#cddc39' },

    // Level 3+
    { id: 9, name: 'Cetona', structure: 'CH₃-CO-CH₃', example: 'Propanona', level: 3, color: '#8bc34a' },
    { id: 10, name: 'Ácido Carboxílico', structure: 'CH₃-COOH', example: 'Ác. Acético', level: 3, color: '#f44336' },
    { id: 11, name: 'Éster', structure: 'CH₃-COO-CH₃', example: 'Acetato de Metila', level: 3, color: '#e91e63' },
    { id: 12, name: 'Amina', structure: 'CH₃-NH₂', example: 'Metilamina', level: 4, color: '#9c27b0' }
];

// ==================== DATA: DAILY LIFE COMPOUNDS ====================
const DAILY_COMPOUNDS = {
    kitchen: [
        { id: 'vinegar', name: 'Vinagre', molecule: 'Ácido Acético', formula: 'CH₃COOH', function: 'Ácido Carboxílico', fact: 'Usado há mais de 10 mil anos!', position: { top: '30%', left: '45%' } },
        { id: 'sugar', name: 'Açúcar', molecule: 'Sacarose', formula: 'C₁₂H₂₂O₁₁', function: 'Dissacarídeo', fact: 'Cada molécula tem 45 átomos!', position: { top: '50%', left: '20%' } },
        { id: 'oil', name: 'Óleo de Cozinha', molecule: 'Triglicerídeo', formula: 'C₅₇H₁₀₄O₆', function: 'Éster', fact: 'Formado por ácidos graxos', position: { top: '40%', left: '70%' } },
        { id: 'vanilla', name: 'Baunilha', molecule: 'Vanilina', formula: 'C₈H₈O₃', function: 'Aldeído Aromático', fact: 'Responsável pelo aroma!', position: { top: '25%', left: '80%' } },
        { id: 'salt', name: 'Sal', molecule: 'Cloreto de Sódio', formula: 'NaCl', function: 'Composto Inorgânico', fact: 'Essencial para a vida!', position: { top: '60%', left: '50%' } }
    ],
    bathroom: [
        { id: 'alcohol', name: 'Álcool em Gel', molecule: 'Etanol', formula: 'C₂H₅OH', function: 'Álcool', fact: 'Mata 99,9% dos germes!', position: { top: '35%', left: '25%' } },
        { id: 'soap', name: 'Sabonete', molecule: 'Estearato de Sódio', formula: 'C₁₇H₃₅COONa', function: 'Sal de Ácido Graxo', fact: 'Remove gordura com micelas!', position: { top: '45%', left: '60%' } },
        { id: 'perfume', name: 'Perfume', molecule: 'Acetato de Linalila', formula: 'C₁₂H₂₀O₂', function: 'Éster', fact: 'Extraído de flores!', position: { top: '30%', left: '75%' } }
    ],
    garage: [
        { id: 'gasoline', name: 'Gasolina', molecule: 'Octano', formula: 'C₈H₁₈', function: 'Alcano', fact: 'Mistura de hidrocarbonetos!', position: { top: '40%', left: '30%' } },
        { id: 'tire', name: 'Pneu', molecule: 'Borracha (Poliisopreno)', formula: '(C₅H₈)ₙ', function: 'Polímero', fact: 'Elástico por ligações duplas!', position: { top: '60%', left: '50%' } }
    ],
    pharmacy: [
        { id: 'aspirin', name: 'Aspirina', molecule: 'Ác. Acetilsalicílico', formula: 'C₉H₈O₄', function: 'Éster + Ácido', fact: 'Analgésico mais usado no mundo!', position: { top: '35%', left: '40%' } },
        { id: 'vitamin_c', name: 'Vitamina C', molecule: 'Ác. Ascórbico', formula: 'C₆H₈O₆', function: 'Ácido', fact: 'Antioxidante essencial!', position: { top: '45%', left: '65%' } }
    ]
};

// ==================== DATA: ACHIEVEMENTS ====================
const ACHIEVEMENTS = [
    { id: 'first_molecule', name: 'Primeira Molécula', icon: '🧬', xp: 20, description: 'Construiu sua primeira molécula' },
    { id: 'alkane_master', name: 'Mestre dos Alcanos', icon: '💚', xp: 100, description: 'Identificou 5 alcanos' },
    { id: 'memory_champion', name: 'Campeão da Memória', icon: '🏆', xp: 150, description: 'Completou nível 3 do memory game' },
    { id: 'detective_pro', name: 'Detetive Profissional', icon: '🔍', xp: 100, description: 'Encontrou 10 compostos no cotidiano' },
    { id: 'speedster', name: 'Velocista', icon: '⚡', xp: 50, description: 'Completou memory game em menos de 60s' },
    { id: 'chemistry_guru', name: 'Guru da Química', icon: '🎓', xp: 500, description: 'Alcançou 1000 XP' }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    updateXPDisplay();
    renderAchievements();
    loadProgress();
});

function updateXPDisplay() {
    document.getElementById('xp-value').textContent = `${GameState.user.xp} XP`;
}

async function addXP(amount) {
    GameState.user.xp += amount;
    localStorage.setItem('organica_xp', GameState.user.xp);
    updateXPDisplay();

    // Update main ENEM FLASH XP
    const mainXP = parseInt(localStorage.getItem('enemflash_xp')) || 0;
    localStorage.setItem('enemflash_xp', mainXP + amount);

    showNotification(`+${amount} XP ganhos!`, 'success');

    // SYNC WITH SUPABASE
    if (typeof supabase !== 'undefined') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // First get current remote XP to avoid overwrite conflicts
            const { data: profile } = await supabase
                .from('student_profiles')
                .select('xp')
                .eq('id', user.id)
                .single();

            if (profile) {
                await supabase
                    .from('student_profiles')
                    .update({
                        xp: profile.xp + amount,
                        last_active: new Date().toISOString()
                    })
                    .eq('id', user.id);
            }
        }
    }

    // Check achievements
    checkGlobalAchievements();
}

function checkGlobalAchievements() {
    if (GameState.user.xp >= 1000 && !GameState.user.achievements.includes('chemistry_guru')) {
        unlockAchievement('chemistry_guru');
    }
}

function unlockAchievement(achievementId) {
    if (GameState.user.achievements.includes(achievementId)) return;

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    GameState.user.achievements.push(achievementId);
    localStorage.setItem('organica_achievements', JSON.stringify(GameState.user.achievements));

    addXP(achievement.xp);
    showAchievementNotification(achievement);
    renderAchievements();
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        background: rgba(26, 26, 46, 0.98);
        border: 2px solid #ffd700;
        border-radius: 1rem;
        padding: 1.5rem;
        z-index: 9999;
        animation: slideInRight 0.5s ease;
        box-shadow: 0 20px 40px rgba(0,0,0,0.7);
        max-width: 300px;
    `;
    notification.innerHTML = `
        <div style="font-size: 3rem; text-align: center; margin-bottom: 0.5rem;">${achievement.icon}</div>
        <h4 style="margin: 0.5rem 0; color: #ffd700;">🏆 Conquista Desbloqueada!</h4>
        <p style="margin: 0; font-weight: 700;">${achievement.name}</p>
        <p style="margin: 0.5rem 0 0; font-size: 0.875rem; color: rgba(255,255,255,0.7);">${achievement.description}</p>
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;

    grid.innerHTML = ACHIEVEMENTS.map(achievement => {
        const unlocked = GameState.user.achievements.includes(achievement.id);
        return `
            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-xp">+${achievement.xp} XP</div>
            </div>
        `;
    }).join('');
}

function loadProgress() {
    // Load saved progress from localStorage
    console.log('Progresso carregado:', GameState.user);
}

// ==================== MODAL CONTROLS ====================
function openMoleculeBuilder() {
    document.getElementById('builder-modal').classList.remove('hidden');
}

function openMemoryGame() {
    document.getElementById('memory-modal').classList.remove('hidden');
    startMemoryGame();
}

function openDetectiveMode() {
    document.getElementById('detective-modal').classList.remove('hidden');
    loadScene('kitchen');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');

    // Clean up memory game timer
    if (modalId === 'memory-modal' && GameState.memory.timerInterval) {
        clearInterval(GameState.memory.timerInterval);
    }
}

// ==================== MOLECULE BUILDER ====================
function checkMolecule() {
    // Simplified check for demo
    showNotification('Molécula construída! 🎉', 'success');
    addXP(20);

    if (!GameState.user.achievements.includes('first_molecule')) {
        unlockAchievement('first_molecule');
    }

    // Celebration effect
    createConfetti();
}

function clearWorkspace() {
    const workspace = document.getElementById('workspace');
    workspace.innerHTML = '<p class="workspace-hint">Arraste átomos para cá para começar a construir!</p>';
}

function createConfetti() {
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${['#ffd700', '#4caf50', '#2196f3', '#ff9800'][Math.floor(Math.random() * 4)]};
            top: 50%;
            left: 50%;
            animation: confetti-fall ${1 + Math.random()}s ease-out forwards;
            transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
            z-index: 10000;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 2000);
    }
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        to {
            transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 300 + 200}px) rotate(${Math.random() * 720}deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== MEMORY GAME ====================
function startMemoryGame() {
    const level = GameState.memory.level;
    const functionsForLevel = ORGANIC_FUNCTIONS.filter(f => f.level === level);
    const cards = [];

    // Create pairs
    functionsForLevel.forEach(func => {
        cards.push({ id: func.id, type: 'name', content: func.name, color: func.color });
        cards.push({ id: func.id, type: 'structure', content: func.structure, color: func.color });
    });

    // Shuffle
    const shuffled = cards.sort(() => Math.random() - 0.5);

    // Render
    const board = document.getElementById('memory-board');
    board.innerHTML = shuffled.map((card, index) => `
        <div class="memory-card" data-id="${card.id}" data-index="${index}" onclick="flipCard(${index})">
            <div class="card-face card-front">🧪</div>
            <div class="card-face card-back" style="background: ${card.color};">
                <div style="font-size: 1.25rem; font-weight: 700;">${card.content}</div>
            </div>
        </div>
    `).join('');

    // Update stats
    document.getElementById('current-level').textContent = level;
    document.getElementById('total-pairs').textContent = functionsForLevel.length;
    document.getElementById('pairs-found').textContent = '0';

    // Reset state
    GameState.memory.flippedCards = [];
    GameState.memory.matchedPairs = 0;
    GameState.memory.moves = 0;
    GameState.memory.timer = 0;

    // Start timer
    if (GameState.memory.timerInterval) clearInterval(GameState.memory.timerInterval);
    GameState.memory.timerInterval = setInterval(() => {
        GameState.memory.timer++;
        document.getElementById('timer').textContent = `${GameState.memory.timer}s`;
    }, 1000);
}

function flipCard(index) {
    const cards = document.querySelectorAll('.memory-card');
    const card = cards[index];

    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (GameState.memory.flippedCards.length >= 2) return;

    card.classList.add('flipped');
    GameState.memory.flippedCards.push({ index, id: card.dataset.id });

    if (GameState.memory.flippedCards.length === 2) {
        setTimeout(checkMatch, 800);
    }
}

function checkMatch() {
    const [card1, card2] = GameState.memory.flippedCards;
    const cards = document.querySelectorAll('.memory-card');

    if (card1.id === card2.id) {
        // Match!
        cards[card1.index].classList.add('matched');
        cards[card2.index].classList.add('matched');
        GameState.memory.matchedPairs++;

        document.getElementById('pairs-found').textContent = GameState.memory.matchedPairs;

        // Check if level complete
        const totalPairs = parseInt(document.getElementById('total-pairs').textContent);
        if (GameState.memory.matchedPairs === totalPairs) {
            levelComplete();
        }
    } else {
        // No match
        cards[card1.index].classList.remove('flipped');
        cards[card2.index].classList.remove('flipped');
    }

    GameState.memory.flippedCards = [];
}

function levelComplete() {
    clearInterval(GameState.memory.timerInterval);

    const xpEarned = 30 + (GameState.memory.level * 10);
    addXP(xpEarned);

    if (GameState.memory.timer < 60 && !GameState.user.achievements.includes('speedster')) {
        unlockAchievement('speedster');
    }

    if (GameState.memory.level >= 3 && !GameState.user.achievements.includes('memory_champion')) {
        unlockAchievement('memory_champion');
    }

    showNotification(`Nível ${GameState.memory.level} completo! 🎉`, 'success');

    setTimeout(() => {
        alert(`Parabéns! Nível ${GameState.memory.level} completo em ${GameState.memory.timer}s!\n+${xpEarned} XP`);
    }, 500);
}

function restartMemoryGame() {
    startMemoryGame();
}

function useHint() {
    if (GameState.user.xp >= 10) {
        addXP(-10);
        showNotification('Dica: Foque nas cores das cartas!', 'info');
    } else {
        showNotification('XP insuficiente para dica!', 'error');
    }
}

// ==================== DETECTIVE MODE ====================
function loadScene(sceneName) {
    GameState.detective.currentScene = sceneName;

    // Update active button
    document.querySelectorAll('.scene-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const compounds = DAILY_COMPOUNDS[sceneName];
    const scene = document.getElementById('detective-scene');

    scene.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 2rem;">Clique nos objetos brilhantes! ✨</h3>
        ${compounds.map(compound => `
            <div class="hotspot" style="top: ${compound.position.top}; left: ${compound.position.left};" 
                 onclick="revealCompound('${compound.id}', '${sceneName}')">
                <div class="pulse-ring"></div>
            </div>
        `).join('')}
    `;

    // Update mission
    document.getElementById('mission-progress').innerHTML = `Progresso: <strong>0/${compounds.length}</strong>`;
}

function revealCompound(compoundId, sceneName) {
    const compound = DAILY_COMPOUNDS[sceneName].find(c => c.id === compoundId);

    // Show popup
    const popup = document.getElementById('compound-popup');
    document.getElementById('compound-name').textContent = compound.name;
    document.getElementById('compound-molecule').textContent = compound.molecule;
    document.getElementById('compound-formula').textContent = compound.formula;
    document.getElementById('compound-function').textContent = `Função: ${compound.function}`;
    document.getElementById('compound-fact').textContent = `💡 ${compound.fact}`;

    popup.classList.remove('hidden');

    // Add to found list
    if (!GameState.detective.foundCompounds.includes(compoundId)) {
        GameState.detective.foundCompounds.push(compoundId);
        addXP(15);

        // Update progress
        const total = DAILY_COMPOUNDS[sceneName].length;
        const found = GameState.detective.foundCompounds.filter(id =>
            DAILY_COMPOUNDS[sceneName].some(c => c.id === id)
        ).length;

        document.getElementById('mission-progress').innerHTML = `Progresso: <strong>${found}/${total}</strong>`;

        // Check achievements
        if (GameState.detective.foundCompounds.length >= 10 && !GameState.user.achievements.includes('detective_pro')) {
            unlockAchievement('detective_pro');
        }
    }
}

function closePopup() {
    document.getElementById('compound-popup').classList.add('hidden');
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: rgba(26, 26, 46, 0.95);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 0.75rem;
        color: white;
        font-weight: 600;
        z-index: 9999;
        animation: slideInRight 0.4s ease, slideOutRight 0.4s ease 2.1s;
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2500);
}

console.log('%c🧬 Orgânica Play', 'font-size: 24px; font-weight: bold; color: #4caf50;');
console.log('%cBem-vindo ao Orgânica Play! Química nunca foi tão divertida! 🎮', 'font-size: 12px; color: #2196f3;');
