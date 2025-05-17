// calcelectric/app/dimensionamento/page.tsx

'use client'; // Este componente precisa ser um Client Component para usar hooks como useState

import { useState } from 'react'; // Hook para gerir o estado no componente
import Link from 'next/link'; // Já tínhamos, mas vamos garantir
// Importa o componente CircuitInputForm e a interface Circuit que agora está definida nele
// Garante que o caminho abaixo (@/app/components/CircuitInputForm) aponta corretamente para o teu ficheiro CircuitInputForm.tsx
import CircuitInputForm, { Circuit } from '@/app/components/CircuitInputForm';


export default function DimensionamentoPage() {
  // Estado para armazenar a lista de circuitos. Começa com um circuito vazio por padrão.
  const [circuits, setCircuits] = useState<Circuit[]>([{ id: 'circuit-1', name: 'Circuito 1', type: '', voltage: '', power: '' }]);
  const [nextCircuitId, setNextCircuitId] = useState(2); // Contador para gerar IDs únicos
  const [totalPower, setTotalPower] = useState<number | ''>(''); // Estado para a potência total calculada
  // Função para adicionar um novo circuito à lista
  const addCircuit = () => {
    const newCircuit: Circuit = {
      id: `circuit-${nextCircuitId}`, // Gera um ID único
      name: `Circuito ${nextCircuitId}`, // Nome inicial
      type: '', // Inicializa novos campos com valores vazios
      voltage: '',
      power: '',
      // Inicializar outros campos que adicionares à interface Circuit aqui
    };
    setCircuits([...circuits, newCircuit]); // Adiciona o novo circuito ao estado existente
    setNextCircuitId(nextCircuitId + 1); // Incrementa o contador para o próximo ID
  };

  // Função para remover um circuito
  const removeCircuit = (id: string) => {
      setCircuits(circuits.filter(circuit => circuit.id !== id));
  };

  // Função para lidar com as mudanças nos dados de um circuito individual (chamada pelo CircuitInputForm)
  const handleCircuitUpdate = (updatedCircuit: Circuit) => {
      // Encontra o índice do circuito atualizado na lista
      const circuitIndex = circuits.findIndex(circuit => circuit.id === updatedCircuit.id);
      if (circuitIndex === -1) return; // Se não encontrar, sai (não deve acontecer)

      // Cria uma nova lista de circuitos com o circuito atualizado na sua posição
      const newCircuits = [...circuits]; // Copia a lista existente
      newCircuits[circuitIndex] = updatedCircuit; // Substitui o circuito antigo pelo atualizado

      // Atualiza o estado global da lista de circuitos
      setCircuits(newCircuits);
  };

  // Função para Calcular o Dimensionamento
   const calculateDimensionamento = () => {
     console.log("Iniciando cálculo...");
     console.log("Dados de entrada dos circuitos:", circuits);

     let calculatedTotalPower = 0; // Variável para somar a potência total
     const updatedCircuits = circuits.map(circuit => {
     let currentIb: number | '' = ''; // Corrente de operação para este circuito

     // Verifica se Potência e Tensão estão preenchidas e são números válidos
       if (circuit.power !== '' && circuit.power !== null && circuit.power > 0 &&
          (circuit.voltage === '127' || circuit.voltage === '220')) {

       const power = Number(circuit.power); // Garante que é um número
       const voltage = Number(circuit.voltage); // Garante que é um número

            if (!isNaN(power) && !isNaN(voltage) && voltage > 0) {
     // Calcula a Corrente de Operação (Ib = P/V para monofásico)
     // Assumindo fator de potência = 1 por enquanto
                currentIb = power / voltage;

     // Soma a potência deste circuito à potência total
                 calculatedTotalPower += power;

     // Corrigido: log padrão JavaScript
                  console.log(`Circuito ${circuit.name}: Potência=${power}W, Tensão=${voltage}V, Ib=${Number(currentIb).toFixed(2)}A`); // Log para verificar
                         } else {
                           console.warn(`Circuito ${circuit.name}: Potência ou Tensão inválida para cálculo.`);
                          }
                         } else {
                           console.warn(`Circuito ${circuit.name}: Potência ou Tensão não preenchida para cálculo.`);
     }

     // Retorna uma cópia do circuito com a corrente calculada adicionada
         return {
             ...circuit,
             calculatedCurrent: currentIb
         }; // <-- CORRIGIDO: Garante que está exato assim
       }); // <-- Fim do map()

     // Atualiza o estado com a potência total e os circuitos com a corrente calculada
      setTotalPower(calculatedTotalPower);
     // --- DESCOMENTA ESTA LINHA ---
      setCircuits(updatedCircuits); // <-- ESTA LINHA AGORA DEVE ESTAR ATIVA
     // --- FIM DA LINHA DESCOMENTADA ---

     // Opcional: Remove ou comenta o log de debug do updatedCircuits se não for mais necessário
     // console.log("Conteúdo de updatedCircuits antes de setCircuits:", updatedCircuits);

      console.log("Potência Total Calculada:", calculatedTotalPower, "W");
      console.log("Cálculo inicial concluído.");
    };
  // --- Fim da Função de Cálculo Modificada ---


  return (
    // Container principal com fundo e padding
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8"> {/* Fundo azul claro, padding */}

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-blue-100"> {/* Container centralizado, largura maior, estilo de cartão */}

        <h1 className="text-3xl font-bold text-blue-800 text-center mb-8">Calculadora de Dimensionamento Elétrico</h1> {/* Título centralizado */}

        {/* Área para adicionar e listar circuitos */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Circuitos</h2>

          {/* Botão para Adicionar Circuito */}
           {/* Usando classes Tailwind para estilizar como um botão */}
          <button
            onClick={addCircuit} // Chama a função addCircuit ao clicar
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
          >
            + Adicionar Circuito
          </button>
        </div>

        {/* --- Renderiza o Componente CircuitInputForm para cada circuito --- */}
         {/* Mapeia a lista de circuitos e renderiza um formulário para cada um */}
        <div>
            {circuits.map((circuit, index) => (
                // Renderiza o componente CircuitInputForm, passando os dados do circuito e funções
                <CircuitInputForm
                    key={circuit.id} // Chave única para a lista (essencial para React)
                    circuit={circuit} // Passa o objeto circuit atual para o formulário
                    index={index} // Passa o índice na lista
                    onCircuitChange={handleCircuitUpdate} // Passa a função para atualizar o estado pai quando um campo mudar
                    onRemoveCircuit={removeCircuit} // Passa a função para o botão "Remover"
                />
            ))}
            {circuits.length === 0 && ( // Mostra mensagem se não houver circuitos adicionados
                 <p className="text-gray-600 text-center">Nenhum circuito adicionado ainda. Clique em "+ Adicionar Circuito".</p>
            )}
        </div>


        {/* Futura área para Resultados e Botão de Cálculo */}
        {/* Área para Resultados e Botão de Cálculo */}
        <div className="mt-12 pt-8 border-t-2 border-blue-200"> {/* Margem superior e borda para separar */}
             <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resultados do Dimensionamento</h2>
              {/* Exibe a potência total calculada */}
              {totalPower !== '' && totalPower > 0 ? (
                  <p className="text-gray-800 text-xl font-semibold mb-6">Potência Total da Instalação: {totalPower.toFixed(2)} W</p> // Mostra a potência se calculada
              ) : (
                   <p className="text-gray-600 mb-6">Os resultados aparecerão aqui após o cálculo.</p> // Placeholder se ainda não calculou
              )}
              
              {/* Botão de Calcular */}
              <button
                onClick={calculateDimensionamento} // Chama a função de cálculo ao clicar
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
              >
                Calcular Dimensionamento
              </button>

              {/* Futura área onde os resultados detalhados serão exibidos */}
              {/* Exemplo: */}
              {/* <div className="mt-6 bg-blue-100 p-4 rounded-md">
                    <h3 className="text-xl font-semibold text-blue-800">Resumo:</h3>
                    <p>Potência Total: [Valor] W</p>
                    <p>Corrente Total: [Valor] A</p>
                     ... resultados por circuito ...
              </div> */}

        </div>


      </div> {/* Fim do Cartão principal */}
    </div> // Fim do container principal com fundo
  );
}