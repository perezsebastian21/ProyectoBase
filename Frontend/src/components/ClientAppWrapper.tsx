"use client";

import { useState, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SplashScreen from "./SplashScreen";
import AppLayout from "./AppLayout";
import { ConsorcioProvider } from "./providers";

const queryClient = new QueryClient();

interface ClientAppWrapperProps {
  children: React.ReactNode;
}

export default function ClientAppWrapper({ children }: ClientAppWrapperProps) {
  const [showSplash, setShowSplash] = useState(true);

  const handleFinished = () => {
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ConsorcioProvider>
        {showSplash && <SplashScreen onFinished={handleFinished} />}
        <div className={showSplash ? "invisible h-0 overflow-hidden" : "visible"}>
          <Suspense fallback={null}>
            <AppLayout>{children}</AppLayout>
          </Suspense>
        </div>
      </ConsorcioProvider>
    </QueryClientProvider>
  );
}

