import Link from 'next/link'
import InstallPrompt from '@/components/InstallPrompt'
import PushNotificationManager from '@/components/PushNotificationManager'
import BackendHealthStatus from '@/components/BackendHealthStatus'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 font-sans bg-slate-950 text-slate-100">
      <main className="w-full max-w-md text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Amenities Proyecto Base
          </h1>
          <p className="text-slate-400 text-sm">
            El entorno de Next.js, Tailwind CSS y TypeScript está listo para usarse con soporte PWA.
          </p>
          <div className="pt-2">
            <Link
              href="/components-demo"
              className="group inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-slate-950 bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-[length:200%_auto] hover:bg-right transition-all duration-500 rounded-full shadow-lg shadow-indigo-500/20 hover:shadow-cyan-500/35 hover:scale-[1.03] active:scale-[0.97] transform"
            >
              Ver Guía de Componentes
              <svg
                className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>


        {/* Estado de Conectividad con el Backend */}
        <BackendHealthStatus />

        {/* Gestor de Notificaciones Push (Frontend) */}
        <PushNotificationManager />

        {/* Banner de Invitación a la Instalación */}
        <InstallPrompt />
      </main>
    </div>
  )
}
