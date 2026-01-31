// ==================== PHYSICHEM LAB - SIMULATION ENGINE ====================

// ==================== STATE MANAGEMENT ====================
const PhysChemState = {
    xp: parseInt(localStorage.getItem('physichem_xp')) || 0,
    currentSimulator: null,
    experiments: JSON.parse(localStorage.getItem('physichem_experiments')) || [],

    // Thermochemistry
    thermo: {
        currentReaction: 'combustion',
        temperature: 25,
        isRunning: false
    },

    // Kinetics
    kinetics: {
        temperature: 25,
        concentration: 1.0,
        surfaceArea: 3,
        catalyst: false,
        rate: 1.0,
        particles: [],
        animationId: null
    },

    // Solutions
    solutions: {
        solute: 'nacl',
        molarMass: 58.5,
        mass: 58.5,
        volume: 1000
    },

    // Gases
    gases: {
        law: 'boyle',
        pressure: 1.0,
        volume: 5.0,
        temperature: 25,
        mols: 0.2
    }
};

// ==================== REACTIONS DATABASE ====================
const REACTIONS = {
    combustion: {
        name: 'Combustão do Metano',
        equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
        deltaH: -890,
        type: 'exothermic',
        description: 'Reação de combustão que libera energia',
        tempChange: 75
    },
    photosynthesis: {
        name: 'Fotossíntese',
        equation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
        deltaH: +2800,
        type: 'endothermic',
        description: 'Absorve energia luminosa para produzir glicose',
        tempChange: -30
    },
    dissolving_nh4no3: {
        name: 'Dissolução de NH₄NO₃',
        equation: 'NH₄NO₃(s) → NH₄⁺(aq) + NO₃⁻(aq)',
        deltaH: +25,
        type: 'endothermic',
        description: 'Processo endotérmico - esfria a solução',
        tempChange: -15
    },
    neutralization: {
        name: 'Neutralização',
        equation: 'HCl + NaOH → NaCl + H₂O',
        deltaH: -57,
        type: 'exothermic',
        description: 'Reação ácido-base libera calor',
        tempChange: 40
    }
};

// ==================== SOLUTES DATABASE ====================
const SOLUTES = {
    nacl: { name: 'NaCl (Sal)', molarMass: 58.5, color: 'rgba(200, 200, 200, 0.2)' },
    sugar: { name: 'C₁₂H₂₂O₁₁ (Açúcar)', molarMass: 342, color: 'rgba(240, 230, 140, 0.3)' },
    kno3: { name: 'KNO₃ (Salitre)', molarMass: 101, color: 'rgba(255, 255, 255, 0.2)' },
    cuso4: { name: 'CuSO₄ (Sulfato de Cobre)', molarMass: 159.5, color: 'rgba(0, 150, 200, 0.4)' }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    updateXPDisplay();
});

function updateXPDisplay() {
    const display = document.getElementById('xp-value-pc');
    if (display) {
        display.textContent = `${PhysChemState.xp} XP`;
    }
}

function addXP(amount) {
    PhysChemState.xp += amount;
    localStorage.setItem('physichem_xp', PhysChemState.xp);
    updateXPDisplay();

    // Update main ENEM FLASH XP
    const mainXP = parseInt(localStorage.getItem('enemflash_xp')) || 0;
    localStorage.setItem('enemflash_xp', mainXP + amount);

    showNotification(`+${amount} XP ganhos!`, 'success');
}

function recordExperiment(simId) {
    if (!PhysChemState.experiments.includes(simId)) {
        PhysChemState.experiments.push(simId);
        localStorage.setItem('physichem_experiments', JSON.stringify(PhysChemState.experiments));
        addXP(25);
    }
}

// ==================== MODAL CONTROLS ====================
function openSimulator(type) {
    PhysChemState.currentSimulator = type;
    document.getElementById(`modal-${type}`).classList.remove('hidden');

    // Initialize specific simulator
    switch (type) {
        case 'thermo':
            selectReaction();
            break;
        case 'kinetics':
            initKinetics();
            break;
        case 'solutions':
            updateSolute();
            break;
        case 'gases':
            selectGasLaw();
            break;
    }
}

