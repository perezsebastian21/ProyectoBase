import { apiClient } from '@/lib/api-client';
import type { ServiceResponse } from '@/types';
import type { OnboardingRequestDto, OnboardingResponseDto } from '../types';

export const onboardingService = {
  /**
   * Ejecuta el Onboarding multientidad (Consorcio, Complejo, Unidades y Amenities en una sola transacción backend)
   */
  async executeOnboarding(payload: OnboardingRequestDto): Promise<ServiceResponse<OnboardingResponseDto>> {
    return apiClient<ServiceResponse<OnboardingResponseDto>>('/Onboarding', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
