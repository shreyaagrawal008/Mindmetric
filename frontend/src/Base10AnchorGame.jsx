import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const Base10AnchorGame = ({ dataStr, onCorrectSound, onVictory }) => {
  const [data, setData] = useState(null);
  const [onesCount, setOnesCount] = useState(0);
  const [tensCount, setTensCount] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, snapping, bound, completed
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Generate random positions for loose items so they look scattered in the workbench
  const [looseItemPositions, setLooseItemPositions] = useState([]);

  useEffect(() => {
    if (dataStr) {
      try {
        setData(JSON.parse(dataStr));
        setOnesCount(0);
        setTensCount(0);
        setGameState('playing');
        setLooseItemPositions([]);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  const handleDispense = useCallback(() => {
    if (gameState !== 'playing' || onesCount >= 10) return;

    // Generate a random position within the workbench bounds (approx 0-80%)
    const newPos = {
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      rotation: Math.random() * 360,
    };
    
    setLooseItemPositions(prev => [...prev, newPos]);
    const nextCount = onesCount + 1;
    setOnesCount(nextCount);

    if (nextCount === 10) {
      setGameState('snapping');
      
      // Sequence: 
      // 1. Wait a moment
      // 2. Snap together (animate positions to center)
      // 3. Transform to bundle and move to vault
      setTimeout(() => {
        setGameState('bound');
        if (onCorrectSound) onCorrectSound();
      }, 1000);

      setTimeout(() => {
        setTensCount(1);
        setOnesCount(0);
        setLooseItemPositions([]);
        setGameState('completed');
        
        setTimeout(() => {
          if (onVictory) onVictory();
        }, 2500);
      }, 2500);
    }
  }, [gameState, onesCount, onCorrectSound, onVictory]);

  if (!data) return null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start p-2 pt-4 overflow-hidden touch-none select-none">
      {gameState === 'completed' && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={400} gravity={0.3} />}
      
      {/* Scoreboard */}
      <div className="bg-slate-900/80 border-4 border-yellow-400 rounded-2xl px-6 py-3 mb-4 shadow-xl flex gap-8 z-10">
        <div className="flex flex-col items-center">
          <span className="text-yellow-400 font-bold text-xl md:text-2xl tracking-widest uppercase">Tens</span>
          <span className={`text-4xl md:text-5xl font-black ${tensCount > 0 ? 'text-white' : 'text-slate-500'}`}>{tensCount}</span>
        </div>
        <div className="w-1 bg-slate-600 rounded-full"></div>
        <div className="flex flex-col items-center">
          <span className="text-blue-300 font-bold text-xl md:text-2xl tracking-widest uppercase">Ones</span>
          <span className="text-4xl md:text-5xl font-black text-white w-8 text-center">{onesCount}</span>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 w-full max-w-5xl flex flex-row gap-4 px-2 mb-4 relative h-64 md:h-96">
        
        {/* Left: Workbench */}
        <div className="w-1/2 h-full bg-blue-900/40 border-4 border-blue-400 rounded-3xl relative overflow-hidden flex flex-col shadow-inner">
          <div className="bg-blue-950/80 text-blue-200 text-center py-2 font-bold text-lg md:text-xl border-b-2 border-blue-500/50 uppercase tracking-wide">
            Workbench
          </div>
          
          <div className="flex-1 relative">
            {/* Render loose items */}
            <AnimatePresence>
              {looseItemPositions.map((pos, i) => {
                const isSnapping = gameState === 'snapping';
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, y: -100, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      // If snapping, bring to center and rotate flat
                      left: isSnapping ? '50%' : `${pos.x}%`,
                      top: isSnapping ? '50%' : `${pos.y}%`,
                      rotate: isSnapping ? 0 : pos.rotation,
                      x: isSnapping ? '-50%' : 0,
                      y: isSnapping ? '-50%' : 0,
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ 
                      type: isSnapping ? 'tween' : 'spring', 
                      duration: isSnapping ? 0.8 : 0.5,
                      delay: isSnapping ? 0 : 0
                    }}
                    className="absolute text-5xl md:text-6xl filter drop-shadow-md z-20"
                    style={!isSnapping ? { left: `${pos.x}%`, top: `${pos.y}%` } : {}}
                  >
                    {data.itemEmoji}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* The Bound Rod showing in workbench temporarily */}
            <AnimatePresence>
              {gameState === 'bound' && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ x: '150%', opacity: 0 }} // Flies into vault
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center z-30"
                >
                  <div className="relative bg-gradient-to-b from-yellow-300 to-amber-600 p-2 rounded-xl border-4 border-yellow-200 shadow-[0_0_50px_rgba(250,204,21,0.8)] flex flex-col items-center">
                     {/* 10 items stacked neatly */}
                     <div className="grid grid-rows-10 gap-[2px]">
                        {Array.from({length: 10}).map((_, i) => (
                           <div key={i} className="text-2xl md:text-3xl leading-none">{data.itemEmoji}</div>
                        ))}
                     </div>
                     <div className="absolute top-1/4 w-full h-4 bg-red-500/80 -mx-4 z-40 rounded shadow-md border border-red-300 transform -rotate-2"></div>
                     <div className="absolute bottom-1/4 w-full h-4 bg-red-500/80 -mx-4 z-40 rounded shadow-md border border-red-300 transform rotate-2"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Arrow / Transition Area */}
        <div className="w-12 md:w-24 flex items-center justify-center flex-col">
           <motion.div 
              animate={{ x: [0, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-4xl md:text-6xl text-white opacity-50"
           >
              ➡️
           </motion.div>
        </div>

        {/* Right: The 10s Express Vault */}
        <div className="w-1/2 h-full bg-indigo-900/40 border-4 border-purple-500 rounded-3xl relative overflow-hidden flex flex-col shadow-inner">
          <div className="bg-indigo-950/80 text-purple-200 text-center py-2 font-bold text-lg md:text-xl border-b-2 border-purple-500/50 uppercase tracking-wide">
            Tens Vault
          </div>
          
          <div className="flex-1 relative flex items-center justify-center">
            <AnimatePresence>
               {gameState === 'completed' && tensCount > 0 && (
                  <motion.div
                    initial={{ scale: 0, x: -100 }}
                    animate={{ scale: 1, x: 0 }}
                    className="relative bg-gradient-to-b from-yellow-300 to-amber-600 p-2 rounded-xl border-4 border-yellow-200 shadow-xl flex flex-col items-center"
                  >
                     <div className="grid grid-rows-10 gap-[2px]">
                        {Array.from({length: 10}).map((_, i) => (
                           <div key={i} className="text-2xl md:text-3xl leading-none">{data.itemEmoji}</div>
                        ))}
                     </div>
                     <div className="absolute top-1/4 w-[110%] h-4 bg-red-500/90 -ml-[5%] z-40 rounded shadow-md border border-red-300 transform -rotate-2"></div>
                     <div className="absolute bottom-1/4 w-[110%] h-4 bg-red-500/90 -ml-[5%] z-40 rounded shadow-md border border-red-300 transform rotate-2"></div>
                  </motion.div>
               )}
            </AnimatePresence>
            {gameState !== 'completed' && (
              <div className="text-slate-500/50 text-2xl md:text-4xl font-black text-center px-4">
                EMPTY
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispenser Button */}
      <AnimatePresence>
        {gameState === 'playing' && (
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDispense}
            className="mt-2 md:mt-4 px-8 py-4 bg-gradient-to-b from-green-400 to-green-600 border-b-8 border-green-800 rounded-3xl text-3xl md:text-4xl font-black text-white shadow-2xl flex items-center gap-4 hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all"
          >
            <span>DROP 1</span>
            <span className="text-4xl">{data.itemEmoji}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {gameState === 'snapping' && (
         <div className="mt-4 text-2xl md:text-4xl text-yellow-300 font-bold animate-pulse drop-shadow-md">
            10 ITEMS REACHED! BINDING...
         </div>
      )}

      {gameState === 'bound' && (
         <div className="mt-4 text-2xl md:text-4xl text-green-400 font-bold drop-shadow-md">
            1 BOUND GROUP OF TEN!
         </div>
      )}
    </div>
  );
};

export default Base10AnchorGame;
