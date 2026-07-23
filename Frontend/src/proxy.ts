import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de autenticación — Livity OS
 *
 * Flujo:
 * 1. Si NO tiene token y busca ruta protegida → redirige a /login
 * 2. Si tiene token y entra a /select-role → permite acceso
 * 3. Si tiene token y entra a ruta protegida sin tener rol seleccionado ('auth_role') → redirige a /select-role
 * 4. Si tiene token y entra a rutas públicas (/login) → redirige a / (o /select-role)
 */

/** Rutas que NO requieren autenticación */
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

/** Prefijos que siempre se ignoran (assets, API, etc.) */
const IGNORED_PREFIXES = ['/_next', '/api', '/icons', '/images', '/sw.js', '/manifest'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ignorar assets estáticos, _next, API routes
  if (IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Ignorar archivos estáticos (favicon, imágenes, etc.)
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  // 2. Leer cookies
  const token = request.cookies.get('auth_token')?.value;
  const activeRole = request.cookies.get('auth_role')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  const isSelectRoleRoute = pathname === '/select-role';

  // 3. Si NO hay token y la ruta NO es pública → redirigir a /login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Si hay token y está intentando acceder a una ruta pública → redirigir según si tiene rol o no
  if (token && isPublicRoute) {
    const target = activeRole ? '/' : '/select-role';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 5. Si hay token, NO tiene rol seleccionado y NO está en /select-role → redirigir a /select-role
  if (token && !activeRole && !isSelectRoleRoute) {
    const selectRoleUrl = new URL('/select-role', request.url);
    if (pathname !== '/') {
      selectRoleUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(selectRoleUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match todas las rutas excepto estáticos
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
