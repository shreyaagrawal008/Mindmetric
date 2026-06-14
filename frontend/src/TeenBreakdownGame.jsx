import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const playZapSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator for the "zap" tone
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    
    // Create gain node for the envelope
    const gainNode = audioCtx.createGain();
    
    // Connect nodes
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Pitch sweep (starts high, drops fast)
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    
    // Volume envelope (sharp attack, quick decay)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const TenRod = () => (
  <div className="flex flex-col gap-0.5 p-1 bg-fuchsia-900/50 border-2 border-fuchsia-500 rounded-lg shadow-[0_0_15px_rgba(217,70,239,0.5)]">
    {Array.from({length: 10}).map((_, i) => (
      <div key={i} className="w-6 h-3 md:w-8 md:h-4 bg-fuchsia-400 rounded-sm border border-fuchsia-200 shadow-inner"></div>
    ))}
  </div>
);

const SingleGem = () => (
  <div className="w-6 h-6 md:w-8 md:h-8 bg-cyan-400 rounded-full border-2 border-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.8)] relative overflow-hidden">
    <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-70"></div>
  </div>
);

const TeenBreakdownGame = ({ dataStr, onVictory, onCorrectSound, onErrorSound }) => {
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState(1); // 1: playing, 2: success
  const [placedRods, setPlacedRods] = useState(0);
  const [placedGems, setPlacedGems] = useState(0);
  const [showError, setShowError] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        setData(JSON.parse(dataStr));
        setPhase(1);
        setPlacedRods(0);
        setPlacedGems(0);
        setShowError(false);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  // Check for win condition whenever pieces change
  useEffect(() => {
    if (data && phase === 1) {
      const currentTotal = placedRods * 10 + placedGems;
      if (currentTotal === data.target && placedRods === 1 && placedGems === data.target - 10) {
        setPhase(2);
        playZapSound();
        setTimeout(() => {
          if (onVictory) onVictory();
        }, 3500);
      }
    }
  }, [placedRods, placedGems, data, phase, onVictory]);

  const handleTapRod = () => {
    if (phase !== 1) return;
    if (placedRods >= 1) {
      // Allow them to remove it
      setPlacedRods(0);
    } else {
      setPlacedRods(1);
      if (onCorrectSound) onCorrectSound();
    }
  };

  const handleTapGem = () => {
    if (phase !== 1) return;
    if (placedGems >= 9) {
      if (onErrorSound) onErrorSound();
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }
    setPlacedGems(prev => prev + 1);
    if (onCorrectSound) onCorrectSound();
  };

  const handleRemoveGem = () => {
    if (phase !== 1 || placedGems <= 0) return;
    setPlacedGems(prev => prev - 1);
  };

  if (!data) return null;
  const { target, potionName } = data;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden touch-none select-none bg-slate-950 font-sans">
      
      {/* Magical Background Details */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-slate-900 to-slate-950 pointer-events-none"></div>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(192, 38, 211, 0.15) 0%, transparent 50%)' }}></div>

      {phase === 2 && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={600} gravity={0.3} colors={['#d946ef', '#c026d3', '#22d3ee', '#fbbf24']} />}

      {/* Main Play Area */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-start pt-2 md:pt-4 relative z-10 px-4">
        
        {/* The Target Flask */}
        <div className="relative flex flex-col items-center mb-2 md:mb-4">
           <motion.div 
             animate={phase === 2 ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : { y: [0, -5, 0] }}
             transition={phase === 2 ? { duration: 0.5 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
             className={`w-24 h-32 md:w-32 md:h-40 relative flex items-end justify-center pb-4 z-20 ${phase === 2 ? 'drop-shadow-[0_0_50px_rgba(217,70,239,0.8)]' : 'drop-shadow-[0_0_20px_rgba(217,70,239,0.4)]'}`}
           >
              {/* Flask SVG Shape */}
              <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full drop-shadow-xl" preserveAspectRatio="none">
                 <path d="M40 0 L60 0 L60 40 L90 100 C95 110, 85 120, 50 120 C15 120, 5 110, 10 100 L40 40 Z" fill="rgba(30, 41, 59, 0.8)" stroke="#d946ef" strokeWidth="4" />
                 <path d="M42 45 L58 45 L85 98 C88 105, 80 115, 50 115 C20 115, 12 105, 15 98 Z" fill="url(#potionGrad)" />
                 <defs>
                    <linearGradient id="potionGrad" x1="0" y1="1" x2="0" y2="0">
                       <stop offset="0%" stopColor="#c026d3" />
                       <stop offset="100%" stopColor="#f472b6" />
                    </linearGradient>
                 </defs>
              </svg>
              
              <div className="relative z-30 flex flex-col items-center">
                 {phase === 2 ? (
                    <span className="text-2xl md:text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]">
                       10 + {target - 10} = {target}
                    </span>
                 ) : (
                    <>
                       <span className="text-[10px] md:text-xs font-bold text-fuchsia-200 tracking-widest uppercase mb-0 md:mb-1 opacity-80">{potionName}</span>
                       <span className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{target}</span>
                    </>
                 )}
              </div>
           </motion.div>
        </div>

        {/* The Pedestals Container */}
        <div className="flex flex-row gap-4 md:gap-16 w-full max-w-3xl justify-center">
           
           {/* Pedestal A: Groups of 10 */}
           <div className="flex flex-col items-center flex-1">
              <div className="h-32 md:h-44 w-full bg-slate-900/60 border-2 border-fuchsia-900 rounded-t-2xl relative flex items-end justify-center p-2 md:p-4">
                 <AnimatePresence>
                    {placedRods > 0 && (
                       <motion.div
                          initial={{ y: -50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          onClick={handleTapRod}
                          className="cursor-pointer"
                       >
                          <TenRod />
                       </motion.div>
                    )}
                 </AnimatePresence>
                 {placedRods === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold opacity-50 pointer-events-none text-center px-2 text-xs md:text-sm">Tap 10-Rod to place</div>}
              </div>
              <div className="w-full py-1 bg-gradient-to-b from-fuchsia-900 to-slate-900 border-t-4 border-fuchsia-500 rounded-b-xl shadow-[0_5px_15px_rgba(217,70,239,0.3)] text-center">
                 <span className="text-fuchsia-200 font-bold text-xs md:text-base tracking-wider">GROUPS OF 10</span>
              </div>
           </div>

           {/* Pedestal B: Extra Ones */}
           <div className="flex flex-col items-center flex-1 relative">
              <AnimatePresence>
                 {showError && (
                    <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: -20 }}
                       exit={{ opacity: 0 }}
                       className="absolute -top-16 bg-red-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold shadow-xl z-50 text-center border-2 border-red-300 w-full"
                    >
                       Too crowded! Bundle 10 into a rod first!
                       <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 rotate-45 border-r-2 border-b-2 border-red-300"></div>
                    </motion.div>
                 )}
              </AnimatePresence>

              <div className={`h-32 md:h-44 w-full bg-slate-900/60 border-2 rounded-t-2xl relative flex items-center justify-center p-2 transition-colors ${showError ? 'border-red-500 bg-red-900/20' : 'border-cyan-900'}`}>
                 
                 <div className="w-full h-full flex flex-wrap-reverse content-start justify-center gap-1 md:gap-2">
                    <AnimatePresence>
                       {Array.from({length: placedGems}).map((_, i) => (
                          <motion.div
                             key={`gem-${i}`}
                             initial={{ scale: 0 }}
                             animate={{ scale: 1 }}
                             exit={{ scale: 0, opacity: 0 }}
                             onClick={handleRemoveGem}
                             className="cursor-pointer"
                          >
                             <SingleGem />
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>
                 {placedGems === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-bold opacity-50 pointer-events-none text-center px-2 text-xs md:text-sm">Tap Gems to place</div>}

              </div>
              <div className="w-full py-1 bg-gradient-to-b from-cyan-900 to-slate-900 border-t-4 border-cyan-500 rounded-b-xl shadow-[0_5px_15px_rgba(34,211,238,0.3)] text-center">
                 <span className="text-cyan-200 font-bold text-xs md:text-base tracking-wider">EXTRA ONES</span>
              </div>
           </div>

        </div>
      </div>

      {/* Inventory Action Bar */}
      <div className="w-full h-20 md:h-24 bg-slate-900 border-t-4 border-slate-700 flex items-center justify-center gap-8 md:gap-16 shadow-[0_-10px_25px_rgba(0,0,0,0.8)] z-40 px-4 pb-2">
         
         {/* 10-Rod Inventory Button */}
         <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTapRod}
            className="flex flex-col items-center justify-center p-1 md:p-2 bg-slate-800 rounded-xl border-2 border-slate-600 shadow-lg relative overflow-hidden group w-24 md:w-32"
         >
            <div className="absolute inset-0 bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20 transition-colors"></div>
            <TenRod />
            <span className="mt-1 md:mt-2 text-fuchsia-300 font-bold text-[10px] md:text-xs tracking-widest bg-slate-900 px-2 py-1 rounded-md">ADD ROD</span>
         </motion.button>

         {/* Single Gem Inventory Button */}
         <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTapGem}
            className="flex flex-col items-center justify-center p-1 md:p-2 bg-slate-800 rounded-xl border-2 border-slate-600 shadow-lg relative overflow-hidden group w-24 md:w-32"
         >
            <div className="absolute inset-0 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors"></div>
            <SingleGem />
            <span className="mt-1 md:mt-2 text-cyan-300 font-bold text-[10px] md:text-xs tracking-widest bg-slate-900 px-2 py-1 rounded-md">ADD GEM</span>
         </motion.button>

      </div>

    </div>
  );
};

export default TeenBreakdownGame;
