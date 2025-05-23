// calcelectric/app/dashboard/page.tsx
'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  // Removido 'unsafe_reload' aqui
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  // Lógica de Carregamento do Clerk
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Carregando Dashboard...
      </div>
    );
  }

  // Lógica de Autenticação (redireciona se não estiver logado)
  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  // Dados do usuário, com fallback para segurança
  const userFirstName = user?.firstName;
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const userPlan = user?.publicMetadata?.plan || 'Free';

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-700 to-purple-800 p-8 flex flex-col items-center justify-center text-white">
      {/* Título Principal */}
      <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg text-center">
        Bem-vindo ao seu Dashboard, {userFirstName || userEmail}!
      </h1>

      {/* Mensagem de Área Restrita */}
      <p className="text-xl text-white opacity-80 mb-12 text-center max-w-lg">
        Esta é a sua área exclusiva para gerenciar suas ferramentas e acessos.
      </p>

      {/* Seção de Informações do Usuário e Botão de Logout */}
      <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-8 mb-12 shadow-2xl">
        <div className="flex items-center space-x-4">
          {/* Personalização do UserButton para ser um pouco maior e visível */}
          <div className="w-12 h-12 flex items-center justify-center bg-blue-500 rounded-full text-xl font-bold">
            <UserButton afterSignOutUrl="/" />
          </div>
          <p className="text-xl text-white font-semibold">
            Seu plano atual: <span className="font-bold text-yellow-300">{String(userPlan).toUpperCase()}</span>
          </p>
        </div>
      </div>

      {/* O botão "Recarregar Dados do Usuário" foi removido daqui */}

      {/* Seção de Navegação (Botões) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Botão para a Calculadora de Dimensionamento */}
        <Link href="/dimensionamento" legacyBehavior>
          <a className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-5 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-lg space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13m-6 2l6-3m-6-3V6m0 10a3 3 0 11-6 0 3 3 0 016 0zm0 0l-1 1m-1-1a3 3 0 11-6 0 3 3 0 016 0zm0 0l-1 1"></path></svg>
            <span>Calculadora de Dimensionamento</span>
          </a>
        </Link>

        {/* Botão para Planos de Upgrade */}
        <Link href="/upgrade" legacyBehavior>
          <a className="bg-green-500 hover:bg-green-600 text-white font-bold py-5 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-lg space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V8m0 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Ver Planos de Upgrade</span>
          </a>
        </Link>
      </div>
    </main>
  );
}