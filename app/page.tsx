// calcelectric/app/page.tsx

import Link from 'next/link';
//import { Button } from '@/components/ui/button'; // Assumindo que tens um componente Button (opcional, podes usar um <a> normal)

// Se não tens um componente Button, substitui a importação acima por:
// import Link from 'next/link';
// E nos botões, usa a tag <a> com classes Tailwind


export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-12 px-4 text-center bg-gray-50"> {/* Ajustado min-height para considerar um possível header, padding, fundo suave */}
      
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Bem-vindo à Calculadora de Dimensionamento Elétrico
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Dimensione instalações elétricas residenciais de forma rápida e fácil, seguindo as normas NBR.
      </p>
      
      <div className="flex space-x-4"> {/* Container para alinhar botões */}
        
        {/* Botão/Link para a página de Login */}
        <Link href="/sign-in" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
        Entrar {/* O texto agora vai direto dentro do Link */}
    </Link>

        {/* Botão/Link para a página de Registo */}
        <Link href="/sign-up" className="bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition duration-200">
       Criar Conta {/* O texto agora vai direto dentro do Link */}
    </Link>

      </div>
      
      {/* Opcional: Adicionar um link para a calculadora de dimensionamento, que será pública por agora */}
      {/* No futuro, podes proteger esta rota */}
       <div className="mt-12">
       <Link href="/dimensionamento" className="text-blue-600 hover:underline text-lg">
       Ir para a Calculadora (Acesso Gratuito) {/* O texto agora vai direto dentro do Link */}
   </Link>
       </div>


    </div>
  );
}

// Nota: Este código assume que tens o Tailwind CSS configurado.
// Usei um componente <Button> que pode ou não existir no teu projeto.
// Se não tiveres o componente <Button>, comenta as linhas que o usam e descomenta as linhas que usam a tag <a> simples com as classes Tailwind fornecidas.