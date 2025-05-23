// calcelectric/app/dimensionamento/page.tsx
'use client'; // Mantenha esta diretiva

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import CircuitInputForm from '../components/CircuitInputForm'; // Caminho para 'app/components'
import { useState } from 'react';
import { Circuit } from '../../types/circuit'; // <--- Caminho corrigido novamente para a raiz do projeto

export default function DimensionamentoPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // Estado para um circuito de teste, com tipos de string para inputs
  const [testCircuit, setTestCircuit] = useState<Circuit>({
    id: 'test-circuit-1',
    name: 'Circuito Teste',
    type: '',
    power: '0', // Inicialize como string '0' ou ''
    voltage: '0', // Inicialize como string '0' ou ''
    numberOfPoints: '0', // Inicialize como string '0'
    installationMethod: '',
    numberOfLoadedConductors: '0', // Inicialize como string '0'
    ambientTemperature: '0', // Inicialize como string '0'
    numberOfGroupedCircuits: '0', // Inicialize como string '0'
    errors: {}, // Mantenha como objeto vazio

    // Inicialize campos de resultado de cálculo conforme a interface Circuit
    calculatedCurrent: '', // Pode ser '' ou 0 se a interface permitir number | ''
    calculatedId: '', // Pode ser '' ou 0
    selectedBreakerIn: null,
    selectedConductorSection: null,
    calculatedIz: null,
  });

  // Funções de manipulação para as props do CircuitInputForm
  const handleCircuitChange = (updatedCircuit: Circuit) => {
    setTestCircuit(updatedCircuit);
  };

  const handleRemoveCircuit = (id: string) => {
    console.log('Remover circuito:', id);
    // Em um cenário real, aqui você implementaria a remoção de um circuito de um array
  };

  // Lógica de Carregamento do Clerk
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  // Lógica de Autenticação
  if (!isSignedIn) {
    router.push('/sign-in'); // Redireciona para login se não estiver logado
    return null;
  }

  // Lógica de Verificação de Plano
  const userPlan = user.publicMetadata?.plan;
  const requiredPlan = 'premium'; // Define o plano necessário para acessar esta página
  if (userPlan !== requiredPlan) {
    router.push('/upgrade'); // Redireciona para a página de upgrade se o plano não for premium
    return null;
  }

  // Se tudo estiver OK (logado e com plano 'premium'), renderiza a calculadora
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Calculadora de Dimensionamento Elétrico</h1>
        {/* Renderiza o CircuitInputForm, passando as props necessárias */}
        <CircuitInputForm
          circuit={testCircuit}
          index={0} // Índice 0 para este circuito de teste
          onCircuitChange={handleCircuitChange}
          onRemoveCircuit={handleRemoveCircuit}
        />
      </div>
    </main>
  );
}