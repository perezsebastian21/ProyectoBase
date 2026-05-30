export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 font-sans bg-slate-950 text-slate-100">
      <main className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Proyecto Base Inicializado
        </h1>
        <p className="text-slate-400 text-sm max-w-sm">
          El entorno de Next.js, Tailwind CSS y TypeScript está listo para usarse. Edita <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">src/app/page.tsx</code> para comenzar a construir tu aplicación.
        </p>
      </main>
    </div>
  );
}
