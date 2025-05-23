// calcelectric/app/page.tsx - Versão Corrigida com Login e Cartões de Funcionalidade

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
          Calcule Fácil
        </h1>
        <p className="mt-4 text-lg sm:text-xl md:text-2xl font-light opacity-90 max-w-3xl mx-auto">
          Sua ferramenta completa para dimensionamento elétrico
        </p>
      </div>

      {/* Seção de Login/Cadastro */}
      <div className="mb-12 flex flex-col items-center"> {/* Aumentei a margem inferior para separar do próximo bloco */}
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-white text-center">
          Comece a dimensionar agora!
        </h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"> {/* Espaçamento responsivo para botões */}
          <Link href="/sign-in" className="bg-white text-blue-600 hover:bg-blue-100 font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300 text-lg sm:text-xl transform hover:-translate-y-1">
            Entrar
          </Link>
          <Link href="/sign-up" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300 text-lg sm:text-xl transform hover:-translate-y-1">
            Criar Conta
          </Link>
        </div>
      </div>

      {/* Seção de Funcionalidades/Calculadoras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-5xl px-4">
        {/* Cartão de Dimensionamento Elétrico - Agora acessível diretamente */}
        <Link href="/dimensionamento" legacyBehavior>
          <a className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 flex flex-col items-center justify-center text-center border border-white border-opacity-20 transform hover:-translate-y-1">
            <svg className="h-12 w-12 sm:h-16 sm:w-16 text-white mb-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Dimensionamento</h2>
            <p className="text-base sm:text-lg opacity-80">Calcule cabos, disjuntores e correntes para seus circuitos.</p>
          </a>
        </Link>

        {/* Cartão Queda de Tensão (Futuro) */}
        <a href="#" className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center border border-white border-opacity-20 opacity-60 cursor-not-allowed">
          <svg className="h-12 w-12 sm:h-16 sm:w-16 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v18M5 9h14M5 15h14"></path>
          </svg>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Queda de Tensão</h2>
          <p className="text-base sm:text-lg">Em breve: Calcule a queda de tensão em suas instalações.</p>
        </a>

        {/* Cartão Outras Ferramentas (Futuro) */}
        <a href="#" className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center border border-white border-opacity-20 opacity-60 cursor-not-allowed">
          <svg className="h-12 w-12 sm:h-16 sm:w-16 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2m14 0h2m-2 0h-2M9 11V9m6 2V9m2 2V9"></path>
          </svg>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Outras Ferramentas</h2>
          <p className="text-base sm:text-lg">Mais calculadoras e recursos para você!</p>
        </a>

      </div>

      <footer className="mt-16 sm:mt-20 text-gray-200 text-xs sm:text-sm opacity-80">
        © {new Date().getFullYear()} Calcule Fácil. Todos os direitos reservados.
      </footer>
    </div>
  );
}