"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase-client";
import { toast } from "sonner";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";

export function SignUpForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || isLoading) return;

    if (password.length < 8) {
      toast.error("Parola trebuie să aibă cel puțin 8 caractere");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { first_name: firstName.trim(), name: firstName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(safeRedirect)}`,
      },
    });

    if (error) {
      toast.error(
        error.message.toLowerCase().includes("already registered")
          ? "Există deja un cont cu acest email. Încearcă să te autentifici."
          : error.message
      );
      setIsLoading(false);
      return;
    }

    setEmailSent(true);
    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(safeRedirect)}`,
      },
    });
    if (error) toast.error("Eroare la înregistrare cu Google");
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="text-5xl">📧</div>
        <h3 className="text-lg font-semibold text-white">Verifică emailul</h3>
        <p className="text-slate-400 text-sm">
          Am trimis un email de confirmare la{" "}
          <span className="text-blue-400 font-medium">{email}</span>.
          Dă click pe link pentru a-ți activa contul.
        </p>
        <p className="text-xs text-slate-500">
          Contul tău va funcționa atât pe{" "}
          <span className="text-white">MedRețea</span> cât și pe{" "}
          <span className="text-white">MedLearn</span> — o singură înregistrare
          pentru ambele platforme.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Google */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignUp}
        className="w-full border-white/20 text-white hover:bg-white/10 bg-white/5"
      >
        <svg className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Înregistrează-te cu Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-slate-900 text-slate-500">sau cu email</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-slate-400">Prenume / Nume afișat</label>
        <Input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Dr. Popescu"
          required
          autoComplete="given-name"
          className="bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-slate-400">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="doctor@exemplu.ro"
          required
          autoComplete="email"
          className="bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-slate-400">Parolă (min. 8 caractere)</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
            className="bg-white/5 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
        {isLoading ? "Se creează contul..." : "Creează cont gratuit"}
      </Button>

      <p className="text-xs text-slate-600 text-center leading-relaxed">
        Un singur cont pentru{" "}
        <span className="text-slate-400">MedRețea</span> și{" "}
        <span className="text-slate-400">MedLearn</span> — înregistrarea este
        valabilă pe ambele platforme.
      </p>

      <p className="text-center text-sm text-slate-500">
        Ai deja cont?{" "}
        <Link href="/auth/login" className="text-blue-400 hover:underline">
          Autentifică-te
        </Link>
      </p>
    </form>
  );
}
