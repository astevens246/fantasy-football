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

// Listen for draft picks from the server
socket.on('player_drafted', (draftData) => {
  console.log(`DRAFT PICK: ${draftData.playerName} drafted by ${draftData.draftedBy}!`);
  
  // Remove the player from the available players list
  const playerCard = document.querySelector(`.player-card[data-player-id="${draftData.playerId}"]`);
  if (playerCard) {
    playerCard.remove();
    console.log(`✅ Removed ${draftData.playerName} from available players`);
  }
  
  // Add the player to the team roster
  addPlayerToTeamRoster(draftData.playerName, draftData.draftedBy);
});

// Listen for turn updates from the server
socket.on('turn_updated', (newTurn) => {
  console.log(`🔄 Turn updated: Now Team ${newTurn}'s turn`);
  
  // Update the current turn display
  const turnDisplay = document.getElementById('current-turn');
  if (turnDisplay) {
    turnDisplay.textContent = `Team ${newTurn}`;
  }
});

// Function to add a player to a team's roster visually
function addPlayerToTeamRoster(playerName, teamName) {
  // Convert "Team 1" to "team-1-roster" 
  const teamNumber = teamName.split(' ')[1]; // Gets "1" from "Team 1"
  const rosterElement = document.getElementById(`team-${teamNumber}-roster`);
  
  if (rosterElement) {
    // Find the first empty roster slot
    const emptySlot = rosterElement.querySelector('.roster-slot.empty');
    if (emptySlot) {
      // Replace the empty slot with the player name
      emptySlot.textContent = playerName;
      emptySlot.classList.remove('empty');
      emptySlot.classList.add('filled');
      console.log(`✅ Added ${playerName} to ${teamName} roster`);
    } else {
      console.log(`⚠️  No empty slots available for ${teamName}`);
    }
  } else {
    console.log(`❌ Could not find roster for ${teamName}`);
  }
}

// Add click handlers to player cards when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Setting up player click handlers...');
  
  // Get all player cards
  const playerCards = document.querySelectorAll('.player-card');
  
  // Add click listener to each player card
  playerCards.forEach(card => {
    card.addEventListener('click', (event) => {
      // Get player information from the card
      const playerId = card.getAttribute('data-player-id');
      const playerName = card.querySelector('.player-name').textContent;
      const playerDetails = card.querySelector('.player-details').textContent;
      
      // Log the click for debugging
      console.log(`🏈 Player clicked:`, playerName);
      
      // Send draft pick to server via Socket.IO
      socket.emit('draft_player', {
        playerId: playerId,
        playerName: playerName,
        playerDetails: playerDetails
      });
      
      console.log(`Sent draft pick to server: ${playerName}`);
    });
  });
  
  console.log(`✅ Added click handlers to ${playerCards.length} players`);
});
