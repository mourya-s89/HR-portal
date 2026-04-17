"use client";
import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for AccessDenied error from Google OAuth
  useEffect(() => {
    if (searchParams.get("error") === "AccessDenied") {
      toast.error("Access Denied: Your email is not registered in the system.");
      // Clear the error from the URL to prevent repeated toasts
      router.replace("/login");
    }
  }, [searchParams, router]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("An error occurred with Google Login.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome back</h1>
        <p className="text-slate-500">Sign in to manage your workforce with intelligence</p>
      </div>

      <div className="space-y-6">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-center text-slate-400 text-sm px-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-100 text-center">
        <p className="text-slate-600 text-sm">
          Need help? <a href="mailto:support@hrportal.com" className="text-indigo-600 font-medium hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Right Illustration Section */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 bg-indigo-50">
        <img 
          src="/login-illustration.png" 
          alt="Login Illustration" 
          className="max-w-[85%] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
        />
      </div>
    </div>
  );
}
