// calcelectric/app/upgrade/page.tsx
'use client'; // Necessário para usar hooks do Next.js e React

import Link from 'next/link';

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">Acesso Premium Necessário</h1>
        <p className="text-lg text-gray-700 mb-6">
          Desculpe, esta funcionalidade está disponível apenas para usuários com um plano **Premium**.
        </p>
        <p className="text-md text-gray-600 mb-8">
          Faça o upgrade para ter acesso ilimitado a todos os recursos avançados da nossa calculadora e muito mais!
        </p>

        <div className="space-y-4">
          {/* Botão de Upgrade ( placeholder por enquanto ) */}
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-300 transform hover:scale-105">
            Comprar Plano Premium
          </button>

          {/* Link para a página inicial ou outro lugar */}
          <Link href="/" className="inline-block text-indigo-600 hover:text-indigo-800 font-semibold text-lg transition duration-200">
            Voltar para a Página Inicial
          </Link>
        </div>

        {/* Opcional: Seções de Comparação de Planos, FAQs, etc. */}
        {/* <div className="mt-8 border-t pt-6 text-gray-500 text-sm">
          <p>Dúvidas? Entre em contato com nosso suporte.</p>
        </div> */}
      </div>
    </div>
  );
}