import { apiClient } from '@/lib/api-client';
import type { ServiceResponse } from '@/types';

export interface PagoRequestPayload {
  idReserva: number;
  metodoPago: 'TARJETA' | 'TRANSFERENCIA' | 'BILLETERA_DIGITAL';
  tokenPasarela: string;
}

export interface PagoResponseDto {
  idReserva: number;
  estadoReserva: string;
  pagoExitoso: boolean;
  comprobante: string;
}

export const pagoService = {
  async procesarPago(payload: PagoRequestPayload): Promise<ServiceResponse<PagoResponseDto>> {
    return apiClient<ServiceResponse<PagoResponseDto>>('/Pago', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
