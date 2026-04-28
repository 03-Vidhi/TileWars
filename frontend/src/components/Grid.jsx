import { memo } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const Tile = memo(({ tile, onClick, isTerritoryTop, isTerritoryBottom, isTerritoryLeft, isTerritoryRight }) => {
  const isOwned = !!tile.ownerId;
  
  return (
    <motion.div
      whileHover={{ scale: 1.15, zIndex: 20 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onClick(tile.x, tile.y)}
      className={clsx(
        'tile',
        isOwned && 'owned',
        isTerritoryTop && 'territory-top',
        isTerritoryBottom && 'territory-bottom',
        isTerritoryLeft && 'territory-left',
        isTerritoryRight && 'territory-right'
      )}
      style={{
        backgroundColor: isOwned ? tile.ownerColor : undefined,
        color: isOwned ? tile.ownerColor : undefined,
      }}
    />
  );
});

export default function Grid({ tiles, onCaptureTile }) {
  // Determine territories
  // To avoid heavy computation on each render, we do a quick check
  const getTile = (x, y) => tiles.find(t => t.x === x && t.y === y);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex justify-center">
      <div className="tile-grid w-full aspect-square bg-slate-800 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-700 p-1">
        {tiles.map(tile => {
          const isOwned = !!tile.ownerId;
          let tTop = false, tBottom = false, tLeft = false, tRight = false;
          
          if (isOwned) {
            const topTile = getTile(tile.x, tile.y - 1);
            const bottomTile = getTile(tile.x, tile.y + 1);
            const leftTile = getTile(tile.x - 1, tile.y);
            const rightTile = getTile(tile.x + 1, tile.y);

            tTop = topTile?.ownerId === tile.ownerId;
            tBottom = bottomTile?.ownerId === tile.ownerId;
            tLeft = leftTile?.ownerId === tile.ownerId;
            tRight = rightTile?.ownerId === tile.ownerId;
          }

          return (
            <Tile 
              key={`${tile.x}-${tile.y}`}
              tile={tile}
              onClick={onCaptureTile}
              isTerritoryTop={tTop}
              isTerritoryBottom={tBottom}
              isTerritoryLeft={tLeft}
              isTerritoryRight={tRight}
            />
          );
        })}
      </div>
    </div>
  );
}
