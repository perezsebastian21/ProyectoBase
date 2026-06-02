"use client";

import React, { useState } from "react";
import TopAppBar from "@/components/ui/TopAppBar";
import BottomNavBar, { NavItem } from "@/components/ui/BottomNavBar";
import StatusBadge from "@/components/ui/StatusBadge";
import PrimaryButton from "@/components/ui/PrimaryButton";
import IconButton from "@/components/ui/IconButton";
import SegmentedControl from "@/components/ui/SegmentedControl";
import DashboardActionCard from "@/components/ui/DashboardActionCard";
import AmenityCard from "@/components/ui/AmenityCard";
import IncidentCard from "@/components/ui/IncidentCard";

export default function ComponentsDemoPage() {
  const [activeTab, setActiveTab] = useState<NavItem>("inicio");
  const [filterValue, setFilterValue] = useState("Abiertas");
  const [clickCount, setClickCount] = useState(0);

  // Mock data for amenities
  const mockAmenities = [
    {
      title: "Piscina Infinity & Solárium",
      imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=600&auto=format&fit=crop",
      statusLabel: "Disponible",
      status: "success" as const,
      capacity: 25,
      description: "Espectacular piscina climatizada con vista panorámica a la ciudad y área de reposeras de diseño.",
    },
    {
      title: "SUM / Parrilla Residencial Pro",
      imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
      statusLabel: "Reservado Hoy",
      status: "warning" as const,
      capacity: 15,
      description: "Salón de usos múltiples equipado con cocina industrial, vajilla premium y asador de última tecnología.",
    },
    {
      title: "Gimnasio & Centro de Bienestar",
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
      statusLabel: "En Mantenimiento",
      status: "error" as const,
      capacity: 10,
      description: "Equipamiento de fuerza y cardio de alta gama con instructores disponibles e hidratación libre.",
    },
  ];

  // Mock data for incidents
  const mockIncidents = [
    {
      id: "1032",
      title: "Filtración en techo de garage subterráneo",
      category: "Mantenimiento General",
      priority: "Alta" as const,
      statusLabel: "Urgente",
      status: "error" as const,
      timeLabel: "Hace 2 horas",
      reporterName: "Carlos Gómez",
    },
    {
      id: "1028",
      title: "Luz piloto de ascensor principal parpadeando",
      category: "Ascensores",
      priority: "Media" as const,
      statusLabel: "En Proceso",
      status: "warning" as const,
      timeLabel: "Ayer",
      reporterName: "Sofía Martínez",
    },
    {
      id: "1015",
      title: "Parrilla N° 2 limpia y re-equipada",
      category: "SUM / Parrillas",
      priority: "Baja" as const,
      statusLabel: "Resuelto",
      status: "success" as const,
      timeLabel: "Hace 3 días",
      reporterName: "Admin Consorcio",
    },
  ];

  // Filter logic for incidents
  const filteredIncidents = mockIncidents.filter((incident) => {
    if (filterValue === "Abiertas") return incident.status === "error";
    if (filterValue === "En Proceso") return incident.status === "warning";
    return incident.status === "success";
  });

  return (
    <div className="min-h-screen bg-brand-background text-slate-800 dark:text-slate-100 flex flex-col font-sans pb-32 transition-colors duration-300">
      {/* Top Header */}
      <TopAppBar
        title="Guía de Componentes"
        onMenuClick={() => alert("Menú presionado")}
        onAvatarClick={() => alert("Perfil de usuario presionado")}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-12">
        {/* Intro */}
        <section className="space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500 dark:from-blue-400 dark:via-emerald-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Residencial Pro UI Kit
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
            Explora la biblioteca de componentes diseñados bajo los lineamientos visuales del proyecto{" "}
            <span className="text-brand-primary font-semibold">Vantage Residential OS</span>.
            Todos los componentes admiten interactividad, micro-animaciones en hover y transiciones fluidas.
          </p>
        </section>

        {/* 1. Badges & Tags */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-brand-surface-bright/20 pb-2">
            01. Feedback & Badges
          </h3>
          <div className="flex flex-wrap gap-4 p-5 rounded-2xl bg-brand-surface-container/40 border border-brand-surface-bright/10">
            <StatusBadge status="success" label="Disponible / Pagado" />
            <StatusBadge status="warning" label="Pendiente / En Proceso" />
            <StatusBadge status="error" label="Urgente / Crítico" />
          </div>
        </section>

        {/* 2. Buttons & Actions */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-brand-surface-bright/20 pb-2">
            02. Botones & Acciones
          </h3>
          <div className="flex flex-wrap gap-4 p-5 rounded-2xl bg-brand-surface-container/40 border border-brand-surface-bright/10 items-center">
            <PrimaryButton showArrow onClick={() => setClickCount(c => c + 1)}>
              Confirmar Reserva
            </PrimaryButton>
            
            <IconButton
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-16v.01M4 12h2m2 4h4a2 2 0 002-2v-4a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
              }
              onClick={() => alert("Generando credencial QR...")}
            >
              Ver Código QR
            </IconButton>

            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Clicks en Botón Principal: <strong className="text-brand-primary">{clickCount}</strong>
            </span>
          </div>
        </section>

        {/* 3. Segmented Control */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-brand-surface-bright/20 pb-2">
            03. Segmented Control (Filtro Dinámico)
          </h3>
          <div className="p-5 rounded-2xl bg-brand-surface-container/40 border border-brand-surface-bright/10 flex flex-col gap-4">
            <div>
              <SegmentedControl
                options={["Abiertas", "En Proceso", "Resueltas"]}
                selectedValue={filterValue}
                onChange={setFilterValue}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Valor actual del filtro: <strong className="text-brand-primary">{filterValue}</strong>
            </p>
          </div>
        </section>

        {/* 4. Action Cards & KPIs */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-brand-surface-bright/20 pb-2">
            04. Dashboard & KPI Cards
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <DashboardActionCard
              category="Finanzas Consorcio"
              title="Cuenta Expensas"
              badgeLabel="Al día"
              badgeStatus="success"
              description="No registras deudas pendientes al período actual. Tu próxima facturación vencerá el 10 de este mes."
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              onClick={() => alert("Abriendo detalles de facturación")}
            />

            <DashboardActionCard
              category="Próxima Actividad"
              title="Reserva SUM Confirmada"
              badgeLabel="Pendiente"
              badgeStatus="warning"
              description="Recuerda que tienes la parrilla reservada hoy. La llave se retira en la cabina de seguridad."
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              dateInfo={{
                date: "Hoy, 1 de Junio",
                time: "20:00 - 23:30 hs",
              }}
              onClick={() => alert("Abriendo detalles de la reserva")}
            />
          </div>
        </section>

        {/* 5. Amenities Gallery */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-brand-surface-bright/20 pb-2">
            05. Galería de Amenities
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {mockAmenities.map((amenity) => (
              <AmenityCard
                key={amenity.title}
                title={amenity.title}
                imageUrl={amenity.imageUrl}
                status={amenity.status}
                statusLabel={amenity.statusLabel}
                capacity={amenity.capacity}
                description={amenity.description}
                onBookClick={() => alert(`Iniciando reserva para: ${amenity.title}`)}
              />
            ))}
          </div>
        </section>

        {/* 6. Filtered Incident Cards */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-brand-surface-bright/20 pb-2">
            06. Reportes e Incidencias (Filtrados por pestaña 03)
          </h3>
          <div className="space-y-4">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  id={incident.id}
                  title={incident.title}
                  category={incident.category}
                  priority={incident.priority}
                  status={incident.status}
                  statusLabel={incident.statusLabel}
                  timeLabel={incident.timeLabel}
                  reporterName={incident.reporterName}
                  onClick={() => alert(`Ver detalle de incidencia #${incident.id}`)}
                />
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-brand-surface-bright/20 text-slate-500 dark:text-slate-400 text-xs">
                No hay incidencias registradas con el estado actual del filtro.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Bottom Nav Bar */}
      <BottomNavBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
