import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const FuelCanister = ({ loaded }) => (
  <div className={`w-6 h-10 md:w-8 md:h-12 border-2 ${loaded ? 'bg-green-500 border-green-300 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-slate-800 border-slate-600'} rounded-md relative overflow-hidden transition-all duration-300`}>
    <div className={`absolute bottom-0 w-full bg-green-400 opacity-50 transition-all duration-500 ${loaded ? 'h-full' : 'h-0'}`}></div>
    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-300/50 rounded-sm"></div>
    {loaded && (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-black text-green-950"
      >
        ⚡
      </motion.div>
    )}
  </div>
);

const playRocketSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 2.5; // 2.5 seconds of noise
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Use a lowpass filter to create a deep rumble that gets brighter
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, audioCtx.currentTime); // Deep start
    filter.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 1.5); // Roar

    // Volume envelope
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.5); // Swell up during ignition
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5); // Hold during blast off
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2.5); // Fade out as it leaves

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseSource.start();
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const AstromazeRocketGame = ({ dataStr, onVictory, onCorrectSound, onErrorSound }) => {
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState(1);
  const [mainTankLoaded, setMainTankLoaded] = useState(false);
  const [auxDrops, setAuxDrops] = useState(0);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        setData(JSON.parse(dataStr));
        setPhase(1);
        setMainTankLoaded(false);
        setAuxDrops(0);
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
      setMainTankLoaded(true);
      if (onCorrectSound) onCorrectSound();
      setTimeout(() => setPhase(2), 600);
    }, 400);
  };

  const handleDrop1 = () => {
    if (phase !== 2) return;
    const nextDrops = auxDrops + 1;
    setAuxDrops(nextDrops);
    if (onCorrectSound) onCorrectSound();

    if (10 + nextDrops === data.target) {
      setPhase(2.5); // Ignition
      playRocketSound(); // Trigger the massive rocket roar!
      setTimeout(() => {
        setPhase(3); // Blast Off!
        setTimeout(() => {
          if (onVictory) onVictory();
        }, 3500);
      }, 1500);
    }
  };

  if (!data) return null;
  const { target, missionName } = data;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden touch-none select-none bg-slate-950 text-cyan-50">
      
      {/* Starfield Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>

      {phase === 3 && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={600} gravity={0.5} colors={['#22d3ee', '#10b981', '#fbbf24', '#f87171']} />}

      {/* Target Dashboard Display */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none w-full px-4">
        <div className="bg-slate-900 border-2 md:border-4 border-cyan-700 rounded-xl px-4 py-1 md:py-2 flex items-center gap-2 md:gap-4 shadow-[0_0_15px_rgba(8,145,178,0.5)]">
           <span className="text-xl md:text-3xl">🎯</span>
           <span className="text-cyan-400 font-mono text-sm md:text-lg uppercase tracking-widest">{missionName} Target</span>
           <span className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{target}</span>
        </div>
      </div>

      {/* Rocket Blast-Off Sequence */}
      <AnimatePresence>
         {phase >= 2.5 && (
            <motion.div
               initial={{ y: 0 }}
               animate={phase === 3 ? { y: -1000 } : { y: [0, 5, -5, 5, -5, 0] }}
               transition={phase === 3 ? { duration: 1.5, ease: "easeIn" } : { duration: 0.2, repeat: Infinity }}
               className="absolute z-0 flex flex-col items-center"
               style={{ top: '20%' }}
            >
               <div className="text-8xl md:text-9xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">🚀</div>
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={phase === 3 ? { height: 400, opacity: 1 } : { height: 100, opacity: 0.8 }}
                 className="w-12 bg-gradient-to-b from-yellow-300 via-orange-500 to-transparent blur-md rounded-full mt-[-20px]"
               ></motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Main Play Area */}
      <div className="flex-1 w-full max-w-4xl flex flex-row items-center justify-center gap-4 md:gap-16 relative z-10 pb-[60px] md:pb-[80px]">
        
        {/* Left Side: Main Fuel Tank (10-Group) */}
        <div className="relative flex flex-col items-center">
           <div className="text-cyan-500/50 font-black tracking-widest text-xs md:text-sm uppercase mb-2 z-0 font-mono">Main Tank</div>
           
           <div className={`relative p-2 md:p-6 rounded-2xl md:rounded-3xl transition-all duration-1000 ${mainTankLoaded ? 'bg-cyan-900/30 shadow-[0_0_30px_rgba(6,182,212,0.4)] border-2 md:border-4 border-cyan-400' : 'bg-slate-900/50 border-2 md:border-4 border-slate-700'}`}>
              
              {/* Internal Tank Grid */}
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
                 {Array.from({length: 10}).map((_, i) => (
                    <FuelCanister key={`main-${i}`} loaded={mainTankLoaded} />
                 ))}
              </div>

              {/* Locked overlay text */}
              <AnimatePresence>
                 {mainTankLoaded && (
                    <motion.div 
                       initial={{ opacity: 0, scale: 2 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
                       className="absolute inset-0 flex items-center justify-center z-30"
                    >
                       <div className="bg-slate-900/90 border-2 border-cyan-400 px-3 md:px-4 py-1 md:py-2 rounded-lg transform -rotate-6 shadow-2xl">
                          <span className="text-xl md:text-3xl font-black text-cyan-300 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                             10-PACK
                          </span>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>

        {/* Right Side: Auxiliary Deck (9 Slots) */}
        <div className="relative flex flex-col items-center">
           <div className="text-cyan-500/50 font-black tracking-widest text-xs md:text-sm uppercase mb-2 z-0 font-mono">Aux Deck</div>
           
           {/* Fixed 3x3 Grid for exactly 9 slots */}
           <div className="w-24 md:w-36 border-2 md:border-4 border-slate-600 bg-slate-900/80 rounded-xl relative p-2 z-20 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
              <div className="grid grid-cols-3 gap-1 md:gap-2 justify-items-center">
                 {Array.from({length: 9}).map((_, i) => (
                    <div key={`slot-${i}`} className="w-6 h-10 md:w-8 md:h-12 border-2 border-dashed border-slate-600 bg-slate-950 rounded-md relative flex items-center justify-center">
                       <AnimatePresence>
                          {i < auxDrops && (
                             <motion.div
                                initial={{ y: -50, opacity: 0, scale: 0.5 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                className="absolute inset-0"
                             >
                                <FuelCanister loaded={true} />
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>

      {/* Action Controls (Bottom Bar) */}
      <div className="absolute bottom-0 inset-x-0 h-16 md:h-20 bg-slate-900 border-t-2 md:border-t-4 border-slate-700 flex items-center justify-center shadow-[0_-5px_15px_rgba(0,0,0,0.8)] z-40">
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
                  className="px-4 py-2 md:px-8 md:py-2 bg-cyan-600 border-b-4 border-cyan-800 rounded-xl text-base md:text-xl font-black text-cyan-50 uppercase tracking-widest flex items-center gap-2 active:translate-y-1 active:border-b-0 transition-all shadow-lg font-mono"
               >
                  <span>LOAD TANK</span>
                  <span className="text-xl md:text-2xl">🔋</span>
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
                  className="px-4 py-2 md:px-8 md:py-2 bg-green-600 border-b-4 border-green-800 rounded-xl text-base md:text-xl font-black text-green-50 uppercase tracking-widest flex items-center gap-2 active:translate-y-1 active:border-b-0 transition-all shadow-lg font-mono"
               >
                  <span>ADD CELL</span>
                  <span className="text-xl md:text-2xl">⚡</span>
               </motion.button>
            )}

            {phase >= 2.5 && (
               <motion.div
                  key="btn-done"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-600/30 border-2 md:border-4 border-yellow-500 px-6 py-1 md:px-8 md:py-2 rounded-full text-yellow-300 font-black text-xl md:text-3xl tracking-widest drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] flex items-center gap-2 font-mono"
               >
                  <span>10 + {target - 10} = {target}</span>
                  <span className="text-2xl md:text-3xl">🚀</span>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

    </div>
  );
};

export default AstromazeRocketGame;
