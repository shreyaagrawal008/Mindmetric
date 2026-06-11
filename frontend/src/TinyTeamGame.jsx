import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const TinyTeamGame = ({ dataStr, onVictory, onCorrectSound, onErrorSound }) => {
  const [data, setData] = useState(null);
  const [teamState, setTeamState] = useState('waiting'); // waiting, moving_left, moving_right
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [shakeLeft, setShakeLeft] = useState(false);
  const [shakeRight, setShakeRight] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      setData(JSON.parse(dataStr));
    } catch (e) {
      console.error("Failed to parse TinyTeamGame data");
    }
  }, [dataStr]);

  if (!data) return null;

  const { leftCount, rightCount, itemEmoji, teamEmoji, askSymbol } = data;
  const targetIsLeft = leftCount < rightCount;

  const handleChoice = (isLeftChoice) => {
    if (teamState !== 'waiting') return;

    if (isLeftChoice === targetIsLeft) {
      // Success
      setTeamState(isLeftChoice ? 'moving_left' : 'moving_right');
      if (onCorrectSound) onCorrectSound();
      
      setTimeout(() => {
        setShowConfetti(true);
        setTimeout(() => {
          if (onVictory) onVictory();
        }, 3000);
      }, 800);
    } else {
      // Failure
      if (onErrorSound) onErrorSound();
      if (isLeftChoice) {
        setShakeLeft(true);
        setTimeout(() => setShakeLeft(false), 500);
      } else {
        setShakeRight(true);
        setTimeout(() => setShakeRight(false), 500);
      }
    }
  };

  const renderTreats = (count) => {
    const textSize = count > 5 ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl';
    return (
      <div className="w-full h-full flex flex-wrap justify-center content-center gap-1 md:gap-2 p-2 md:p-4">
        {Array.from({ length: count }).map((_, i) => {
          const rotation = Math.random() * 20 - 10;
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

  const renderTeam = () => {
    return (
      <div className="flex flex-row justify-center items-end gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
            className="text-4xl md:text-6xl filter drop-shadow-xl select-none"
          >
            {teamEmoji}
          </motion.div>
        ))}
      </div>
    );
  };

  // Animation values for the team
  let teamX = 0;
  let teamY = 0;
  let teamScale = 1;
  let teamOpacity = 1;

  if (teamState === 'moving_left') {
    teamX = -120; // Move towards left pile
    teamY = -80;
    teamScale = 0.5;
    teamOpacity = 0; // Fade out as they "carry away"
  } else if (teamState === 'moving_right') {
    teamX = 120; // Move towards right pile
    teamY = -80;
    teamScale = 0.5;
    teamOpacity = 0;
  }

  return (
    <div className="relative w-full h-full flex flex-row items-center justify-center gap-4 md:gap-12 p-4 md:p-12 overflow-hidden bg-gradient-to-b from-amber-100 to-amber-300 rounded-xl">
      {showConfetti && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={300} />}
      
      {/* Left Pile */}
      <motion.div 
        onClick={!askSymbol ? () => handleChoice(true) : undefined}
        animate={shakeLeft ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`relative w-32 h-32 md:w-48 md:h-48 bg-white/40 backdrop-blur-sm rounded-full border-4 border-white/60 overflow-hidden transition-all shadow-xl ${!askSymbol ? 'cursor-pointer hover:bg-white/60 active:scale-95' : ''}`}
      >
        <AnimatePresence>
          {teamState !== 'moving_left' && renderTreats(leftCount)}
        </AnimatePresence>
      </motion.div>

      {/* Center Character Group */}
      <div className="relative z-10 w-24 md:w-48 flex flex-col items-center justify-center">
        <motion.div 
          animate={{ x: teamX, y: teamY, scale: teamScale, opacity: teamOpacity }}
          transition={{ type: "tween", duration: 0.8 }}
        >
          {renderTeam()}
        </motion.div>

        {teamState === 'waiting' && (
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-16 bg-white text-xl px-3 py-1 rounded-2xl shadow-lg border-2 border-gray-200"
          >
            ❓
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 border-b-2 border-r-2 border-gray-200"></div>
          </motion.div>
        )}

        {/* Symbol Buttons for Advanced Tier */}
        {askSymbol && teamState === 'waiting' && (
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-row gap-4">
            <button 
              onClick={() => handleChoice(true)} 
              className="bg-white hover:bg-yellow-100 text-5xl font-bold py-2 px-6 rounded-2xl shadow-xl border-4 border-amber-400 active:scale-95 transition-all text-amber-700"
            >
              &lt;
            </button>
            <button 
              onClick={() => handleChoice(false)} 
              className="bg-white hover:bg-yellow-100 text-5xl font-bold py-2 px-6 rounded-2xl shadow-xl border-4 border-amber-400 active:scale-95 transition-all text-amber-700"
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* Right Pile */}
      <motion.div 
        onClick={!askSymbol ? () => handleChoice(false) : undefined}
        animate={shakeRight ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`relative w-32 h-32 md:w-48 md:h-48 bg-white/40 backdrop-blur-sm rounded-full border-4 border-white/60 overflow-hidden transition-all shadow-xl ${!askSymbol ? 'cursor-pointer hover:bg-white/60 active:scale-95' : ''}`}
      >
        <AnimatePresence>
          {teamState !== 'moving_right' && renderTreats(rightCount)}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TinyTeamGame;
