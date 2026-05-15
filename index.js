const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('QR Code:', qr);
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== 401;
      if (shouldReconnect) startBot();
    }
    if (connection === 'open') {
      console.log('Bot connected successfully!');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

startBot();
