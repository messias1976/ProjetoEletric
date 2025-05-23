// calcelectric/app/dimensionamento/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import CircuitInputForm from '../components/CircuitInputForm';
import { Circuit } from '../../types/circuit';
import {
  calculateId,
  selectBreaker,
  dimensionConductor,
  temperatureCorrectionFactors,
  groupingCorrectionFactors,
} from '../../utils/calculations';

import { CheckCircleIcon, ExclamationCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';

export default function DimensionamentoPage() {
  const initialCircuitState = (): Circuit => ({
    id: 'circuit-1',
    name: '',
    type: '',
    voltage: '',
    power: '',
    numberOfPoints: '',
    calculatedCurrent: '',
    installationMethod: '',
    numberOfLoadedConductors: '',
    ambientTemperature: '30',
    numberOfGroupedCircuits: '1',
    calculatedId: '',
    selectedBreakerIn: null,
    selectedConductorSection: null,
    calculatedIz: null,
    errors: {}
  });

  const [circuits, setCircuits] = useState<Circuit[]>([initialCircuitState()]);
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
      ambientTemperature: '30',
      numberOfGroupedCircuits: '1',
      calculatedId: '',
      selectedBreakerIn: null,
      selectedConductorSection: null,
      calculatedIz: null,
      errors: {}
    };
    setCircuits([...circuits, newCircuit]);
    setNextCircuitId(nextCircuitId + 1);
  };

  const removeCircuit = (id: string) => {
    if (circuits.length === 1 && circuits[0].id === id) {
      alert("Não é possível remover o último circuito. Use o botão 'Limpar Tudo' para reiniciar.");
      return;
    }
    setCircuits(circuits.filter(circuit => circuit.id !== id));
  };

  const resetAllCircuits = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os circuitos e reiniciar?")) {
      setCircuits([initialCircuitState()]);
      setNextCircuitId(2);
      setTotalPower('');
    }
  };

  const handleCircuitUpdate = (updatedCircuit: Circuit) => {
    const circuitIndex = circuits.findIndex(circuit => circuit.id === updatedCircuit.id);
    if (circuitIndex === -1) return;

    const newCircuits = [...circuits];
    newCircuits[circuitIndex] = updatedCircuit;
    setCircuits(newCircuits);
  };

  const calculateDimensionamento = () => {
    console.log("Iniciando validação e cálculo...");

    let hasGlobalErrors = false;
    let calculatedTotalPower = 0;
    const updatedCircuits: Circuit[] = circuits.map(circuit => {
      let currentCircuitErrors: Circuit['errors'] = {};
      let currentIb: number | '' = '';
      let currentId: number | '' = '';
      let selectedIn: number | null = null;
      let conductorSection: string | null = null;
      let calculatedIz: number | null = null;
      let conductorResult: { section: string, iz: number } | null = null;

      let circuitHasLocalErrors = false;

      const powerNum = Number(circuit.power);
      const voltageNum = Number(circuit.voltage);
      const numLoadedConductorsNum = Number(circuit.numberOfLoadedConductors);
      const installationMethod = circuit.installationMethod;
      const ambientTemperatureNum = Number(circuit.ambientTemperature);
      const numberOfGroupedCircuitsNum = Number(circuit.numberOfGroupedCircuits);

      // --- Validação dos campos de entrada ---
      if (!circuit.name.trim()) {
        currentCircuitErrors.name = "Nome do circuito é obrigatório.";
        circuitHasLocalErrors = true;
      }
      if (!circuit.type) {
        currentCircuitErrors.type = "Tipo de circuito é obrigatório.";
        circuitHasLocalErrors = true;
      }
      if (!circuit.voltage || isNaN(voltageNum) || voltageNum <= 0) {
        currentCircuitErrors.voltage = "Tensão é obrigatória e deve ser um número positivo.";
        circuitHasLocalErrors = true;
      }
      if (!circuit.power || isNaN(powerNum) || powerNum <= 0) {
        currentCircuitErrors.power = "Potência é obrigatória e deve ser um número positivo.";
        circuitHasLocalErrors = true;
      }
      if (!installationMethod) {
        currentCircuitErrors.installationMethod = "Método de instalação é obrigatório.";
        circuitHasLocalErrors = true;
      }
      if (!circuit.numberOfLoadedConductors || isNaN(numLoadedConductorsNum) || (numLoadedConductorsNum !== 2 && numLoadedConductorsNum !== 3)) {
        currentCircuitErrors.numberOfLoadedConductors = "Nº de condutores carregados é obrigatório e deve ser 2 ou 3.";
        circuitHasLocalErrors = true;
      }
      if (!circuit.ambientTemperature || isNaN(ambientTemperatureNum) || ambientTemperatureNum < 0) {
        currentCircuitErrors.ambientTemperature = "Temperatura ambiente é obrigatória e deve ser um número positivo.";
        circuitHasLocalErrors = true;
      } else if (!Object.keys(temperatureCorrectionFactors).map(Number).includes(ambientTemperatureNum)) {
         currentCircuitErrors.ambientTemperature = "Temperatura ambiente idealmente deve ser um valor da tabela (10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70).";
      }

      if (!circuit.numberOfGroupedCircuits || isNaN(numberOfGroupedCircuitsNum) || numberOfGroupedCircuitsNum < 1) {
        currentCircuitErrors.numberOfGroupedCircuits = "Nº de circuitos agrupados é obrigatório e deve ser no mínimo 1.";
        circuitHasLocalErrors = true;
      } else if (numberOfGroupedCircuitsNum > Math.max(...Object.keys(groupingCorrectionFactors).map(Number))) {
        currentCircuitErrors.numberOfGroupedCircuits = `Máximo de circuitos agrupados na tabela é ${Math.max(...Object.keys(groupingCorrectionFactors).map(Number))}.`;
      }


      if (circuitHasLocalErrors) {
        hasGlobalErrors = true;
        return {
          ...circuit,
          calculatedCurrent: '',
          calculatedId: '',
          selectedBreakerIn: null,
          selectedConductorSection: null,
          calculatedIz: null,
          errors: currentCircuitErrors
        } as Circuit;
      }

      if (
        !isNaN(powerNum) && powerNum > 0 &&
        !isNaN(voltageNum) && voltageNum > 0 &&
        (installationMethod === 'b1' || installationMethod === 'b2') &&
        !isNaN(numLoadedConductorsNum) && (numLoadedConductorsNum === 2 || numLoadedConductorsNum === 3) &&
        !isNaN(ambientTemperatureNum) && ambientTemperatureNum >= 0 &&
        !isNaN(numberOfGroupedCircuitsNum) && numberOfGroupedCircuitsNum >= 1
      ) {
        currentIb = powerNum / voltageNum;
        calculatedTotalPower += powerNum;

        if (typeof currentIb === 'number' && currentIb > 0) {
          currentId = calculateId(currentIb);

          if (typeof currentId === 'number' && currentId > 0) {
            selectedIn = selectBreaker(currentId);

            if (selectedIn) {
              conductorResult = dimensionConductor(
                currentId,
                selectedIn,
                installationMethod as 'b1' | 'b2',
                numLoadedConductorsNum,
                ambientTemperatureNum,
                numberOfGroupedCircuitsNum
              );
              conductorSection = conductorResult ? conductorResult.section : null;
              calculatedIz = conductorResult ? conductorResult.iz : null;
            } else {
                currentCircuitErrors.selectedBreakerIn = "Não foi possível encontrar um disjuntor padrão adequado para a corrente de projeto.";
                circuitHasLocalErrors = true;
            }
          } else {
             currentCircuitErrors.calculatedId = "Não foi possível calcular a corrente de projeto (Id). Verifique Potência e Tensão.";
             circuitHasLocalErrors = true;
          }
        } else {
            currentCircuitErrors.calculatedCurrent = "Não foi possível calcular a corrente de operação (Ib). Verifique Potência e Tensão.";
            circuitHasLocalErrors = true;
        }
      } else {
        console.warn(`Circuito ${circuit.name || `Circuito ${circuits.indexOf(circuit) + 1}`}: Dados insuficientes ou inválidos para cálculo.`);
        currentIb = '';
        currentId = '';
        selectedIn = null;
        conductorSection = null;
        calculatedIz = null;
      }

      if (circuitHasLocalErrors) {
        hasGlobalErrors = true;
      }

      return {
        ...circuit,
        calculatedCurrent: currentIb,
        calculatedId: currentId,
        selectedBreakerIn: selectedIn,
        selectedConductorSection: conductorSection,
        calculatedIz: calculatedIz,
        errors: currentCircuitErrors
      } as Circuit;
    });
    if (hasGlobalErrors) {
      console.log("Cálculo interrompido devido a erros de validação.");
      setTotalPower('');
    } else {
      setTotalPower(calculatedTotalPower);
      console.log("Potência Total Calculada:", calculatedTotalPower, "W");
    }
    setCircuits(updatedCircuits);
  };

  const formatNumberForDisplay = (value: number | string | null | undefined, unit: string = '') => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '';
    }
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(value);

    return `${formatted} ${unit}`;
  };

  const formatConductorSection = (value: string | null) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: true
      }).format(numValue) + ' mm²';
    }
    return `${value} mm²`;
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8"> {/* Ajustado py para py-8, px para menor e sm:px-6 para mais espaço em tablet */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/" className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200">
          ← Voltar ao Início
        </Link>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-blue-100"> {/* Ajustado p-6 sm:p-8 para paddings responsivos */}
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 text-center mb-6 sm:mb-8">Calculadora de Dimensionamento Elétrico</h1> {/* Ajustado tamanhos de fonte */}

        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4"> {/* Flexbox para empilhar em mobile e linha em desktop */}
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Circuitos</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto"> {/* Para os botões "Add" e "Limpar" */}
            <button
              onClick={addCircuit}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 w-full sm:w-auto"
            >
              + Adicionar Circuito
            </button>
            <button
              onClick={resetAllCircuits}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 w-full sm:w-auto"
            >
              Limpar Tudo
            </button>
          </div>
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
            <p className="text-gray-600 text-center text-sm sm:text-base">Nenhum circuito adicionado ainda. Clique em "+ Adicionar Circuito".</p>
          )}
        </div>


        <div className="mt-8 pt-6 sm:mt-12 sm:pt-8 border-t-2 border-blue-200"> {/* Ajustado margens e paddings superiores */}
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Resultados do Dimensionamento</h2>
          {circuits.some(c => Object.keys(c.errors || {}).length > 0) && (
            <p className="flex items-center text-red-700 text-base sm:text-lg font-semibold mb-4"> {/* Ajustado tamanho do texto */}
              <ExclamationCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" /> Por favor, corrija os erros nos circuitos para visualizar os resultados completos.
            </p>
          )}

          {typeof totalPower === 'number' && totalPower > 0 && !circuits.some(c => Object.keys(c.errors || {}).length > 0) ? (
            <p className="text-lg sm:text-xl font-semibold mb-6"> {/* Ajustado tamanho do texto */}
              Potência Total da Instalação: <span className="text-blue-600">
                {formatNumberForDisplay(totalPower, 'W')}
              </span>
            </p>
          ) : (
            !circuits.some(c => Object.keys(c.errors || {}).length > 0) && (totalPower === '' || totalPower === 0) &&
            <p className="text-gray-600 text-base sm:text-lg mb-6">Os resultados da potência total aparecerão aqui após o cálculo.</p> 
          )}

          <button
            onClick={calculateDimensionamento}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 w-full sm:w-auto"
          >
            Calcular Dimensionamento
          </button>

          {circuits.map((circuit, index) => {
            const hasCircuitErrors = Object.keys(circuit.errors || {}).length > 0;
            const hasCalculatedData = (
              (typeof circuit.calculatedId === 'number' && circuit.calculatedId > 0) ||
              (typeof circuit.selectedBreakerIn === 'number' && circuit.selectedBreakerIn > 0) ||
              circuit.selectedConductorSection !== null ||
              (typeof circuit.calculatedIz === 'number' && circuit.calculatedIz > 0)
            );

            if (hasCircuitErrors) {
              return (
                <div key={`results-${circuit.id}`} className="mt-6 bg-red-50 p-4 rounded-md border border-red-200 text-sm sm:text-base"> {/* Ajustado tamanho do texto */}
                  <h3 className="text-lg sm:text-xl font-semibold text-red-800 mb-2 flex items-center">
                    <MinusCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                    {circuit.name && circuit.name !== '' ? circuit.name : `Circuito ${index + 1}`}
                  </h3>
                  <p className="text-red-700">Este circuito possui erros de entrada. Por favor, corrija os campos acima para ver os resultados.</p>
                </div>
              );
            } else if (hasCalculatedData) {
              return (
                <div key={`results-${circuit.id}`} className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200 text-sm sm:text-base"> {/* Ajustado tamanho do texto */}
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                    {circuit.name && circuit.name !== '' ? circuit.name : `Circuito ${index + 1}`}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 sm:gap-y-2 gap-x-2 sm:gap-x-4 text-gray-700"> {/* Ajustado gaps para telas menores */}
                    {typeof circuit.calculatedCurrent === 'number' && <p><span className="font-medium text-gray-900">Corrente de Operação (Ib):</span> <span className="text-green-700 font-semibold">{formatNumberForDisplay(circuit.calculatedCurrent, 'A')}</span></p>}
                    {typeof circuit.calculatedId === 'number' && <p><span className="font-medium text-gray-900">Corrente de Projeto (Id):</span> <span className="text-green-700 font-semibold">{formatNumberForDisplay(circuit.calculatedId, 'A')}</span></p>}
                    {circuit.selectedBreakerIn !== null && <p><span className="font-medium text-gray-900">Disjuntor (In):</span> <span className="text-green-700 font-semibold">{formatNumberForDisplay(circuit.selectedBreakerIn, 'A')}</span></p>}
                    {circuit.selectedConductorSection !== null && <p><span className="font-medium text-gray-900">Seção do Condutor (S):</span> <span className="text-green-700 font-semibold">{formatConductorSection(circuit.selectedConductorSection)}</span></p>}
                    {typeof circuit.calculatedIz === 'number' && <p><span className="font-medium text-gray-900">Capacidade Condução Condutor (Iz):</span> <span className="text-green-700 font-semibold">{formatNumberForDisplay(circuit.calculatedIz, 'A')}</span></p>}
                    {circuit.ambientTemperature && <p><span className="font-medium text-gray-900">Temp. Ambiente:</span> <span className="text-gray-700">{circuit.ambientTemperature}°C</span></p>}
                    {circuit.numberOfGroupedCircuits && <p><span className="font-medium text-gray-900">Circs. Agrupados:</span> <span className="text-gray-700">{circuit.numberOfGroupedCircuits}</span></p>}
                  </div>
                  {circuit.calculatedId && circuit.selectedBreakerIn && circuit.installationMethod && circuit.numberOfLoadedConductors && !circuit.selectedConductorSection && (
                    <p className="text-orange-600 mt-2 flex items-center text-xs sm:text-sm"> {/* Ajustado tamanho do texto */}
                      <ExclamationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                      Atenção: Não foi possível dimensionar o condutor para este circuito com os dados fornecidos e as tabelas disponíveis. Verifique os valores, métodos de instalação ou fatores de correção.
                    </p>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}