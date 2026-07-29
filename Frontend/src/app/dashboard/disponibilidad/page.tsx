'use client';

import React, { useState, useEffect } from 'react';
import { AmenityDisponibilidadGrid } from '@/features/amenities/components/AmenityDisponibilidadGrid';
import { CheckoutModal } from '@/features/pagos';
import { amenityService } from '@/features/amenities/services/amenityService';
import { reservaService } from '@/features/reservas/services/reservaService';
import { listaEsperaService } from '@/features/listas-espera/services/listaEsperaService';
import type { Amenity, DisponibilidadSlotDto } from '@/types';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function DisponibilidadPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityId, setSelectedAmenityId] = useState<number | null>(null);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Checkout modal
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    idReserva: number;
    nombreAmenity: string;
    monto: number;
  }>({
    isOpen: false,
    idReserva: 0,
    nombreAmenity: '',
    monto: 0,
  });

  useEffect(() => {
    async function loadAmenities() {
      setIsLoadingAmenities(true);
      try {
        const res = await amenityService.getAll();
        if (res.success && res.data && res.data.length > 0) {
          setAmenities(res.data);
          setSelectedAmenityId(res.data[0].idAmenity);
        }
      } catch (err) {
        console.error('Error al cargar amenities:', err);
      } finally {
        setIsLoadingAmenities(false);
      }
    }
    loadAmenities();
  }, []);

  const handleReservarSlot = async (slot: DisponibilidadSlotDto, fecha: string) => {
    if (!selectedAmenityId) return;
    setStatusMsg(null);

    const selectedAmenity = amenities.find((a) => a.idAmenity === selectedAmenityId);

    try {
      const res = await reservaService.create({
        idAmenity: selectedAmenityId,
        idUnidadHabitacional: 1, // ID de unidad mock/sesión
        fechaUso: fecha,
        horaInicio: slot.horaInicio,
        cantidadInvitados: 0,
      } as any);

      if (res.success && res.data) {
        const reserva = res.data;
        if (reserva.estado === 'PENDIENTE_PAGO') {
          setCheckoutModal({
            isOpen: true,
            idReserva: reserva.idReserva,
            nombreAmenity: selectedAmenity?.nombre || 'Amenity',
            monto: selectedAmenity?.config?.tarifa || 0,
          });
        } else {
          setStatusMsg({
            success: true,
            text: `¡Reserva #${reserva.idReserva} creada con éxito! Estado: ${reserva.estado}`,
          });
        }
      } else {
        setStatusMsg({
          success: false,
          text: res.errorMessage || 'Error al procesar la reserva.',
        });
      }
    } catch (err: any) {
      setStatusMsg({
        success: false,
        text: err.message || 'Error al conectar con la API de reservas.',
      });
    }
  };

  const handleAnotarListaEspera = async (slot: DisponibilidadSlotDto, fecha: string) => {
    if (!selectedAmenityId) return;
    setStatusMsg(null);

    try {
      const res = await listaEsperaService.create({
        idAmenity: selectedAmenityId,
        idUnidadHabitacional: 1,
        fechaUso: fecha,
        horaInicio: slot.horaInicio,
      } as any);

      if (res.success && res.data) {
        setStatusMsg({
          success: true,
          text: `¡Te has anotado en la Lista de Espera! Posición actual: ${res.data.posicion}`,
        });
      } else {
        setStatusMsg({
          success: false,
          text: res.errorMessage || 'Error al anotarse en la lista de espera.',
        });
      }
    } catch (err: any) {
      setStatusMsg({
        success: false,
        text: err.message || 'Error de comunicación.',
      });
    }
  };

  const selectedAmenity = amenities.find((a) => a.idAmenity === selectedAmenityId);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-1">
              Módulo Residentes (CU-12 / CU-01 / CU-05)
            </span>
            <h1 className="text-2xl font-bold">Reserva de Amenities & Lista de Espera</h1>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
            statusMsg.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          {statusMsg.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {statusMsg.text}
        </div>
      )}

      {/* Selector de Amenity */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Seleccionar Amenity del Edificio
        </label>
        {isLoadingAmenities ? (
          <div className="text-sm text-zinc-500 flex items-center gap-2 py-2">
            <Clock className="w-4 h-4 animate-spin text-indigo-500" /> Cargando catálogo de amenities...
          </div>
        ) : (
          <select
            value={selectedAmenityId || ''}
            onChange={(e) => setSelectedAmenityId(Number(e.target.value))}
            className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-zinc-100 shadow-sm"
          >
            {amenities.map((a) => (
              <option key={a.idAmenity} value={a.idAmenity}>
                {a.nombre} (Capacidad: {a.capacidad} personas)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Grilla de Disponibilidad Horaria */}
      {selectedAmenityId && (
        <AmenityDisponibilidadGrid
          idAmenity={selectedAmenityId}
          nombreAmenity={selectedAmenity?.nombre}
          idUnidadHabitacional={1}
          onReservarSlot={handleReservarSlot}
          onAnotarListaEspera={handleAnotarListaEspera}
        />
      )}

      {/* Modal de Pago / Pasarela */}
      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ ...checkoutModal, isOpen: false })}
        idReserva={checkoutModal.idReserva}
        nombreAmenity={checkoutModal.nombreAmenity}
        monto={checkoutModal.monto}
        onSuccess={() => {
          setStatusMsg({
            success: true,
            text: `¡Pago de la Reserva #${checkoutModal.idReserva} completado exitosamente!`,
          });
        }}
      />
    </div>
  );
}
