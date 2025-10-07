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

// Top 30 Fantasy Football Players (simplified - no CSV needed)
const availablePlayers = [
  { id: '1', name: "Ja'Marr Chase", position: 'WR', team: 'CIN', rank: 1 },
  { id: '2', name: 'Bijan Robinson', position: 'RB', team: 'ATL', rank: 2 },
  { id: '3', name: 'Saquon Barkley', position: 'RB', team: 'PHI', rank: 3 },
  { id: '4', name: 'Justin Jefferson', position: 'WR', team: 'MIN', rank: 4 },
  { id: '5', name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', rank: 5 },
  { id: '6', name: 'CeeDee Lamb', position: 'WR', team: 'DAL', rank: 6 },
  { id: '7', name: 'Derrick Henry', position: 'RB', team: 'BAL', rank: 7 },
  { id: '8', name: 'Nico Collins', position: 'WR', team: 'HOU', rank: 8 },
  { id: '9', name: 'Brian Thomas Jr.', position: 'WR', team: 'JAC', rank: 9 },
  { id: '10', name: 'Puka Nacua', position: 'WR', team: 'LAR', rank: 10 },
  { id: '11', name: 'A.J. Brown', position: 'WR', team: 'PHI', rank: 11 },
  { id: '12', name: 'Kyren Williams', position: 'RB', team: 'LAR', rank: 12 },
  { id: '13', name: 'Tyreek Hill', position: 'WR', team: 'MIA', rank: 13 },
  { id: '14', name: 'De\'Von Achane', position: 'RB', team: 'MIA', rank: 14 },
  { id: '15', name: 'Josh Jacobs', position: 'RB', team: 'GB', rank: 15 },
  { id: '16', name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', rank: 16 },
  { id: '17', name: 'Kenneth Walker III', position: 'RB', team: 'SEA', rank: 17 },
  { id: '18', name: 'Garrett Wilson', position: 'WR', team: 'NYJ', rank: 18 },
  { id: '19', name: 'Drake London', position: 'WR', team: 'ATL', rank: 19 },
  { id: '20', name: 'Joe Mixon', position: 'RB', team: 'HOU', rank: 20 },
  { id: '21', name: 'Davante Adams', position: 'WR', team: 'NYJ', rank: 21 },
  { id: '22', name: 'Travis Kelce', position: 'TE', team: 'KC', rank: 22 },
  { id: '23', name: 'Lamar Jackson', position: 'QB', team: 'BAL', rank: 23 },
  { id: '24', name: 'Josh Allen', position: 'QB', team: 'BUF', rank: 24 },
  { id: '25', name: 'Patrick Mahomes', position: 'QB', team: 'KC', rank: 25 },
  { id: '26', name: 'Tee Higgins', position: 'WR', team: 'CIN', rank: 26 },
  { id: '27', name: 'Mike Evans', position: 'WR', team: 'TB', rank: 27 },
  { id: '28', name: 'George Kittle', position: 'TE', team: 'SF', rank: 28 },
  { id: '29', name: 'Mark Andrews', position: 'TE', team: 'BAL', rank: 29 },
  { id: '30', name: 'Alvin Kamara', position: 'RB', team: 'NO', rank: 30 }
];

io.on("connection", (socket) => {
  console.log("🏈 New user connected to the draft! 🏈");
  
  // Send current turn to new users
  socket.emit('turn_updated', {
    currentTurn: currentTurn,
    currentTeamName: teamNames[currentTurn] || `Team ${currentTurn}`
  });
  
  // Send available players to new users (all 30 players)
  socket.emit('players_loaded', availablePlayers);
  
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
  console.log(`🏈 Fantasy Draft server running on port ${PORT} with ${availablePlayers.length} players! 🏈`);
});