function closeSimulator() {
    if (PhysChemState.currentSimulator) {
        document.getElementById(`modal-${PhysChemState.currentSimulator}`).classList.add('hidden');

        // Stop kinetics animation
        if (PhysChemState.currentSimulator === 'kinetics' && PhysChemState.kinetics.animationId) {
            cancelAnimationFrame(PhysChemState.kinetics.animationId);
        }

        PhysChemState.currentSimulator = null;
    }
}

// ==================== THERMOCHEMISTRY SIMULATOR ====================
function selectReaction() {
    const select = document.getElementById('reaction-select');
    const reactionId = select.value;
    const reaction = REACTIONS[reactionId];

    PhysChemState.thermo.currentReaction = reactionId;

    // Update UI
    document.getElementById('reaction-info').innerHTML = `
        <p class="equation">${reaction.equation}</p>
        <p class="description">${reaction.description}</p>
    `;

    document.getElementById('deltaH-value').textContent = `${reaction.deltaH > 0 ? '+' : ''}${reaction.deltaH} kJ/mol`;

    const typeBadge = document.getElementById('reaction-type');
    typeBadge.textContent = reaction.type === 'exothermic' ? 'Exotérmica' : 'Endotérmica';
    typeBadge.className = `type-badge ${reaction.type}`;

    // Reset temperature
    PhysChemState.thermo.temperature = 25;
    updateThermometer(25);
}

function startReaction() {
    const reaction = REACTIONS[PhysChemState.thermo.currentReaction];

    PhysChemState.thermo.isRunning = true;
    document.getElementById('btn-start-reaction').disabled = true;
    document.getElementById('btn-start-reaction').textContent = '⏳ Reagindo...';

    // Animate temperature change
    const targetTemp = 25 + reaction.tempChange;
    animateTemperature(25, targetTemp, 2000);

    // Draw enthalpy diagram
    drawEnthalpyDiagram(reaction);

    setTimeout(() => {
        PhysChemState.thermo.isRunning = false;
        document.getElementById('btn-start-reaction').disabled = false;
        document.getElementById('btn-start-reaction').textContent = '▶ Iniciar Reação';
        showNotification('Reação completa!', 'success');
        recordExperiment('thermo');
    }, 2500);
}

