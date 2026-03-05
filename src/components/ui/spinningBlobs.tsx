import React from 'react'

function SpinningBlobs({ disabled = false }) {
    return (
        <div
            className="relative flex items-center justify-center w-20 aspect-square"
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
            <div className="absolute bg-white  z-10 w-12 h-12 blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"></div>
            <div className="relative bg-white p-2 z-20 w-10 h-10 rounded-full flex flex-row items-center justify-center gap-2 transition-all duration-200 hover:scale-110 active:scale-95">
                <div className='w-2 aspect-[1/2] rounded-[100%] bg-black'></div>
                <div className='w-2 aspect-[1/2] rounded-[100%] bg-black'></div>
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
