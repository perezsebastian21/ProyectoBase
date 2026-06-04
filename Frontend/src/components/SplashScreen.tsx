"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onFinished: () => void;
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1. Mostrar la pantalla por 2 segundos antes de iniciar el desvanecimiento
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // 2. Esperar 500ms adicionales para que termine la animación de fade-out antes de desmontar
    const finishTimer = setTimeout(() => {
      onFinished();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050e1a] transition-opacity duration-500 ease-out ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center">
        {/* Contenedor del Logo con halo de luz respirante y pulso suave */}
        <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
          {/* Destello de luz brillante detrás del logo (con la forma del icono) */}
          <div className="absolute w-24 h-24 bg-white/20 rounded-[28px] blur-xl animate-destello pointer-events-none" />
          
          {/* Onda de luz expansiva (con la forma del icono) */}
          <div className="absolute w-24 h-24 border border-white/30 rounded-[28px] animate-light-wave pointer-events-none" />
          
          {/* Contenedor del logo con animación de pulso */}
          <div className="relative animate-logo-pulse">
            <Image
              src="/LogoReversion.png"
              alt="Livity Logo"
              width={96}
              height={96}
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Nombre de la Aplicación con la tipografía y degradado del Login */}
        <h1 className="text-[2.5rem] md:text-[3rem] font-[800] tracking-[-0.03em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-[rgba(255,255,255,0.95)] to-[rgba(255,255,255,0.45)]">
          Livity
        </h1>
        
        {/* Slogan idéntico al del Login */}
        <p className="text-[0.75rem] font-[500] tracking-[0.22em] text-[rgba(255,255,255,0.3)] uppercase mt-2">
          El control de tu espacio, al instante.
        </p>
      </div>
    </div>
  );
}
