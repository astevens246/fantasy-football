// app.js
const express = require('express');
const app = express();
// Socket.io has to use the http server
const server = require('http').Server(app);

// Socket.io setup
const io = require('socket.io')(server);
io.on("connection", (socket) => {
  console.log("🏈 New user connected to the draft! 🏈");
  
  // Listen for draft pick attempts
  socket.on('draft_player', (draftData) => {
    console.log(`Draft pick received:`, draftData.playerName);
    
    // For now, just echo the pick back to all clients
    // (Later we'll add turn validation and roster management)
    io.emit('player_drafted', {
      playerId: draftData.playerId,
      playerName: draftData.playerName,
      playerDetails: draftData.playerDetails,
      draftedBy: 'Team 1' // Hardcoded for now
    });
    
    console.log(`Broadcasted draft pick to all clients: ${draftData.playerName}`);
  });
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
