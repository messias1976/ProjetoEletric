// calcelectric/app/dimensionamento/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import CircuitInputForm, { Circuit } from '../components/CircuitInputForm'; // Caminho relativo
// --- ALTERAÇÃO AQUI: Caminho de importação para relativo ---
import {
  calculateId,
  selectBreaker,
  dimensionConductor,
  standardBreakerSizes,
  temperatureCorrectionFactors,
  groupingCorrectionFactors
} from '../../utils/calculations'; // Caminho relativo agora: sobe duas pastas para a raiz e entra em 'utils'
// --- FIM DA ALTERAÇÃO ---


export default function DimensionamentoPage() {
  const [circuits, setCircuits] = useState<Circuit[]>([
    { 
      id: 'circuit-1', 
      name: '', 
      type: '', 
      voltage: '', 
      power: '',
      numberOfPoints: '', 
      calculatedCurrent: '',
      installationMethod: '',
      numberOfLoadedConductors: '',
      calculatedId: '',
      selectedBreakerIn: null,
      selectedConductorSection: null,
      calculatedIz: ''
    }
  ]);

  const [nextCircuitId, setNextCircuitId] = useState(2);
  const [totalPower, setTotalPower] = useState<number | ''>('');
  
  const addCircuit = () => {
    const newCircuit: Circuit = {
      id: `circuit-${nextCircuitId}`,
      name: '',
      type: '',
      voltage: '',
      power: '',
      numberOfPoints: '',
      calculatedCurrent: '',
      installationMethod: '',
      numberOfLoadedConductors: '',
      calculatedId: '',
      selectedBreakerIn: null,
      selectedConductorSection: null,
      calculatedIz: ''
    };
    setCircuits([...circuits, newCircuit]);
    setNextCircuitId(nextCircuitId + 1);
  };

  const removeCircuit = (id: string) => {
      setCircuits(circuits.filter(circuit => circuit.id !== id));
  };

  const handleCircuitUpdate = (updatedCircuit: Circuit) => {
      const circuitIndex = circuits.findIndex(circuit => circuit.id === updatedCircuit.id);
      if (circuitIndex === -1) return;

      const newCircuits = [...circuits];
      newCircuits[circuitIndex] = updatedCircuit;
      setCircuits(newCircuits);
  };

   const calculateDimensionamento = () => {
     console.log("Iniciando cálculo...");
     console.log("Dados de entrada dos circuitos:", circuits);

     let calculatedTotalPower = 0;
     const updatedCircuits = circuits.map(circuit => {
        let currentIb: number | '' = '';
        let currentId: number | '' = '';
        let selectedIn: number | null = null;
        let conductorResult: { section: string, iz: number } | null = null;

       if (circuit.power !== '' && circuit.power !== null && circuit.power > 0 &&
          (circuit.voltage === '127' || circuit.voltage === '220')) {

          const power = Number(circuit.power);
          const voltage = Number(circuit.voltage);
          const numLoadedConductors = Number(circuit.numberOfLoadedConductors);
          const installationMethod = circuit.installationMethod;

          if (!isNaN(power) && !isNaN(voltage) && voltage > 0) {
              currentIb = power / voltage;
              calculatedTotalPower += power;

              if (typeof currentIb === 'number' && currentIb > 0) {
                  currentId = calculateId(currentIb);

                  if (currentId > 0) {
                      selectedIn = selectBreaker(currentId);

                      // O tipo de installationMethod aqui é garantido ser 'b1' ou 'b2'
                      // porque 'installationMethod' (string vazia) é avaliado como falso na condição
                      if (selectedIn && installationMethod && numLoadedConductors > 0) {
                          const defaultTemperature = 30; // Pode ser um input futuro
                          
                          conductorResult = dimensionConductor(
                              currentId,
                              selectedIn,
                              // Adiciona um cast de tipo para 'b1' | 'b2' para garantir, pois a função espera isso
                              // mas a variável installationMethod é de tipo mais amplo.
                              // A condição 'if (installationMethod)' já garante que não é ''
                              installationMethod as 'b1' | 'b2', 
                              numLoadedConductors,
                              defaultTemperature
                          );
                      }
                  }
              }

              console.log(`Circuito ${circuit.name || `Circuito ${circuits.indexOf(circuit) + 1}`}: Potência=${power}W, Tensão=${voltage}V, Ib=${Number(currentIb).toFixed(2)}A`);
              if (currentId) console.log(`  Id: ${Number(currentId).toFixed(2)}A`);
              if (selectedIn) console.log(`  Disjuntor (In): ${selectedIn}A`);
              if (conductorResult) console.log(`  Condutor (Seção): ${conductorResult.section}mm², Iz: ${conductorResult.iz.toFixed(2)}A`);

          } else {
            console.warn(`Circuito ${circuit.name || `Circuito ${circuits.indexOf(circuit) + 1}`}: Potência ou Tensão inválida para cálculo.`);
          }
        } else {
          console.warn(`Circuito ${circuit.name || `Circuito ${circuits.indexOf(circuit) + 1}`}: Potência, Tensão, Método de Instalação ou Nº de Condutores Carregados não preenchida para cálculo.`);
        }

         return {
             ...circuit,
             calculatedCurrent: currentIb,
             calculatedId: currentId,
             selectedBreakerIn: selectedIn,
             selectedConductorSection: conductorResult ? conductorResult.section : null,
             calculatedIz: conductorResult ? conductorResult.iz : ''
         };
       });

      setTotalPower(calculatedTotalPower);
      setCircuits(updatedCircuits);

      console.log("Potência Total Calculada:", calculatedTotalPower, "W");
      console.log("Cálculo inicial concluído.");
    };

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-blue-100">

        <h1 className="text-3xl font-bold text-blue-800 text-center mb-8">Calculadora de Dimensionamento Elétrico</h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Circuitos</h2>

          <button
            onClick={addCircuit}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
          >
            + Adicionar Circuito
          </button>
        </div>

        <div>
            {circuits.map((circuit, index) => (
                <CircuitInputForm
                    key={circuit.id}
                    circuit={circuit}
                    index={index}
                    onCircuitChange={handleCircuitUpdate}
                    onRemoveCircuit={removeCircuit}
                />
            ))}
            {circuits.length === 0 && (
                 <p className="text-gray-600 text-center">Nenhum circuito adicionado ainda. Clique em "+ Adicionar Circuito".</p>
            )}
        </div>


        <div className="mt-12 pt-8 border-t-2 border-blue-200">
             <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resultados do Dimensionamento</h2>
              {totalPower !== '' && totalPower > 0 ? (
                  <p className="text-gray-800 text-xl font-semibold mb-6">Potência Total da Instalação: {totalPower.toFixed(2)} W</p>
              ) : (
                   <p className="text-gray-600 mb-6">Os resultados aparecerão aqui após o cálculo.</p>
              )}
              
              <button
                onClick={calculateDimensionamento}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              >
                Calcular Dimensionamento
              </button>

            {/* --- ÁREA PARA EXIBIR OS RESULTADOS DETALHADOS POR CIRCUITO --- */}
            {circuits.map((circuit, index) => (
                // Exibe os resultados apenas se houver algum cálculo
                (circuit.calculatedId || circuit.selectedBreakerIn || circuit.selectedConductorSection || circuit.calculatedIz) && (
                    <div key={`results-${circuit.id}`} className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                        <h3 className="text-xl font-semibold text-blue-800 mb-2">
                            {circuit.name && circuit.name !== '' ? circuit.name : `Circuito ${index + 1}`}
                        </h3>
                        {circuit.calculatedCurrent !== '' && <p>Corrente de Operação (Ib): <span className="font-medium">{Number(circuit.calculatedCurrent).toFixed(2)} A</span></p>}
                        {circuit.calculatedId !== '' && <p>Corrente de Projeto (Id): <span className="font-medium">{Number(circuit.calculatedId).toFixed(2)} A</span></p>}
                        {circuit.selectedBreakerIn !== null && <p>Disjuntor (In): <span className="font-medium">{circuit.selectedBreakerIn} A</span></p>}
                        {circuit.selectedConductorSection !== null && <p>Seção do Condutor (S): <span className="font-medium">{circuit.selectedConductorSection} mm²</span></p>}
                        {circuit.calculatedIz !== '' && <p>Capacidade Condução Condutor (Iz): <span className="font-medium">{Number(circuit.calculatedIz).toFixed(2)} A</span></p>}
                        {/* Mensagem de erro ou aviso se o dimensionamento do condutor falhar */}
                        {circuit.calculatedId && circuit.selectedBreakerIn && circuit.installationMethod && circuit.numberOfLoadedConductors && !circuit.selectedConductorSection && (
                            <p className="text-red-600">Atenção: Não foi possível dimensionar o condutor para este circuito com os dados fornecidos e as tabelas disponíveis.</p>
                        )}
                    </div>
                )
            ))}
            {/* --- FIM DA ÁREA DE RESULTADOS --- */}

        </div>


      </div>
    </div>
  );
}