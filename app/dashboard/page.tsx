// calcelectric/app/dashboard/page.tsx

'use client'; // Este componente precisa ser um Client Component para usar hooks como useUser e o router

import { UserButton, useUser } from "@clerk/nextjs"; // Componentes e hooks do Clerk
import { useRouter } from 'next/navigation'; // Importa o hook useRouter para redirecionamento
import { useEffect } from 'react'; // Importa useEffect para executar lógica após a renderização
import Link from "next/link"; // Importa o componente Link para navegação

// Define o componente da página do Dashboard
export default function DashboardPage() {
  // Usa o hook useUser do Clerk para aceder ao estado de autenticação e dados do utilizador
  const { isLoaded, isSignedIn, user } = useUser();
  // Usa o hook useRouter do Next.js para navegação programática (redirecionamento)
  const router = useRouter();

  // --- Lógica de Proteção da Rota Baseada em Componentes ---
  // Usamos useEffect para executar esta lógica após a renderização inicial e sempre que as dependências mudarem
  useEffect(() => {
    // Se os dados do utilizador já carregaram ('isLoaded' é true) E o utilizador NÃO está autenticado ('isSignedIn' é false)
    if (isLoaded && !isSignedIn) {
      // Redireciona o utilizador para a página de login
      router.push('/sign-in');
    }
    // As dependências do useEffect são as variáveis cujo valor faz com que o efeito deva ser re-executado
  }, [isLoaded, isSignedIn, router]); // Dependências: re-executa se isLoaded, isSignedIn ou router mudarem

  // --- Renderização Condicional ---
  // Enquanto os dados do utilizador estão a carregar (!isLoaded) ou se o utilizador não está autenticado (!isSignedIn),
  // mostramos uma mensagem de carregamento/verificação.
  // A lógica do useEffect acima cuidará do redirecionamento se não estiver autenticado.
  if (!isLoaded || !isSignedIn) {
    return (
        // Mostra uma tela simples de carregamento/verificação enquanto a proteção está a ser avaliada
        <div className="flex justify-center items-center min-h-screen bg-blue-50"> {/* Fundo azul claro */}
            <p className="text-xl text-blue-700">Verificando autenticação...</p> {/* Texto azul */}
        </div>
    );
  }

  // --- Conteúdo Principal do Dashboard ---
  // Este bloco SÓ será renderizado se isLoaded for true E isSignedIn for true.
  // Como o useEffect acima redireciona se não estiver autenticado, user deverá estar disponível aqui.
  return (
    // Container principal com fundo e padding
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start"> {/* Fundo azul claro, padding, centraliza conteúdo verticalmente no topo */}
      
      {/* Cartão principal do Dashboard */}
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center border border-blue-100"> {/* Largura máxima, fundo branco, padding, cantos arredondados, sombra, borda azul clara */}

        <h1 className="text-3xl font-bold text-blue-800 mb-4">Bem-vindo ao seu Dashboard!</h1> {/* Título maior, negrito, cor azul escura */}

        {/* Mostra o nome ou email do utilizador (Lógica robusta para aceder às propriedades do user) */}
        {/* Verifica primeiro se o objeto user existe antes de tentar aceder às suas propriedades */}
        {user ? (
            <> {/* Fragmento para agrupar elementos sem adicionar um novo nó DOM */}
                {user.firstName && user.lastName ? (
                    // Se tem nome e sobrenome, mostra o nome completo
                    <p className="text-xl text-gray-700 mb-6">Olá, <span className="font-semibold">{user.firstName} {user.lastName}</span>!</p> 
                ) : user.primaryEmailAddress?.emailAddress ? (
                    // Se não tem nome completo, mas tem email principal, mostra o email
                    <p className="text-xl text-gray-700 mb-6">Olá, <span className="font-semibold">{user.primaryEmailAddress.emailAddress}</span>!</p> 
                ) : (
                    // Se não tem nome nem email, mostra uma saudação genérica
                    <p className="text-xl text-gray-700 mb-6">Olá!</p>
                )}
            </>
        ) : (
            // Se o objeto user for null/undefined (não deve acontecer se o isSignedIn check funcionou, mas é uma proteção extra)
             <p className="text-xl text-gray-700 mb-6">Olá!</p> // Mostra um "Olá!" genérico
        )}

        <p className="text-gray-600 mb-8">Você está logado e pode acessar esta área protegida.</p> {/* Cor do texto */}

        {/* Área do Botão de Utilizador do Clerk - Estilo Aprimorado */}
        {/* Adicionado padding, fundo suave, cantos arredondados, sombra sutil para o "relevo" */}
        <div className="mb-8 flex justify-center p-3 bg-blue-50 rounded-lg shadow-sm"> {/* Padding, fundo azul suave, cantos arredondados, sombra pequena */}
          {/* Componente do Clerk que mostra a foto do utilizador e menu (logout, gestão de conta) */}
          <UserButton
            afterSignOutUrl="/" // Redireciona para a raiz "/" após o logout. Note que este atributo pode ter um risco no editor por ser considerado depreciado em versões futuras, mas deve funcionar.
            appearance={{
              elements: {
                // Estilo para o container da imagem do avatar
                userButtonAvatarBox: {
                  width: '48px', // Aumenta a largura do avatar (ex: para 48px)
                  height: '48px', // Aumenta a altura do avatar (ex: para 48px)
                  // Pode adicionar outras bordas ou estilos aqui se quiser
                  // border: '2px solid #3b82f6', // Exemplo: borda azul
                  // borderRadius: 'full', // Exemplo: avatar redondo (geralmente já é)
                },
                 // Se quiseres ajustar o popover que abre ao clicar (opcional)
                 // userButtonPopoverCard: {
                 //    backgroundColor: '#ffffff', // Fundo branco para o popover
                 //    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Sombra para o popover
                 // },
              },
              // Variáveis para cores globais dentro do componente (opcional, se não estiver no layout global)
              // variables: {
              //   colorPrimary: '#3b82f6', // Exemplo: cor primária azul
              // },
            }}
          />
        </div>

        {/* Link para a Calculadora - Estilo aprimorado e usando o componente Link corretamente */}
        {/* Não precisa de tag <a> interna nem passHref */}
        <Link href="/dimensionamento" className="inline-block px-4 py-2 text-lg font-medium text-white bg-blue-500 rounded-md shadow-sm hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">{/* Classe Tailwind para estilo, aplicada diretamente no Link */}
            Ir para a Calculadora de Dimensionamento {/* O texto vai direto dentro do Link */}
        </Link>

      </div> {/* Fim do Cartão principal */}
    </div> // Fim do container principal com fundo
  );
}