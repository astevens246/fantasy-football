// client.js - Fantasy Football Draft Client
console.log('Fantasy Football Draft client loaded! 🏈');

// Connect to the Socket.IO server
const socket = io.connect();

// Test the connection - log when we connect
socket.on('connect', () => {
  console.log('🔌 Connected to fantasy draft server! 🔌');
});

// Log any connection errors
socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error);
});
