import InstallPrompt from '@/components/InstallPrompt'
import PushNotificationManager from '@/components/PushNotificationManager'
import BackendHealthStatus from '@/components/BackendHealthStatus'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 font-sans bg-slate-950 text-slate-100">
      <main className="w-full max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Amenities Proyecto Base
          </h1>
          <p className="text-slate-400 text-sm">
            El entorno de Next.js, Tailwind CSS y TypeScript está listo para usarse con soporte PWA.
          </p>
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
