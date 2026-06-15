import React from "react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export function Toaster() {
  const { toasts, removeToast } = useWorkspaceStore() as any;

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-14 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast: any) => {
        const borderColors = {
          success: "border-[#CCFF00] shadow-[#CCFF00]/10",
          warn: "border-[#FF2D78] shadow-[#FF2D78]/10",
          info: "border-[#00F5FF] shadow-[#00F5FF]/10",
        };
        const borderColor = borderColors[toast.type as keyof typeof borderColors] || "border-white/20";
        
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#0b0b12] border-3 ${borderColor} text-white px-4 py-3 shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-start gap-3 relative overflow-hidden font-mono text-[11px] animate-slide-in`}
          >
            {/* Animated left indicator bar */}
            <div className="absolute inset-y-0 left-0 w-1 bg-current" />

            {toast.type === "success" && <CheckCircle size={14} className="text-[#CCFF00] shrink-0 mt-0.5" />}
            {toast.type === "warn" && <AlertCircle size={14} className="text-[#FF2D78] shrink-0 mt-0.5" />}
            {toast.type === "info" && <Info size={14} className="text-[#00F5FF] shrink-0 mt-0.5" />}

            <div className="flex-1 pr-4 whitespace-pre-wrap leading-relaxed">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0 mt-0.5 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
