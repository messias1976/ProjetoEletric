// calcelectric/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    // Este div envolve o componente SignUp para centralizá-lo
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignUp />
    </div>
  );
}