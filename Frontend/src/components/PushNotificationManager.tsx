'use client'

import React, { useState, useEffect } from 'react'

// Convierte la llave pública VAPID a un formato que el navegador pueda interpretar de forma robusta
function urlBase64ToUint8Array(base64String: string) {
  // Eliminar cualquier relleno '=' existente para recalcularlo de forma limpia
  const base64WithoutPadding = base64String.replace(/=/g, '')
  const padding = '='.repeat((4 - (base64WithoutPadding.length % 4)) % 4)
  const base64 = (base64WithoutPadding + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  // Cargar llave VAPID pública desde variables de entorno
  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

  useEffect(() => {
    // Verificar si el navegador soporta Service Workers y Notificaciones Push
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscriptionState()
    }
  }, [])

  const checkSubscriptionState = async () => {
    try {
      // 1. Registrar el Service Worker explícitamente en el navegador
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      console.log('Service Worker registrado con éxito:', registration)

      // 2. Obtener la suscripción actual si existe
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Error al registrar el Service Worker o verificar la suscripción:', error)
      setStatusMessage('⚠️ Error al registrar el Service Worker.')
    }
  }

  // ===========================================================================
  // CONEXIÓN CON EL BACKEND (INTEGRACIÓN PARA OTRO EQUIPO)
  // ===========================================================================
  const sendSubscriptionToBackend = async (sub: PushSubscription, action: 'subscribe' | 'unsubscribe') => {
    setStatusMessage(`Suscripción generada en navegador. Comunicando al Backend...`)
    
    // Imprimir en consola de desarrollo para que el desarrollador pueda ver el JSON exacto
    console.log(`[PWA Frontend] Envío al backend (${action}):`, JSON.stringify(sub, null, 2))

    try {
      // -----------------------------------------------------------------------
      // INSTRUCCIONES PARA EL EQUIPO DE BACKEND:
      // Reemplaza la siguiente llamada Fetch con la URL real de la API de tu backend.
      // Ejemplo: https://api.mi-backend.com/v1/pwa/subscriptions
      // -----------------------------------------------------------------------
      
      /*
      const response = await fetch('/api/pwa-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action, // 'subscribe' o 'unsubscribe'
          subscription: sub
        }),
      });

      if (!response.ok) {
        throw new Error('Fallo al sincronizar con el backend.');
      }
      */

      // Simulamos una respuesta exitosa instantánea para demostración
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      setStatusMessage(
        action === 'subscribe'
          ? '✓ ¡Suscrito con éxito! Registrado en Backend (Simulado).'
          : '✓ Notificaciones desactivadas con éxito.'
      )
    } catch (err: any) {
      console.error('Error sincronizando con el backend:', err)
      setStatusMessage(`⚠️ Error de sincronización: ${err.message}`)
    }
  }

  const handleSubscribe = async () => {
    if (!VAPID_PUBLIC_KEY) {
      setStatusMessage('⚠️ Error: Falta configurar NEXT_PUBLIC_VAPID_PUBLIC_KEY en .env.local')
      return
    }

    setIsSubscribing(true)
    setStatusMessage('Solicitando permisos de notificaciones...')

    try {
      // 1. Solicitar permiso al usuario
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatusMessage('⚠️ Permiso denegado. Habilita las notificaciones en tu navegador.')
        setIsSubscribing(false)
        return
      }

      // 2. Registrar/obtener service worker listo
      const registration = await navigator.serviceWorker.ready

      // 3. Suscribirse a las notificaciones a través del navegador
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      setSubscription(sub)
      
      // 4. Enviar los datos al backend
      await sendSubscriptionToBackend(sub, 'subscribe')
    } catch (error: any) {
      console.error('Error suscribiendo a notificaciones push:', error)
      
      if (error.name === 'AbortError' || error.message?.includes('push service error') || error.message?.includes('Registration failed')) {
        setStatusMessage(
          '⚠️ Error del Servicio Push del Navegador.\n\n' +
          'Esto es un problema de red/navegador común en desarrollo. Soluciónalo comprobando:\n' +
          '• Si usas Brave: Ve a brave://settings/privacy y activa "Usar servicios de Google para mensajería push".\n' +
          '• Si tienes VPN/Firewall: Desactiva VPNs corporativas que bloqueen puertos de Google (5228-5230).\n' +
          '• Estado de Red: Abre chrome://gcm-internals/ en otra pestaña y valida que diga CONNECTED.'
        )
      } else {
        setStatusMessage(`⚠️ Error: ${error.message || error}`)
      }
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!subscription) return

    setIsSubscribing(true)
    setStatusMessage('Desactivando notificaciones...')

    try {
      // 1. Informar al backend antes de remover la suscripción
      await sendSubscriptionToBackend(subscription, 'unsubscribe')

      // 2. Remover del navegador
      await subscription.unsubscribe()
      setSubscription(null)
    } catch (error: any) {
      console.error('Error removiendo suscripción:', error)
      setStatusMessage(`⚠️ Error: ${error.message || error}`)
    } finally {
      setIsSubscribing(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-md text-slate-400">
        <p className="text-sm font-medium">
          ⚠️ Las notificaciones push no están soportadas en este navegador o entorno.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/40 dark:bg-slate-950/30 backdrop-blur-lg text-white shadow-lg space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-base text-slate-100">Notificaciones en Tiempo Real</h4>
          <p className="text-xs text-slate-400">Mantente al día con reservas y eventos.</p>
        </div>
      </div>

      <div className="pt-2">
        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-ping" />
              Notificaciones Activas
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Tu navegador está listo para recibir alertas. El objeto de suscripción ha sido logueado en la consola del desarrollador (F12) para pruebas del Backend.
            </p>

            <button
              onClick={handleUnsubscribe}
              disabled={isSubscribing}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-white/5 hover:border-white/10 shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              {isSubscribing ? 'Desactivando...' : 'Desactivar notificaciones'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Al activar las notificaciones, podrás enterarte inmediatamente de la asignación de amenities, confirmación de reservas y avisos del edificio.
            </p>
            
            <button
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-900 bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-300 hover:to-indigo-300 disabled:opacity-50 shadow-[0_4px_20px_rgba(59,130,246,0.15)] transition-all duration-200 active:scale-[0.98]"
            >
              {isSubscribing ? 'Configurando...' : 'Activar notificaciones'}
            </button>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 animate-in fade-in duration-200">
          {statusMessage}
        </div>
      )}
    </div>
  )
}
