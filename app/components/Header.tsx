// calcelectric/components/Header.tsx

'use client'; // Isso é importante para que os hooks do Clerk funcionem no Client Component

import Link from 'next/link';
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'; // Assumindo que você usa Clerk

export default function Header() {
  const { isLoaded, isSignedIn, user } = useUser(); // Hook para acessar os dados do usuário do Clerk

  return (
    <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Nome do App */}
        <Link href="/" className="text-2xl font-bold tracking-wider hover:text-blue-200 transition duration-200">
          Calcule Fácil
        </Link>

        {/* Navegação Principal */}
        <nav className="hidden md:flex space-x-6"> {/* Esconde em telas pequenas, mostra em telas médias/grandes */}
          <Link href="/dimensionamento" className="hover:text-blue-200 transition duration-200 text-lg font-medium">
            Calculadora
          </Link>
          {/* Adicionar mais links de navegação aqui se tiver outras páginas */}
          {/* <Link href="/blog" className="hover:text-blue-200 transition duration-200 text-lg font-medium">Blog</Link> */}
          {/* <Link href="/sobre" className="hover:text-blue-200 transition duration-200 text-lg font-medium">Sobre</Link> */}
        </nav>

        {/* Área do Usuário (Login/Perfil) */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            {/* Se o usuário estiver logado, mostra o botão do perfil do Clerk */}
            <UserButton afterSignOutUrl="/" />
            {/* Opcional: Mostrar o nome do usuário */}
            {/* <span className="hidden lg:inline-block text-lg font-medium">Olá, {user?.firstName || user?.username}!</span> */}
          </SignedIn>
          <SignedOut>
            {/* Se o usuário NÃO estiver logado, mostra botões de Entrar/Criar Conta */}
            <Link href="/sign-in" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200 text-base font-medium">
              Entrar
            </Link>
            <Link href="/sign-up" className="hidden sm:inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200 text-base font-medium"> {/* Esconde "Criar Conta" em telas muito pequenas */}
              Criar Conta
            </Link>
          </SignedOut>
        </div>

        {/* Menu Hambúrguer para Mobile (se for implementar depois) */}
        {/* <div className="md:hidden">
          <button className="text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div> */}
      </div>
    </header>
  );
}