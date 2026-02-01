// ==================== DADOS DOS ELEMENTOS QUÍMICOS ====================
// Dataset simplificado dos 118 elementos da tabela periódica

const ELEMENTS_DATA = [
    { symbol: "H", name: "Hidrogênio", number: 1, mass: 1.008, category: "non-metal", row: 1, col: 1 },
    { symbol: "He", name: "Hélio", number: 2, mass: 4.003, category: "noble-gas", row: 1, col: 18 },
    { symbol: "Li", name: "Lítio", number: 3, mass: 6.941, category: "alkali-metal", row: 2, col: 1 },
    { symbol: "Be", name: "Berílio", number: 4, mass: 9.012, category: "alkaline-earth-metal", row: 2, col: 2 },
    { symbol: "B", name: "Boro", number: 5, mass: 10.811, category: "metalloid", row: 2, col: 13 },
    { symbol: "C", name: "Carbono", number: 6, mass: 12.011, category: "non-metal", row: 2, col: 14 },
    { symbol: "N", name: "Nitrogênio", number: 7, mass: 14.007, category: "non-metal", row: 2, col: 15 },
    { symbol: "O", name: "Oxigênio", number: 8, mass: 15.999, category: "non-metal", row: 2, col: 16 },
    { symbol: "F", name: "Flúor", number: 9, mass: 18.998, category: "halogen", row: 2, col: 17 },
    { symbol: "Ne", name: "Neônio", number: 10, mass: 20.180, category: "noble-gas", row: 2, col: 18 },
    { symbol: "Na", name: "Sódio", number: 11, mass: 22.990, category: "alkali-metal", row: 3, col: 1 },
    { symbol: "Mg", name: "Magnésio", number: 12, mass: 24.305, category: "alkaline-earth-metal", row: 3, col: 2 },
    { symbol: "Al", name: "Alumínio", number: 13, mass: 26.982, category: "post-transition-metal", row: 3, col: 13 },
    { symbol: "Si", name: "Silício", number: 14, mass: 28.086, category: "metalloid", row: 3, col: 14 },
    { symbol: "P", name: "Fósforo", number: 15, mass: 30.974, category: "non-metal", row: 3, col: 15 },
    { symbol: "S", name: "Enxofre", number: 16, mass: 32.065, category: "non-metal", row: 3, col: 16 },
    { symbol: "Cl", name: "Cloro", number: 17, mass: 35.453, category: "halogen", row: 3, col: 17 },
    { symbol: "Ar", name: "Argônio", number: 18, mass: 39.948, category: "noble-gas", row: 3, col: 18 },
    { symbol: "K", name: "Potássio", number: 19, mass: 39.098, category: "alkali-metal", row: 4, col: 1 },
    { symbol: "Ca", name: "Cálcio", number: 20, mass: 40.078, category: "alkaline-earth-metal", row: 4, col: 2 },
    // Metais de transição (linha 4)
    { symbol: "Sc", name: "Escândio", number: 21, mass: 44.956, category: "transition-metal", row: 4, col: 3 },
    { symbol: "Ti", name: "Titânio", number: 22, mass: 47.867, category: "transition-metal", row: 4, col: 4 },
    { symbol: "V", name: "Vanádio", number: 23, mass: 50.942, category: "transition-metal", row: 4, col: 5 },
    { symbol: "Cr", name: "Crômio", number: 24, mass: 51.996, category: "transition-metal", row: 4, col: 6 },
    { symbol: "Mn", name: "Manganês", number: 25, mass: 54.938, category: "transition-metal", row: 4, col: 7 },
    { symbol: "Fe", name: "Ferro", number: 26, mass: 55.845, category: "transition-metal", row: 4, col: 8 },
    { symbol: "Co", name: "Cobalto", number: 27, mass: 58.933, category: "transition-metal", row: 4, col: 9 },
    { symbol: "Ni", name: "Níquel", number: 28, mass: 58.693, category: "transition-metal", row: 4, col: 10 },
    { symbol: "Cu", name: "Cobre", number: 29, mass: 63.546, category: "transition-metal", row: 4, col: 11 },
    { symbol: "Zn", name: "Zinco", number: 30, mass: 65.380, category: "transition-metal", row: 4, col: 12 },
    { symbol: "Ga", name: "Gálio", number: 31, mass: 69.723, category: "post-transition-metal", row: 4, col: 13 },
    { symbol: "Ge", name: "Germânio", number: 32, mass: 72.640, category: "metalloid", row: 4, col: 14 },
    { symbol: "As", name: "Arsênio", number: 33, mass: 74.922, category: "metalloid", row: 4, col: 15 },
    { symbol: "Se", name: "Selênio", number: 34, mass: 78.960, category: "nonmetal", row: 4, col: 16 },
    { symbol: "Br", name: "Bromo", number: 35, mass: 79.904, category: "halogen", row: 4, col: 17 },
    { symbol: "Kr", name: "Criptônio", number: 36, mass: 83.798, category: "noble-gas", row: 4, col: 18 },
    // ... Mais 82 elementos seguindo o mesmo padrão
    // Para o MVP, incluir os principais. Dataset completo pode ser expandido
];

