import { motion, AnimatePresence } from 'framer-motion';

export default function Leaderboard({ tiles }) {
  // Compute leaderboard
  const userStats = {};
  tiles.forEach(t => {
    if (t.ownerId) {
      if (!userStats[t.ownerId]) {
        userStats[t.ownerId] = {
          id: t.ownerId,
          name: t.ownerName,
          color: t.ownerColor,
          count: 0
        };
      }
      userStats[t.ownerId].count += 1;
    }
  });

  const sortedUsers = Object.values(userStats).sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl overflow-hidden flex flex-col h-full max-h-[400px]">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-100">
        <span className="text-yellow-500">🏆</span> Leaderboard
      </h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        <AnimatePresence>
          {sortedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-mono w-4">{index + 1}.</span>
                <div 
                  className="w-4 h-4 rounded-full shadow-md"
                  style={{ backgroundColor: user.color, boxShadow: `0 0 10px ${user.color}` }}
                />
                <span className="font-medium text-slate-200 truncate max-w-[120px]" title={user.name}>
                  {user.name}
                </span>
              </div>
              <span className="font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded text-sm">
                {user.count}
              </span>
            </motion.div>
          ))}
          {sortedUsers.length === 0 && (
            <div className="text-slate-500 text-center py-8">No tiles captured yet.</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
