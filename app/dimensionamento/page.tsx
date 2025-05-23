// calcelectric/app/dimensionamento/page.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CircuitInputForm from '../components/CircuitInputForm';
import { Circuit } from '../../types/circuit';

export default function DimensionamentoPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // ***** CONSOLE LOGS PARA DEPURAR O PLANO *****
  console.log("DEBUG: Usuário carregado no Dimensionamento:", user);
  console.log("DEBUG: Plano do usuário no Dimensionamento:", user?.publicMetadata?.plan);
  // **********************************************

  // Estado para um circuito de teste. Garante que os valores são numéricos ou strings vazias conforme o tipo.
  const [testCircuit, setTestCircuit] = useState<Circuit>({
    id: 'test-circuit-1',
    name: 'Circuito Teste',
    type: '0', // CORRIGIDO: string vazia
    power: '0',
    voltage:'0',
    installationMethod: '0', // CORRIGIDO: string vazia
    numberOfLoadedConductors: '0', // CORRIGIDO: string vazia
    ambientTemperature: '0', // CORRIGIDO: string vazia
    numberOfGroupedCircuits: '0', // CORRIGIDO: string vazia
    errors: {}, // Inicializa como objeto vazio
  });

  // Funções de manipulação para o CircuitInputForm
  const handleCircuitChange = (updatedCircuit: Circuit) => {
    setTestCircuit(updatedCircuit);
    console.log('DEBUG: Circuito atualizado:', updatedCircuit); // Para depuração
  };

  const handleRemoveCircuit = (id: string) => {
    console.log(`DEBUG: Remover Circuito: ${id}`);
    // Em um cenário real, você removeria o circuito do estado aqui.
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
    router.push('/sign-in'); // Redireciona para login se não estiver logado
    return null;
  }

  // Lógica de Proteção de Plano
  if (user?.publicMetadata?.plan !== 'premium') {
     console.log("DEBUG: Redirecionando para upgrade. Plano atual não é 'premium'. Plano lido:", user?.publicMetadata?.plan);
     router.push('/upgrade');
     return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Calculadora de Dimensionamento Elétrico</h1>
      <div className="flex flex-col space-y-4">
        <CircuitInputForm
          circuit={testCircuit}
          onCircuitChange={handleCircuitChange}
          onRemove={handleRemoveCircuit}
        />
        {/* Você pode adicionar mais CircuitInputForm aqui ou lógica para adicionar dinamicamente */}
      </div>
      {/* Adicione botões para adicionar novos circuitos, realizar o cálculo final, etc. */}
    </main>
  );
}