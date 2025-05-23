// calcelectric/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    // Este div envolve o componente SignIn para centralizá-lo
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignIn />
    </div>
  );
}