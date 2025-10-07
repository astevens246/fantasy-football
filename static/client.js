// client.js - Fantasy Football Draft Client
console.log('Fantasy Football Draft client loaded! 🏈');

// Connect to the Socket.IO server
const socket = io.connect();

// Track which team this user is on
let myTeam = null;
let myTeamName = null;

// Test the connection - log when we connect
socket.on('connect', () => {
  console.log('🔌 Connected to fantasy draft server! 🔌');
});

// Log any connection errors
socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error);
});

// Listen for draft picks from the server
socket.on('player_drafted', (draftData) => {
  console.log(`DRAFT PICK: ${draftData.playerName} drafted by ${draftData.draftedBy}!`);
  
  // Remove the player from the available players list
  const playerCard = document.querySelector(`.player-card[data-player-id="${draftData.playerId}"]`);
  if (playerCard) {
    playerCard.remove();
    console.log(`✅ Removed ${draftData.playerName} from available players`);
  }
  
  // Add the player to the team roster (use team number for placement)
  addPlayerToTeamRoster(draftData.playerName, draftData.draftedByTeamNumber);
});

// Listen for turn updates from the server
socket.on('turn_updated', (turnData) => {
  // Handle both old format (just number) and new format (object with custom names)
  const currentTurn = typeof turnData === 'object' ? turnData.currentTurn : turnData;
  const currentTeamName = typeof turnData === 'object' ? turnData.currentTeamName : `Team ${turnData}`;
  
  console.log(`🔄 Turn updated: Now ${currentTeamName}'s turn`);
  
  // Update the current turn display (personalized)
  const turnDisplay = document.getElementById('current-turn');
  if (turnDisplay) {
    if (myTeam === currentTurn) {
      turnDisplay.textContent = `YOUR TURN!`;
      turnDisplay.style.color = '#4caf50'; // Green for your turn
      turnDisplay.style.fontWeight = 'bold';
    } else {
      turnDisplay.textContent = currentTeamName;
      turnDisplay.style.color = '#666'; // Gray for other team's turn
      turnDisplay.style.fontWeight = 'normal';
    }
  }
});

// Listen for draft errors (when you try to draft out of turn)
socket.on('draft_error', (error) => {
  console.log(`❌ Draft Error: ${error.message}`);
  alert(`Draft Error: ${error.message}`);
});

// Listen for draft full error (when trying to join a full draft)
socket.on('draft_full', (error) => {
  console.log(`❌ Draft Full: ${error.message}`);
  alert(`Draft Full: ${error.message}`);
});

// Listen for player data from server
socket.on('players_loaded', (players) => {
  console.log(`📋 Received ${players.length} players from server`);
  displayPlayers(players);
});

// Function to display players in the HTML
function displayPlayers(players) {
  const playersListElement = document.getElementById('players-list');
  if (!playersListElement) return;
  
  // Clear existing hardcoded players
  playersListElement.innerHTML = '';
  
  // Add real players from server
  players.forEach(player => {
    const playerCard = document.createElement('div');
    playerCard.className = 'player-card';
    playerCard.setAttribute('data-player-id', player.id);
    
    playerCard.innerHTML = `
      <div class="player-name">${player.name}</div>
      <div class="player-details">${player.position} - ${player.team} - Rank: ${player.rank}</div>
    `;
    
    // Add click handler to the new player card
    playerCard.addEventListener('click', (event) => {
      // Log the click for debugging
      console.log(`Player clicked:`, player.name);
      
      // Send draft pick to server via Socket.IO
      socket.emit('draft_player', {
        playerId: player.id,
        playerName: player.name,
        playerDetails: `${player.position} - ${player.team} - Rank: ${player.rank}`
      });
      
      console.log(`Sent draft pick to server: ${player.name}`);
    });
    
    playersListElement.appendChild(playerCard);
  });
}

// Function to add a player to a team's roster visually
function addPlayerToTeamRoster(playerName, teamNumber) {
  const rosterElement = document.getElementById(`team-${teamNumber}-roster`);
  
  if (rosterElement) {
    // Find the first empty roster slot
    const emptySlot = rosterElement.querySelector('.roster-slot.empty');
    if (emptySlot) {
      // Replace the empty slot with the player name
      emptySlot.textContent = playerName;
      emptySlot.classList.remove('empty');
      emptySlot.classList.add('filled');
      console.log(`✅ Added ${playerName} to Team ${teamNumber} roster`);
    } else {
      console.log(`⚠️  No empty slots available for Team ${teamNumber}`);
    }
  } else {
    console.log(`❌ Could not find roster for Team ${teamNumber}`);
  }
}

// Team selection form handler (like Make Chat's username form)
document.addEventListener('DOMContentLoaded', () => {
  const teamForm = document.querySelector('.team-selection-form');
  const joinButton = document.getElementById('join-team-btn');
  const teamNameInput = document.getElementById('team-name-input');
  
  // Handle team selection form submission
  teamForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const teamName = teamNameInput.value.trim();
    
    if (teamName) {
      // Store team name (position will be assigned by server)
      myTeamName = teamName;
      
      // Send team name to server (server will assign position)
      socket.emit('join_team', {
        teamName: teamName,
        socketId: socket.id
      });
      
      console.log(`🎯 Joining as ${teamName} (position will be assigned)`);
    }
  });
  
  // Listen for successful team join
  socket.on('team_joined', (data) => {
    console.log(`✅ Successfully joined as ${data.teamName} (Position ${data.teamNumber})`);
    
    // Store my assigned team number
    myTeam = data.teamNumber;
    
    // Hide the team selection form
    teamForm.style.display = 'none';
    
    // Show the main draft board
    document.querySelector('.container').style.display = 'block';
  });
  
  // Listen for team updates (when any team joins, update the display)
  socket.on('team_update', (teamData) => {
    console.log(`📋 Team update: ${teamData.teamName} is now Position ${teamData.teamNumber}`);
    
    // Update the team name header in draft results
    const teamHeader = document.getElementById(`team-${teamData.teamNumber}-name`);
    if (teamHeader) {
      teamHeader.textContent = teamData.teamName;
    }
  });

  console.log('✅ Team selection form handlers set up');
});
