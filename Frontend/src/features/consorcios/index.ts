/**
 * Módulo de la feature Consorcios.
 */

// Components
export { default as ConsorcioList } from './components/ConsorcioList';
export { default as ConsorcioFormModal } from './components/ConsorcioFormModal';

// Hooks
export { useConsorcios } from './hooks/useConsorcios';

// Services
export { consorcioService } from './services/consorcioService';

// Types
export type { 
  Consorcio, 
  CreateConsorcioPayload, 
  UpdateConsorcioPayload,
  ConsorciosState
} from './types';
