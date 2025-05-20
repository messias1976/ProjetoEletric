// calcelectric/components/CircuitInputForm.tsx

'use client';

import { useState } from 'react';

export interface Circuit {
  id: string;
  name?: string;
  type: '' | 'lighting' | 'tug' | 'tue';
  voltage: '' | '127' | '220';
  power: number | '';
  numberOfPoints?: number | '';
  calculatedCurrent?: number | ''; // Corrente de Operação (Ib)
  
  installationMethod?: '' | 'b1' | 'b2';
  numberOfLoadedConductors?: number | '';

  // --- NOVOS CAMPOS PARA RESULTADOS DO DIMENSIONAMENTO ---
  calculatedId?: number | ''; // Corrente de Projeto (Id)
  selectedBreakerIn?: number | null; // Corrente Nominal do Disjuntor (In)
  selectedConductorSection?: string | null; // Seção do Condutor (mm²)
  calculatedIz?: number | ''; // Capacidade de Condução do Condutor (Iz)
  // --- FIM DOS NOVOS CAMPOS ---
}
// ... o resto do código de CircuitInputForm.tsx permanece o mesmo por enquanto ...


// Define as props que este componente irá receber
interface CircuitInputFormProps {
  circuit: Circuit; // Recebe os dados atuais do circuito (agora com mais campos)
  index: number; // Posição do circuito na lista (para exibição)
  onCircuitChange: (updatedCircuit: Circuit) => void; // Função para notificar o pai sobre as mudanças
  onRemoveCircuit: (id: string) => void; // Função para remover este circuito
}

export default function CircuitInputForm({ circuit, index, onCircuitChange, onRemoveCircuit }: CircuitInputFormProps) {
  console.log(`[CircuitInputForm] Circuito ID: ${circuit.id}, calculatedCurrent prop recebida:`, circuit.calculatedCurrent);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' && value !== '' ? parseFloat(value) : value;
    
    const updatedCircuit = {
      ...circuit,
      [name]: type === 'number' && newValue === '' ? '' : newValue,
    };
    onCircuitChange(updatedCircuit);
  };


  // Renderiza o formulário de entrada para um único circuito
  return (
    <div className="bg-gray-100 p-6 rounded-md shadow-sm mb-6 border border-gray-200">
      
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-xl font-semibold text-gray-700">
           {circuit.name && circuit.name !== '' ? circuit.name : `Circuito ${index + 1}`}
         </h3>
           <button
             onClick={() => onRemoveCircuit(circuit.id)}
             className="text-red-600 hover:text-red-800 text-sm font-medium transition duration-200"
           >
             Remover
           </button>
      </div>


      {/* --- CAMPOS DE ENTRADA DO FORMULÁRIO --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Campo Nome do Circuito (Opcional) */}
        <div>
          <label htmlFor={`name-${circuit.id}`} className="block text-sm font-medium text-gray-700 mb-1">Nome Personalizado (Opcional)</label>
          <input
            type="text"
            id={`name-${circuit.id}`}
            name="name"
            value={circuit.name || ''}
            onChange={handleInputChange}
            placeholder={`Ex: Circuito ${index + 1}`}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Campo Tipo de Circuito */}
        <div>
          <label htmlFor={`type-${circuit.id}`} className="block text-sm font-medium text-gray-700 mb-1">Tipo de Circuito</label>
          <select
            id={`type-${circuit.id}`}
            name="type"
            value={circuit.type}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">-- Selecione --</option>
            <option value="lighting">Iluminação</option>
            <option value="tug">Tomada de Uso Geral (TUG)</option>
            <option value="tue">Tomada de Uso Específico (TUE)</option>
          </select>
        </div>

         {/* Campo Tensão do Circuito */}
        <div>
          <label htmlFor={`voltage-${circuit.id}`} className="block text-sm font-medium text-gray-700 mb-1">Tensão (V)</label>
          <select
            id={`voltage-${circuit.id}`}
            name="voltage"
            value={circuit.voltage}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">-- Selecione --</option>
            <option value="127">127V</option>
            <option value="220">220V</option>
          </select>
        </div>

        {/* Campo Potência */}
        <div>
             <label htmlFor={`power-${circuit.id}`} className="block text-sm font-medium text-gray-700 mb-1">Potência Total do Circuito (W)</label>
             <input
               type="number"
               id={`power-${circuit.id}`}
               name="power"
               value={circuit.power}
               onChange={handleInputChange}
               min="0"
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
             />
         </div>

         {/* --- NOVOS CAMPOS ADICIONADOS AQUI --- */}
         {/* Campo Método de Instalação */}
         <div>
           <label htmlFor={`installationMethod-${circuit.id}`} className="block text-sm font-medium text-gray-700 mb-1">Método de Instalação</label>
           <select
             id={`installationMethod-${circuit.id}`}
             name="installationMethod"
             value={circuit.installationMethod || ''}
             onChange={handleInputChange}
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
           >
             <option value="">-- Selecione --</option>
             <option value="b1">Eletroduto embutido (até 3 cond. carregados)</option>
             <option value="b2">Eletroduto aparente ou embutido (mais de 3 cond. carregados)</option>
             {/* Poderíamos adicionar mais métodos (C, D, etc.) no futuro */}
           </select>
         </div>

         {/* Campo Número de Condutores Carregados */}
         <div>
           <label htmlFor={`numberOfLoadedConductors-${circuit.id}`} className="block text-sm font-medium text-gray-700 mb-1">Nº de Condutores Carregados</label>
           <input
             type="number"
             id={`numberOfLoadedConductors-${circuit.id}`}
             name="numberOfLoadedConductors"
             value={circuit.numberOfLoadedConductors || ''}
             onChange={handleInputChange}
             min="1"
             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
           />
         </div>
         {/* --- FIM DOS NOVOS CAMPOS --- */}

         {/* Bloco para Corrente Calculada (Ib) */}
          {circuit.calculatedCurrent !== undefined && circuit.calculatedCurrent !== '' && !isNaN(Number(circuit.calculatedCurrent)) && (
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Corrente Calculada (Ib)</label>
                  <p className="mt-1 block w-full px-3 py-2 bg-blue-50 rounded-md shadow-sm text-blue-800 font-semibold border border-blue-200 sm:text-sm">
                     {Number(circuit.calculatedCurrent).toFixed(2)} A
                  </p>
              </div>
          )}


      </div>
    </div>
  );
}