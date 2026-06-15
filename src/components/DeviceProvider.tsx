import React, { createContext, useContext, useState, useEffect } from "react";

type DeviceType = "mobile" | "tablet" | "desktop";

const DeviceContext = createContext<DeviceType>("desktop");

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<DeviceType>("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDevice("mobile");
      } else if (width < 1024) {
        setDevice("tablet");
      } else {
        setDevice("desktop");
      }
    };

    handleResize(); // Initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DeviceContext.Provider value={device}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
