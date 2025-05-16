// calcelectric/middleware.ts

import { authMiddleware } from "@clerk/nextjs";

// Este middleware irá proteger todas as rotas da aplicação por padrão
// No entanto, podes especificar rotas públicas que não requerem autenticação

export default authMiddleware({
  // Rotas públicas que qualquer pessoa pode aceder sem autenticação
  publicRoutes: [
      '/',           // A página inicial
      '/sign-in(.*)', // A página de login e qualquer sub-rota (ex: /sign-in/sso-callback)
      '/sign-up(.*)',  // A página de registo e qualquer sub-rota
      '/dimensionamento' // A página da calculadora (por enquanto, pública - mudaremos depois)
      // Adiciona aqui outras rotas públicas se tiveres (ex: /sobre, /contacto)
    ],

  // Rotas que serão ignoradas pelo middleware (ex: rotas de webhook do Clerk)
  ignoredRoutes: [
      // '/api/webhook',
      // '/api/some-other-public-api'
    ]
});

// Configuração do middleware
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)"],
};