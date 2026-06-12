import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const TeenTowerGame = ({ dataStr, onVictory, onCorrectSound, onErrorSound }) => {
  const [data, setData] = useState(null);
  
  // Game State
  const [phase, setPhase] = useState(1); // 1 = load foundation, 2 = load roof, 3 = victory
  const [foundationLoaded, setFoundationLoaded] = useState(false);
  const [roofCount, setRoofCount] = useState(0);
  
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        setData(JSON.parse(dataStr));
        setPhase(1);
        setFoundationLoaded(false);
        setRoofCount(0);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  const handleLoad10 = () => {
    if (phase !== 1) return;
    setPhase(1.5); // Animating load
    
    setTimeout(() => {
      setFoundationLoaded(true);
      if (onCorrectSound) onCorrectSound();
      
      setTimeout(() => {
        setPhase(2);
      }, 1000);
    }, 600); // Wait for block to drop
  };

  const handleDrop1 = () => {
    if (phase !== 2) return;
    const nextCount = roofCount + 1;
    setRoofCount(nextCount);
    
    if (onCorrectSound) onCorrectSound();

    if (10 + nextCount === data.target) {
      setPhase(3);
      setTimeout(() => {
        if (onVictory) onVictory();
      }, 3500);
    }
  };

  if (!data) return null;

  const targetNumber = data.target;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 overflow-hidden touch-none select-none bg-gradient-to-b from-slate-900 to-indigo-950">
      
      {phase === 3 && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={500} gravity={0.3} />}

      {/* Header & Prompt */}
      <div className="text-center z-20 bg-slate-900/90 px-6 py-2 rounded-2xl border-4 border-cyan-500 shadow-xl mb-2 max-w-2xl">
        <h2 className="text-lg md:text-2xl font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
          {phase === 1 && `Let's build Tower ${targetNumber}! First, load the foundation with a full deck of 10!`}
          {(phase === 1.5 || phase === 2) && `Foundation locked at 10! How many more single blocks to reach ${targetNumber}?`}
          {phase === 3 && `TOWER ${targetNumber} COMPLETE! Great job engineering!`}
        </h2>
      </div>

      {/* The Sky Display (Neon Equation) */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
        <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] mb-2">
           TARGET: {targetNumber}
        </div>
        <AnimatePresence mode="wait">
          {phase >= 2 && (
             <motion.div 
               key={roofCount}
               initial={{ opacity: 0, scale: 0.5, y: -20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] bg-slate-800/80 px-8 py-2 rounded-full border-2 border-slate-600"
             >
               10 + <span className="text-blue-400">{roofCount}</span> = <span className="text-green-400">{10 + roofCount}</span>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The Construction Yard */}
      <div className="flex-1 w-full max-w-3xl flex flex-col items-center justify-end relative z-10 pb-20">
        
        {/* The Scaffold Structure */}
        <div className="relative w-48 md:w-64 flex flex-col items-center">
           
           {/* Victory Flag */}
           <AnimatePresence>
              {phase === 3 && (
                 <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="absolute -top-24 flex items-end -ml-12"
                 >
                    <div className="w-2 h-32 bg-slate-300 rounded-t-full shadow-inner"></div>
                    <div className="bg-red-500 w-24 h-16 rounded-r-xl border-4 border-red-700 shadow-xl flex items-center justify-center font-black text-white text-3xl mb-16 -ml-1">
                       {targetNumber}
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>

           {/* Roof Deck */}
           <div className="w-full h-48 md:h-64 border-x-8 border-t-8 border-slate-700/50 bg-slate-800/30 rounded-t-xl relative flex flex-col-reverse items-center justify-start p-2 gap-1 overflow-hidden z-20">
              <span className="absolute top-2 text-slate-500/50 font-black tracking-widest text-xl uppercase z-0">Roof Deck</span>
              
              {/* Stacked Single Blocks */}
              <AnimatePresence>
                 {Array.from({length: roofCount}).map((_, i) => (
                    <motion.div
                       key={`roof-${i}`}
                       initial={{ y: -200, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       className="w-full h-8 md:h-10 bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-blue-400 rounded-md shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 flex items-center justify-center"
                    >
                       <span className="text-white/50 font-black text-xs">BLOCK</span>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>

           {/* Foundation Deck */}
           <div className={`w-[110%] h-32 md:h-40 border-8 ${foundationLoaded ? 'border-cyan-500 bg-cyan-900/40 shadow-[0_0_30px_rgba(6,182,212,0.5)]' : 'border-slate-600 bg-slate-800/40'} rounded-md relative flex items-end justify-center overflow-hidden transition-all duration-1000 z-30`}>
              {!foundationLoaded && <span className="absolute top-1/2 transform -translate-y-1/2 text-slate-500/50 font-black tracking-widest text-xl uppercase z-0">Foundation</span>}
              
              {/* Massive 10-Block */}
              <AnimatePresence>
                 {(phase === 1.5 || foundationLoaded) && (
                    <motion.div
                       initial={{ y: -500 }}
                       animate={{ y: 0 }}
                       transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                       className="w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-600 border-4 border-yellow-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center z-10"
                    >
                       <div className="grid grid-cols-5 grid-rows-2 w-full h-full p-2 gap-1 opacity-50">
                          {Array.from({length: 10}).map((_, i) => (
                             <div key={i} className="border-2 border-yellow-700/50 rounded-sm"></div>
                          ))}
                       </div>
                       <span className="absolute text-5xl md:text-6xl font-black text-white drop-shadow-md">
                          10
                       </span>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>

      </div>

      {/* Action Controls (Bottom Bar) */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-slate-900 border-t-4 border-slate-700 flex items-center justify-center shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-40">
         <AnimatePresence mode="wait">
            {phase === 1 && (
               <motion.button
                  key="btn-10"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoad10}
                  className="px-12 py-4 bg-yellow-500 border-b-8 border-yellow-700 rounded-2xl text-2xl md:text-3xl font-black text-yellow-950 uppercase tracking-widest flex items-center gap-4 active:translate-y-2 active:border-b-0 transition-all shadow-xl"
               >
                  <span>LOAD 10</span>
                  <span className="text-4xl">🏗️</span>
               </motion.button>
            )}

            {phase === 2 && (
               <motion.button
                  key="btn-1"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDrop1}
                  className="px-12 py-4 bg-blue-500 border-b-8 border-blue-700 rounded-2xl text-2xl md:text-3xl font-black text-white uppercase tracking-widest flex items-center gap-4 active:translate-y-2 active:border-b-0 transition-all shadow-xl shadow-blue-500/20"
               >
                  <span>DROP 1</span>
                  <span className="text-4xl">🧱</span>
               </motion.button>
            )}

            {phase === 3 && (
               <motion.div
                  key="btn-done"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 font-black text-3xl tracking-widest uppercase drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] flex items-center gap-4"
               >
                  <span>TOWER LOCKED</span>
                  <span className="text-4xl">✅</span>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
};

export default TeenTowerGame;
