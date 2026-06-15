import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface InteractiveTiltProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  max?: number;
  perspective?: number;
}

export function InteractiveTilt({
  children,
  className = "",
  style = {},
  max = 12,
  perspective = 1000,
}: InteractiveTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Motion values relative to card dimensions (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for fluid motion responses
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), springConfig);

  // Holographic reflection coordinates
  const glareX = useSpring(useTransform(x, [-0.5, 0.5], ["10%", "90%"]), springConfig);
  const glareY = useSpring(useTransform(y, [-0.5, 0.5], ["10%", "90%"]), springConfig);
  const glareOpacity = useSpring(useTransform(x, [-0.5, 0.5], [0.15, 0.45]), springConfig);

  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        perspective: perspective,
        transformStyle: "preserve-3d",
        rotateX: rotateX,
        rotateY: rotateY,
      }}
      className={`relative transition-all duration-150 ${className}`}
    >
      {/* Glare Holographic reflection layer */}
      {hovering && (
        <motion.div
          className="absolute inset-[1.5px] pointer-events-none z-15 mix-blend-color-dodge rounded-[inherit] overflow-hidden"
          style={{
            background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255, 255, 255, ${glareOpacity.get()}) 0%, rgba(200, 255, 255, 0.08) 35%, transparent 65%)`,
          }}
        />
      )}
      
      <div 
        style={{ transform: "translateZ(10px)", transformStyle: "preserve-3d" }}
        className="h-full w-full"
      >
        {children}
      </div>
    </motion.div>
  );
}
