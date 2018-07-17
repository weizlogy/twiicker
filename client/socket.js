define(['io'], io => {
  console.info('ソケット接続...')

  let socket = io()

  // 共通サーバーエラー
  socket.on('s2c-error', error => {
    console.error('サーバーエラー', error)
  })

  return socket
})