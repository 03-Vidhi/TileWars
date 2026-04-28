# Real-Time Multiplayer Tile Capture App

This is a real-time multiplayer tile capture application built with the MERN stack and Socket.IO.

## Architecture Explanation

- **Frontend**: React + Vite, styled with Tailwind CSS, and animated with Framer Motion. Uses `socket.io-client` to communicate real-time actions and listen for updates (tile captures, decay events, live user counts).
- **Backend**: Node.js + Express. Exposes an initial `/api/grid` endpoint for initial state load and establishes a WebSockets server using `Socket.IO` to broadcast real-time events.
- **Database**: MongoDB (via Mongoose). Ensures data persistence for the tile grid. Atomic updates (`findOneAndUpdate`) are used to prevent race conditions during simultaneous capture requests.
- **Real-Time Mechanism**: When a user clicks a tile, the frontend optimistically checks for client-side valid actions and emits a `captureTile` event. The backend validates if the tile is genuinely unclaimed by querying MongoDB. If successful, the ownership is updated atomically, and a broadcast is sent to all connected clients.

## Features Added
- Responsive 30x30 grid.
- Real-time tile ownership updates.
- MongoDB atomic update logic to prevent race conditions.
- Random user generation (names & colors).
- Leaderboard & Live Activity Feed.
- Territory System (adjacent tiles visually connect).
- Tile Decay System (tiles reset after 2 minutes of inactivity).
- 3s cooldown between captures to prevent spam.
- Live online users count.

## Setup Steps

### Prerequisites
- Node.js installed
- MongoDB installed and running locally on `mongodb://127.0.0.1:27017` (or update `backend/.env` with your Mongo URI).

### Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Ensure you have a `.env` file with `MONGODB_URI` and `PORT`.
4. Run the server: `npm run dev` (starts on port 5000).

### Frontend Setup
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install --legacy-peer-deps`
3. Run the development server: `npm run dev` (starts on port 5173).

Open `http://localhost:5173` in multiple browser windows to test the real-time multiplayer functionality!
