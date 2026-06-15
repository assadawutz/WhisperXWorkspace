import React from "react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { Home, MessageSquare, Files, Hammer, Settings, Menu, X, Landmark, UserCheck } from "lucide-react";
import { useDevice } from "./DeviceProvider";
import { InteractiveTilt } from "./InteractiveTilt";

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
    <div className="flex flex-col h-full bg-[#0b0b12] border-r-3 border-black w-64 shrink-0 text-slate-350 font-mono">
      {/* Brand Launcher Banner with heavy borders */}
      <div className="h-16 border-b-3 border-black flex items-center justify-between px-5 bg-black/80">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-[#CCFF00] border border-black shadow-[1px_1px_0_rgba(0,0,0,1)] text-black">
            <Landmark size={14} className="animate-pulse" />
          </div>
          <span className="font-mono text-[11px] font-black text-white tracking-widest uppercase">
            WHISPER // HUB
          </span>
        </div>
        {device !== "desktop" && (
          <button 
            onClick={() => setMobileOpen(false)} 
            className="bg-[#FF2D78] text-white border-2 border-black p-1 text-[10px] font-bold cursor-pointer transition-all active:scale-90"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Buttons List */}
      <nav className="flex-1 p-4 space-y-2.5 overflow-y-auto">
        <p className="text-[9px] font-mono font-black text-[#00F5FF] uppercase tracking-wider pl-1 mb-2">
          SYSTEM_ROUTES::
        </p>
        {menuItems.map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          
          let btnStyle = "bg-transparent text-slate-400 border-2 border-transparent hover:text-white hover:bg-white/5";
          if (isActive) {
            if (item.id === "home") {
              btnStyle = "bg-[#CCFF00] text-black border-black font-black shadow-[3px_3px_0_rgba(0,0,0,1)]";
            } else if (item.id === "agent") {
              btnStyle = "bg-[#00F5FF] text-black border-black font-black shadow-[3px_3px_0_rgba(0,0,0,1)]";
            } else if (item.id === "doc") {
              btnStyle = "bg-[#B44FFF] text-white border-black font-black shadow-[3px_3px_0_rgba(0,0,0,1)]";
            } else if (item.id === "tools") {
              btnStyle = "bg-[#FF2D78] text-white border-black font-black shadow-[3px_3px_0_rgba(0,0,0,1)]";
            } else {
              btnStyle = "bg-white text-black border-black font-black shadow-[3px_3px_0_rgba(0,0,0,1)]";
            }
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (device !== "desktop") setMobileOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 transition-all cursor-pointer ${btnStyle}`}
            >
              <div className={`p-1.5 ${isActive ? "bg-black/15" : "bg-black/30 border border-white/5"}`}>
                <IconComp size={14} className={isActive ? "text-current" : "text-slate-400"} />
              </div>
              <div className="text-left filter drop-shadow-[1px_1px_0_rgba(0,0,0,0.15)]">
                <span className="text-xs block leading-tight font-extrabold uppercase tracking-wide">{item.label}</span>
                <span className={`text-[8.5px] block font-normal leading-none mt-0.5 ${
                  isActive ? "text-current opacity-70" : "text-slate-500"
                }`}>
                  {item.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Active Session info footer panel with brutalist border */}
      <div className="p-4 border-t-3 border-black bg-black/60">
        <div className="flex items-center space-x-2.5 bg-[#03040A] p-2.5 border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
          <div className="w-7 h-7 bg-[#FF2D78] border border-black flex items-center justify-center font-black text-white font-mono text-xs shadow-[1px_1px_0_rgba(0,0,0,1)]">
            AS
          </div>
          <div className="truncate text-left leading-tight">
            <p className="text-[10px] font-black text-white truncate">assadawut.sarakul</p>
            <p className="text-[8px] text-slate-500 font-mono mt-0.5 truncate">assadawut.sarakul@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Responsive adaptive drawers
  if (device !== "desktop") {
    if (!mobileOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/65 z-50 flex border-r-3 border-black">
        {content}
        <div className="flex-1" onClick={() => setMobileOpen(false)} />
      </div>
    );
  }

  return (
    <InteractiveTilt max={3} perspective={1500} className="h-full w-64 shrink-0 relative z-30">
      {content}
    </InteractiveTilt>
  );
}
export { Menu as HamburgerIcon };
