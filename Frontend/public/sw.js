// Service Worker para gestión de Notificaciones Push de la PWA

self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json()
      
      const options = {
        body: data.body || 'Tienes una nueva actualización en tu aplicación de Amenities.',
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/icon-192x192.png',
        vibrate: data.vibrate || [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          url: data.url || '/'
        }
      }

      event.waitUntil(
        self.registration.showNotification(data.title || 'Alerta de Amenities', options)
      )
    } catch (e) {
      // Si la carga útil del push no es JSON, mostrarla como texto plano
      const text = event.data.text()
      event.waitUntil(
        self.registration.showNotification('Alerta de Amenities', {
          body: text,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
        })
      )
    }
  }
})

// Abre o enfoca la ventana de la aplicación cuando el usuario hace clic en la notificación
self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  
  // Obtener la URL destino de los datos de la notificación o usar la raíz
  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Si hay una ventana abierta de la app, enfocarla y navegar a la ruta
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (client.url !== self.location.origin + targetUrl) {
            client.navigate(targetUrl)
          }
          return client.focus()
        }
      }
      
      // Si no hay ventanas de la app abiertas, abrir una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
