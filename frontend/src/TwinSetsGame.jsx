import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const TwinSetsGame = ({ dataStr, onVictory, onCorrectSound, onErrorSound }) => {
  const [data, setData] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, correct, incorrect
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [placedSymbol, setPlacedSymbol] = useState(null); // '=', '≠'
  const [wiggleSymbol, setWiggleSymbol] = useState(false);

  const dropZoneRef = useRef(null);

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
      console.error("Failed to parse TwinSetsGame data", e);
    }
  }, [dataStr]);

  if (!data) return null;

  const { leftCount, rightCount, itemEmoji, isEqual } = data;
  const targetSymbol = isEqual ? '=' : '≠';

  const handleValidation = (chosenSymbol) => {
    if (gameState !== 'waiting') return;
    
    setPlacedSymbol(chosenSymbol);

    if (chosenSymbol === targetSymbol) {
      setGameState('correct');
      if (onCorrectSound) onCorrectSound();
      
      setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => {
          if (onVictory) onVictory();
        }, 3500);
      }, 500);
    } else {
      setGameState('incorrect');
      if (onErrorSound) onErrorSound();
      setWiggleSymbol(true);
      
      setTimeout(() => {
        setWiggleSymbol(false);
        setPlacedSymbol(null);
        setGameState('waiting');
      }, 800);
    }
  };

  const handleDragEnd = (event, info, symbol) => {
    if (!dropZoneRef.current || gameState !== 'waiting') return;
    
    const dropZone = dropZoneRef.current.getBoundingClientRect();
    const isInside = 
      info.point.x >= dropZone.left &&
      info.point.x <= dropZone.right &&
      info.point.y >= dropZone.top &&
      info.point.y <= dropZone.bottom;

    if (isInside) {
      handleValidation(symbol);
    }
  };

  const renderTreats = (count, side) => {
    const textSize = count > 5 ? 'text-4xl md:text-5xl' : 'text-5xl md:text-7xl';
    
    return (
      <div className="w-full h-full flex flex-wrap justify-center content-center gap-2 md:gap-4 p-4">
        {Array.from({ length: count }).map((_, i) => {
          const isCorrect = gameState === 'correct';
          return (
            <motion.div 
              key={i}
              animate={isCorrect ? {
                y: [0, -15, 0],
                rotate: [0, -10, 10, 0],
                scale: [1, 1.2, 1]
              } : {}}
              transition={isCorrect ? {
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.1 + (side === 'left' ? 0 : 0.05)
              } : {}}
              className={`${textSize} select-none drop-shadow-xl`}
            >
              {itemEmoji}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl">
      {showConfetti && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={400} gravity={0.15} />}
      
      {/* Title */}
      <div className="text-white text-2xl md:text-4xl font-bold mb-4 drop-shadow-lg text-center z-10">
        Are they perfect Twin Sets?
      </div>

      {/* Main Play Area */}
      <div className="flex-1 w-full flex flex-row items-center justify-center gap-2 md:gap-8 relative z-10">
        
        {/* Left Set */}
        <div className="w-40 h-40 md:w-64 md:h-64 bg-white/10 backdrop-blur-md rounded-3xl border-4 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden">
          {renderTreats(leftCount, 'left')}
        </div>

        {/* Center Drop Zone */}
        <div 
          ref={dropZoneRef}
          className={`w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-2xl transition-all duration-300 ${
            placedSymbol 
              ? (gameState === 'correct' ? 'bg-green-500/50 border-4 border-green-300 shadow-[0_0_40px_rgba(74,222,128,0.6)]' : 'bg-red-500/50 border-4 border-red-300')
              : 'bg-black/30 border-4 border-dashed border-white/50 shadow-inner'
          }`}
        >
          {placedSymbol ? (
            <motion.div 
              animate={wiggleSymbol ? { x: [-10, 10, -10, 10, 0] } : { scale: [0, 1.2, 1] }}
              transition={{ duration: 0.4 }}
              className="text-6xl md:text-8xl font-bold text-white drop-shadow-xl"
            >
              {placedSymbol}
            </motion.div>
          ) : (
            <span className="text-white/30 text-5xl md:text-6xl animate-pulse">?</span>
          )}
        </div>

        {/* Right Set */}
        <div className="w-40 h-40 md:w-64 md:h-64 bg-white/10 backdrop-blur-md rounded-3xl border-4 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden">
          {renderTreats(rightCount, 'right')}
        </div>

      </div>

      {/* Draggable Controls */}
      <div className="w-full h-32 mt-8 bg-black/40 backdrop-blur-lg rounded-t-3xl border-t-4 border-white/20 flex flex-row items-center justify-center gap-12 md:gap-24 relative z-20">
        
        <div className="text-white/50 absolute top-2 text-sm uppercase tracking-widest font-bold">
          Drag to the center slot
        </div>

        {/* EQUAL Draggable */}
        <motion.div
          drag
          dragSnapToOrigin
          onDragEnd={(e, info) => handleDragEnd(e, info, '=')}
          onClick={() => handleValidation('=')}
          whileHover={{ scale: 1.1 }}
          whileDrag={{ scale: 1.2, zIndex: 50 }}
          className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-green-400 to-emerald-300 rounded-2xl flex items-center justify-center shadow-xl cursor-grab active:cursor-grabbing border-4 border-white/50 ${placedSymbol ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <span className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-md">=</span>
        </motion.div>

        {/* NOT EQUAL Draggable */}
        <motion.div
          drag
          dragSnapToOrigin
          onDragEnd={(e, info) => handleDragEnd(e, info, '≠')}
          onClick={() => handleValidation('≠')}
          whileHover={{ scale: 1.1 }}
          whileDrag={{ scale: 1.2, zIndex: 50 }}
          className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-rose-400 to-red-400 rounded-2xl flex items-center justify-center shadow-xl cursor-grab active:cursor-grabbing border-4 border-white/50 ${placedSymbol ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <span className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-md">≠</span>
        </motion.div>

      </div>
    </div>
  );
};

export default TwinSetsGame;
