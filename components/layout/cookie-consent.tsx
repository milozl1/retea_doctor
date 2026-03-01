"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("cookie-consent", "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 lg:p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto glass-card p-5 border border-white/[0.08] shadow-2xl shadow-black/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              Utilizăm cookies
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Folosim cookies esențiale pentru autentificare și funcționalitate.
              Prin continuarea navigării, ești de acord cu{" "}
              <Link
                href="/cookies"
                className="text-primary hover:text-primary/80 underline underline-offset-2"
              >
                Politica de Cookies
              </Link>
              .
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={handleAccept}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white text-xs h-8 px-4"
              >
                Accept
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-300 text-xs h-8"
              >
                Închide
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-600 hover:text-slate-400 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
