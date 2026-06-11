import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const TenFrameGame = ({ dataStr, answerStr, optionsStr, onCorrectSound, onErrorSound, onVictory }) => {
  const [data, setData] = useState(null);
  const [options, setOptions] = useState([]);
  const [gameState, setGameState] = useState('playing'); // playing, correct, incorrect
  const [selectedOption, setSelectedOption] = useState(null);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr && optionsStr) {
      try {
        setData(JSON.parse(dataStr));
        setOptions(JSON.parse(optionsStr));
        setGameState('playing');
        setSelectedOption(null);
      } catch (e) {
        console.error("Failed to parse", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr, optionsStr]);

  const handleSelection = (option) => {
    if (gameState === 'correct') return;

    setSelectedOption(option);
    if (option === answerStr) {
      setGameState('correct');
      if (onCorrectSound) onCorrectSound();
      if (onVictory) onVictory();
    } else {
      setGameState('incorrect');
      if (onErrorSound) onErrorSound();
      // Reset after a brief moment to allow trying again
      setTimeout(() => {
        if (gameState !== 'correct') {
          setGameState('playing');
          setSelectedOption(null);
        }
      }, 800);
    }
  };

  if (!data) return null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 pt-4 overflow-hidden touch-none">
      {gameState === 'correct' && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={300} gravity={0.3} />}
      
      {/* Top Area: The Frame Arena */}
      <div className="flex-1 flex flex-col items-center justify-center w-full mt-4">
        <div className="grid grid-cols-5 grid-rows-2 gap-2 md:gap-4 p-4 md:p-6 bg-blue-900/60 border-8 border-indigo-400 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.5)]">
          {Array.from({ length: 10 }).map((_, index) => {
            const isFilled = index < data.count;
            const isEmpty = !isFilled;
            const showComplement = gameState === 'correct' && isEmpty;

            return (
              <motion.div
                key={index}
                animate={{
                  scale: (gameState === 'correct' && isFilled) ? [1, 1.2, 1] : 1,
                  backgroundColor: showComplement ? 'rgba(250, 204, 21, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                  borderColor: showComplement ? 'rgba(253, 224, 71, 1)' : 'rgba(255, 255, 255, 0.3)'
                }}
                transition={{
                  scale: { repeat: Infinity, duration: 0.8 },
                  backgroundColor: { duration: 0.5 },
                  borderColor: { duration: 0.5 }
                }}
                className={`w-14 h-14 md:w-20 md:h-20 border-4 rounded-xl flex items-center justify-center text-3xl md:text-5xl shadow-inner ${showComplement ? 'animate-pulse' : ''}`}
              >
                <AnimatePresence>
                  {isFilled && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: index * 0.05 }}
                      className="drop-shadow-lg"
                    >
                      {data.itemEmoji}
                    </motion.div>
                  )}
                </AnimatePresence>
                {showComplement && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-yellow-100 font-bold text-xl md:text-3xl drop-shadow-md"
                  >
                    ?
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {/* Complement Text visible only on win */}
        <AnimatePresence>
          {gameState === 'correct' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-2xl md:text-4xl font-black text-white drop-shadow-lg bg-black/40 px-6 py-2 rounded-full border-2 border-yellow-400"
            >
              <span className="text-blue-300">{data.count}</span> + <span className="text-yellow-300">{10 - data.count}</span> = <span className="text-green-400">10</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Area: Choice Cards */}
      <div className="w-full max-w-3xl flex flex-row items-center justify-center gap-6 md:gap-12 pb-8 md:pb-12 mt-auto">
        {options.map((opt, i) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === answerStr;
          
          let cardStyle = "w-24 h-32 md:w-32 md:h-40 rounded-2xl border-4 flex items-center justify-center text-5xl md:text-6xl font-black shadow-xl cursor-pointer transition-all duration-300 bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-300 text-white hover:scale-105 hover:-translate-y-2 ";
          
          if (isSelected) {
            if (gameState === 'incorrect') {
              cardStyle = "w-24 h-32 md:w-32 md:h-40 rounded-2xl border-4 flex items-center justify-center text-5xl md:text-6xl font-black shadow-xl cursor-pointer transition-all duration-300 bg-red-600 border-red-300 text-white animate-shake ";
            }
          }
          
          if (gameState === 'correct') {
             if (isCorrect) {
                cardStyle = "w-24 h-32 md:w-32 md:h-40 rounded-2xl border-4 flex items-center justify-center text-5xl md:text-6xl font-black shadow-[0_0_40px_rgba(74,222,128,1)] transition-all duration-300 bg-green-500 border-green-200 text-white scale-110 ";
             } else {
                cardStyle = "w-24 h-32 md:w-32 md:h-40 rounded-2xl border-4 flex items-center justify-center text-5xl md:text-6xl font-black shadow-xl transition-all duration-300 bg-slate-700 border-slate-500 text-slate-400 opacity-50 scale-95 pointer-events-none ";
             }
          }

          return (
            <div 
              key={i} 
              className={cardStyle}
              onClick={() => handleSelection(opt)}
            >
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TenFrameGame;
