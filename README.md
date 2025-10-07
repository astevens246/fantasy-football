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
- Receive notifications when the draft is complete

The app features 36 NFL players across 4 positions (QB, RB, WR, TE) with enough variety for strategic decision-making.

## Justification for Using WebSockets

WebSockets are essential for this application because:

1. **Real-time synchronization** - When one user drafts a player, all other users must see the update immediately
2. **Turn management** - Users need instant feedback about whose turn it is and validation errors
3. **Multi-user state** - The draft state must be synchronized across all connected clients
4. **Interactive experience** - Creates the feeling of being in the same room during a live draft

Traditional HTTP requests would require constant polling and wouldn't provide the seamless real-time experience that makes fantasy drafts engaging.

## Application Mockup & WebSocket Events

```
┌─────────────────────────┐    ┌──────────────────────────┐
│     Team Selection      │    │      Draft Board         │
│                         │    │                          │
│  [Team Name Input]      │    │  Available Players       │
│  [Join Draft Button]    │    │  ┌─────────────────────┐  │
│                         │    │  │ Lamar Jackson (QB)  │  │ ← click triggers
│                         │    │  │ Bijan Robinson (RB) │  │   'draft_player'
│                         │    │  │ Ja'Marr Chase (WR)  │  │
│                         │    │  └─────────────────────┘  │
└─────────────────────────┘    │                          │
                               │  Draft Results            │
   ↓ 'join_team'               │  ┌─────────────────────┐  │
                               │  │ Allen's Team        │  │
                               │  │ QB: [Empty]         │  │ ← filled by
                               │  │ RB1: [Empty]        │  │   'player_drafted'
                               │  │ RB2: [Empty]        │  │
                               │  └─────────────────────┘  │
                               └──────────────────────────┘
```

### WebSocket Events:
- **`join_team`** - User joins with team name, gets random position
- **`draft_player`** - User attempts to draft a player
- **`player_drafted`** - Broadcasts successful draft to all clients
- **`turn_updated`** - Notifies all clients whose turn it is
- **`team_update`** - Updates team names across all clients
- **`draft_complete`** - Celebrates when all 24 picks are made
- **`draft_error`** - Handles invalid actions (drafting out of turn)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fantasy-football
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   # or
   node app.js
   ```

4. **Open the application**
   - Navigate to `http://localhost:3000` in your browser
   - Open multiple browser windows/tabs to simulate different users
   - Join with different team names to test the multi-user functionality

### Usage
1. Enter a team name and click "Join Draft"
2. Wait for other users to join (up to 4 total)
3. Draft players when it's your turn (indicated by "YOUR TURN!" message)
4. Players automatically go to appropriate roster positions
5. Draft completes after 24 total picks (6 per team)

## Technologies Used
- **Backend:** Node.js, Express.js, Socket.IO
- **Frontend:** HTML5, CSS3, JavaScript
- **Real-time Communication:** WebSockets via Socket.IO

## Features
- ✅ Real-time multi-user drafting
- ✅ Random draft position assignment  
- ✅ Turn-based validation
- ✅ Smart position-based roster placement
- ✅ Draft completion notifications
- ✅ Professional error handling
- ✅ 36 real NFL players with strategic variety