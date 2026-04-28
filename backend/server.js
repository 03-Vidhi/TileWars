import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const GRID_SIZE = 30;
const TILE_DECAY_MS = 2 * 60 * 1000;

const tileSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  ownerId: { type: String, default: null },
  ownerColor: { type: String, default: null },
  ownerName: { type: String, default: null },
  capturedAt: { type: Date, default: null },
});
tileSchema.index({ x: 1, y: 1 }, { unique: true });
const Tile = mongoose.model('Tile', tileSchema);

const activeUsers = new Map();

async function initializeGrid() {
  const count = await Tile.countDocuments();
  if (count < GRID_SIZE * GRID_SIZE) {
    console.log('Initializing grid...');
    const tiles = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        tiles.push({ x, y });
      }
    }
    await Tile.deleteMany({});
    await Tile.insertMany(tiles);
    console.log('Grid initialized');
  }
}
initializeGrid();

setInterval(async () => {
  const now = new Date();
  const decayThreshold = new Date(now.getTime() - TILE_DECAY_MS);

  const decayedTiles = await Tile.find({
    ownerId: { $ne: null },
    capturedAt: { $lt: decayThreshold }
  });

  if (decayedTiles.length > 0) {
    await Tile.updateMany(
      { _id: { $in: decayedTiles.map(t => t._id) } },
      { $set: { ownerId: null, ownerColor: null, ownerName: null, capturedAt: null } }
    );

    const decayedCoordinates = decayedTiles.map(t => ({ x: t.x, y: t.y }));
    io.emit('tilesDecayed', decayedCoordinates);
    io.emit('activity', { type: 'decay', message: `${decayedTiles.length} tiles became neutral` });
  }
}, 5000);

app.get("/", (req, res) => {
  res.send("TileWars Backend Running 🚀");
});
app.get('/api/grid', async (req, res) => {
  try {
    const tiles = await Tile.find({});
    res.json(tiles);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userData) => {
    activeUsers.set(socket.id, userData);
    io.emit('usersCount', activeUsers.size);
    io.emit('activity', { type: 'join', message: `${userData.name} joined the game`, time: new Date() });
  });

  socket.on('captureTile', async (data) => {
    const { x, y, user } = data;
    try {
      const updatedTile = await Tile.findOneAndUpdate(
        { x, y, ownerId: null },
        {
          $set: {
            ownerId: user.id,
            ownerColor: user.color,
            ownerName: user.name,
            capturedAt: new Date()
          }
        },
        { new: true }
      );

      if (updatedTile) {
        io.emit('tileCaptured', updatedTile);
        io.emit('activity', { type: 'capture', message: `${user.name} captured a tile`, time: new Date() });
      } else {
        socket.emit('captureFailed', { x, y, message: 'Tile already claimed' });
      }
    } catch (error) {
      console.error('Error capturing tile:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const user = activeUsers.get(socket.id);
    if (user) {
      io.emit('activity', { type: 'leave', message: `${user.name} left the game`, time: new Date() });
    }
    activeUsers.delete(socket.id);
    io.emit('usersCount', activeUsers.size);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
