// calcelectric/app/dashboard/page.tsx
'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Carregando Dashboard...</div>;
  }

  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  const userFirstName = user?.firstName;
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const userPlan = user?.publicMetadata?.plan || 'Free';

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Bem-vindo ao seu Dashboard, {userFirstName || userEmail}!
      </h1>
      <p className="text-lg text-gray-600 mb-8">Esta é a sua área restrita.</p>
      <div className="flex items-center space-x-4">
        <UserButton afterSignOutUrl="/" />
        <p className="text-gray-700">Seu plano atual: {String(userPlan)}</p>
      </div>
      <div className="mt-8">
        <a href="/dimensionamento" className="text-blue-600 hover:underline">Ir para a Calculadora de Dimensionamento</a>
        <span className="mx-2">|</span>
        <a href="/upgrade" className="text-blue-600 hover:underline">Ver planos de Upgrade</a>
      </div>
    </main>
  );
}