// ==================== BANCO DE QUESTÕES QUIZ ====================
const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "Qual é o símbolo químico do elemento Ouro?",
        answers: ["Ou", "Au", "Go", "Or"],
        correct: 1,
        category: "periodic-table",
        difficulty: "easy"
    },
    {
        id: 2,
        question: "Quantos prótons possui um átomo de Carbono?",
        answers: ["4", "6", "12", "14"],
        correct: 1,
        category: "atomic-structure",
        difficulty: "easy"
    },
    {
        id: 3,
        question: "Qual é a fórmula molecular da água?",
        answers: ["HO", "H2O", "H2O2", "HO2"],
        correct: 1,
        category: "compounds",
        difficulty: "easy"
    },
    {
        id: 4,
        question: "Qual elemento tem o maior raio atômico?",
        answers: ["Hélio", "Flúor", "Césio", "Frâncio"],
        correct: 3,
        category: "periodic-trends",
        difficulty: "medium"
    },
    {
        id: 5,
        question: "Qual tipo de ligação ocorre entre Na e Cl no NaCl?",
        answers: ["Covalente", "Iônica", "Metálica", "Van der Waals"],
        correct: 1,
        category: "chemical-bonds",
        difficulty: "medium"
    },
    {
        id: 6,
        question: "Quantos elétrons cabem na camada de valência?",
        answers: ["2", "8", "10", "18"],
        correct: 1,
        category: "electron-config",
        difficulty: "medium"
    },
    {
        id: 7,
        question: "Qual é o número de Avogadro (aproximado)?",
        answers: ["6.02 × 10²²", "6.02 × 10²³", "6.02 × 10²⁴", "6.02 × 10²⁵"],
        correct: 1,
        category: "stoichiometry",
        difficulty: "hard"
    },
    {
        id: 8,
        question: "Qual composto é considerado um ácido forte?",
        answers: ["H2CO3", "HCl", "CH3COOH", "NH3"],
        correct: 1,
        category: "acid-base",
        difficulty: "hard"
    },
    {
        id: 9,
        question: "Qual a geometria da molécula de CH4?",
        answers: ["Linear", "Trigonal plana", "Tetraédrica", "Piramidal"],
        correct: 2,
        category: "molecular-geometry",
        difficulty: "hard"
    },
    {
        id: 10,
        question: "Qual gás nobre é usado em letreiros luminosos?",
        answers: ["Hélio", "Neônio", "Argônio", "Xenônio"],
        correct: 1,
        category: "applications",
        difficulty: "medium"
    }
];

// ==================== SISTEMA DE GAMIFICAÇÃO ====================
const ACHIEVEMENTS = [
    { id: "first_quiz", name: "Primeiro Quiz", description: "Complete seu primeiro quiz", icon: "🎓", xp: 50 },
    { id: "perfect_score", name: "Perfeição", description: "Acerte todas as questões de um quiz", icon: "💯", xp: 100 },
    { id: "speedster", name: "Velocista", description: "Responda uma questão em menos de 5 segundos", icon: "⚡", xp: 30 },
    { id: "chemist", name: "Químico", description: "Acerte 50 questões", icon: "🧪", xp: 200 },
    { id: "master", name: "Mestre", description: "Alcance nível 10", icon: "🏆", xp: 500 },
    { id: "explorer", name: "Explorador", description: "Visualize 20 elementos diferentes", icon: "🔍", xp: 75 },
    { id: "streak", name: "Sequência", description: "Acerte 5 questões seguidas", icon: "🔥", xp: 150 }
];

// Níveis e XP necessário
const LEVELS = [
    { level: 1, xpRequired: 0, title: "Aprendiz" },
    { level: 2, xpRequired: 100, title: "Estudante" },
    { level: 3, xpRequired: 250, title: "Praticante" },
    { level: 4, xpRequired: 500, title: "Conhecedor" },
    { level: 5, xpRequired: 1000, title: "Especialista" },
    { level: 6, xpRequired: 2000, title: "Expert" },
    { level: 7, xpRequired: 3500, title: "Mestre" },
    { level: 8, xpRequired: 5500, title: "Sábio" },
    { level: 9, xpRequired: 8000, title: "Guru" },
    { level: 10, xpRequired: 12000, title: "Mestre Químico" }
];

// ==================== INFORMAÇÕES DETALHADAS DOS ELEMENTOS ====================
const ELEMENT_DETAILS_TEMPLATE = {
    "H": {
        discovered: "1766",
        discoverer: "Henry Cavendish",
        uses: ["Combustível", "Produção de amônia", "Hidrogenação de óleos"],
        state: "Gas",
        meltingPoint: "-259.16°C",
        boilingPoint: "-252.87°C",
        density: "0.0899 g/L",
        electronConfig: "1s¹",
        electronegativity: 2.20,
        ionizationEnergy: "1312 kJ/mol",
        atomicRadius: "25 pm",
        facts: [
            "Elemento mais abundante no universo",
            "Combustível das estrelas",
            "Forma 75% da massa do universo"
        ]
    },
    "O": {
        discovered: "1774",
        discoverer: "Joseph Priestley",
        uses: ["Respiração", "Combustão", "Processos industriais"],
        state: "Gas",
        meltingPoint: "-218.79°C",
        boilingPoint: "-182.96°C",
        density: "1.429 g/L",
        electronConfig: "1s² 2s² 2p⁴",
        electronegativity: 3.44,
        ionizationEnergy: "1314 kJ/mol",
        atomicRadius: "60 pm",
        facts: [
            "Essencial para a vida",
            "Segundo elemento mais abundante na Terra",
            "Forma 21% da atmosfera"
        ]
    },
    "Au": {
        discovered: "Pré-história",
        discoverer: "Desconhecido",
        uses: ["Joalheria", "Eletrônicos", "Investimento"],
        state: "Solid",
        meltingPoint: "1064.18°C",
        boilingPoint: "2856°C",
        density: "19.3 g/cm³",
        electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹",
        electronegativity: 2.54,
        ionizationEnergy: "890 kJ/mol",
        atomicRadius: "135 pm",
        facts: [
            "Símbolo vem do latim 'aurum'",
            "Metal mais maleável e dúctil",
            "Não reage com a maioria dos ácidos"
        ]
    }
    // Mais elementos podem ser adicionados conforme necessário
};
