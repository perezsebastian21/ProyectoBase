/**
 * Módulo de la feature Complejos.
 */

// Components
export { default as ComplejoList } from './components/ComplejoList';
export { default as ComplejoFormModal } from './components/ComplejoFormModal';

// Hooks
export { useComplejos } from './hooks/useComplejos';

// Services
export { complejoService } from './services/complejoService';

// Types
export type { 
  Complejo, 
  CreateComplejoPayload, 
  UpdateComplejoPayload,
  ComplejosState,
  TipoComplejo
} from './types';
