import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

export default function NumberComparisonGame({ dataStr, answerStr, onVictory, onCorrectSound, onErrorSound }) {
  const [data, setData] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, correct, incorrect
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!dataStr) return;
    try {
      setData(JSON.parse(dataStr));
    } catch (e) {
      console.error("Failed to parse NumberComparisonGame data", e);
    }
  }, [dataStr]);

  if (!data) return null;

  const { num1, num2, mode } = data;
  const isSelectionMode = mode === 'selection';

  const handleChoice = (choice) => {
    if (gameState !== 'waiting') return;
    
    setSelectedChoice(choice);
    
    if (choice === answerStr) {
      setGameState('correct');
      if (onCorrectSound) onCorrectSound();
      setShowConfetti(true);
      setTimeout(() => {
        if (onVictory) onVictory();
      }, 3000);
    } else {
      setGameState('incorrect');
      if (onErrorSound) onErrorSound();
      setTimeout(() => {
        setGameState('waiting');
        setSelectedChoice(null);
      }, 800);
    }
  };

  // Card classes
  const getCardClass = (side) => {
    const base = "w-40 h-56 md:w-56 md:h-72 rounded-3xl flex items-center justify-center text-7xl md:text-9xl font-black drop-shadow-xl border-8 transition-all duration-300";
    if (isSelectionMode) {
      if (gameState === 'correct' && selectedChoice === side) {
        return `${base} bg-green-500 border-white text-white scale-110`;
      }
      if (gameState === 'incorrect' && selectedChoice === side) {
        return `${base} bg-red-500 border-white text-white animate-shake`;
      }
      return `${base} bg-white border-blue-400 text-blue-600 hover:scale-105 hover:bg-blue-50 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.3)]`;
    } else {
      // In True/False mode, cards are static
      return `${base} bg-white border-gray-200 text-gray-700 opacity-90`;
    }
  };

  // Button classes for True/False mode
  const getBtnClass = (btnType) => {
    const base = "w-40 md:w-56 py-6 md:py-8 rounded-full flex items-center justify-center text-4xl md:text-5xl font-bold drop-shadow-xl border-4 transition-all duration-300 cursor-pointer text-white";
    if (gameState === 'correct' && selectedChoice === btnType) {
      return `${base} bg-green-500 border-white scale-110`;
    }
    if (gameState === 'incorrect' && selectedChoice === btnType) {
      return `${base} bg-red-500 border-white animate-shake`;
    }
    
    if (btnType === 'YES') {
      return `${base} bg-emerald-500 border-emerald-300 hover:bg-emerald-400 hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)]`;
    } else {
      return `${base} bg-rose-500 border-rose-300 hover:bg-rose-400 hover:scale-105 shadow-[0_0_20px_rgba(244,63,94,0.4)]`;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 gap-12 touch-none">
      {showConfetti && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={300} gravity={0.2} />}
      
      {/* Central Number Cards */}
      <div className="flex flex-row items-center justify-center gap-10 md:gap-24 relative z-10">
        <motion.div 
          className={getCardClass('LEFT')}
          onClick={() => isSelectionMode ? handleChoice('LEFT') : null}
          whileHover={isSelectionMode && gameState === 'waiting' ? { scale: 1.05 } : {}}
          animate={gameState === 'correct' && selectedChoice === 'LEFT' ? { scale: [1, 1.15, 1.1] } : {}}
        >
          {num1}
        </motion.div>
        
        <div className="text-white text-5xl md:text-7xl font-bold opacity-50 drop-shadow-md">
          vs
        </div>
        
        <motion.div 
          className={getCardClass('RIGHT')}
          onClick={() => isSelectionMode ? handleChoice('RIGHT') : null}
          whileHover={isSelectionMode && gameState === 'waiting' ? { scale: 1.05 } : {}}
          animate={gameState === 'correct' && selectedChoice === 'RIGHT' ? { scale: [1, 1.15, 1.1] } : {}}
        >
          {num2}
        </motion.div>
      </div>

      {/* Control Deck for True/False Mode */}
      {!isSelectionMode && (
        <div className="flex flex-row items-center justify-center gap-8 md:gap-16 mt-8 z-10">
          <motion.div 
            className={getBtnClass('YES')}
            onClick={() => handleChoice('YES')}
            whileHover={gameState === 'waiting' ? { scale: 1.05 } : {}}
            animate={gameState === 'correct' && selectedChoice === 'YES' ? { scale: [1, 1.15, 1.1] } : {}}
          >
            👍 YES
          </motion.div>
          
          <motion.div 
            className={getBtnClass('NO')}
            onClick={() => handleChoice('NO')}
            whileHover={gameState === 'waiting' ? { scale: 1.05 } : {}}
            animate={gameState === 'correct' && selectedChoice === 'NO' ? { scale: [1, 1.15, 1.1] } : {}}
          >
            👎 NO
          </motion.div>
        </div>
      )}
    </div>
  );
}
