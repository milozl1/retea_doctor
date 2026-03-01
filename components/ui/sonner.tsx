"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-slate-800 border-white/10 text-white shadow-xl",
          description: "text-slate-400",
          actionButton: "bg-primary text-white",
          cancelButton: "bg-slate-700 text-white",
        },
      }}
    />
  );
}
