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
  console.log('Full draft data:', draftData);
});

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
