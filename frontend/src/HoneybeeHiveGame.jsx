import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const Hexagon = ({ filled }) => (
  <div className="relative w-12 h-14 md:w-16 md:h-20" style={{ margin: '-4px' }}>
    <div 
      className={`absolute inset-0 transition-colors duration-500 ${filled ? 'bg-amber-400' : 'bg-amber-900/40'} border-2 ${filled ? 'border-amber-200' : 'border-amber-700'}`}
      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
    />
    {filled && (
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute inset-0 flex items-center justify-center text-amber-100/50"
      >
        <span className="text-xl md:text-3xl filter drop-shadow-md">🍯</span>
      </motion.div>
    )}
  </div>
);

const HoneybeeHiveGame = ({ dataStr, onVictory, onCorrectSound, onErrorSound }) => {
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState(1);
  const [mainHiveLoaded, setMainHiveLoaded] = useState(false);
  const [looseDrops, setLooseDrops] = useState(0);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        setData(JSON.parse(dataStr));
        setPhase(1);
        setMainHiveLoaded(false);
        setLooseDrops(0);
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
      setMainHiveLoaded(true);
      if (onCorrectSound) onCorrectSound();
      setTimeout(() => setPhase(2), 800);
    }, 500);
  };

  const handleDrop1 = () => {
    if (phase !== 2) return;
    const nextDrops = looseDrops + 1;
    setLooseDrops(nextDrops);
    if (onCorrectSound) onCorrectSound();

    if (10 + nextDrops === data.target) {
      setPhase(2.5); // transition phase
      setTimeout(() => {
        setPhase(3); // victory phase
        setTimeout(() => {
          if (onVictory) onVictory();
        }, 3500);
      }, 2000);
    }
  };

  if (!data) return null;
  const { target, beeName } = data;

  // Linguistic mappings
  const onesWord = looseDrops === 5 ? 'Five' : looseDrops === 6 ? 'Six' : looseDrops;
  const teenWord = looseDrops === 5 ? 'Fif-teen' : looseDrops === 6 ? 'Six-teen' : `${looseDrops}-teen`;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden touch-none select-none bg-gradient-to-b from-yellow-950 via-amber-950 to-orange-950">
      
      {phase === 3 && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={600} gravity={0.3} colors={['#fbbf24', '#f59e0b', '#d97706', '#fffbeb']} />}

      {/* Dynamic Header */}
      <div className="text-center z-20 bg-amber-900/80 px-4 py-2 mt-2 rounded-2xl border-4 border-amber-500 shadow-xl max-w-2xl">
        <h2 className="text-sm md:text-xl font-black text-amber-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
          {phase === 1 && `Worker Bee ${beeName} needs ${target} drops! First, fill the main hive with 10 drops!`}
          {(phase === 1.5 || phase === 2) && `10 drops secured! How many loose drops needed to reach ${target}?`}
          {phase >= 2.5 && `Sweet Success! Hive is full!`}
        </h2>
      </div>

      {/* The Target Board Held by Worker Bee */}
      <div className="absolute top-20 right-4 md:right-16 z-10 flex flex-col items-center pointer-events-none">
        <div className="text-5xl md:text-7xl mb-[-10px] z-20">🐝</div>
        <div className="bg-amber-100 border-4 border-amber-800 rounded-lg p-2 shadow-xl transform rotate-3">
           <div className="text-3xl md:text-5xl font-black text-amber-900 text-center px-4">
              {target}
           </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 w-full max-w-4xl flex flex-row items-center justify-center gap-4 md:gap-16 relative z-10 pb-[80px]">
        
        {/* Left Side: The Main Hive (10-Group) */}
        <div className="relative flex flex-col items-center">
           <div className="text-amber-500/50 font-black tracking-widest text-sm md:text-lg uppercase mb-4 z-0">Main Hive</div>
           
           <div className={`relative p-4 md:p-8 rounded-3xl transition-all duration-1000 ${mainHiveLoaded ? 'bg-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.5)] border-4 border-amber-400' : 'bg-amber-900/30 border-4 border-transparent'}`}>
              
              {/* Honeycomb Layout (3-4-3 staggered for 10) */}
              <div className="flex flex-col items-center justify-center">
                 <div className="flex justify-center -mb-2 md:-mb-4">
                    <Hexagon filled={mainHiveLoaded} />
                    <Hexagon filled={mainHiveLoaded} />
                    <Hexagon filled={mainHiveLoaded} />
                 </div>
                 <div className="flex justify-center -mb-2 md:-mb-4">
                    <Hexagon filled={mainHiveLoaded} />
                    <Hexagon filled={mainHiveLoaded} />
                    <Hexagon filled={mainHiveLoaded} />
                    <Hexagon filled={mainHiveLoaded} />
                 </div>
                 <div className="flex justify-center">
                    <Hexagon filled={mainHiveLoaded} />
                    <Hexagon filled={mainHiveLoaded} />
                    <Hexagon filled={mainHiveLoaded} />
                 </div>
              </div>

              {/* Locked overlay text */}
              <AnimatePresence>
                 {mainHiveLoaded && (
                    <motion.div 
                       initial={{ opacity: 0, scale: 2 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
                       className="absolute inset-0 flex items-center justify-center z-30"
                    >
                       <div className="bg-amber-900/90 border-4 border-amber-400 px-6 py-2 rounded-full transform -rotate-12 shadow-2xl">
                          <span className="text-3xl md:text-5xl font-black text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,1)]">
                             1 Ten
                          </span>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>

        {/* Right Side: The Extension Tray (Ones) */}
        <div className="relative flex flex-col items-center">
           <div className="text-amber-500/50 font-black tracking-widest text-sm md:text-lg uppercase mb-4 z-0">Loose Drops</div>
           
           <div className="w-24 md:w-32 h-48 md:h-64 border-4 border-dashed border-amber-700/50 rounded-2xl relative flex flex-wrap items-end justify-center p-2 gap-1 overflow-hidden z-20 bg-amber-900/20">
              <AnimatePresence>
                 {Array.from({length: looseDrops}).map((_, i) => (
                    <motion.div
                       key={`loose-${i}`}
                       initial={{ y: -200, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       className="text-4xl md:text-5xl filter drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                    >
                       🍯
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        </div>

      </div>

      {/* Linguistic Transition Animation (Phase 2.5) */}
      <AnimatePresence>
         {phase === 2.5 && (
            <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 2, opacity: 0 }}
               transition={{ duration: 0.5 }}
               className="absolute inset-0 flex items-center justify-center bg-amber-950/80 z-50 pointer-events-none"
            >
               <div className="flex items-center gap-8 text-5xl md:text-7xl font-black text-white drop-shadow-[0_0_20px_rgba(245,158,11,1)]">
                  <span>10 and {onesWord}</span>
                  <motion.span 
                     animate={{ x: [0, 20, 0] }}
                     transition={{ repeat: Infinity, duration: 1 }}
                  >➡️</motion.span>
                  <span className="text-amber-400">{teenWord}!</span>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Action Controls (Bottom Bar) */}
      <div className="absolute bottom-0 inset-x-0 h-20 md:h-24 bg-amber-950 border-t-4 border-amber-800 flex items-center justify-center shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-40">
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
                  className="px-6 py-2 md:px-10 md:py-3 bg-amber-500 border-b-4 md:border-b-6 border-amber-700 rounded-xl text-lg md:text-2xl font-black text-amber-950 uppercase tracking-widest flex items-center gap-2 md:gap-4 active:translate-y-1 active:border-b-0 transition-all shadow-lg"
               >
                  <span>LOAD 10</span>
                  <span className="text-3xl md:text-4xl">🏺</span>
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
                  className="px-6 py-2 md:px-10 md:py-3 bg-amber-400 border-b-4 md:border-b-6 border-amber-600 rounded-xl text-lg md:text-2xl font-black text-amber-950 uppercase tracking-widest flex items-center gap-2 md:gap-4 active:translate-y-1 active:border-b-0 transition-all shadow-lg shadow-amber-500/20"
               >
                  <span>DROP 1</span>
                  <span className="text-3xl md:text-4xl">🍯</span>
               </motion.button>
            )}

            {phase === 3 && (
               <motion.div
                  key="btn-done"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-600/30 border-4 border-green-500 px-8 py-2 rounded-full text-green-300 font-black text-2xl md:text-4xl tracking-widest drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] flex items-center gap-4"
               >
                  <span>10 + {target - 10} = {target}</span>
                  <span className="text-3xl md:text-4xl">🐝</span>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
};

export default HoneybeeHiveGame;
