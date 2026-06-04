"use client";

import { useState, useEffect } from "react";
import SplashScreen from "./SplashScreen";

interface ClientAppWrapperProps {
  children: React.ReactNode;
}

export default function ClientAppWrapper({ children }: ClientAppWrapperProps) {
  const [showSplash, setShowSplash] = useState(true);

  // Opcional: Si deseas que NO se muestre el splash screen en reloads durante la misma sesión de pestaña,
  // puedes descomentar la lógica de sessionStorage. Por ahora, se mostrará siempre al cargar/recargar la app.
  /*
  useEffect(() => {
    const hasShown = sessionStorage.getItem("vantage_splash_shown");
    if (hasShown) {
      setShowSplash(false);
    }
  }, []);

  const handleFinished = () => {
    sessionStorage.setItem("vantage_splash_shown", "true");
    setShowSplash(false);
  };
  */

  const handleFinished = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinished={handleFinished} />}
      {/* 
        Mantenemos el contenido principal siempre en el DOM pero oculto/bloqueado
        mientras se muestra el splash screen para mejorar la performance de renderizado.
      */}
      <div className={showSplash ? "invisible h-0 overflow-hidden" : "visible"}>
        {children}
      </div>
    </>
  );
}
