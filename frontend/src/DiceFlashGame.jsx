import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const playMagicSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator for the "tada" tone
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    
    // Create gain node for the envelope
    const gainNode = audioCtx.createGain();
    
    // Connect nodes
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Pitch sweep (starts low, sweeps high)
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.4);
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const getHatColor = (colorName) => {
  switch (colorName) {
    case 'Crimson': return '#dc2626'; // red-600
    case 'Cobalt': return '#2563eb'; // blue-600
    case 'Violet': return '#7c3aed'; // violet-600
    case 'Emerald': return '#059669'; // emerald-600
    case 'Onyx': return '#1e293b'; // slate-800
    default: return '#7c3aed';
  }
};

const Dot = ({ isStar, delay }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1, rotate: isStar ? 360 : 0 }}
    transition={{ duration: 0.3, delay }}
    className={`w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center ${isStar ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'bg-slate-800 shadow-inner'}`}
  >
    {isStar && (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-white">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )}
  </motion.div>
);

const DieFace = ({ value, isStar }) => {
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
    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.4),inset_0_-4px_0_rgba(200,200,200,0.5)] border border-slate-200 grid grid-cols-3 grid-rows-3 p-3 md:p-4 gap-1 md:gap-2 relative z-10">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          {positions.includes(i) && <Dot isStar={isStar} delay={isStar ? positions.indexOf(i) * 0.1 : 0} />}
        </div>
      ))}
    </div>
  );
};

const DiceFlashGame = ({ dataStr, onVictory, onCorrectSound, onErrorSound }) => {
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState(1); // 1: start, 2: flashing, 3: choice, 4: success
  const [wrongShake, setWrongShake] = useState(null);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        // The DataSeeder format gives options in the main object, but wait, the generic player passes assetValue.
        // We will need the options from the parent component or we can generate them from target.
        // Wait, the parent passes dataStr as `currentQuestion.assetValue`. The options are in `currentQuestion.options`.
        // I will just parse options from the data if they are not there, I will just generate them from the target.
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
    setPhase(2);
    // The hat lifts for 1.5 seconds, then drops
    setTimeout(() => {
      setPhase(3);
    }, 1500);
  };

  const handleChoice = (choice) => {
    if (phase !== 3) return;
    if (choice === data.target) {
      if (onCorrectSound) onCorrectSound();
      playMagicSound();
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
  const { target, hatColor } = data;
  const colorHex = getHatColor(hatColor);

  // Generate 3 choices (target, +1, -1) if parent didn't pass options inside data string
  // Let's generate them deterministically based on target to match DataSeeder's logic
  let w1 = target === 1 ? 2 : target - 1;
  let w2 = target === 6 ? 5 : target + 1;
  if (w1 === w2) w2 = (w1 + 1) % 6 + 1;
  const choices = [target, w1, w2].sort((a, b) => a - b);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden touch-none select-none bg-slate-950 font-sans pb-4 md:pb-8">
      
      {/* Background Stage */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none"></div>
      
      {/* Stage Curtains (CSS Shapes) */}
      <div className="absolute top-0 left-0 w-1/4 h-full bg-red-900/40 border-r-4 border-red-700/50 rounded-br-[100px] shadow-2xl pointer-events-none transform -skew-x-6 origin-top-left"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-red-900/40 border-l-4 border-red-700/50 rounded-bl-[100px] shadow-2xl pointer-events-none transform skew-x-6 origin-top-right"></div>
      
      {phase === 4 && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={500} gravity={0.3} colors={['#fbbf24', '#fef08a', colorHex, '#ffffff']} />}

      <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 pt-10">
        
        {/* The Magic Table */}
        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-[150%] max-w-4xl h-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/80 to-transparent rounded-[100%] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-0 pointer-events-none"></div>

        {/* The Hat & Die Container */}
        <div className="relative flex flex-col items-center justify-end h-64 md:h-80 w-64 md:w-80 z-20">
          
          {/* The Die */}
          <div className="absolute bottom-8 z-10">
            <DieFace value={target} isStar={phase === 4} />
          </div>

          {/* The Magician's Hat */}
          <motion.div
            initial={{ y: 0 }}
            animate={
              phase === 1 ? { y: 0 } :
              phase === 2 ? { y: -150 } : // Lift up to reveal
              phase === 3 ? { y: 0 } :    // Drop down to hide
              phase === 4 ? { y: -300, rotate: 15, opacity: 0 } : // Fly off
              { y: 0 }
            }
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="absolute bottom-0 z-30 flex flex-col items-center drop-shadow-2xl"
          >
            {/* Top of Hat */}
            <div className="w-32 h-40 md:w-40 md:h-48 rounded-t-lg relative" style={{ backgroundColor: colorHex }}>
              {/* Hat Band */}
              <div className="absolute bottom-2 w-full h-8 bg-black/80 flex items-center justify-center">
                <div className="w-4 h-6 border-2 border-yellow-500 rounded-sm"></div>
              </div>
            </div>
            {/* Brim */}
            <div className="w-48 h-8 md:w-56 md:h-10 rounded-[50%] -mt-4 shadow-[0_10px_20px_rgba(0,0,0,0.5)]" style={{ backgroundColor: colorHex, borderBottom: '4px solid rgba(0,0,0,0.3)' }}></div>
          </motion.div>

        </div>

        {/* Phase 1: Reveal Button */}
        <div className="h-24 mt-8 flex items-center justify-center z-40">
          <AnimatePresence mode="wait">
            {phase === 1 && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReveal}
                className="px-8 py-4 bg-gradient-to-b from-yellow-400 to-amber-600 text-amber-950 font-black text-xl md:text-2xl rounded-full shadow-[0_5px_15px_rgba(251,191,36,0.5)] border-2 border-yellow-200 tracking-widest uppercase"
              >
                TAP TO REVEAL!
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Phase 3: Choice Cards */}
      <div className="w-full max-w-2xl px-4 flex justify-center gap-4 md:gap-8 z-40 min-h-[100px]">
        <AnimatePresence>
          {(phase === 3 || phase === 4) && choices.map((choice, i) => (
            <motion.button
              key={choice}
              initial={{ y: 50, opacity: 0 }}
              animate={
                wrongShake === choice
                  ? { x: [-10, 10, -10, 10, 0], backgroundColor: '#ef4444' }
                  : { y: 0, opacity: 1, backgroundColor: '#334155' }
              }
              exit={{ y: 50, opacity: 0 }}
              transition={{ delay: phase === 3 ? i * 0.1 : 0, duration: wrongShake === choice ? 0.4 : 0.3 }}
              onClick={() => handleChoice(choice)}
              disabled={phase !== 3}
              className="w-20 h-24 md:w-28 md:h-32 flex items-center justify-center rounded-xl border-4 border-slate-600 shadow-xl overflow-hidden relative group disabled:cursor-not-allowed"
            >
              {/* Highlight sweep effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span className="text-4xl md:text-6xl font-black text-white drop-shadow-md z-10">{choice}</span>
              
              {/* If it's the correct answer and we are in phase 4, highlight it green */}
              {phase === 4 && choice === target && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="absolute inset-0 bg-green-500 z-0" 
                />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default DiceFlashGame;
