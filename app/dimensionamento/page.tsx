// calcelectric/app/dimensionamento/page.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CircuitInputForm from '../components/CircuitInputForm';
import { Circuit } from '../../types/circuit';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, CalculatorIcon } from '@heroicons/react/24/outline';

// Importar a função de cálculo
import { calculateDimensioning } from '../../utils/calculations';

export default function DimensionamentoPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  console.log("DEBUG: Usuário carregado no Dimensionamento:", user);
  console.log("DEBUG: Plano do usuário no Dimensionamento:", user?.publicMetadata?.plan);

  const [circuits, setCircuits] = useState<Circuit[]>([
    {
      id: uuidv4(),
      name: '', type: '', power: '', voltage: '', numberOfPoints: '',
      installationMethod: '', numberOfLoadedConductors: '', ambientTemperature: '',
      numberOfGroupedCircuits: '', calculatedCurrent: '', calculatedId: '',
      selectedBreakerIn: null, selectedConductorSection: null, calculatedIz: null,
      errors: {},
    },
  ]);

  // Novo estado para armazenar os resultados dos circuitos calculados
  const [calculatedCircuits, setCalculatedCircuits] = useState<Circuit[]>([]);

  const addCircuit = () => {
    const newCircuit: Circuit = {
      id: uuidv4(),
      name: '', type: '', power: '', voltage: '', numberOfPoints: '',
      installationMethod: '', numberOfLoadedConductors: '', ambientTemperature: '',
      numberOfGroupedCircuits: '', calculatedCurrent: '', calculatedId: '',
      selectedBreakerIn: null, selectedConductorSection: null, calculatedIz: null,
      errors: {},
    };
    setCircuits((prevCircuits) => [...prevCircuits, newCircuit]);
    setCalculatedCircuits([]); // Limpa os resultados ao adicionar novo circuito
  };

  const handleCircuitChange = (updatedCircuit: Circuit) => {
    setCircuits((prevCircuits) =>
      prevCircuits.map((c) => (c.id === updatedCircuit.id ? updatedCircuit : c))
    );
    setCalculatedCircuits([]); // Limpa os resultados quando um input é alterado
  };

  const handleRemoveCircuit = (id: string) => {
    if (circuits.length > 1) {
      setCircuits((prevCircuits) => prevCircuits.filter((c) => c.id !== id));
    } else {
      setCircuits([
        {
          id: uuidv4(),
          name: '', type: '', power: '', voltage: '', numberOfPoints: '',
          installationMethod: '', numberOfLoadedConductors: '', ambientTemperature: '',
          numberOfGroupedCircuits: '', calculatedCurrent: '', calculatedId: '',
          selectedBreakerIn: null, selectedConductorSection: null, calculatedIz: null,
          errors: {},
        },
      ]);
    }
    setCalculatedCircuits([]); // Limpa os resultados ao remover circuito
  };

  const handleCalculate = () => {
    // Validação inicial antes de passar para a função de cálculo
    let allInputsValid = true;
    const updatedCircuitsWithInputErrors = circuits.map(circuit => {
      const newErrors: { [key: string]: string } = {};
      if (!circuit.name.trim()) newErrors.name = 'Nome é obrigatório.';
      if (!circuit.type) newErrors.type = 'Tipo é obrigatório.';
      if (parseFloat(circuit.power) <= 0 || isNaN(parseFloat(circuit.power))) newErrors.power = 'Potência inválida.';
      if (parseFloat(circuit.voltage) <= 0 || isNaN(parseFloat(circuit.voltage))) newErrors.voltage = 'Tensão inválida.';
      if (!circuit.installationMethod) newErrors.installationMethod = 'Método é obrigatório.';
      if (!circuit.numberOfLoadedConductors) newErrors.numberOfLoadedConductors = 'Condutores é obrigatório.';
      if (parseFloat(circuit.ambientTemperature) <= 0 || isNaN(parseFloat(circuit.ambientTemperature))) newErrors.ambientTemperature = 'Temperatura inválida.';
      if (parseInt(circuit.numberOfGroupedCircuits, 10) <= 0 || isNaN(parseInt(circuit.numberOfGroupedCircuits, 10))) newErrors.numberOfGroupedCircuits = 'Agrupamento inválido.';

      if (Object.keys(newErrors).length > 0) {
        allInputsValid = false;
        return { ...circuit, errors: newErrors };
      }
      return { ...circuit, errors: {} }; // Limpa erros se o campo foi corrigido
    });

    setCircuits(updatedCircuitsWithInputErrors); // Atualiza os circuitos com os erros de input

    if (!allInputsValid) {
      alert("Por favor, preencha todos os campos obrigatórios e corrija os erros antes de calcular.");
      return;
    }

    // Chama a função de cálculo principal
    const results = calculateDimensioning(circuits);
    setCalculatedCircuits(results); // Armazena os resultados no novo estado
    console.log("DEBUG: Resultados do Cálculo:", results);

    // Verifica se algum circuito tem erro após o cálculo
    const hasCalculationErrors = results.some(c => Object.keys(c.errors).length > 0);
    if (hasCalculationErrors) {
      alert("Cálculo concluído com erros em alguns circuitos. Verifique os resultados.");
    } else {
      alert("Dimensionamento calculado com sucesso!");
    }
  };

  // Lógica de Carregamento do Clerk
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Carregando Calculadora...
      </div>
    );
  }

  // Lógica de Autenticação
  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  // Lógica de Proteção de Plano
 // if (user?.publicMetadata?.plan !== 'premium') {
   // console.log("DEBUG: Redirecionando para upgrade. Plano atual não é 'premium'. Plano lido:", user?.publicMetadata?.plan);
   // router.push('/upgrade');
   // return null;
 // }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Calculadora de Dimensionamento Elétrico</h1>

        {/* Renderiza os CircuitInputForms para cada circuito no estado */}
        {circuits.length === 0 && (
          <p className="text-center text-gray-600 mb-6">
            Clique em "Adicionar Circuito" para começar o dimensionamento.
          </p>
        )}
        {circuits.map((circuit, index) => (
          <CircuitInputForm
            key={circuit.id}
            circuit={circuit}
            index={index}
            onCircuitChange={handleCircuitChange}
            onRemoveCircuit={handleRemoveCircuit}
          />
        ))}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
          <button
            onClick={addCircuit}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Adicionar Circuito
          </button>

          <button
            onClick={handleCalculate}
            disabled={circuits.length === 0 || circuits.some(c => Object.keys(c.errors).length > 0)}
            className={`flex items-center justify-center font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 ${
              circuits.length === 0 || circuits.some(c => Object.keys(c.errors).length > 0)
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <CalculatorIcon className="h-5 w-5 mr-2" />
            Calcular Dimensionamento
          </button>
        </div>

        {/* Seção para exibir resultados */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Resultados do Dimensionamento</h2>
            {calculatedCircuits.length === 0 && (
                <p className="text-gray-600">Os resultados dos cálculos aparecerão aqui após clicar em "Calcular".</p>
            )}

            {calculatedCircuits.map((circuit, index) => (
                <div key={circuit.id} className="mt-4 p-3 border-t border-gray-300">
                    <h3 className="font-semibold text-gray-700 mb-2">Circuito {index + 1}: {circuit.name || 'Novo Circuito'}</h3>
                    {Object.keys(circuit.errors).length > 0 ? (
                        <div className="text-red-600 text-sm">
                            <p className="font-bold">Erros neste circuito:</p>
                            <ul>
                                {Object.values(circuit.errors).map((error, i) => (
                                    <li key={i}>- {error}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 text-sm">
                            <p><span className="font-medium">Corrente de Operação (Ib):</span> {circuit.calculatedCurrent !== '' ? `${circuit.calculatedCurrent} A` : 'N/A'}</p>
                            <p><span className="font-medium">Disjuntor (In):</span> {circuit.selectedBreakerIn !== null ? `${circuit.selectedBreakerIn} A` : 'N/A'}</p>
                            <p><span className="font-medium">Corrente de Projeto (Id):</span> {circuit.calculatedId !== '' ? `${circuit.calculatedId} A` : 'N/A'}</p>
                            <p><span className="font-medium">Seção do Condutor:</span> {circuit.selectedConductorSection !== null ? `${circuit.selectedConductorSection} mm²` : 'N/A'}</p>
                            <p><span className="font-medium">Capacidade de Condução (Iz):</span> {circuit.calculatedIz !== null ? `${circuit.calculatedIz} A` : 'N/A'}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </main>
  );
}