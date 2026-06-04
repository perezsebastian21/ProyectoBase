import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de autenticación — Vantage Residential OS
 *
 * Flujo tipo app nativa:
 * - Si el usuario tiene token → accede normalmente a la app
 * - Si NO tiene token → redirige a /login
 * - Las rutas públicas (/login, /register, assets) no requieren auth
 *
 * Nota: por ahora el token se guarda en una cookie `auth_token`.
 * Cuando el backend devuelva un token real, se puede validar acá.
 */

/** Rutas que NO requieren autenticación */
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

/** Prefijos que siempre se ignoran (assets, API, etc.) */
const IGNORED_PREFIXES = ['/_next', '/api', '/icons', '/images', '/sw.js', '/manifest'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ignorar assets estáticos, _next, API routes
  if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Ignorar archivos estáticos (favicon, images, etc.)
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  // 2. Leer el token de la cookie
  const token = request.cookies.get('auth_token')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // 3. Si no hay token y la ruta NO es pública → redirigir a /login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Guardar la URL original para redirigir después del login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Si hay token y está en una ruta pública (login/register) → redirigir a /dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all routes except static files and API routes.
   * This regex matches everything that is NOT a file with an extension.
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
