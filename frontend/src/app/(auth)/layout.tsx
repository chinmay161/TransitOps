import { Toaster } from "@/components/ui/sonner";
import { AuthHeader } from "@/components/auth/auth-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster />
      <div className="dot-grid flex min-h-dvh items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <AuthHeader />
          {children}
        </div>
      </div>
    </>
  );
}
