import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const Base10AnchorGame = ({ dataStr, onCorrectSound, onVictory }) => {
  const [data, setData] = useState(null);
  const [fuelCount, setFuelCount] = useState(0); // 0 to 10
  const [rodsCount, setRodsCount] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, fusing, completed
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        setData(JSON.parse(dataStr));
        setFuelCount(0);
        setRodsCount(0);
        setGameState('playing');
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  const handleTapFuel = useCallback(() => {
    if (gameState !== 'playing' || fuelCount >= 10) return;

    const nextCount = fuelCount + 1;
    setFuelCount(nextCount);

    if (nextCount === 10) {
      setGameState('fusing');
      
      setTimeout(() => {
        if (onCorrectSound) onCorrectSound();
      }, 800);

      setTimeout(() => {
        setRodsCount(1);
        setFuelCount(0);
        setGameState('completed');
        
        setTimeout(() => {
          if (onVictory) onVictory();
        }, 2500);
      }, 1800);
    }
  }, [gameState, fuelCount, onCorrectSound, onVictory]);

  if (!data) return null;

  // Determine item emoji, use battery if not present
  const itemEmoji = data.itemEmoji || '🔋';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start p-2 pt-4 overflow-hidden touch-none select-none">
      {gameState === 'completed' && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={400} gravity={0.3} />}
      
      {/* Scoreboard */}
      <div className="bg-slate-900/80 border-4 border-cyan-400 rounded-2xl px-6 py-2 mb-4 shadow-[0_0_20px_rgba(34,211,238,0.3)] flex gap-8 z-10">
        <div className="flex flex-col items-center">
          <span className="text-cyan-400 font-bold text-lg md:text-xl tracking-widest uppercase">Tens</span>
          <span className={`text-4xl md:text-5xl font-black ${rodsCount > 0 ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-slate-600'}`}>{rodsCount}</span>
        </div>
        <div className="w-1 bg-slate-600 rounded-full my-1"></div>
        <div className="flex flex-col items-center">
          <span className="text-blue-300 font-bold text-lg md:text-xl tracking-widest uppercase">Ones</span>
          <span className={`text-4xl md:text-5xl font-black w-8 text-center ${fuelCount > 0 ? 'text-white' : 'text-slate-600'}`}>{fuelCount}</span>
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl flex flex-row items-end justify-center gap-6 md:gap-16 px-2 mb-6">
        
        {/* Left: The Fuel Gauge (Tens Maker) */}
        <div className="flex flex-col items-center h-full max-h-[60vh] justify-end">
          <div className="text-cyan-200 font-black mb-2 uppercase tracking-wider text-sm md:text-base drop-shadow-md">
            Fuel Gauge
          </div>
          
          <div className={`relative w-20 md:w-28 flex-1 bg-slate-900/80 border-4 ${gameState === 'fusing' ? 'border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,1)]' : 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]'} rounded-t-3xl rounded-b-xl flex flex-col-reverse overflow-hidden transition-all duration-500`}>
            
            {/* 10 Segments */}
            {Array.from({length: 10}).map((_, i) => {
              const isFilled = i < fuelCount;
              return (
                <div key={i} className="flex-1 border-b border-cyan-800/30 flex items-center justify-center relative">
                   <AnimatePresence>
                     {isFilled && gameState !== 'fusing' && gameState !== 'completed' && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl md:text-4xl drop-shadow-lg z-10"
                        >
                           {itemEmoji}
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              );
            })}

            {/* Fused Rod Animation */}
            <AnimatePresence>
              {gameState === 'fusing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ y: -500, opacity: 0 }}
                  transition={{ duration: 0.5, exit: { duration: 0.6, ease: "easeIn" } }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-t from-yellow-500 via-amber-400 to-yellow-200"
                >
                  <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                  <div className="text-5xl drop-shadow-[0_0_20px_rgba(255,255,255,1)] font-black text-white transform -rotate-90 tracking-widest">
                    10-ROD
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Action Area (Loose Fuel) */}
        <div className="flex flex-col items-center justify-end h-full w-48 md:w-64 pb-8">
           <AnimatePresence>
              {gameState === 'playing' && (
                 <motion.button
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0 }}
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={handleTapFuel}
                   className="relative group cursor-pointer flex flex-col items-center"
                 >
                    <div className="absolute inset-0 bg-cyan-400 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
                    <div className="bg-slate-800 border-4 border-cyan-400 rounded-full w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)] z-10 overflow-hidden">
                       <span className="text-5xl md:text-6xl drop-shadow-md mb-1">{itemEmoji}</span>
                       <span className="text-xs md:text-sm font-black text-cyan-300 tracking-wider">TAP TO LOAD</span>
                    </div>
                 </motion.button>
              )}
           </AnimatePresence>

           {gameState === 'fusing' && (
             <div className="text-2xl md:text-3xl text-yellow-400 font-black animate-pulse drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] text-center">
               FUSING CORE...
             </div>
           )}

           {gameState === 'completed' && (
             <div className="text-2xl md:text-3xl text-green-400 font-black drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] text-center">
               CORE LOADED!
             </div>
           )}
        </div>

        {/* Right: Engine Core (Tens Vault) */}
        <div className="flex flex-col items-center h-full max-h-[60vh] justify-end">
          <div className="text-purple-300 font-black mb-2 uppercase tracking-wider text-sm md:text-base drop-shadow-md">
            Engine Core
          </div>
          
          <div className={`relative w-24 md:w-32 flex-1 bg-slate-900/80 border-4 border-purple-500/50 rounded-xl flex items-end justify-center p-2 overflow-hidden shadow-[inset_0_0_40px_rgba(168,85,247,0.2)] transition-all duration-500`}>
             <AnimatePresence>
               {gameState === 'completed' && rodsCount > 0 && (
                  <motion.div
                    initial={{ y: -500, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                    className="w-full h-full bg-gradient-to-t from-yellow-600 via-yellow-400 to-yellow-200 rounded-lg shadow-[0_0_30px_rgba(250,204,21,0.8)] flex items-center justify-center relative overflow-hidden"
                  >
                     <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                     <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-orange-600 to-transparent"></div>
                     <div className="text-2xl md:text-4xl font-black text-white transform -rotate-90 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 tracking-widest">
                        10-ROD
                     </div>
                  </motion.div>
               )}
             </AnimatePresence>
             {rodsCount === 0 && (
                <div className="text-purple-500/30 font-black text-2xl absolute top-1/2 transform -translate-y-1/2 -rotate-90 tracking-widest w-full text-center">
                  EMPTY
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Base10AnchorGame;
