// src/components/ui/spinningBlobs.tsx

import React from 'react'

interface SpinningBlobsProps {
  disabled?: boolean;
  size?: "tiny" | "small" | "medium" | "large";  // ✅ Ajout "tiny"
}

function SpinningBlobs({ disabled = false, size = "medium" }: SpinningBlobsProps) {
  
  const sizeConfig = {
    tiny: { 
      container: "w-5 h-5",
      innerBlur: "w-3 h-3",
      innerCircle: "w-2.5 h-2.5",
      eyes: "w-0.5 h-0.5",
      eyeGap: "gap-0.5",
    },
    small: {
      container: "w-8 h-8",
      innerBlur: "w-5 h-5",
      innerCircle: "w-4 h-4",
      eyes: "w-1 h-1.5",
      eyeGap: "gap-1",
    },
    medium: {
      container: "w-20 h-20",
      innerBlur: "w-12 h-12",
      innerCircle: "w-10 h-10",
      eyes: "w-2 h-3",
      eyeGap: "gap-2",
    },
    large: {
      container: "w-32 h-32",
      innerBlur: "w-20 h-20",
      innerCircle: "w-16 h-16",
      eyes: "w-3 h-5",
      eyeGap: "gap-3",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`relative flex items-center justify-center ${config.container}`}
      style={{ isolation: "isolate" }}
    >
      {/* Blob 1 — blue, slow clockwise */}
      <svg
        className="absolute"
        viewBox="0 0 200 200"
        style={{
          width: "100%", height: "100%",
          animation: "spin 8s linear infinite",
          mixBlendMode: "exclusion",
          opacity: disabled ? 0.08 : 0.85,
          transition: "opacity 0.4s ease",
        }}
      >
        <path
          d="M100 20 C130 10, 170 30, 178 70 C186 110, 160 155, 120 168 C80 181, 35 162, 20 120 C5 78, 30 35, 60 22 C75 16, 88 24, 100 20Z"
          fill="#60a5fa"
        />
      </svg>

      {/* Blob 2 — orange, faster counter-clockwise */}
      <svg
        className="absolute"
        viewBox="0 0 200 200"
        style={{
          width: "100%", height: "100%",
          animation: "spinReverse 5s linear infinite",
          mixBlendMode: "exclusion",
          opacity: disabled ? 0.08 : 0.8,
          transition: "opacity 0.4s ease",
        }}
      >
        <path
          d="M115 18 C148 8, 182 38, 184 75 C186 112, 162 158, 122 170 C82 182, 38 160, 22 122 C6 84, 28 40, 58 24 C78 14, 98 24, 115 18Z"
          fill="#fb923c"
        />
      </svg>

      {/* Blob 3 — green, medium clockwise */}
      <svg
        className="absolute"
        viewBox="0 0 200 200"
        style={{
          width: "100%", height: "100%",
          animation: "spin 12s linear infinite",
          mixBlendMode: "exclusion",
          opacity: disabled ? 0.08 : 0.75,
          transition: "opacity 0.4s ease",
        }}
      >
        <path
          d="M95 25 C132 12, 175 45, 176 88 C177 131, 148 168, 105 172 C62 176, 22 148, 18 105 C14 62, 42 28, 70 22 C80 19, 88 27, 95 25Z"
          fill="#4ade80"
        />
      </svg>

      {/* Blob 4 — sky blue accent, slow reverse */}
      <svg
        className="absolute"
        viewBox="0 0 200 200"
        style={{
          width: "88%", height: "88%",
          animation: "spinReverse 9s linear infinite",
          mixBlendMode: "exclusion",
          opacity: disabled ? 0.05 : 0.6,
          transition: "opacity 0.4s ease",
        }}
      >
        <path
          d="M108 22 C140 16, 172 48, 175 82 C178 116, 155 160, 116 168 C77 176, 36 155, 24 116 C12 77, 36 36, 68 24 C84 18, 96 26, 108 22Z"
          fill="#38bdf8"
        />
      </svg>

      {/* ✅ ISOLATION: Empêche le blend mode de toucher le visage */}
      <div 
        className="absolute z-20 flex items-center justify-center"
        style={{ isolation: "isolate" }}  // ✅ Crucial !
      >
        {/* Cercle blanc flou */}
        <div 
          className={`absolute bg-white ${config.innerBlur} blur-sm rounded-full`}
          style={{ opacity: disabled ? 0.3 : 1 }}
        />
        
        {/* Cercle blanc avec yeux */}
        <div 
          className={`relative bg-white ${config.innerCircle} rounded-full flex items-center justify-center ${config.eyeGap}`}
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          <div className={`${config.eyes} rounded-full bg-black`} />
          <div className={`${config.eyes} rounded-full bg-black`} />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}

export default SpinningBlobs