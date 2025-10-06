// app.js
const express = require('express');
const app = express();
// Socket.io has to use the http server
const server = require('http').Server(app);

// Socket.io setup
const io = require('socket.io')(server);

// Draft state management
let currentTurn = 1; // Which team's turn it is (1, 2, 3, 4)
const totalTeams = 4; // Number of teams in the draft

io.on("connection", (socket) => {
  console.log("🏈 New user connected to the draft! 🏈");
  
  // Send current turn to new users
  socket.emit('turn_updated', currentTurn);
  
  // Listen for draft pick attempts
  socket.on('draft_player', (draftData) => {
    const draftingTeam = `Team ${currentTurn}`;
    console.log(`📥 Draft pick received: ${draftData.playerName} by ${draftingTeam}`);
    
    // Broadcast the pick to all clients with the correct team
    io.emit('player_drafted', {
      playerId: draftData.playerId,
      playerName: draftData.playerName,
      playerDetails: draftData.playerDetails,
      draftedBy: draftingTeam
    });
    
    // Advance to next team's turn
    currentTurn = currentTurn === totalTeams ? 1 : currentTurn + 1;
    
    // Notify all clients of the turn change
    io.emit('turn_updated', currentTurn);
    
    console.log(`📤 Broadcasted draft pick. Next turn: Team ${currentTurn}`);
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
