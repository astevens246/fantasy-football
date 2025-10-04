// app.js
const express = require('express');
const app = express();
// Socket.io has to use the http server
const server = require('http').Server(app);

// Socket.io setup
const io = require('socket.io')(server);
io.on("connection", (socket) => {
  console.log("🏈 New user connected to the draft! 🏈");
});

// Serve static files from the 'static' directory
app.use(express.static('static'));

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/static/index.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🏈 Fantasy Draft server running on port ${PORT} 🏈`);
});
