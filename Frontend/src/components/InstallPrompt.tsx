'use client'

import React, { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 1. Verificar si ya está instalada e iniciada en standalone
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isStandaloneMode)

    // 2. Detectar si el usuario está usando un dispositivo iOS (iPhone, iPad, iPod)
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // 3. Capturar el evento `beforeinstallprompt` para navegadores compatibles (Chrome, Android, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Solo mostrar el prompt si no está ya instalada y ha sido descartado anteriormente en esta sesión
      if (!isStandaloneMode) {
        setIsVisible(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // En iOS, puesto que no hay evento beforeinstallprompt, mostramos la guía si no está instalada
    if (isIOSDevice && !isStandaloneMode) {
      // Verificar si ya fue cerrado en esta sesión mediante sessionStorage para no cansar al usuario
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed')
      if (!dismissed) {
        setIsVisible(true)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Mostrar el prompt nativo del navegador
    deferredPrompt.prompt()

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice
    console.log(`Usuario decidió instalar: ${outcome}`)

    // Limpiar el prompt diferido
    setDeferredPrompt(null)
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  // Si está instalada, ya fue cerrada o no se debe mostrar, retornamos null
  if (isStandalone || !isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md p-5 rounded-2xl border border-white/10 bg-slate-900/90 dark:bg-slate-950/85 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-base leading-tight text-white dark:text-slate-100">
              Instala Amenities App
            </h4>
            <p className="text-xs text-slate-300 dark:text-slate-400 mt-0.5 leading-snug">
              Acceso rápido desde tu pantalla de inicio y notificaciones.
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5">
        {isIOS ? (
          <div className="text-xs space-y-2 text-slate-200">
            <p className="flex items-center gap-1.5 font-medium text-amber-300">
              💡 Instrucciones para iOS (iPhone / iPad):
            </p>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
              <li>
                Presiona el botón de{' '}
                <span className="font-semibold text-white">Compartir</span>{' '}
                <svg
                  className="inline-block w-4 h-4 text-blue-400 align-text-bottom"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 10.742l5.263-2.63m0 0l-5.263-2.63m5.263 2.63a3 3 0 11-4.82 2.44m4.82-2.44a3 3 0 11-4.82-2.44"
                  />
                </svg>{' '}
                en Safari.
              </li>
              <li>
                Desliza hacia abajo y pulsa{' '}
                <span className="font-semibold text-white">Añadir a pantalla de inicio</span>{' '}
                <span className="inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white font-sans align-middle">
                  ➕
                </span>
                .
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-4 rounded-xl text-center text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 transition-all duration-200 shadow-md active:scale-[0.98]"
            >
              Instalar ahora
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              Más tarde
            </button>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic">
            Para instalar en Android o PC, abre el menú de opciones de tu navegador y selecciona "Instalar Aplicación".
          </p>
        )}
      </div>
    </div>
  )
}
