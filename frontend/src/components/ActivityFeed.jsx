import { motion, AnimatePresence } from 'framer-motion';

export default function ActivityFeed({ activities }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-[300px]">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-100">
        <span className="text-blue-500">⚡</span> Live Feed
      </h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        <AnimatePresence initial={false}>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm border-l-2 pl-3 py-1"
              style={{
                borderColor: 
                  activity.type === 'join' ? '#22c55e' : 
                  activity.type === 'leave' ? '#ef4444' :
                  activity.type === 'capture' ? '#3b82f6' : '#f59e0b'
              }}
            >
              <div className="text-slate-300">{activity.message}</div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(activity.time).toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
