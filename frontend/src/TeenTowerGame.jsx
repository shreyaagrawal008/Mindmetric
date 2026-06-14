import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const TeenTowerGame = ({ dataStr, onVictory, onCorrectSound, onErrorSound }) => {
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState(1);
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
    setPhase(1.5);
    setTimeout(() => {
      setFoundationLoaded(true);
      if (onCorrectSound) onCorrectSound();
      setTimeout(() => setPhase(2), 800);
    }, 500);
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
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden touch-none select-none bg-gradient-to-b from-slate-900 to-indigo-950">
      
      {phase === 3 && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={500} gravity={0.3} />}

      {/* The Sky Display */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none w-full px-4">
        <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] mb-1">
           TARGET: {targetNumber}
        </div>
        <AnimatePresence mode="wait">
          {phase >= 2 && (
             <motion.div 
               key={roofCount}
               initial={{ opacity: 0, scale: 0.5, y: -10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="text-2xl md:text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] bg-slate-800/80 px-6 py-1 rounded-full border-2 border-slate-600"
             >
               10 + <span className="text-blue-400">{roofCount}</span> = <span className="text-green-400">{10 + roofCount}</span>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The Construction Yard */}
      <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-end relative z-10 pb-[70px] md:pb-[90px] mt-16 md:mt-24">
        
        {/* The Scaffold Structure */}
        <div className="relative w-40 md:w-56 flex flex-col items-center">
           
           {/* Victory Flag */}
           <AnimatePresence>
              {phase === 3 && (
                 <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="absolute -top-16 flex items-end -ml-10"
                 >
                    <div className="w-1 md:w-2 h-20 md:h-24 bg-slate-300 rounded-t-full shadow-inner"></div>
                    <div className="bg-red-500 w-16 md:w-20 h-10 md:h-12 rounded-r-lg border-2 md:border-4 border-red-700 shadow-xl flex items-center justify-center font-black text-white text-xl md:text-2xl mb-10 md:mb-12 -ml-1">
                       {targetNumber}
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>

           {/* Roof Deck */}
           <div className="w-full h-32 md:h-40 border-x-4 md:border-x-8 border-t-4 md:border-t-8 border-slate-700/50 bg-slate-800/30 rounded-t-xl relative flex flex-col-reverse items-center justify-start p-1 md:p-2 gap-1 overflow-hidden z-20">
              <span className="absolute top-1 text-slate-500/50 font-black tracking-widest text-sm md:text-lg uppercase z-0">Roof Deck</span>
              
              <AnimatePresence>
                 {Array.from({length: roofCount}).map((_, i) => (
                    <motion.div
                       key={`roof-${i}`}
                       initial={{ y: -100, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       className="w-full h-6 md:h-8 bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-400 rounded shadow-[0_0_5px_rgba(59,130,246,0.5)] z-10 flex items-center justify-center"
                    >
                       <span className="text-white/50 font-black text-[10px] md:text-xs">BLOCK</span>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>

           {/* Foundation Deck */}
           <div className={`w-[110%] h-20 md:h-28 border-4 md:border-8 ${foundationLoaded ? 'border-cyan-500 bg-cyan-900/40 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'border-slate-600 bg-slate-800/40'} rounded-md relative flex items-end justify-center overflow-hidden transition-all duration-700 z-30`}>
              {!foundationLoaded && <span className="absolute top-1/2 transform -translate-y-1/2 text-slate-500/50 font-black tracking-widest text-sm md:text-lg uppercase z-0">Foundation</span>}
              
              <AnimatePresence>
                 {(phase === 1.5 || foundationLoaded) && (
                    <motion.div
                       initial={{ y: -300 }}
                       animate={{ y: 0 }}
                       transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                       className="w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-600 border-2 md:border-4 border-yellow-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center z-10"
                    >
                       <div className="grid grid-cols-5 grid-rows-2 w-full h-full p-1 md:p-2 gap-[2px] opacity-50">
                          {Array.from({length: 10}).map((_, i) => (
                             <div key={i} className="border md:border-2 border-yellow-700/50 rounded-sm"></div>
                          ))}
                       </div>
                       <span className="absolute text-4xl md:text-5xl font-black text-white drop-shadow-md">
                          10
                       </span>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* Action Controls (Bottom Bar) */}
      <div className="absolute bottom-0 inset-x-0 h-16 md:h-20 bg-slate-900 border-t-2 md:border-t-4 border-slate-700 flex items-center justify-center shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-40">
         <AnimatePresence mode="wait">
            {phase === 1 && (
               <motion.button
                  key="btn-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoad10}
                  className="px-6 py-2 md:px-10 md:py-3 bg-yellow-500 border-b-4 md:border-b-6 border-yellow-700 rounded-xl text-lg md:text-2xl font-black text-yellow-950 uppercase tracking-widest flex items-center gap-2 md:gap-4 active:translate-y-1 active:border-b-0 transition-all shadow-lg"
               >
                  <span>LOAD 10</span>
                  <span className="text-2xl md:text-3xl">🏗️</span>
               </motion.button>
            )}

            {phase === 2 && (
               <motion.button
                  key="btn-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDrop1}
                  className="px-6 py-2 md:px-10 md:py-3 bg-blue-500 border-b-4 md:border-b-6 border-blue-700 rounded-xl text-lg md:text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2 md:gap-4 active:translate-y-1 active:border-b-0 transition-all shadow-lg shadow-blue-500/20"
               >
                  <span>DROP 1</span>
                  <span className="text-2xl md:text-3xl">🧱</span>
               </motion.button>
            )}

            {phase === 3 && (
               <motion.div
                  key="btn-done"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-400 font-black text-xl md:text-3xl tracking-widest uppercase drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] flex items-center gap-2 md:gap-4"
               >
                  <span>TOWER LOCKED</span>
                  <span className="text-2xl md:text-4xl">✅</span>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
};

export default TeenTowerGame;