function animateTemperature(from, to, duration) {
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        const currentTemp = from + (to - from) * progress;
        updateThermometer(currentTemp);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function updateThermometer(temp) {
    const mercury = document.getElementById('mercury-level');
    const display = document.getElementById('temp-display');

    // Map temp to height (−50°C to 150°C → 0% to 100%)
    const height = ((temp + 50) / 200) * 100;
    mercury.style.height = `${Math.max(0, Math.min(100, height))}%`;

    // Change color based on temp
    if (temp > 25) {
        mercury.classList.remove('cold');
    } else {
        mercury.classList.add('cold');
    }

    display.textContent = `${Math.round(temp)}°C`;
    PhysChemState.thermo.temperature = temp;
}

function drawEnthalpyDiagram(reaction) {
    const canvas = document.getElementById('enthalpy-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 300, 200);

    const isExo = reaction.type === 'exothermic';
    const reactantsY = isExo ? 50 : 150;
    const productsY = isExo ? 150 : 50;

    // Draw energy levels
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 3;

    // Reactants
    ctx.beginPath();
    ctx.moveTo(50, reactantsY);
    ctx.lineTo(100, reactantsY);
    ctx.stroke();

    // Transition state (curve)
    ctx.beginPath();
    ctx.moveTo(100, reactantsY);
    ctx.quadraticCurveTo(150, 20, 200, productsY);
    ctx.strokeStyle = '#ffc107';
    ctx.stroke();

    // Products
    ctx.strokeStyle = '#4caf50';
    ctx.beginPath();
    ctx.moveTo(200, productsY);
    ctx.lineTo(250, productsY);
    ctx.stroke();

    // Labels
    ctx.fillStyle = 'white';
    ctx.font = '12px Inter';
    ctx.fillText('Reagentes', 40, reactantsY - 10);
    ctx.fillText('Produtos', 200, productsY - 10);
    ctx.fillText(`ΔH = ${reaction.deltaH} kJ/mol`, 100, 190);
}

// ==================== KINETICS SIMULATOR ====================
function initKinetics() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    // Create particles
    PhysChemState.kinetics.particles = [];
    for (let i = 0; i < 30; i++) {
        PhysChemState.kinetics.particles.push({
            x: Math.random() * 400,
            y: Math.random() * 300,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 5
        });
    }

    updateKinetics();
    animateParticles();
}

function updateKinetics() {
    const temp = parseFloat(document.getElementById('temp-slider').value);
    const conc = parseFloat(document.getElementById('conc-slider').value);
    const surface = parseFloat(document.getElementById('surface-select').value);
    const catalyst = document.getElementById('catalyst-check').checked;

    PhysChemState.kinetics.temperature = temp;
    PhysChemState.kinetics.concentration = conc;
    PhysChemState.kinetics.surfaceArea = surface;
    PhysChemState.kinetics.catalyst = catalyst;

    // Calculate rate using simplified Arrhenius
    const k = 0.1;
    const Ea = 50; // kJ/mol
    const R = 8.314;
    const T = temp + 273.15;

    const rateConstant = k * Math.exp(-Ea / (R * T));
    const rate = rateConstant * conc * surface * (catalyst ? 2 : 1);

    PhysChemState.kinetics.rate = rate;

    // Update displays
    document.getElementById('temp-display-k').textContent = `${temp}°C`;
    document.getElementById('conc-display').textContent = `${conc.toFixed(1)} mol/L`;
    document.getElementById('rate-value').textContent = `${rate.toFixed(2)} mol/L·s`;

    // Update speed bar
    const speedBar = document.getElementById('speed-bar');
    const speedPercent = Math.min(100, (rate / 5) * 100);
    speedBar.style.width = `${speedPercent}%`;

    // Update particle speeds
    const speedMultiplier = 0.5 + rate * 0.5;
    PhysChemState.kinetics.particles.forEach(p => {
        p.speed = speedMultiplier;
    });

    if (PhysChemState.kinetics.rate > 0) {
        recordExperiment('kinetics');
    }
}

function animateParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function draw() {
        ctx.clearRect(0, 0, 400, 300);

        const speed = 0.5 + PhysChemState.kinetics.rate * 0.3;

        PhysChemState.kinetics.particles.forEach(p => {
            // Update position
            p.x += p.vx * speed;
            p.y += p.vy * speed;

            // Bounce off walls
            if (p.x < p.radius || p.x > 400 - p.radius) p.vx *= -1;
            if (p.y < p.radius || p.y > 300 - p.radius) p.vy *= -1;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#2196f3';
            ctx.fill();
        });

        PhysChemState.kinetics.animationId = requestAnimationFrame(draw);
    }

    draw();
}

// ==================== SOLUTIONS SIMULATOR ====================
function updateSolute() {
    const soluteId = document.getElementById('solute-select').value;
    const solute = SOLUTES[soluteId];

    PhysChemState.solutions.solute = soluteId;
    PhysChemState.solutions.molarMass = solute.molarMass;
}

function calculateConcentration() {
    const mass = parseFloat(document.getElementById('mass-input').value);
    const volume = parseFloat(document.getElementById('volume-input').value);
    const molarMass = PhysChemState.solutions.molarMass;

    if (isNaN(mass) || isNaN(volume) || volume === 0) {
        showNotification('Valores inválidos!', 'error');
        return;
    }

    // Calculations
    const volumeL = volume / 1000;
    const gPerL = mass / volumeL;
    const molPerL = (mass / molarMass) / volumeL;
    const percentage = (mass / (mass + volume)) * 100;

    // Display results
    document.getElementById('gPerL-result').textContent = `${gPerL.toFixed(2)} g/L`;
    document.getElementById('molPerL-result').textContent = `${molPerL.toFixed(3)} mol/L`;
    document.getElementById('percent-result').textContent = `${percentage.toFixed(2)}%`;

    // Update beaker visualization
    const solution = document.getElementById('solution-visual');
    const solute = SOLUTES[PhysChemState.solutions.solute];

    const heightPercent = Math.min(90, (volume / 1000) * 100);
    solution.style.height = `${heightPercent}%`;
    solution.style.background = solute.color;

    // Intensity based on concentration
    const intensity = Math.min(1, molPerL / 2);
    solution.style.opacity = 0.3 + intensity * 0.5;

    document.getElementById('beaker-concentration').textContent = `${molPerL.toFixed(2)} mol/L`;

    showNotification('Concentração calculada!', 'success');
    recordExperiment('solutions');
}

