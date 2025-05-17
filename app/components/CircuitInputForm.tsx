// calcelectric/components/CircuitInputForm.tsx

'use client';

import { useState } from 'react';

// --- Define a interface Circuit AQUI e exporta-a ---
export interface Circuit {
  id: string; // Identificador único
  name: string; // Nome do circuito
  type: '' | 'lighting' | 'tug' | 'tue'; // Tipo de circuito: vazio, iluminação, TUG, TUE
  voltage: '' | '127' | '220'; // Tensão: vazio, 127V, 220V (poderia ser number, mas string para dropdown)
  power: number | ''; // Potência em Watts (pode ser calculada ou inserida) - usei number | '' para permitir campo vazio inicial
  numberOfPoints?: number | ''; // Número de pontos/tomadas (opcional para alguns tipos)
  calculatedCurrent?: number | ''; // Corrente de operação calculada (Ib)
  // Futuros campos: comprimento, método de instalação, tipo de condutor, etc.
  // Exemplo: length?: number | ''; // Comprimento do circuito em metros
  // Exemplo: installationMethod?: string; // Método de instalação (ex: eletroduto embutido)
  // Exemplo: conductorType?: string; // Tipo de condutor (ex: Cobre/PVC)
}
// --- FIM DA INTERFACE CIRCUIT (Comentário posicionado corretamente) ---


// Define as props que este componente irá receber
interface CircuitInputFormProps {
  circuit: Circuit; // Recebe os dados atuais do circuito (agora com mais campos)
  index: number; // Posição do circuito na lista (para exibição)
  onCircuitChange: (updatedCircuit: Circuit) => void; // Função para notificar o pai sobre as mudanças
  onRemoveCircuit: (id: string) => void; // Função para remover este circuito
}

export default function CircuitInputForm({ circuit, index, onCircuitChange, onRemoveCircuit }: CircuitInputFormProps) {
  // --- CONSOLE.LOG DE DEBUG (mantido, mas fora do bloco condicional para ver sempre) ---
  console.log(`[CircuitInputForm] Circuito ID: ${circuit.id}, calculatedCurrent prop recebida:`, circuit.calculatedCurrent);
  // --- FIM DO CONSOLE.LOG ADICIONADO ---


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target; // Pega o tipo do input
    
    // Converte o valor para número se o input for do tipo 'number', senão mantém como string
    // Nota: Se o input type="number" estiver vazio, value será "", convertemos para '' explicitamente ou 0 se for o caso.
    const newValue = type === 'number' && value !== '' ? parseFloat(value) : value;
    
    const updatedCircuit = {
      ...circuit,
      // Garante que campos numéricos vazios são armazenados como '' (ou 0, se preferir)
      [name]: type === 'number' && newValue === '' ? '' : newValue,
    };
    onCircuitChange(updatedCircuit);
  };


  // Renderiza o formulário de entrada para um único circuito
  return (
    // Container para o formulário deste circuito
    <div className="bg-gray-100 p-6 rounded-md shadow-sm mb-6 border border-gray-200"> {/* Estilo aprimorado */}
      
      {/* Cabeçalho do formulário do circuito com nome e botão remover */}
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-xl font-semibold text-gray-700">{circuit.name || `Circuito ${index + 1}`}</h3> {/* Usa o nome se existir, senão usa o índice */}
          {/* Botão para Remover Circuito */}
           <button
             onClick={() => onRemoveCircuit(circuit.id)} // Chama a função onRemoveCircuit do pai
             className="text-red-600 hover:text-red-800 text-sm font-medium transition duration-200"
           >
             Remover
           </button>
      </div>


      {/* --- CAMPOS DE ENTRADA DO FORMULÁRIO --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Layout responsivo em grelha */}
        
        {/* Campo Nome do Circuito */}
        <div>
          <label htmlFor={`name-${circuit.id}`} className="block text-sm font-medium text-gray-700 mb-1">Nome do Circuito</label>
          <input
            type="text"
            id={`name-${circuit.id}`}
            name="name"
            value={circuit.name}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Campo Tipo de Circuito */}
        <div>
          <label htmlFor={`type-${circuit.id}`} className="block text-sm font-medium text-gray-700 mb-1">Tipo de Circuito</label>
          <select
            id={`type-${circuit.id}`}
            name="type"
            value={circuit.type} // O valor selecionado
            onChange={handleInputChange} // Lida com a mudança
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

        {/* Campo Potência (Visível se for TUE, ou para ajuste manual) */}
         {/* Note: A lógica para calcular potência automaticamente para Ilum/TUG virá depois */}
        <div>
             <label htmlFor={`power-${circuit.id}`} className="block text-sm font-medium text-gray-700 mb-1">Potência Total do Circuito (W)</label>
             <input
               type="number" // Input do tipo number
               id={`power-${circuit.id}`}
               name="power"
               value={circuit.power} // O valor do input é o estado 'power'
               onChange={handleInputChange} // Lida com a mudança
               min="0" // Potência não pode ser negativa
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
             />
         </div>

         {/* --- BLOCO PARA MOSTRAR A CORRENTE CALCULADA --- */}
          {/* Mostra a corrente calculada se ela existir e for um número válido */}
          {circuit.calculatedCurrent !== undefined && circuit.calculatedCurrent !== '' && !isNaN(Number(circuit.calculatedCurrent)) && (
              <div> {/* Este div é renderizado se a condição for verdadeira */}
                  <label className="block text-sm font-medium text-gray-700 mb-1">Corrente Calculada (Ib)</label>
                   {/* Exibe o valor com 2 casas decimais */}
                  <p className="mt-1 block w-full px-3 py-2 bg-blue-50 rounded-md shadow-sm text-blue-800 font-semibold border border-blue-200 sm:text-sm">
                     {Number(circuit.calculatedCurrent).toFixed(2)} A
                  </p>
              </div>
          )}
          {/* --- FIM DO BLOCO ADICIONADO --- */}


         {/* Futuros campos: Número de pontos, Comprimento, Método Instalação, etc. */}
          {/* Exemplo Campo Número de Pontos */}
           {/* <div>
               <label htmlFor={`points-${circuit.id}`} className="block text-sm font-medium text-gray-700 mb-1">Nº de Pontos/Tomadas</label>
               <input
                 type="number"
                 id={`points-${circuit.id}`}
                 name="numberOfPoints" // Adicionar numberOfPoints à interface Circuit
                 value={circuit.numberOfPoints || ''}
                 onChange={handleInputChange}
                 min="0"
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
               />
           </div> */}


      </div> {/* Fim dos campos de entrada */}

    </div> // Fim do container do formulário do circuito
  );
}