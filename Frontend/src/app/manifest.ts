import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vantage Residential OS',
    short_name: 'Vantage',
    description: 'Sistema de gestión residencial — amenities, reservas e incidentes',
    start_url: '/',
    display: 'standalone',
    background_color: '#050e1a',
    theme_color: '#3b82f6',
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