function calculateDilution() {
    const C1 = parseFloat(document.getElementById('c1-input').value);
    const V1 = parseFloat(document.getElementById('v1-input').value);
    const C2 = parseFloat(document.getElementById('c2-input').value);

    if (isNaN(C1) || isNaN(V1) || isNaN(C2) || C2 === 0) {
        showNotification('Valores inválidos!', 'error');
        return;
    }

    // C1V1 = C2V2 → V2 = C1V1 / C2
    const V2 = (C1 * V1) / C2;

    document.getElementById('v2-input').value = V2.toFixed(1);

    showNotification(`V₂ = ${V2.toFixed(1)} mL`, 'success');
}

// ==================== GASES SIMULATOR ====================
function selectGasLaw() {
    const law = document.getElementById('gas-law-select').value;
    PhysChemState.gases.law = law;
    updateGas();
}

function updateGas() {
    let P = parseFloat(document.getElementById('pressure-slider').value);
    let V = parseFloat(document.getElementById('volume-slider').value);
    let T = parseFloat(document.getElementById('temp-slider-gas').value);
    const n = parseFloat(document.getElementById('mols-input').value);

    const R = 0.082; // atm·L/(mol·K)
    const TKelvin = T + 273.15;

    const law = PhysChemState.gases.law;

    // Apply gas law constraints
    if (law === 'boyle') {
        // P × V = constant (T fixed)
        const constant = P * V;
        // Don't recalculate - let user control P and V independently
    } else if (law === 'charles') {
        // V / T = constant (P fixed)
        V = (V / TKelvin) * TKelvin; // Keep proportional
    } else if (law === 'gay-lussac') {
        // P / T = constant (V fixed)
        P = (P / TKelvin) * TKelvin;
    } else if (law === 'ideal') {
        // PV = nRT - calculate from ideal gas law
        // Keep user inputs as-is
    }

    // Update displays
    document.getElementById('pressure-display').textContent = P.toFixed(1);
    document.getElementById('volume-display').textContent = V.toFixed(1);
    document.getElementById('temp-display-gas').textContent = Math.round(T);

    document.getElementById('p-stat').textContent = `${P.toFixed(2)} atm`;
    document.getElementById('v-stat').textContent = `${V.toFixed(1)} L`;
    document.getElementById('t-stat').textContent = `${Math.round(TKelvin)} K`;

    // Calculate constant
    const constant = (P * V) / (n * TKelvin);
    document.getElementById('constant-value').textContent = constant.toFixed(3);

    // Update balloon visualization
    updateBalloon(V, P);

    // Update state
    PhysChemState.gases.pressure = P;
    PhysChemState.gases.volume = V;
    PhysChemState.gases.temperature = T;
    PhysChemState.gases.mols = n;

    recordExperiment('gases');
}

function updateBalloon(volume, pressure) {
    const balloon = document.getElementById('balloon-shape');

    // Map volume (1-10 L) to radius (30-100)
    const rx = 30 + (volume - 1) * 7;
    const ry = 50 + (volume - 1) * 10;

    balloon.setAttribute('rx', rx);
    balloon.setAttribute('ry', ry);

    // Color intensity based on pressure
    const opacity = 0.3 + (pressure - 0.5) * 0.2;
    balloon.style.fill = `rgba(66, 165, 245, ${opacity})`;
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
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
        animation: slideIn 0.3s ease;
    `;

    if (type === 'success') {
        notification.style.borderColor = '#4caf50';
    } else if (type === 'error') {
        notification.style.borderColor = '#f44336';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
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

console.log('%c🧪 PhysChem Lab', 'font-size: 24px; font-weight: bold; color: #2196f3;');
console.log('%cLaboratórios virtuais interativos carregados! ⚗️', 'font-size: 12px; color: #00bcd4;');
