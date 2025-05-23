// calcelectric/utils/calculations.ts

// Tabela de correntes nominais padronizadas de disjuntores (NBR 5410)
export const standardBreakerCurrents: number[] = [
    6, 10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 90, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300
  ];
  
  // Tabela de capacidades de condução de corrente (Iz) para condutores de cobre (NBR 5410 - Tabela 36, para 70°C)
  // Valores em Amperes (A) para 30°C ambiente
  // Supondo condutores de Cobre, isolação de PVC (70°C)
  // Coluna 1: Seção (mm²)
  // Coluna 2: Método B1 (Eletroduto em alvenaria, 2 condutores carregados)
  // Coluna 3: Método B1 (Eletroduto em alvenaria, 3 condutores carregados)
  // Coluna 4: Método B2 (Cabos multipolares em eletroduto, 2 condutores carregados)
  // Coluna 5: Método B2 (Cabos multipolares em eletroduto, 3 condutores carregados)
  // Note: As tabelas reais da NBR 5410 são mais extensas. Estamos usando um subconjunto comum.
  
  // Definindo a estrutura para a tabela Iz
  interface IzTable {
    section: string;
    b1_2c: number; // Método B1, 2 condutores
    b1_3c: number; // Método B1, 3 condutores
    b2_2c: number; // Método B2, 2 condutores
    b2_3c: number; // Método B2, 3 condutores
  }
  
  export const conductorIzTable: IzTable[] = [
    { section: "1.5", b1_2c: 17.5, b1_3c: 15.5, b2_2c: 17, b2_3c: 14.5 },
    { section: "2.5", b1_2c: 24, b1_3c: 21, b2_2c: 23, b2_3c: 19.5 },
    { section: "4", b1_2c: 32, b1_3c: 28, b2_2c: 30, b2_3c: 25 },
    { section: "6", b1_2c: 41, b1_3c: 36, b2_2c: 38, b2_3c: 31 },
    { section: "10", b1_2c: 57, b1_3c: 50, b2_2c: 52, b2_3c: 43 },
    { section: "16", b1_2c: 76, b1_3c: 67, b2_2c: 69, b2_3c: 58 },
    { section: "25", b1_2c: 99, b1_3c: 87, b2_2c: 90, b2_3c: 75 },
    { section: "35", b1_2c: 120, b1_3c: 106, b2_2c: 109, b2_3c: 90 },
    { section: "50", b1_2c: 145, b1_3c: 128, b2_2c: 130, b2_3c: 108 },
    { section: "70", b1_2c: 180, b1_3c: 160, b2_2c: 160, b2_3c: 135 },
    { section: "95", b1_2c: 215, b1_3c: 195, b2_2c: 190, b2_3c: 160 },
    { section: "120", b1_2c: 250, b1_3c: 225, b2_2c: 220, b2_3c: 185 },
    { section: "150", b1_2c: 285, b1_3c: 260, b2_2c: 255, b2_3c: 215 },
    { section: "185", b1_2c: 320, b1_3c: 295, b2_2c: 285, b2_3c: 240 },
    { section: "240", b1_2c: 380, b1_3c: 345, b2_2c: 335, b2_3c: 285 },
    { section: "300", b1_2c: 435, b1_3c: 395, b2_2c: 385, b2_3c: 325 }
  ];
  
  // Tabela de Fatores de Correção de Temperatura (NBR 5410 - Tabela 40)
  // Para isolação de PVC (70°C)
  export const temperatureCorrectionFactors: { [temp: number]: number } = {
    10: 1.22,
    15: 1.17,
    20: 1.12,
    25: 1.06,
    30: 1.00, // Temperatura de referência
    35: 0.94,
    40: 0.87,
    45: 0.79,
    50: 0.71,
    55: 0.61,
    60: 0.50,
    65: 0.38,
    70: 0.23,
  };
  
  // Tabela de Fatores de Agrupamento (NBR 5410 - Tabela 42)
  // Para um grupo de circuitos ou cabos multipolares
  export const groupingCorrectionFactors: { [numConductors: number]: number } = {
    1: 1.00, // Não há fator de redução para 1 circuito/cabo
    2: 0.82,
    3: 0.75,
    4: 0.69,
    5: 0.66,
    6: 0.63,
    7: 0.60,
    8: 0.58,
    9: 0.56,
    10: 0.54,
    11: 0.52,
    12: 0.51,
    13: 0.50,
    14: 0.49,
    15: 0.48,
    16: 0.47,
    17: 0.46,
    18: 0.45,
    19: 0.44,
    20: 0.43,
    // ... (Tabela continua na NBR 5410 para mais de 20 condutores/circuitos agrupados)
  };
  
  // Função para calcular a corrente de projeto (Id)
  // Id = Ib * Fator de demanda (geralmente 1 para a maioria das cargas)
  // NBR 5410 recomenda usar Ib para cargas normais, e um fator de correção para sobrecarga
  // Aqui, simplificamos Id = Ib * 1.25 (para 125% da carga nominal, comum para disjuntores)
  export const calculateId = (ib: number): number => {
    return ib * 1.25; // Fator de 1.25 para dimensionamento do disjuntor (NBR 5410, 5.3.4.1)
  };
  
  // Função para selecionar o disjuntor mais próximo acima da corrente de projeto (Id)
  export const selectBreaker = (id: number): number | null => {
    for (const In of standardBreakerCurrents) {
      if (In >= id) {
        return In;
      }
    }
    return null; // Nenhum disjuntor adequado encontrado
  };
  
  // Função para dimensionar o condutor
  export const dimensionConductor = (
    id: number, // Corrente de Projeto (Id)
    inBreaker: number, // Corrente Nominal do Disjuntor (In)
    installationMethod: 'b1' | 'b2',
    numberOfLoadedConductors: number,
    ambientTemperature: number = 30, // Temperatura ambiente em °C
    numberOfGroupedCircuits: number = 1 // Número de circuitos agrupados
  ): { section: string, iz: number } | null => {
  
    // 1. Obter o Fator de Correção de Temperatura (f_temp)
    // Encontrar o fator mais próximo se a temperatura não estiver na tabela, ou arredondar?
    // Para simplificação inicial, vamos arredondar para o valor mais próximo na tabela.
    const closestTemp = Object.keys(temperatureCorrectionFactors)
      .map(Number)
      .reduce((prev, curr) => (Math.abs(curr - ambientTemperature) < Math.abs(prev - ambientTemperature) ? curr : prev));
    const f_temp = temperatureCorrectionFactors[closestTemp] || 1.0; // Padrão 1.0 se não encontrar
  
    // 2. Obter o Fator de Correção de Agrupamento (f_group)
    // Se o número de circuitos for maior que o máximo na tabela, podemos usar o último fator ou um valor seguro.
    const f_group = groupingCorrectionFactors[numberOfGroupedCircuits] ||
                    groupingCorrectionFactors[Math.max(...Object.keys(groupingCorrectionFactors).map(Number))] || 1.0;
  
    // 3. Calcular a corrente de condução corrigida necessária (Iz_corrigido_min)
    // Iz_corrigido_min = In / (f_temp * f_group)
    // O condutor deve suportar no mínimo In / (Fatores de Correção)
    const izRequired = inBreaker / (f_temp * f_group);
  
    // 4. Selecionar a seção do condutor da tabela Iz
    // Iterar sobre a tabela de condutores e encontrar a menor seção que atenda à condição:
    // Iz >= Iz_corrigido_min E Iz >= Id (requisito NBR 5410)
    // Também precisa atender In <= Iz (sempre)
    for (const conductor of conductorIzTable) {
      let conductorCapacity: number | undefined;
  
      // Seleciona a capacidade de condução de corrente baseada no método e número de condutores
      if (installationMethod === 'b1') {
        conductorCapacity = numberOfLoadedConductors === 2 ? conductor.b1_2c : conductor.b1_3c;
      } else if (installationMethod === 'b2') {
        conductorCapacity = numberOfLoadedConductors === 2 ? conductor.b2_2c : conductor.b2_3c;
      }
  
      // Se a capacidade foi encontrada e atende aos critérios
      if (conductorCapacity !== undefined && conductorCapacity >= izRequired && conductorCapacity >= id) {
        return {
          section: conductor.section,
          iz: conductorCapacity
        };
      }
    }
  
    // Se nenhum condutor adequado for encontrado
    return null;
  };