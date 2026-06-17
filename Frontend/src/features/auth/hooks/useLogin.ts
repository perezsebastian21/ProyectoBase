'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../services/authService';
import type { LoginFormState } from '../types/auth.types';

/**
 * Hook para manejar la lógica del formulario de login.
 *
 * Encapsula:
 * - Estado del formulario (email, password, loading, error)
 * - Toggle de visibilidad de password
 * - Validación básica
 * - Submit con llamada a la API
 * - Guardado del token en cookie (accesible por el middleware)
 * - Redirección post-login (a la URL original o /dashboard)
 */
export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formState, setFormState] = useState<LoginFormState>({
    usuario: '',
    password: '',
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const setField = useCallback(
    (field: 'usuario' | 'password', value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value, error: null }));
    },
    []
  );

  const toggleShowPassword = useCallback(() => {
    setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      // Validación básica
      if (!formState.usuario.trim()) {
        setFormState((prev) => ({ ...prev, error: 'Ingresá tu usuario' }));
        return;
      }
      if (!formState.password.trim()) {
        setFormState((prev) => ({ ...prev, error: 'Ingresá tu contraseña' }));
        return;
      }

      setFormState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await authService.login({
          usuario: formState.usuario,
          password: formState.password,
        });

        // Verificar si el backend reportó error
        if (!response.success) {
          throw new Error(response.errorMessage || 'Credenciales inválidas');
        }

        // Guardar token en cookie (accesible por el middleware de Next.js)
        // maxAge = 7 días en segundos; path=/ para que aplique a toda la app
        const token = response.data.token;
        const expiration = response.data.expiration;
        const username = response.data.username;
        
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_username', username || '');
          localStorage.setItem('auth_expiration', expiration || '');
        }

        // Redirigir a la URL original (si venía de una ruta protegida) o a la raíz (/)
        const redirectTo = searchParams.get('redirect') || '/';
        router.push(redirectTo);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Error al iniciar sesión. Intentá de nuevo.';
        setFormState((prev) => ({ ...prev, error: message, isLoading: false }));
      }
    },
    [formState.usuario, formState.password, router, searchParams]
  );

  return {
    ...formState,
    setField,
    toggleShowPassword,
    handleSubmit,
  };
}
