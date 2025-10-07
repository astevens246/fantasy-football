# Fantasy Football Draft Board 🏈

A real-time multi-user fantasy football draft application built with WebSockets and Node.js.

## Team Members
- Allen Stevens

## App Description

This application allows 4 users to participate in a live fantasy football draft where they can:
- Join with custom team names and get randomly assigned draft positions
- Draft players in turn-based order with real-time validation
- See players automatically placed in correct roster positions (QB, RB1, RB2, WR1, WR2, TE)
- Watch all updates happen instantly across all connected browsers

The app currently includes **36 hardcoded NFL players** (6 QBs, 12 RBs, 12 WRs, 6 TEs) providing enough variety for strategic drafting. For expanded player pools, a CSV file with additional players can be uploaded instead.

## Justification for Using WebSockets

WebSockets are essential because when one user drafts a player, all other users must see the update immediately. Traditional HTTP requests would require constant polling and wouldn't provide the seamless real-time experience that makes fantasy drafts engaging.

## Application Mockup & WebSocket Events

```
Team Selection → Draft Board → Real-time Updates
[Team Name] → [Available Players] → [Team Rosters]  
     ↓              ↓                    ↑
  join_team → draft_player → player_drafted (to all)
```

**Key Events:**
- `join_team` - User joins with team name, gets random position
- `draft_player` - User attempts to draft a player  
- `player_drafted` - Broadcasts successful draft to all clients
- `turn_updated` - Notifies whose turn it is
- `draft_complete` - Celebrates when all 24 picks are made

## Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Open multiple browser windows**
   - Navigate to `http://localhost:3000`
   - Join with different team names to test multi-user functionality

## How to Use
1. Enter a team name and click "Join Draft"
2. Wait for other users to join (up to 4 total)
3. Draft players when it's your turn ("YOUR TURN!" message)
4. Draft completes after 24 total picks (6 per team)

## Technologies Used
- Node.js & Express.js
- Socket.IO for WebSockets
- HTML/CSS/JavaScript frontend

## Player Data
- **Current:** 36 hardcoded NFL players for quick setup and testing
- **Expandable:** CSV file can be uploaded with full player database for more realistic drafts
- **Distribution:** 6 QBs, 12 RBs, 12 WRs, 6 TEs (enough variety for strategic choices)