// calcelectric/utils/calculations.ts

import { Circuit } from '../types/circuit';

// --- Tabelas de Referência NBR 5410 (Simplificadas para o exemplo) ---
// Estes são dados simplificados. Em uma aplicação real, você precisaria de tabelas completas.

// Tabela 36: Capacidade de Condução de Corrente (Iz) - Fios de Cobre, PVC, 70°C
// Valores hipotéticos para fins de demonstração
// Os valores reais dependem do método de instalação e número de condutores
const TABLE_IZ_PVCC_70: { [method: string]: { [conductors: number]: { [section: string]: number } } } = {
  'b1': { // Eletroduto em alvenaria
    2: { '1.5': 17.5, '2.5': 24, '4': 32, '6': 41, '10': 57, '16': 76 },
    3: { '1.5': 15, '2.5': 21, '4': 28, '6': 36, '10': 50, '16': 67 },
  },
  'b2': { // Cabo multipolar em eletroduto
    2: { '1.5': 17.5, '2.5': 24, '4': 32, '6': 41, '10': 57, '16': 76 }, // Mesmos valores para simplicidade
    3: { '1.5': 15, '2.5': 21, '4': 28, '6': 36, '10': 50, '16': 67 }, // Mesmos valores para simplicidade
  },
  // ... adicione outros métodos de instalação (A1, A2, etc.)
};

// Tabela 42: Fatores de Correção de Temperatura (fT)
// Para condutores isolados em PVC, 70°C, Temperatura de referência 30°C
const TABLE_FT: { [temp: number]: number } = {
  10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00,
  35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.63, 60: 0.53,
};

// Tabela 43: Fatores de Correção de Agrupamento (fA)
// Valores hipotéticos para fins de demonstração (para 2, 3, 4, 5, 6, 7 circuitos agrupados)
const TABLE_FA: { [grouped: number]: number } = {
  1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57, 7: 0.54,
  // ... adicione mais valores conforme a NBR 5410
};

// Valores nominais de disjuntores (padrão)
const BREAKER_IN_OPTIONS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 90, 100];

// Seções de condutores comerciais (mm²)
const CONDUCTOR_SECTIONS = ['1.5', '2.5', '4', '6', '10', '16', '25', '35', '50', '70', '95', '120', '150', '185', '240', '300'];

// --- Função Principal de Cálculo ---

