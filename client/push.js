require(['Vue'], (Vue) => {
  // https://github.com/GoogleChromeLabs/web-push-codelab/blob/master/app/scripts/main.js
  // ===
  let urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  // ===

  // PUSH通知設定開始
  Vue.socket.emit('c2s-webpush-publickey', publicKey => {
    console.log('Valid push key: ', publicKey)
    
    navigator.serviceWorker.ready.then(registration => {
      registration.pushManager.getSubscription().then(subscription => {
        if (subscription) {
          console.log('PUSH通知は購読済み', subscription)
          return subscription
        }
        const applicationServerPublicKey = urlB64ToUint8Array(publicKey)
        registration.pushManager.subscribe({
          'userVisibleOnly': true, 'applicationServerKey': applicationServerPublicKey }).then(
            subscribed => {
              console.log('PUSH通知が購読された', subscribed)
              return subscribed
            }
          ).catch(error => {
            console.log('ServiceWorker subscribe failed: ', error)
          })
      }).then(subscribed => {
        Vue.socket.emit('c2s-webpush-register-subscription', subscribed)
      })
    })
  })
})