import React from "react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { Home, MessageSquare, Files, Hammer, Settings, Menu, X, Landmark, UserCheck } from "lucide-react";
import { useDevice } from "./DeviceProvider";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { activeTab, setActiveTab } = useWorkspaceStore();
  const device = useDevice();

  const menuItems = [
    { id: "home" as const, label: "XHome", icon: Home, subtitle: "Dashboard & Intake" },
    { id: "agent" as const, label: "WhisperX", icon: MessageSquare, subtitle: "Agent Orchestration" },
    { id: "doc" as const, label: "XDoc", icon: Files, subtitle: "Docs, Sheets, Slides" },
    { id: "tools" as const, label: "XTools", icon: Hammer, subtitle: "Mascots & Creations" },
    { id: "settings" as const, label: "XSettings", icon: Settings, subtitle: "Providers & Sync" },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#12161F] border-r border-white/10 w-64 shrink-0 text-slate-400">
      {/* Brand Launcher banner */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#151921]">
        <div className="flex items-center space-x-2">
          <Landmark size={18} className="text-blue-450 animate-pulse" />
          <span className="font-mono text-xs font-bold text-slate-200 tracking-widest uppercase">
            WHISPERX HUB
          </span>
        </div>
        {device !== "desktop" && (
          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation buttons */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-3 mb-2">
          Workspace Navigation
        </p>
        {menuItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (device !== "desktop") setMobileOpen(false);
              }}
              className={`w-full flex items-center space-x-3.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? "bg-blue-500/20" : "bg-white/5"}`}>
                <IconComp size={16} className={isActive ? "text-blue-450" : "text-slate-400"} />
              </div>
              <div className="text-left">
                <span className="text-xs block leading-tight">{item.label}</span>
                <span className={`text-[10px] block font-normal leading-none mt-0.5 ${
                  isActive ? "text-blue-300/80" : "text-slate-500"
                }`}>
                  {item.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Active Session user details */}
      <div className="p-4 border-t border-white/10 bg-white/2">
        <div className="flex items-center space-x-3 bg-white/5 p-2.5 rounded-xl border border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white font-mono text-xs border border-white/10">
            AS
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-300 leading-none truncate">assadawut.sarakul</p>
            <p className="text-[10px] text-slate-500 mt-1 truncate">assadawut.sarakul@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Responsive adaptive drawers
  if (device !== "desktop") {
    if (!mobileOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/65 z-50 flex">
        {content}
        <div className="flex-1" onClick={() => setMobileOpen(false)} />
      </div>
    );
  }

  return content;
}
export { Menu as HamburgerIcon };