export function calculateDimensioning(circuitsToCalculate: Circuit[]): Circuit[] {
  return circuitsToCalculate.map(circuit => {
    // Cópia do circuito para não modificar o original diretamente
    const updatedCircuit = { ...circuit, errors: {} };
    let newErrors: { [key: string]: string } = {};

    // 1. Validação dos inputs (conversão para número)
    const power = parseFloat(circuit.power);
    const voltage = parseFloat(circuit.voltage);
    const numberOfLoadedConductors = parseInt(circuit.numberOfLoadedConductors, 10);
    const ambientTemperature = parseFloat(circuit.ambientTemperature);
    const numberOfGroupedCircuits = parseInt(circuit.numberOfGroupedCircuits, 10);

    if (isNaN(power) || power <= 0) newErrors.power = 'Potência inválida.';
    if (isNaN(voltage) || (voltage !== 127 && voltage !== 220)) newErrors.voltage = 'Tensão deve ser 127V ou 220V.';
    if (!circuit.type) newErrors.type = 'Tipo de circuito é obrigatório.';
    if (!circuit.installationMethod) newErrors.installationMethod = 'Método de instalação é obrigatório.';
    if (isNaN(numberOfLoadedConductors) || ![2, 3].includes(numberOfLoadedConductors)) newErrors.numberOfLoadedConductors = 'Nº de condutores deve ser 2 ou 3.';
    if (isNaN(ambientTemperature) || ambientTemperature <= 0) newErrors.ambientTemperature = 'Temperatura ambiente inválida.';
    if (isNaN(numberOfGroupedCircuits) || numberOfGroupedCircuits <= 0) newErrors.numberOfGroupedCircuits = 'Nº de circuitos agrupados inválido.';

    // Se houver erros de validação, atualiza o circuito com os erros e retorna
    if (Object.keys(newErrors).length > 0) {
      return { ...updatedCircuit, errors: newErrors };
    }

    // 2. Cálculo da Corrente de Operação (Ib)
    let ib: number;
    // Para circuitos monofásicos (F-N ou F-F), bifásicos (F-F), trifásicos (3F)
    // Supondo fator de potência 1 para tomadas/iluminação (simplificado)
    // Para cargas indutivas, o fator de potência deve ser considerado (ex: motor, ar condicionado)
    const powerFactor = 0.92; // Exemplo para cargas gerais. Para chuveiro/iluminação pode ser 1.
    const efficiency = 1; // Eficiência, assumindo 1 para simplicidade

    if (numberOfLoadedConductors === 2) { // Monofásico (F-N ou F-F)
      ib = power / (voltage * powerFactor * efficiency);
    } else if (numberOfLoadedConductors === 3) { // Trifásico (3 Fases)
      ib = power / (voltage * Math.sqrt(3) * powerFactor * efficiency);
    } else {
      // Este caso já deveria ser pego pela validação acima
      ib = 0;
      newErrors.numberOfLoadedConductors = 'Configuração de condutores não suportada para cálculo de Ib.';
    }

    updatedCircuit.calculatedCurrent = parseFloat(ib.toFixed(2)); // Arredonda para 2 casas decimais

    // 3. Seleção do Disjuntor (In)
    // Escolhe o menor disjuntor imediatamente superior ou igual a Ib
    let inBreaker: number | null = null;
    for (const breakerValue of BREAKER_IN_OPTIONS) {
      if (breakerValue >= ib) {
        inBreaker = breakerValue;
        break;
      }
    }

    if (inBreaker === null) {
      newErrors.selectedBreakerIn = 'Nenhum disjuntor adequado encontrado para esta corrente.';
    } else {
      updatedCircuit.selectedBreakerIn = inBreaker;
    }

    // 4. Cálculo da Corrente de Projeto (Id)
    // Ib <= In <= Iz * fT * fA
    // Precisamos encontrar Iz (capacidade de condução do condutor)
    // Id = In / (fT * fA)
    // Para simplificar, vamos dimensionar o condutor primeiro e depois verificar Id.

    // 5. Determinação dos Fatores de Correção
    const ft = TABLE_FT[ambientTemperature] || TABLE_FT[30]; // Usa 30°C como fallback
    const fa = TABLE_FA[numberOfGroupedCircuits] || TABLE_FA[1]; // Usa 1 como fallback

    if (!ft) newErrors.ambientTemperature = 'Fator de temperatura não encontrado.';
    if (!fa) newErrors.numberOfGroupedCircuits = 'Fator de agrupamento não encontrado.';

    if (Object.keys(newErrors).length > 0) {
      return { ...updatedCircuit, errors: newErrors };
    }

    // 6. Seleção da Seção do Condutor (Iz)
    let selectedSection: string | null = null;
    let izConductor: number | null = null;

    // A Iz * fT * fA deve ser >= In (corrente do disjuntor)
    const requiredIzCorrected = inBreaker ? inBreaker / (ft * fa) : 0;

    if (requiredIzCorrected > 0 && circuit.installationMethod && numberOfLoadedConductors) {
      const availableSections = TABLE_IZ_PVCC_70[circuit.installationMethod]?.[numberOfLoadedConductors];

      if (!availableSections) {
        newErrors.installationMethod = 'Método de instalação ou nº de condutores inválido para tabela Iz.';
      } else {
        // Encontra a menor seção que atende à condição (Iz >= requiredIzCorrected)
        for (const section of CONDUCTOR_SECTIONS) {
          const izForSection = availableSections[section];
          if (izForSection && (izForSection * ft * fa) >= (inBreaker || 0)) {
            selectedSection = section;
            izConductor = izForSection;
            break;
          }
        }
      }
    }

    if (selectedSection === null) {
      newErrors.selectedConductorSection = 'Nenhuma seção de condutor adequada encontrada.';
    } else {
      updatedCircuit.selectedConductorSection = selectedSection;
      updatedCircuit.calculatedIz = izConductor;
    }

    // 7. Verificação da Corrente de Projeto (Id) com o condutor selecionado
    // Id = Iz * fT * fA
    if (izConductor && ft && fa) {
      const idCalculated = izConductor * ft * fa;
      updatedCircuit.calculatedId = parseFloat(idCalculated.toFixed(2));

      // Verificação final da condição: Ib <= In <= Iz * fT * fA
      if (ib > (inBreaker || 0) || (inBreaker || 0) > idCalculated) {
        newErrors.validation = 'Condição de dimensionamento (Ib <= In <= Iz*ft*fa) não atendida. Verifique os dados ou tabelas.';
      }
    } else {
      newErrors.calculatedId = 'Não foi possível calcular Id.';
    }

    // Retorna o circuito atualizado com os resultados e/ou erros
    updatedCircuit.errors = newErrors;
    return updatedCircuit;
  });
}

// --- Funções Auxiliares (Opcional, para refatorar lógica mais complexa) ---

// function validateCircuit(circuit: Circuit): { [key: string]: string } {
//   const errors: { [key: string]: string } = {};
//   // ... lógica de validação
//   return errors;
// }

// function calculateIb(power: number, voltage: number, conductors: number, type: string): number {
//   // ... lógica de cálculo de Ib
//   return 0;
// }

// function selectBreaker(ib: number): number | null {
//   // ... lógica de seleção de disjuntor
//   return null;
// }

// function getCorrectionFactors(temp: number, grouped: number): { ft: number, fa: number } {
//   // ... lógica de fatores de correção
//   return { ft: 1, fa: 1 };
// }

// function selectConductor(requiredIzCorrected: number, method: string, conductors: number): { section: string | null, iz: number | null } {
//   // ... lógica de seleção de condutor
//   return { section: null, iz: null };
// }