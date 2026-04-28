import { useEffect, useState, useCallback } from 'react';
import { socket } from './utils/socket';
import { generateUser } from './utils/user';
import Grid from './components/Grid';
import Leaderboard from './components/Leaderboard';
import ActivityFeed from './components/ActivityFeed';
import { Users, Wifi, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [user, setUser] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [activities, setActivities] = useState([]);
  const [connected, setConnected] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const currentUser = generateUser();
    setUser(currentUser);

    // Initial fetch
    fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/grid`)
      .then(res => res.json())
      .then(data => setTiles(data))
      .catch(err => console.error("Failed to load grid", err));

    socket.connect();

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join', currentUser);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('usersCount', (count) => {
      setUsersCount(count);
    });

    socket.on('tileCaptured', (updatedTile) => {
      setTiles(prev => prev.map(t => (t.x === updatedTile.x && t.y === updatedTile.y) ? updatedTile : t));
    });

    socket.on('tilesDecayed', (decayedCoords) => {
      setTiles(prev => {
        const next = [...prev];
        decayedCoords.forEach(c => {
          const idx = next.findIndex(t => t.x === c.x && t.y === c.y);
          if (idx !== -1) {
            next[idx] = { ...next[idx], ownerId: null, ownerColor: null, ownerName: null, capturedAt: null };
          }
        });
        return next;
      });
    });

    socket.on('activity', (act) => {
      setActivities(prev => [{ ...act, id: Math.random().toString(36).substr(2, 9) }, ...prev].slice(0, 50));
    });

    socket.on('captureFailed', ({ message }) => {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(null), 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCaptureTile = useCallback((x, y) => {
    if (cooldown > 0) {
      setErrorMsg(`Cooldown active: ${cooldown.toFixed(1)}s remaining`);
      setTimeout(() => setErrorMsg(null), 2000);
      return;
    }

    // Optimistic check
    const tile = tiles.find(t => t.x === x && t.y === y);
    if (tile && tile.ownerId) {
      // Cannot capture owned tile, must wait for decay
      setErrorMsg("Tile already owned! Wait for it to decay.");
      setTimeout(() => setErrorMsg(null), 2000);
      return;
    }

    socket.emit('captureTile', { x, y, user });
    setCooldown(1); // 1 seconds cooldown
  }, [cooldown, tiles, user]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <span className="font-bold text-white">T</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              TileWars
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
              <Users size={16} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-200">{usersCount} Online</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
              <Wifi size={16} className={connected ? "text-green-400" : "text-red-400"} />
              <span className="text-sm font-medium text-slate-200">
                {connected ? 'Connected' : 'Connecting...'}
              </span>
            </div>

            {user && (
              <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
                <div
                  className="w-6 h-6 rounded-full shadow-md"
                  style={{ backgroundColor: user.color, boxShadow: `0 0 10px ${user.color}` }}
                />
                <span className="text-sm font-semibold text-slate-200">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-8">

        {/* Left sidebar: Leaderboard & Feed */}
        <div className="w-full lg:w-80 flex flex-col gap-6 order-2 lg:order-1">
          <Leaderboard tiles={tiles} />
          <ActivityFeed activities={activities} />
        </div>

        {/* Center: Grid */}
        <div className="flex-1 flex flex-col order-1 lg:order-2">

          {/* Status Bar */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <AlertCircle size={16} />
              <span>Click any neutral tile to capture. Tiles decay after 2 mins.</span>
            </div>

            {/* Cooldown Indicator */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-300">Status:</span>
              {cooldown > 0 ? (
                <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm border border-red-500/30">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Cooldown: {Math.ceil(cooldown)}s
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/30">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                  Ready to Capture
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -20, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className="absolute top-4 left-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-xl font-medium"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <Grid tiles={tiles} onCaptureTile={handleCaptureTile} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
