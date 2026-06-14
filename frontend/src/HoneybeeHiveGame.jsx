import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const Hexagon = ({ filled }) => (
  <div className="relative w-10 h-12 md:w-14 md:h-16" style={{ margin: '-2px' }}>
    <div 
      className={`absolute inset-0 transition-colors duration-500 ${filled ? 'bg-amber-400' : 'bg-amber-900/40'} border md:border-2 ${filled ? 'border-amber-200' : 'border-amber-700'}`}
      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
    />
    {filled && (
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute inset-0 flex items-center justify-center text-amber-100/50"
      >
        <span className="text-lg md:text-2xl filter drop-shadow-md">🍯</span>
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
      setTimeout(() => setPhase(2), 600);
    }, 400);
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
      }, 1500);
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

      {/* The Target Board Held by Worker Bee */}
      <div className="absolute top-2 right-2 md:top-6 md:right-8 z-10 flex flex-col items-center pointer-events-none">
        <div className="text-3xl md:text-5xl mb-[-5px] md:mb-[-10px] z-20">🐝</div>
        <div className="bg-amber-100 border-2 border-amber-800 rounded-lg p-1 shadow-xl transform rotate-3">
           <div className="text-xl md:text-3xl font-black text-amber-900 text-center px-2">
              {target}
           </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 w-full max-w-4xl flex flex-row items-center justify-center gap-4 md:gap-16 relative z-10 pb-[50px] md:pb-[70px]">
        
        {/* Left Side: The Main Hive (10-Group) */}
        <div className="relative flex flex-col items-center">
           <div className="text-amber-500/50 font-black tracking-widest text-xs md:text-sm uppercase mb-2 z-0">Main Hive</div>
           
           <div className={`relative p-2 md:p-6 rounded-2xl md:rounded-3xl transition-all duration-1000 ${mainHiveLoaded ? 'bg-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 md:border-4 border-amber-400' : 'bg-amber-900/30 border-2 md:border-4 border-transparent'}`}>
              
              {/* Honeycomb Layout (3-4-3 staggered for 10) */}
              <div className="flex flex-col items-center justify-center">
                 <div className="flex justify-center -mb-2 md:-mb-3">
                    <Hexagon filled={mainHiveLoaded} />
                    <Hexagon filled={mainHiveLoaded} />
                    <Hexagon filled={mainHiveLoaded} />
                 </div>
                 <div className="flex justify-center -mb-2 md:-mb-3">
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
                       <div className="bg-amber-900/90 border-2 md:border-4 border-amber-400 px-4 md:px-6 py-1 md:py-2 rounded-full transform -rotate-12 shadow-2xl">
                          <span className="text-2xl md:text-4xl font-black text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,1)]">
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
           <div className="text-amber-500/50 font-black tracking-widest text-xs md:text-sm uppercase mb-2 z-0">Loose Drops</div>
           
           <div className="w-20 md:w-32 h-36 md:h-56 border-2 md:border-4 border-dashed border-amber-700/50 rounded-xl relative flex flex-col-reverse flex-wrap content-center justify-start p-1 md:p-2 gap-1 md:gap-2 z-20 bg-amber-900/20">
              <AnimatePresence>
                 {Array.from({length: looseDrops}).map((_, i) => (
                    <motion.div
                       key={`loose-${i}`}
                       initial={{ y: -50, opacity: 0, scale: 0.5 }}
                       animate={{ y: 0, opacity: 1, scale: 1 }}
                       className="text-xl md:text-3xl filter drop-shadow-[0_0_2px_rgba(251,191,36,0.8)]"
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
               <div className="flex flex-col items-center gap-2 md:gap-8 text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(245,158,11,1)]">
                  <span>10 and {onesWord}</span>
                  <motion.span 
                     animate={{ y: [0, 10, 0] }}
                     transition={{ repeat: Infinity, duration: 1 }}
                  >⬇️</motion.span>
                  <span className="text-amber-400">{teenWord}!</span>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Action Controls (Bottom Bar) */}
      <div className="absolute bottom-0 inset-x-0 h-16 md:h-20 bg-amber-950 border-t-2 md:border-t-4 border-amber-800 flex items-center justify-center shadow-[0_-5px_15px_rgba(0,0,0,0.5)] z-40">
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
                  className="px-4 py-2 md:px-8 md:py-2 bg-amber-500 border-b-4 border-amber-700 rounded-xl text-base md:text-xl font-black text-amber-950 uppercase tracking-widest flex items-center gap-2 active:translate-y-1 active:border-b-0 transition-all shadow-lg"
               >
                  <span>LOAD 10</span>
                  <span className="text-2xl md:text-3xl">🏺</span>
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
                  className="px-4 py-2 md:px-8 md:py-2 bg-amber-400 border-b-4 border-amber-600 rounded-xl text-base md:text-xl font-black text-amber-950 uppercase tracking-widest flex items-center gap-2 active:translate-y-1 active:border-b-0 transition-all shadow-lg shadow-amber-500/20"
               >
                  <span>DROP 1</span>
                  <span className="text-2xl md:text-3xl">🍯</span>
               </motion.button>
            )}

            {phase === 3 && (
               <motion.div
                  key="btn-done"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-600/30 border-2 md:border-4 border-green-500 px-6 py-1 md:px-8 md:py-2 rounded-full text-green-300 font-black text-xl md:text-3xl tracking-widest drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] flex items-center gap-2"
               >
                  <span>10 + {target - 10} = {target}</span>
                  <span className="text-2xl md:text-3xl">🐝</span>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
};

export default HoneybeeHiveGame;
