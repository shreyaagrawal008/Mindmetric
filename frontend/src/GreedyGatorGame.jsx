import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

export default function GreedyGatorGame({ dataStr, onCorrect, onCorrectSound, onErrorSound }) {
  const asset = JSON.parse(dataStr);
  const crunchSoundRef = useRef(null);
  const buzzSoundRef = useRef(null);

  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playBuzz = () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      };
      buzzSoundRef.current = playBuzz;

      const playCrunch = () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
        
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.2);
        
        osc2.connect(gain);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start(); osc.stop(audioCtx.currentTime + 0.2);
        osc2.start(); osc2.stop(audioCtx.currentTime + 0.2);
      };
      crunchSoundRef.current = playCrunch;

    } catch(e) {
      console.log("AudioContext not supported");
    }
  }, []);

  const [windowDimension, setWindowDimension] = useState({width: window.innerWidth, height: window.innerHeight});
  useEffect(() => {
    const handleResize = () => setWindowDimension({width: window.innerWidth, height: window.innerHeight});
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [gatorState, setGatorState] = useState('waiting'); // 'waiting', 'eating_left', 'eating_right'
  const [shakeLeft, setShakeLeft] = useState(false);
  const [shakeRight, setShakeRight] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const leftCount = asset.leftCount;
  const rightCount = asset.rightCount;
  const itemEmoji = asset.itemEmoji;
  const askSymbol = asset.askSymbol || false;

  const handleLeftClick = () => {
    if (gatorState !== 'waiting') return;
    if (leftCount > rightCount) {
      setGatorState('eating_left');
      if (crunchSoundRef.current) crunchSoundRef.current();
      if (onCorrectSound) onCorrectSound();
      setShowConfetti(true);
      setTimeout(() => onCorrect(), 2500);
    } else {
      if (buzzSoundRef.current) buzzSoundRef.current();
      if (onErrorSound) onErrorSound();
      setShakeLeft(true);
      setTimeout(() => setShakeLeft(false), 500);
    }
  };

  const handleRightClick = () => {
    if (gatorState !== 'waiting') return;
    if (rightCount > leftCount) {
      setGatorState('eating_right');
      if (crunchSoundRef.current) crunchSoundRef.current();
      if (onCorrectSound) onCorrectSound();
      setShowConfetti(true);
      setTimeout(() => onCorrect(), 2500);
    } else {
      if (buzzSoundRef.current) buzzSoundRef.current();
      if (onErrorSound) onErrorSound();
      setShakeRight(true);
      setTimeout(() => setShakeRight(false), 500);
    }
  };

  // Helper to render treats in an organized, evenly spaced grid
  const renderTreats = (count) => {
    const textSize = count > 5 ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl';
    return (
      <div className="w-full h-full flex flex-wrap justify-center content-center gap-1 md:gap-2 p-2 md:p-4">
        {Array.from({ length: count }).map((_, i) => {
          const rotation = Math.random() * 20 - 10; // Slight random tilt for character
          return (
            <div 
              key={i}
              className={`${textSize} select-none pointer-events-none drop-shadow-md transition-all`}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {itemEmoji}
            </div>
          );
        })}
      </div>
    );
  };

  // Determine Gator styling based on state
  let gatorScale = 1;
  let gatorRotate = -90; // Windows alligator points UP, so -90 makes it face LEFT
  if (gatorState === 'eating_left') {
    gatorScale = 1.8;
    gatorRotate = -90; // Face left and lunges (scale handles the lunge)
  } else if (gatorState === 'eating_right') {
    gatorScale = 1.8;
    gatorRotate = 90; // Face right
  }
  
  const gatorFlip = gatorState === 'eating_right' ? -1 : 1;

  return (
    <div className="relative w-full h-full flex flex-row items-center justify-center gap-4 md:gap-12 p-4 md:p-12 overflow-hidden bg-gradient-to-b from-green-300 to-green-500 rounded-xl">
      {showConfetti && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={300} />}
      
      {/* Left Pile */}
      <motion.div 
        onClick={!askSymbol ? handleLeftClick : undefined}
        animate={shakeLeft ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`relative w-32 h-32 md:w-48 md:h-48 bg-white/30 backdrop-blur-sm rounded-full border-4 border-white/50 overflow-hidden transition-all shadow-xl ${!askSymbol ? 'cursor-pointer hover:bg-white/40 active:scale-95' : ''}`}
      >
        <AnimatePresence>
          {gatorState !== 'eating_left' && renderTreats(leftCount)}
        </AnimatePresence>
      </motion.div>

      {/* Center Gator */}
      <motion.div 
        className="relative z-10"
        animate={{ 
          scale: gatorScale, 
          rotate: gatorRotate, 
          scaleX: gatorFlip 
        }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        <div className="text-[6rem] md:text-[9rem] select-none filter drop-shadow-2xl">
          🐊
        </div>
        {gatorState === 'waiting' && (
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-12 -right-8 bg-white text-2xl px-4 py-2 rounded-2xl shadow-lg border-2 border-gray-200"
          >
            ❓
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white transform rotate-45 border-b-2 border-l-2 border-gray-200"></div>
          </motion.div>
        )}

        {/* Symbol Buttons for Advanced Tier */}
        {askSymbol && gatorState === 'waiting' && (
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-row gap-4">
            <button 
              onClick={handleLeftClick} 
              className="bg-white hover:bg-yellow-100 text-5xl font-bold py-2 px-6 rounded-2xl shadow-xl border-4 border-yellow-400 active:scale-95 transition-all text-green-700"
            >
              &gt;
            </button>
            <button 
              onClick={handleRightClick} 
              className="bg-white hover:bg-yellow-100 text-5xl font-bold py-2 px-6 rounded-2xl shadow-xl border-4 border-yellow-400 active:scale-95 transition-all text-green-700"
            >
              &lt;
            </button>
          </div>
        )}
      </motion.div>

      {/* Right Pile */}
      <motion.div 
        onClick={!askSymbol ? handleRightClick : undefined}
        animate={shakeRight ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`relative w-32 h-32 md:w-48 md:h-48 bg-white/30 backdrop-blur-sm rounded-full border-4 border-white/50 overflow-hidden transition-all shadow-xl ${!askSymbol ? 'cursor-pointer hover:bg-white/40 active:scale-95' : ''}`}
      >
        <AnimatePresence>
          {gatorState !== 'eating_right' && renderTreats(rightCount)}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
