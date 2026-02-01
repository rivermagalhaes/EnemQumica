// ==================== CURRÍCULO DE QUÍMICA ORGÂNICA ====================
// Portado do código Python para JS estático

const ORGANIC_CURRICULUM = {
    "petroleum_formation": {
        id: "petroleum_formation",
        title: "Formação do Petróleo",
        description: "Processo geológico e bioquímico de formação do petróleo",
        difficulty: 2,
        estimated_time: 45,
        prerequisites: [],
        category: "petroleum",
        content: {
            sections: [
                {
                    title: "Acúmulo de Matéria Orgânica",
                    content: `
                    - Fonte principal: microorganismos marinhos (fitoplâncton, zooplâncton)
                    - Ambiente ideal: bacias sedimentares marinhas anóxicas
                    - Processo: acumulação no fundo oceânico com sedimentos
                    `,
                    key_terms: ["bioprodução", "anóxico", "sedimentos"]
                },
                {
                    title: "Diagênese: Formação do Querogênio",
                    content: `
                    - Transformação sob pressão e temperatura moderadas
                    - Ação de bactérias anaeróbicas
                    - Formação do QUEROGÊNIO e ROCHA-MÃE
                    `,
                    key_terms: ["querogênio", "rocha-mãe", "diagênese"]
                },
                {
                    title: "Catagênese: Geração do Petróleo",
                    content: `
                    - Temperatura: 60°C a 150°C (Janela de Geração)
                    - Cracking térmico do querogênio
                    - Tipos de querogênio: I (lacustre), II (marinho), III (húmico)
                    `,
                    key_terms: ["catagênese", "cracking", "janela_geracao"]
                }
            ],
            summary: "O petróleo é formado por matéria orgânica soterrada, transformada por calor e pressão ao longo de milhões de anos.",
            real_world_connection: "Entender a formação do petróleo ajuda na exploração de reservas e na compreensão dos combustíveis fósseis."
        }
    },

    "hydrocarbons_basics": {
        id: "hydrocarbons_basics",
        title: "Hidrocarbonetos: Conceitos Fundamentais",
        description: "Alcanos, alcenos, alcinos e aromáticos",
        difficulty: 1,
        estimated_time: 60,
        prerequisites: ["petroleum_formation"],
        category: "hydrocarbons",
        content: {
            sections: [
                {
                    title: "Alcanos (Parafinas)",
                    content: `
                    - Fórmula geral: CₙH₂ₙ₊₂
                    - Apenas ligações simples (saturados)
                    - Baixa reatividade
                    - Exemplos: metano, propano, octano
                    - Aplicações: combustíveis, solventes, lubrificantes
                    `,
                    examples: [
                        "CH₄ (metano) - gás natural",
                        "C₈H₁₈ (octano) - componente da gasolina"
                    ]
                },
                {
                    title: "Alcenos (Olefinas)",
                    content: `
                    - Fórmula geral: CₙH₂ₙ (uma dupla ligação)
                    - Ligação dupla (σ + π)
                    - Alta reatividade (adição eletrofílica)
                    - Geometria trigonal plana
                    - Aplicações: polímeros, produção de álcoois
                    `,
                    examples: [
                        "CH₂=CH₂ (eteno) - produção de polietileno",
                        "CH₃-CH=CH₂ (propeno) - produção de polipropileno"
                    ]
                }
            ]
        }
    },

    "nomenclature": {
        id: "nomenclature",
        title: "Nomenclatura IUPAC",
        description: "Regras sistemáticas para nomear compostos orgânicos",
        difficulty: 2,
        estimated_time: 90,
        prerequisites: ["hydrocarbons_basics"],
        category: "basics",
        content: {
            rules: [
                "1. Identificar a cadeia principal mais longa",
                "2. Numerar para menores números aos substituintes",
                "3. Nomear radicais em ordem alfabética",
                "4. Indicar posições de insaturações"
            ],
            examples: [
                {
                    structure: "CH₃-CH(CH₃)-CH₂-CH₃",
                    name: "2-metilbutano",
                    explanation: "Cadeia de 4C (butano) com metil no carbono 2"
                }
            ]
        }
    }
};

// Seeder function to populate Supabase if needed
async function seedTopics(supabaseClient) {
    console.log("Seeding Chemistry Topics...");
    const topics = Object.values(ORGANIC_CURRICULUM).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        difficulty: t.difficulty,
        estimated_time: t.estimated_time,
        content_data: t.content,
        prerequisites: t.prerequisites
    }));

    const { error } = await supabaseClient.from('chemistry_topics').upsert(topics);
    if (error) console.error("Error seeding topics:", error);
    else console.log("Topics seeded successfully!");
}
