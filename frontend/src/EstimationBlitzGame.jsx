import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const EstimationBlitzGame = ({ dataStr, answerStr, onCorrectSound, onErrorSound, onVictory }) => {
  const [data, setData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [gameState, setGameState] = useState('playing'); // playing, timeout, correct, incorrect
  const [selectedJar, setSelectedJar] = useState(null);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        setData(JSON.parse(dataStr));
        setTimeLeft(5);
        setGameState('playing');
        setSelectedJar(null);
      } catch (e) {
        console.error("Failed to parse dataStr", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('timeout');
    }
  }, [timeLeft, gameState]);

  const handleSelection = (side) => {
    if (gameState === 'correct' || gameState === 'incorrect') return; // already picked

    setSelectedJar(side);
    if (side === answerStr) {
      setGameState('correct');
      if (onCorrectSound) onCorrectSound();
      if (onVictory) onVictory();
    } else {
      setGameState('incorrect');
      if (onErrorSound) onErrorSound();
      // Allow them to click again after a brief red flash? Or just lock it?
      // For estimation, maybe lock it for 1 second then let them try again.
      setTimeout(() => {
        setGameState('timeout'); // keep jars opaque if time ran out, or just playing
        setSelectedJar(null);
      }, 1500);
    }
  };

  if (!data) return null;

  const renderCandies = (count, emoji) => {
    const items = [];
    for (let i = 0; i < count; i++) {
      // Create a dense cluster with slight random offsets
      items.push(
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl drop-shadow-md"
          style={{ 
            margin: '-4px', 
            position: 'relative',
            left: `${Math.random() * 10 - 5}px`,
            top: `${Math.random() * 10 - 5}px`
          }}
        >
          {emoji}
        </motion.div>
      );
    }
    return items;
  };

  const getJarClass = (side) => {
    let base = "relative w-full max-w-[280px] h-72 md:h-96 rounded-[40px] border-8 shadow-2xl flex flex-row flex-wrap items-end justify-center content-end p-4 pb-6 cursor-pointer overflow-hidden transition-all duration-500 ";
    
    // Time out state (opaque jars)
    if (gameState === 'timeout') {
      base += "border-slate-700 bg-slate-800 ";
    } else {
      base += "border-white/50 bg-white/10 backdrop-blur-sm "; // Transparent glass
    }

    if (selectedJar === side) {
      if (gameState === 'correct') {
        base += "border-green-400 bg-green-500/40 scale-105 shadow-[0_0_40px_rgba(74,222,128,0.8)] ";
      } else if (gameState === 'incorrect') {
        base += "border-red-500 bg-red-600/40 animate-pulse ";
      }
    } else if (gameState === 'playing' || gameState === 'timeout') {
      base += "hover:scale-105 hover:bg-white/20 hover:border-white/80 ";
    }

    return base;
  };

  // The lid pops off if correct
  const lidVariants = {
    closed: { y: 0, rotate: 0 },
    open: { y: -80, rotate: -20, opacity: 0 }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start pt-24 pb-8 p-4 overflow-hidden touch-none">
      {gameState === 'correct' && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={300} gravity={0.3} />}
      
      {/* Top Timer UI */}
      <div className="mb-8 flex flex-col items-center justify-center">
        <motion.div 
          animate={{ scale: timeLeft <= 3 && gameState === 'playing' ? [1, 1.2, 1] : 1 }}
          transition={{ repeat: timeLeft <= 3 ? Infinity : 0, duration: 0.5 }}
          className={`text-6xl md:text-8xl font-black drop-shadow-xl ${timeLeft <= 2 ? 'text-red-500' : 'text-yellow-400'}`}
        >
          {timeLeft > 0 ? `00:0${timeLeft}` : 'TIME UP!'}
        </motion.div>
        <p className="text-white text-xl mt-2 drop-shadow-md font-bold">
          {gameState === 'timeout' ? "Oh no! The jars are opaque now. Trust your memory!" : "Quick! Tap the jar with MORE candies!"}
        </p>
      </div>

      <div className="w-full max-w-4xl flex flex-row items-end justify-center gap-6 md:gap-16 relative">
        
        {/* Left Jar Container */}
        <div className="flex flex-col items-center relative w-1/2 justify-end">
          <AnimatePresence>
            {(gameState === 'correct' || gameState === 'incorrect') && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-16 md:-top-20 z-20 text-5xl md:text-7xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
              >
                {data.leftCount}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Jar Lid */}
          <motion.div 
            variants={lidVariants}
            initial="closed"
            animate={(gameState === 'correct' && selectedJar === 'LEFT') ? "open" : "closed"}
            className="w-3/4 h-8 md:h-12 bg-orange-400 rounded-t-xl border-4 border-orange-600 mb-[-10px] z-10 shadow-lg"
          />
          
          <div 
            className={getJarClass('LEFT')}
            onClick={() => handleSelection('LEFT')}
          >
            {/* The candy fill */}
            <div className={`flex flex-row flex-wrap items-end justify-center content-end transition-opacity duration-700 ${gameState === 'timeout' ? 'opacity-0' : 'opacity-100'}`}>
              {renderCandies(data.leftCount, data.itemEmoji)}
            </div>
            
            {/* Gloss reflection overlay */}
            <div className="absolute top-0 left-4 w-1/4 h-full bg-gradient-to-b from-white/30 to-transparent skew-x-[-10deg] pointer-events-none"></div>
          </div>
        </div>

        {/* Right Jar Container */}
        <div className="flex flex-col items-center relative w-1/2 justify-end">
          <AnimatePresence>
            {(gameState === 'correct' || gameState === 'incorrect') && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-16 md:-top-20 z-20 text-5xl md:text-7xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
              >
                {data.rightCount}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Jar Lid */}
          <motion.div 
            variants={lidVariants}
            initial="closed"
            animate={(gameState === 'correct' && selectedJar === 'RIGHT') ? "open" : "closed"}
            className="w-3/4 h-8 md:h-12 bg-orange-400 rounded-t-xl border-4 border-orange-600 mb-[-10px] z-10 shadow-lg"
          />

          <div 
            className={getJarClass('RIGHT')}
            onClick={() => handleSelection('RIGHT')}
          >
            {/* The candy fill */}
            <div className={`flex flex-row flex-wrap items-end justify-center content-end transition-opacity duration-700 ${gameState === 'timeout' ? 'opacity-0' : 'opacity-100'}`}>
              {renderCandies(data.rightCount, data.itemEmoji)}
            </div>

            {/* Gloss reflection overlay */}
            <div className="absolute top-0 left-4 w-1/4 h-full bg-gradient-to-b from-white/30 to-transparent skew-x-[-10deg] pointer-events-none"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EstimationBlitzGame;
