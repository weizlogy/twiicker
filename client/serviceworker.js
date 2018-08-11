self.addEventListener('install', event => {
  console.log('Service Worker installing.')
})

self.addEventListener('activate', event => {
  console.log('Service Worker activating.')
})

self.addEventListener('fetch', event => {
  console.log('Service Worker fetching.')
})

self.addEventListener('push', event => {
  let notify = event.data.json()
  console.log('Service Worker push received.', notify)
  const title = notify.title
  const options = {
    body: notify.body,
    icon: 'twiicker.png',
    badge: 'twiicker.png'
  };
  event.waitUntil(self.registration.showNotification(title, options))
})