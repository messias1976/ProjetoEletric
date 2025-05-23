// calcelectric/types/circuit.ts

export interface Circuit {
  id: string;
  name: string;
  type: string;
  voltage: string; // Manter como string para input
  power: string;   // Manter como string para input
  numberOfPoints: string; // Manter como string para input
  installationMethod: 'b1' | 'b2' | ''; // Usar string vazia como padrão inicial
  numberOfLoadedConductors: string; // Manter como string para input

  // Novos campos para fatores de correção
  ambientTemperature: string; // Temperatura ambiente em °C (string para input)
  numberOfGroupedCircuits: string; // Número de circuitos agrupados (string para input)

  // Resultados de cálculo (podem ser números ou string vazia se não calculados)
  calculatedCurrent: number | ''; // Corrente de Operação (Ib)
  calculatedId: number | ''; // Corrente de Projeto (Id)
  selectedBreakerIn: number | null; // Corrente Nominal do Disjuntor (In)
  selectedConductorSection: string | null; // Seção do condutor em mm²
  calculatedIz: number | null; // Capacidade de Condução de Corrente do Condutor (Iz)

  errors: {
    [key: string]: string; // Objeto para armazenar mensagens de erro por campo
  };
}