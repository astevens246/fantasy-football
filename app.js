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

// Track which socket belongs to which team (like Make Chat's user tracking)
const teamAssignments = {}; // { socketId: teamNumber }
const teamNames = {}; // { teamNumber: customTeamName }
const availablePositions = [1, 2, 3, 4]; // Track which positions are still available

io.on("connection", (socket) => {
  console.log("🏈 New user connected to the draft! 🏈");
  
  // Send current turn to new users
  socket.emit('turn_updated', {
    currentTurn: currentTurn,
    currentTeamName: teamNames[currentTurn] || `Team ${currentTurn}`
  });
  
  // Handle team selection (like Make Chat's "new user")
  socket.on('join_team', (data) => {
    const teamName = data.teamName;
    
    // Check if draft is full
    if (availablePositions.length === 0) {
      socket.emit('draft_full', { message: 'Draft is full! All 4 positions are taken.' });
      console.log(`❌ ${socket.id} tried to join "${teamName}" but draft is full`);
      return;
    }
    
    // Randomly assign an available position
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const assignedPosition = availablePositions[randomIndex];
    
    // Remove this position from available positions
    availablePositions.splice(randomIndex, 1);
    
    console.log(`🎯 User ${socket.id} joining as "${teamName}" (Auto-assigned Position ${assignedPosition})`);
    
    // Store the team assignment and name
    teamAssignments[socket.id] = assignedPosition;
    teamNames[assignedPosition] = teamName;
    
    // Confirm successful join to the user who joined
    socket.emit('team_joined', {
      teamName: teamName,
      teamNumber: assignedPosition
    });
    
    // Broadcast team update to ALL clients (so everyone sees the team name)
    io.emit('team_update', {
      teamName: teamName,
      teamNumber: assignedPosition
    });
    
    // Broadcast updated turn info with custom name
    io.emit('turn_updated', {
      currentTurn: currentTurn,
      currentTeamName: teamNames[currentTurn] || `Draft Position ${currentTurn}`
    });
    
    console.log(`✅ ${socket.id} is now "${teamName}" (Position ${assignedPosition}). Available positions: [${availablePositions.join(', ')}]`);
  });
  
  // Listen for draft pick attempts
  socket.on('draft_player', (draftData) => {
    const userTeam = teamAssignments[socket.id];
    const draftingTeamName = teamNames[currentTurn] || `Team ${currentTurn}`;
    
    // Validate it's this user's turn (like Make Chat message validation)
    if (userTeam !== currentTurn) {
      const currentTeamName = teamNames[currentTurn] || `Team ${currentTurn}`;
      console.log(`❌ ${socket.id} (${teamNames[userTeam] || 'Team ' + userTeam}) tried to draft on ${currentTeamName}'s turn`);
      socket.emit('draft_error', { 
        message: `It's not your turn! Currently ${currentTeamName}'s turn.` 
      });
      return;
    }
    
    console.log(`📥 Valid draft pick: ${draftData.playerName} by ${draftingTeamName}`);
    
    // Broadcast the pick to all clients
    io.emit('player_drafted', {
      playerId: draftData.playerId,
      playerName: draftData.playerName,
      playerDetails: draftData.playerDetails,
      draftedBy: draftingTeamName,
      draftedByTeamNumber: currentTurn  // Add team number for roster placement
    });
    
    // Advance to next team's turn
    currentTurn = currentTurn === totalTeams ? 1 : currentTurn + 1;
    
    // Notify all clients of the turn change with custom names
    io.emit('turn_updated', {
      currentTurn: currentTurn,
      currentTeamName: teamNames[currentTurn] || `Team ${currentTurn}`
    });
    
    console.log(`📤 Broadcasted draft pick. Next turn: ${teamNames[currentTurn] || 'Team ' + currentTurn}`);
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
