import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function GreedyGatorGame({ dataStr, onCorrect }) {
  const asset = JSON.parse(dataStr);
  const [playCrunch] = useSound('/audio/crunch.mp3', { volume: 0.7 });
  const [playBuzzer] = useSound('/audio/error-buzz.mp3', { volume: 0.5 });
  const { width, height } = useWindowSize();
  
  const [gatorState, setGatorState] = useState('waiting'); // 'waiting', 'eating_left', 'eating_right'
  const [shakeLeft, setShakeLeft] = useState(false);
  const [shakeRight, setShakeRight] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const leftCount = asset.leftCount;
  const rightCount = asset.rightCount;
  const itemEmoji = asset.itemEmoji;

  const handleLeftClick = () => {
    if (gatorState !== 'waiting') return;
    if (leftCount > rightCount) {
      setGatorState('eating_left');
      playCrunch();
      setShowConfetti(true);
      setTimeout(() => onCorrect(), 2500);
    } else {
      playBuzzer();
      setShakeLeft(true);
      setTimeout(() => setShakeLeft(false), 500);
    }
  };

  const handleRightClick = () => {
    if (gatorState !== 'waiting') return;
    if (rightCount > leftCount) {
      setGatorState('eating_right');
      playCrunch();
      setShowConfetti(true);
      setTimeout(() => onCorrect(), 2500);
    } else {
      playBuzzer();
      setShakeRight(true);
      setTimeout(() => setShakeRight(false), 500);
    }
  };

  // Helper to render treats in a random scattered pile
  const renderTreats = (count) => {
    return Array.from({ length: count }).map((_, i) => {
      // random pos within a bounding box
      const top = 10 + Math.random() * 60;
      const left = 10 + Math.random() * 60;
      const rotation = Math.random() * 45 - 22.5;
      return (
        <div 
          key={i}
          className="absolute text-4xl md:text-6xl select-none pointer-events-none drop-shadow-md"
          style={{ top: `${top}%`, left: `${left}%`, transform: `rotate(${rotation}deg)` }}
        >
          {itemEmoji}
        </div>
      );
    });
  };

  // Determine Gator styling based on state
  let gatorScale = 1;
  let gatorRotate = 0;
  if (gatorState === 'eating_left') {
    gatorScale = 1.8;
    gatorRotate = -30;
  } else if (gatorState === 'eating_right') {
    gatorScale = 1.8;
    gatorRotate = 30; // 🐊 by default faces left-ish, so maybe flip horizontally for right?
  }
  
  const gatorFlip = gatorState === 'eating_right' ? -1 : 1;

  return (
    <div className="relative w-full h-full flex flex-row items-center justify-between p-4 md:p-12 overflow-hidden bg-gradient-to-b from-green-300 to-green-500 rounded-xl">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}
      
      {/* Left Pile */}
      <motion.div 
        onClick={handleLeftClick}
        animate={shakeLeft ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative w-1/3 h-64 bg-white/30 backdrop-blur-sm rounded-full border-4 border-white/50 cursor-pointer hover:bg-white/40 active:scale-95 transition-all shadow-xl"
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
          {gatorState === 'waiting' ? '🐊' : '🦖'} {/* Using T-Rex as "open mouth" if needed, or stick to 🐊 */}
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
      </motion.div>

      {/* Right Pile */}
      <motion.div 
        onClick={handleRightClick}
        animate={shakeRight ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative w-1/3 h-64 bg-white/30 backdrop-blur-sm rounded-full border-4 border-white/50 cursor-pointer hover:bg-white/40 active:scale-95 transition-all shadow-xl"
      >
        <AnimatePresence>
          {gatorState !== 'eating_right' && renderTreats(rightCount)}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
