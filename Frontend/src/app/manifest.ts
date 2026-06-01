import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Amenities Proyecto Base',
    short_name: 'AmenitiesPWA',
    description: 'Gestión y reserva de amenities para proyectos residenciales',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a', // Slate 900 (fondo oscuro premium)
    theme_color: '#3b82f6', // Azul brillante moderno
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
