import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const FairnessAdjusterGame = ({ dataStr, onCorrectSound, onVictory }) => {
  const [data, setData] = useState(null);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [isBalanced, setIsBalanced] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Custom audio context for mechanical tick-tock
  const playTick = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.log('Audio disabled or failed');
    }
  }, []);

  const playTock = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      console.log('Audio disabled or failed');
    }
  }, []);

  useEffect(() => {
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        setData(parsed);
        setLeftCount(parsed.leftCount);
        setRightCount(parsed.rightCount);
        setIsBalanced(false);
      } catch (e) {
        console.error("Failed to parse dataStr", e);
      }
    }
    const handleResize = () => {
      setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  const handleAdd = (side) => {
    if (isBalanced) return;
    playTick();
    if (side === 'left') {
      setLeftCount(c => c + 1);
    } else {
      setRightCount(c => c + 1);
    }
  };

  const handleRemove = (side) => {
    if (isBalanced) return;
    playTock();
    if (side === 'left' && leftCount > 0) {
      setLeftCount(c => c - 1);
    } else if (side === 'right' && rightCount > 0) {
      setRightCount(c => c - 1);
    }
  };

  useEffect(() => {
    if (data && !isBalanced) {
      if (leftCount === rightCount) {
        setIsBalanced(true);
        if (onCorrectSound) onCorrectSound();
        if (onVictory) onVictory();
      }
    }
  }, [leftCount, rightCount, data, isBalanced, onCorrectSound, onVictory]);

  if (!data) return null;

  const renderItems = (count, emoji) => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-3xl md:text-4xl drop-shadow-md m-0.5 md:m-1"
        >
          {emoji}
        </motion.div>
      );
    }
    return items;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 pt-4 overflow-hidden touch-none">
      {isBalanced && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={300} gravity={0.2} />}
      
      <div className="w-full max-w-4xl flex flex-row items-stretch justify-between relative px-2">
        
        {/* Left Side */}
        <div className="w-5/12 flex flex-col items-center border-4 border-dashed border-blue-400 bg-blue-900/40 rounded-3xl p-2 md:p-3 shadow-xl relative h-[250px] md:h-[300px]">
          <div className="text-lg md:text-xl font-bold text-white mb-1 uppercase drop-shadow-md flex items-center gap-2">
            <span className="text-2xl md:text-3xl">{data.receiverEmoji}</span>
            <span className="hidden md:inline">{data.receiverName}</span>
          </div>
          
          <div className="flex-1 flex flex-row flex-wrap items-center justify-center content-center w-full relative z-10 overflow-hidden">
            <AnimatePresence>
              {renderItems(leftCount, data.itemEmoji)}
            </AnimatePresence>
          </div>

          <div className="absolute -bottom-6 md:-bottom-8 flex flex-row gap-4">
            {!isBalanced && leftCount > rightCount && (
              <button 
                onClick={() => handleRemove('left')}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-500 border-4 border-white shadow-lg text-white text-xl md:text-2xl font-black flex items-center justify-center hover:bg-red-400 active:scale-95 transition-all"
              >
                🗑️
              </button>
            )}
            {!isBalanced && leftCount < rightCount && (
              <button 
                onClick={() => handleAdd('left')}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500 border-4 border-white shadow-lg text-white text-2xl md:text-3xl font-black flex items-center justify-center hover:bg-green-400 active:scale-95 transition-all"
              >
                +
              </button>
            )}
          </div>
        </div>

        {/* Center Scale Indicator */}
        <div className="w-2/12 flex flex-col items-center justify-center relative">
          <motion.div 
            animate={{ 
              rotate: isBalanced ? 0 : (leftCount > rightCount ? -15 : 15),
              scale: isBalanced ? 1.2 : 1
            }}
            className="text-3xl md:text-5xl drop-shadow-xl z-20"
          >
            ⚖️
          </motion.div>
          <div className="text-white font-bold text-sm md:text-lg mt-1 text-center h-6">
            {isBalanced ? <span className="text-green-400">EQUAL!</span> : 
             <span className="text-yellow-300">{leftCount} vs {rightCount}</span>}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-5/12 flex flex-col items-center border-4 border-dashed border-pink-400 bg-pink-900/40 rounded-3xl p-2 md:p-3 shadow-xl relative h-[250px] md:h-[300px]">
          <div className="text-lg md:text-xl font-bold text-white mb-1 uppercase drop-shadow-md flex items-center gap-2">
            <span className="text-2xl md:text-3xl">{data.receiverEmoji}</span>
            <span className="hidden md:inline">{data.receiverName}</span>
          </div>
          
          <div className="flex-1 flex flex-row flex-wrap items-center justify-center content-center w-full relative z-10 overflow-hidden">
            <AnimatePresence>
              {renderItems(rightCount, data.itemEmoji)}
            </AnimatePresence>
          </div>

          <div className="absolute -bottom-6 md:-bottom-8 flex flex-row gap-4">
            {!isBalanced && rightCount < leftCount && (
              <button 
                onClick={() => handleAdd('right')}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500 border-4 border-white shadow-lg text-white text-2xl md:text-3xl font-black flex items-center justify-center hover:bg-green-400 active:scale-95 transition-all"
              >
                +
              </button>
            )}
            {!isBalanced && rightCount > leftCount && (
              <button 
                onClick={() => handleRemove('right')}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-500 border-4 border-white shadow-lg text-white text-xl md:text-2xl font-black flex items-center justify-center hover:bg-red-400 active:scale-95 transition-all"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FairnessAdjusterGame;
