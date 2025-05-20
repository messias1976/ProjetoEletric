// calcelectric/utils/calculations.ts

// Tabela 36 da NBR 5410: Capacidade de Condução de Corrente (Iz) para Condutores de Cobre/PVC (70°C)
// Valores em Ampères (A) para 30°C
// Assumindo isolamento PVC (70°C) para a maioria das instalações residenciais
// Formato: { [seção]: { b1: valor, b2: valor } }
export const conductorCapacityTable = {
    '1.5': { b1: 17.5, b2: 15.5 }, // Seção em mm²: Capacidade em A para 2 condutores carregados
    '2.5': { b1: 24, b2: 21 },
    '4': { b1: 32, b2: 28 },
    '6': { b1: 41, b2: 36 },
    '10': { b1: 57, b2: 50 },
    '16': { b1: 76, b2: 67 },
    '25': { b1: 99, b2: 87 },
    '35': { b1: 122, b2: 107 },
    '50': { b1: 147, b2: 129 },
    '70': { b1: 185, b2: 163 },
    '95': { b1: 226, b2: 199 },
};

// Tabela de Disjuntores Comerciais (NBR 5410)
// Valores em Ampères (A)
export const standardBreakerSizes = [
    6, 8, 10, 13, 16, 20, 25, 32, 40, 50, 63, 70, 80, 90, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400, 500, 630
];

// Tabela de Fatores de Correção por Temperatura (NBR 5410 - Tabela 40)
// Para condutores PVC (70°C)
export const temperatureCorrectionFactors = {
    '20': 1.06, '25': 1.02, '30': 1.00, '35': 0.94, '40': 0.87, '45': 0.79, '50': 0.71, '55': 0.61, '60': 0.50
};

// Tabela de Fatores de Correção por Agrupamento (NBR 5410 - Tabela 42)
// Para métodos B1 e B2, eletroduto com 2 ou mais circuitos ou condutores
export const groupingCorrectionFactors = {
    '1': 1.00,
    '2': 0.80, // Para 2 circuitos/condutores carregados
    '3': 0.70,
    '4': 0.65,
    '5': 0.60,
    '6': 0.57,
    '7': 0.54,
    '8': 0.52,
    '9': 0.50,
    // ... pode ser expandido para mais condutores
};


// --- FUNÇÕES DE CÁLCULO ---

/**
 * Calcula a corrente de projeto (Id). Por enquanto, simplificado para Id = Ib.
 * Em instalações reais, poderia incluir fatores de demanda/simultaneidade.
 * @param ib Corrente de operação (Ib) em Ampères.
 * @returns Corrente de projeto (Id) em Ampères.
 */
export function calculateId(ib: number): number {
    // Por enquanto, Id = Ib. Pode ser expandido futuramente.
    return ib;
}

/**
 * Dimensiona o disjuntor (In) com base na corrente de projeto (Id).
 * In >= Id e In <= Iz (esta última verificação será feita na função de dimensionamento do condutor).
 * @param id Corrente de projeto (Id) em Ampères.
 * @returns O tamanho do disjuntor padrão mais próximo e maior que Id, ou null se não houver um adequado.
 */
export function selectBreaker(id: number): number | null {
    // Encontra o menor disjuntor padrão que seja maior ou igual a Id
    for (const breaker of standardBreakerSizes) {
        if (breaker >= id) {
            return breaker;
        }
    }
    return null; // Nenhum disjuntor adequado encontrado
}

/**
 * Dimensiona a seção do condutor (S) e calcula a capacidade de condução (Iz).
 * Verifica se Iz >= Id e se In <= Iz.
 * @param id Corrente de projeto (Id) em Ampères.
 * @param inBreaker Corrente nominal do disjuntor (In) em Ampères.
 * @param method Método de instalação (ex: 'b1', 'b2').
 * @param numLoadedConductors Número de condutores carregados no mesmo eletroduto.
 * @param temperature Temperatura ambiente em °C (para fator de correção).
 * @returns Um objeto com a seção do condutor e sua capacidade Iz, ou null se não for possível dimensionar.
 */
export function dimensionConductor(
    id: number,
    inBreaker: number,
    method: 'b1' | 'b2',
    numLoadedConductors: number,
    temperature: number
): { section: string, iz: number } | null {
    
    // Fator de correção por temperatura
    // Correção: Usar .toString() para aceder às chaves do objeto
    const ft = temperatureCorrectionFactors[temperature.toString() as keyof typeof temperatureCorrectionFactors] || 1.0; 
    
    // Fator de correção por agrupamento
    // Correção: Usar .toString() para aceder às chaves do objeto
    const fa = groupingCorrectionFactors[numLoadedConductors.toString() as keyof typeof groupingCorrectionFactors] || 1.0;

    // A corrente corrigida para a tabela Iz é Id / (Ft * Fa)
    const requiredIzWithoutCorrection = id / (ft * fa);

    for (const section of Object.keys(conductorCapacityTable).map(Number).sort((a,b)=>a-b)) {
        const sectionStr = String(section);
        const methodCapacities = conductorCapacityTable[sectionStr as keyof typeof conductorCapacityTable];

        if (methodCapacities) {
            const izBase = methodCapacities[method];
            
            if (izBase !== undefined) {
                // A NBR 5410 pede Iz >= Id e In <= Iz (para proteção contra sobrecarga)
                // A condição principal para selecionar a seção é Iz >= Id / (Ft * Fa)
                // E também que In <= Iz
                
                // Calculamos a Iz corrigida para esta seção
                const izCorrigida = izBase * ft * fa;

                if (izCorrigida >= id && izCorrigida >= inBreaker) { // Ambas as condições devem ser satisfeitas
                    return { section: sectionStr, iz: izCorrigida };
                }
            }
        }
    }
    return null; // Nenhuma seção adequada encontrada
}