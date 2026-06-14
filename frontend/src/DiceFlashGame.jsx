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
    className={`w-3 h-3 md:w-5 md:h-5 rounded-full flex items-center justify-center ${isStar ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'bg-slate-800 shadow-inner'}`}
  >
    {isStar && (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-white">
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
    <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.4),inset_0_-4px_0_rgba(200,200,200,0.5)] border border-slate-200 grid grid-cols-3 grid-rows-3 p-2 md:p-3 gap-1 relative z-10">
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

  let w1 = target === 1 ? 2 : target - 1;
  let w2 = target === 6 ? 5 : target + 1;
  if (w1 === w2) w2 = (w1 + 1) % 6 + 1;
  const choices = [target, w1, w2].sort((a, b) => a - b);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden touch-none select-none bg-slate-950 font-sans pb-2 md:pb-4">
      
      {/* Background Stage */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black pointer-events-none"></div>
      
      {/* Stage Curtains (CSS Shapes) */}
      <div className="absolute top-0 left-0 w-1/4 h-full bg-red-900/40 border-r-4 border-red-700/50 rounded-br-[100px] shadow-2xl pointer-events-none transform -skew-x-6 origin-top-left"></div>
      <div className="absolute top-0 right-0 w-1/4 h-full bg-red-900/40 border-l-4 border-red-700/50 rounded-bl-[100px] shadow-2xl pointer-events-none transform skew-x-6 origin-top-right"></div>
      
      {phase === 4 && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={500} gravity={0.3} colors={['#fbbf24', '#fef08a', colorHex, '#ffffff']} />}

      <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 pt-2 md:pt-4">
        
        {/* The Magic Table */}
        <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-[150%] max-w-4xl h-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/80 to-transparent rounded-[100%] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-0 pointer-events-none"></div>

        {/* The Hat & Die Container */}
        <div className="relative flex flex-col items-center justify-end h-48 md:h-64 w-48 md:w-64 z-20">
          
          {/* The Die */}
          <div className="absolute bottom-6 z-10">
            <DieFace value={target} isStar={phase === 4} />
          </div>

          {/* The Magician's Hat */}
          <motion.div
            initial={{ y: 0 }}
            animate={
              phase === 1 ? { y: 0 } :
              phase === 2 ? { y: -100 } : // Lift up to reveal
              phase === 3 ? { y: 0 } :    // Drop down to hide
              phase === 4 ? { y: -250, rotate: 15, opacity: 0 } : // Fly off
              { y: 0 }
            }
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="absolute bottom-0 z-30 flex flex-col items-center drop-shadow-2xl"
          >
            {/* Top of Hat */}
            <div className="w-24 h-32 md:w-32 md:h-40 rounded-t-lg relative" style={{ backgroundColor: colorHex }}>
              {/* Hat Band */}
              <div className="absolute bottom-1 w-full h-6 bg-black/80 flex items-center justify-center">
                <div className="w-3 h-5 border-2 border-yellow-500 rounded-sm"></div>
              </div>
            </div>
            {/* Brim */}
            <div className="w-40 h-6 md:w-48 md:h-8 rounded-[50%] -mt-3 shadow-[0_10px_20px_rgba(0,0,0,0.5)]" style={{ backgroundColor: colorHex, borderBottom: '3px solid rgba(0,0,0,0.3)' }}></div>
          </motion.div>

        </div>

        {/* Phase 1: Reveal Button */}
        <div className="h-16 mt-4 flex items-center justify-center z-40">
          <AnimatePresence mode="wait">
            {phase === 1 && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReveal}
                className="px-6 py-2 md:px-8 md:py-4 bg-gradient-to-b from-yellow-400 to-amber-600 text-amber-950 font-black text-lg md:text-xl rounded-full shadow-[0_5px_15px_rgba(251,191,36,0.5)] border-2 border-yellow-200 tracking-widest uppercase"
              >
                TAP TO REVEAL!
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Phase 3: Choice Cards */}
      <div className="w-full max-w-xl px-2 flex justify-center gap-2 md:gap-6 z-40 min-h-[80px] md:min-h-[100px]">
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
              className="w-16 h-20 md:w-24 md:h-28 flex items-center justify-center rounded-xl border-4 border-slate-600 shadow-xl overflow-hidden relative group disabled:cursor-not-allowed"
            >
              {/* Highlight sweep effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span className="text-3xl md:text-5xl font-black text-white drop-shadow-md z-10">{choice}</span>
              
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
