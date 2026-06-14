import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const playSciFiSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator for the "success" chime
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Rapid sci-fi arpeggio
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.setValueAtTime(554, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.2);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playDoorSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    const gainNode = audioCtx.createGain();
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const Dot = () => (
  <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] border-2 border-cyan-200"></div>
);

const DominoHalf = ({ value }) => {
  const getDotPositions = () => {
    switch (value) {
      case 1: return [4];
      case 2: return [2, 6];
      case 3: return [2, 4, 6];
      case 4: return [0, 2, 6, 8];
      case 5: return [0, 2, 4, 6, 8];
      case 6: return [0, 2, 3, 5, 6, 8];
      default: return [];
    }
  };
  const positions = getDotPositions();

  return (
    <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-800 rounded-lg shadow-inner border-2 border-slate-600 grid grid-cols-3 grid-rows-3 p-1.5 md:p-2.5 gap-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none"></div>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          {positions.includes(i) && <Dot />}
        </div>
      ))}
    </div>
  );
};

const CargoBayDoors = ({ isOpen }) => (
  <div className="absolute inset-0 overflow-hidden rounded-xl border-4 border-slate-700 pointer-events-none z-30">
    {/* Left Door */}
    <motion.div 
      initial={false}
      animate={{ x: isOpen ? '-100%' : '0%' }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="absolute top-0 left-0 w-[51%] h-full bg-slate-800 border-r-4 border-slate-600 flex flex-col justify-center items-end pr-2 shadow-2xl"
    >
      <div className="w-4 h-16 bg-amber-500/80 rounded flex flex-col justify-between py-1 px-0.5">
        <div className="w-full h-[2px] bg-black/40"></div>
        <div className="w-full h-[2px] bg-black/40"></div>
        <div className="w-full h-[2px] bg-black/40"></div>
      </div>
    </motion.div>
    
    {/* Right Door */}
    <motion.div 
      initial={false}
      animate={{ x: isOpen ? '100%' : '0%' }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="absolute top-0 right-0 w-[51%] h-full bg-slate-800 border-l-4 border-slate-600 flex flex-col justify-center items-start pl-2 shadow-2xl"
    >
      <div className="w-4 h-16 bg-amber-500/80 rounded flex flex-col justify-between py-1 px-0.5">
        <div className="w-full h-[2px] bg-black/40"></div>
        <div className="w-full h-[2px] bg-black/40"></div>
        <div className="w-full h-[2px] bg-black/40"></div>
      </div>
    </motion.div>
  </div>
);

const DominosFlashGame = ({ dataStr, onVictory, onCorrectSound, onErrorSound }) => {
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState(1); // 1: start, 2: flashing, 3: choice, 4: success
  const [wrongShake, setWrongShake] = useState(null);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        setData(parsed);
        setPhase(1);
        setWrongShake(null);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  const handleReveal = () => {
    if (phase !== 1) return;
    playDoorSound();
    setPhase(2);
    // Doors open for exactly 1.5 seconds
    setTimeout(() => {
      playDoorSound();
      setPhase(3);
    }, 1500);
  };

  const handleChoice = (choice) => {
    if (phase !== 3) return;
    if (choice === data.target) {
      if (onCorrectSound) onCorrectSound();
      playSciFiSound();
      playDoorSound(); // doors open again
      setPhase(4);
      setTimeout(() => {
        if (onVictory) onVictory();
      }, 3500);
    } else {
      if (onErrorSound) onErrorSound();
      setWrongShake(choice);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  if (!data) return null;
  const { target, left, right, sector } = data;

  // Determine choices
  let w1 = target === 3 ? 4 : target - 1;
  let w2 = target === 9 ? 8 : target + 1;
  if (w1 === w2) w2 = target + 2;
  const choices = [target, w1, w2].sort((a, b) => a - b);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden touch-none select-none bg-slate-950 font-sans pb-2 md:pb-4">
      
      {/* Sci-Fi Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none"></div>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {phase === 4 && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={500} gravity={0.3} colors={['#22d3ee', '#06b6d4', '#0891b2', '#ffffff']} />}

      <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 pt-2 md:pt-4">
        
        {/* Sector Tag */}
        <div className="absolute top-4 left-4 bg-slate-800 border border-cyan-500/50 px-3 py-1 rounded shadow-[0_0_10px_rgba(34,211,238,0.2)] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-cyan-400 font-mono text-xs md:text-sm font-bold uppercase tracking-widest">Sector {sector}</span>
        </div>

        {/* Cargo Bay Chamber */}
        <div className="relative flex items-center justify-center w-[280px] h-[160px] md:w-[400px] md:h-[220px] bg-slate-900 rounded-xl border-4 border-slate-700 shadow-[0_0_30px_rgba(0,0,0,1)_inset]">
          
          <CargoBayDoors isOpen={phase === 2 || phase === 4} />

          {/* The Domino inside the Chamber */}
          <div className="relative flex items-center justify-center w-full h-full p-4">
            
            <div className="relative flex items-center justify-center bg-slate-300 rounded-xl md:rounded-2xl shadow-xl p-1 md:p-2 border-2 md:border-4 border-slate-400">
              
              <motion.div 
                animate={phase === 4 ? { x: -40 } : { x: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="z-10"
              >
                <DominoHalf value={left} />
              </motion.div>
              
              <AnimatePresence>
                {phase === 4 && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute z-0 text-3xl md:text-5xl font-black text-slate-800"
                  >
                    +
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Center Divider Line (disappears in phase 4) */}
              <AnimatePresence>
                {phase !== 4 && (
                  <motion.div 
                    exit={{ opacity: 0, width: 0 }}
                    className="w-1 md:w-2 h-14 md:h-20 bg-slate-400 mx-1 md:mx-2 rounded-full shadow-inner z-10"
                  ></motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                animate={phase === 4 ? { x: 40 } : { x: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="z-10"
              >
                <DominoHalf value={right} />
              </motion.div>

            </div>

            {/* Equals Result (Appears Below in Phase 4) */}
            <AnimatePresence>
              {phase === 4 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 80, opacity: 1 }}
                  className="absolute bottom-0 text-3xl md:text-5xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] z-20"
                >
                  = {target}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Phase 1: Reveal Button */}
        <div className="h-16 mt-6 md:mt-8 flex items-center justify-center z-40">
          <AnimatePresence mode="wait">
            {phase === 1 && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReveal}
                className="px-6 py-2 md:px-8 md:py-4 bg-cyan-600/20 text-cyan-400 font-mono font-black text-lg md:text-xl rounded shadow-[0_0_15px_rgba(34,211,238,0.4)] border border-cyan-400 tracking-widest uppercase hover:bg-cyan-600/40 transition-colors"
              >
                INITIATE SCAN
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Phase 3: Choice Buttons */}
      <div className="w-full max-w-2xl px-2 flex justify-center gap-4 md:gap-8 z-40 min-h-[80px] md:min-h-[100px]">
        <AnimatePresence>
          {(phase === 3 || phase === 4) && choices.map((choice, i) => (
            <motion.button
              key={choice}
              initial={{ y: 50, opacity: 0 }}
              animate={
                wrongShake === choice
                  ? { x: [-10, 10, -10, 10, 0], backgroundColor: '#991b1b', borderColor: '#ef4444', color: '#fca5a5' }
                  : { y: 0, opacity: 1, backgroundColor: '#0f172a', borderColor: '#334155', color: '#94a3b8' }
              }
              exit={{ y: 50, opacity: 0 }}
              transition={{ delay: phase === 3 ? i * 0.1 : 0, duration: wrongShake === choice ? 0.4 : 0.3 }}
              onClick={() => handleChoice(choice)}
              disabled={phase !== 3}
              className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center rounded border-2 md:border-4 shadow-[0_5px_20px_rgba(0,0,0,0.5)] overflow-hidden relative group disabled:cursor-not-allowed font-mono transition-colors"
              style={phase === 4 && choice === target ? { backgroundColor: '#164e63', borderColor: '#22d3ee', color: '#cffafe', boxShadow: '0 0 20px rgba(34,211,238,0.5)' } : {}}
            >
              {/* Highlight sweep effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span className="text-4xl md:text-5xl font-black z-10 drop-shadow-md">{choice}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default DominosFlashGame;
