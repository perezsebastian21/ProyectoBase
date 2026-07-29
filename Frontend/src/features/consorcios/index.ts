/**
 * Módulo de la feature Consorcios.
 */

// Components
export { default as ConsorcioList } from './components/ConsorcioList';
export { default as ConsorcioFormModal } from './components/ConsorcioFormModal';
export { default as ConsorcioDetailView } from './components/ConsorcioDetailView';
export { OnboardingWizardModal } from './components/OnboardingWizardModal';

// Hooks
export { useConsorcios } from './hooks/useConsorcios';

// Services
export { consorcioService } from './services/consorcioService';
export { onboardingService } from './services/onboardingService';

// Types
export type { 
  Consorcio, 
  CreateConsorcioPayload, 
  UpdateConsorcioPayload,
  ConsorciosState,
  OnboardingRequestDto,
  OnboardingResponseDto
} from './types';

