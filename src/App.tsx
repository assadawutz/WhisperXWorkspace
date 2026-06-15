import React, { useState } from "react";
import { DeviceProvider, useDevice } from "./components/DeviceProvider";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Inspector } from "./components/Inspector";
import { BottomTray } from "./components/BottomTray";
import { XHome } from "./components/XHome";
import { WhisperX } from "./components/WhisperX";
import { XDoc } from "./components/XDoc";
import { XTools } from "./components/XTools";
import { XSettings } from "./components/XSettings";
import { useWorkspaceStore } from "./stores/workspaceStore";
import { CommandPalette } from "./components/CommandPalette";
import { Toaster } from "./components/Toaster";

function RootShell() {
  const device = useDevice();
  const { activeTab } = useWorkspaceStore() as any;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inspectorExpanded, setInspectorExpanded] = useState(true);

  return (
    <div className="h-screen w-screen bg-[#03040A] text-slate-100 flex flex-col overflow-hidden font-mono select-none antialiased relative cosmic-grid">
      
      {/* Cyberpunk ambient laser scanning line bar */}
      <div className="absolute left-0 w-full h-[2.5px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent pointer-events-none laser-scanner z-45 opacity-60" />

      {/* Structural layout wrapper */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative z-10">
        
        {/* Sidebar Nav section */}
        <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

        {/* Master central panel workspace */}
        <div className="flex-grow flex flex-col min-h-0 overflow-hidden relative">
          
          {/* Top master bar */}
          <TopBar
            onTriggerMobileMenu={() => setMobileMenuOpen(true)}
            inspectorOpen={inspectorExpanded}
            onToggleInspector={() => setInspectorExpanded(!inspectorExpanded)}
          />

          {/* Core Content Switching and Panel Division */}
          <div className="flex-grow flex min-h-0 overflow-hidden relative">
            
            {/* Active page views dispatcher */}
            <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative bg-[#03040A]/40 backdrop-blur-xs">
              <div className="flex-grow overflow-y-auto overflow-x-hidden p-3 md:p-6 space-y-6">
                {activeTab === "home" && <XHome />}
                {activeTab === "agent" && <WhisperX />}
                {activeTab === "doc" && <XDoc />}
                {activeTab === "tools" && <XTools />}
                {activeTab === "settings" && <XSettings />}
              </div>
            </main>

            {/* Context inspector (visible if opened on tablet/desktop) */}
            {inspectorExpanded && device === "desktop" && <Inspector />}
          </div>

          {/* Bottom active telemetry stats diagnostics panel */}
          <BottomTray />
        </div>
      </div>

      {/* Global Command Palette and Toast Notifications */}
      <CommandPalette />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <DeviceProvider>
      <RootShell />
    </DeviceProvider>
  );
}
