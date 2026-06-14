import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const playBeepSound = (isCorrect) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = isCorrect ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(isCorrect ? 600 : 150, audioCtx.currentTime);
    
    if (isCorrect) {
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.2);
    } else {
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    }
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const CosmicBridgeRepairGame = ({ dataStr, question, onVictory }) => {
  const [data, setData] = useState(null);
  const [options, setOptions] = useState([]);
  const [isVictory, setIsVictory] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [wrongShakeId, setWrongShakeId] = useState(null);

  useEffect(() => {
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        setData(parsed);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    
    if (question && question.options) {
        const uniqueOpts = Array.from(new Set(question.options));
        setOptions(uniqueOpts.map(o => parseInt(o, 10)).slice(0, 3));
    }
    
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr, question]);

  const speak = (text) => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.2; 
        window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionClick = (val) => {
    if (isVictory) return;
    
    if (val === data.target) {
        // Correct!
        setIsVictory(true);
        setWarningMessage(null);
        playBeepSound(true);
        
        setTimeout(() => {
            if (onVictory) onVictory();
        }, 3500); 
    } else {
        // Wrong!
        setWrongShakeId(val);
        setTimeout(() => setWrongShakeId(null), 500);
        playBeepSound(false);
        
        if (val > data.next) {
            setWarningMessage(`${val} is bigger than ${data.next}! Look at both sides of the gap and try again!`);
            speak(`${val} is bigger than ${data.next}! Look at both sides of the gap and try again!`);
        } else if (val < data.prev) {
            setWarningMessage(`${val} is smaller than ${data.prev}! Look at both sides of the gap and try again!`);
            speak(`${val} is smaller than ${data.prev}! Look at both sides of the gap and try again!`);
        } else {
            setWarningMessage("That rock doesn't fit the sequence!");
            speak("That rock doesn't fit the sequence!");
        }
    }
  };

  if (!data || options.length === 0) return null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between touch-none select-none overflow-hidden bg-slate-900" style={{ background: 'linear-gradient(to bottom, #020617 0%, #172554 100%)' }}>
      
      {/* Dynamic Nebula Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600 rounded-full blur-[100px] opacity-30" style={{ animation: 'pulse 4s infinite alternate-reverse' }}></div>
      </div>

      {isVictory && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <Confetti 
             width={windowDimension.width} 
             height={windowDimension.height} 
             recycle={false} 
             numberOfPieces={150} 
             gravity={0.5}
             initialVelocityY={25}
             colors={['#facc15', '#60a5fa', '#a78bfa', '#f472b6']}
             drawShape={ctx => {
                 // Draw a star shape
                 ctx.beginPath();
                 for(let i = 0; i < 5; i++) {
                     ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * 10,
                                -Math.sin((18 + i * 72) / 180 * Math.PI) * 10);
                     ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * 4,
                                -Math.sin((54 + i * 72) / 180 * Math.PI) * 4);
                 }
                 ctx.closePath();
                 ctx.fill();
             }}
          />
        </div>
      )}

      {/* Warning Message */}
      <AnimatePresence>
        {warningMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 20 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 z-50 bg-red-900/95 border-2 border-red-500 rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(239,68,68,0.5)] text-center max-w-lg backdrop-blur-sm"
            >
                <div className="text-red-200 text-sm md:text-lg font-bold tracking-widest">
                    ⚠ {warningMessage}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Play Area - Cosmic Bridge */}
      <div className="flex-1 w-full relative z-10 flex flex-col items-center justify-center pt-10">
          
          <div className="relative w-full max-w-3xl flex justify-center items-center mt-12 mb-12">
             
             {/* The Cosmic Energy Path */}
             <div className={`absolute top-1/2 left-0 w-full h-4 -translate-y-1/2 transition-colors duration-1000 blur-sm z-0 ${isVictory ? 'bg-green-400' : 'bg-cyan-900'}`}></div>
             <div className={`absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 transition-colors duration-1000 z-0 ${isVictory ? 'bg-green-200 shadow-[0_0_20px_#4ade80]' : 'bg-cyan-500'}`}></div>

             {/* Tiles Container */}
             <div className="relative z-10 flex items-center justify-between w-3/4 max-w-2xl px-4 md:px-12">
                 
                 {/* Rover Vehicle */}
                 <motion.div 
                    className="absolute top-[-40px] z-20 w-16 h-12"
                    initial={{ left: '0%' }}
                    animate={isVictory ? { left: '100%', rotate: [0, 5, 0, -5, 0] } : { left: '15%', y: [0, -2, 0] }}
                    transition={isVictory ? { duration: 2, ease: "easeInOut", delay: 0.5 } : { duration: 1, repeat: Infinity, type: 'tween' }}
                 >
                     <div className="w-12 h-8 bg-white rounded-t-xl border-4 border-slate-300 relative">
                         <div className="absolute top-1 right-1 w-4 h-4 bg-cyan-300 rounded-sm"></div>
                     </div>
                     <div className="flex justify-between px-1 -mt-2">
                         <div className="w-4 h-4 bg-slate-800 rounded-full border-2 border-slate-500 animate-spin"></div>
                         <div className="w-4 h-4 bg-slate-800 rounded-full border-2 border-slate-500 animate-spin"></div>
                     </div>
                 </motion.div>

                 {/* Tile 1: Prev */}
                 <div className="relative flex flex-col items-center group perspective-1000">
                     <motion.div 
                         className={`w-20 h-20 md:w-28 md:h-28 flex items-center justify-center transform rotate-x-12 shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-t-2 border-l-2 rounded-xl transition-colors duration-500 ${isVictory ? 'bg-green-500 border-green-300' : 'bg-cyan-800 border-cyan-400'}`}
                         whileHover={{ scale: 1.05 }}
                     >
                         <span className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{data.prev}</span>
                     </motion.div>
                     <div className={`w-full h-8 blur-md mt-2 transition-colors duration-500 ${isVictory ? 'bg-green-500/40' : 'bg-cyan-500/20'}`}></div>
                 </div>

                 {/* Tile 2: Missing Gap */}
                 <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center mx-4">
                     <AnimatePresence>
                         {!isVictory && (
                             <motion.div 
                                 className="absolute inset-0 border-4 border-dashed border-cyan-500/50 rounded-xl flex items-center justify-center transform rotate-x-12"
                                 exit={{ opacity: 0, scale: 0.5 }}
                             >
                                 <span className="text-4xl text-cyan-500/40 font-black animate-pulse">?</span>
                             </motion.div>
                         )}
                     </AnimatePresence>
                     <AnimatePresence>
                         {isVictory && (
                             <motion.div 
                                 className="absolute inset-0 w-20 h-20 md:w-28 md:h-28 m-auto flex items-center justify-center bg-green-400 border-t-2 border-l-2 border-green-200 rounded-xl transform rotate-x-12 shadow-[0_0_30px_#4ade80]"
                                 initial={{ y: -50, opacity: 0, scale: 1.5 }}
                                 animate={{ y: 0, opacity: 1, scale: 1 }}
                                 transition={{ type: "spring", stiffness: 200, damping: 15 }}
                             >
                                 <span className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{data.target}</span>
                             </motion.div>
                         )}
                     </AnimatePresence>
                 </div>

                 {/* Tile 3: Next */}
                 <div className="relative flex flex-col items-center group perspective-1000">
                     <motion.div 
                         className={`w-20 h-20 md:w-28 md:h-28 flex items-center justify-center transform rotate-x-12 shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-t-2 border-l-2 rounded-xl transition-colors duration-500 ${isVictory ? 'bg-green-500 border-green-300' : 'bg-cyan-800 border-cyan-400'}`}
                         whileHover={{ scale: 1.05 }}
                     >
                         <span className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{data.next}</span>
                     </motion.div>
                     <div className={`w-full h-8 blur-md mt-2 transition-colors duration-500 ${isVictory ? 'bg-green-500/40' : 'bg-cyan-500/20'}`}></div>
                 </div>

             </div>
          </div>
      </div>

      {/* Floating Asteroid Keys Options */}
      <div className="w-full p-6 md:p-10 z-40 relative flex justify-center mb-8">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {options.map((opt, index) => {
                  const isWrongShake = wrongShakeId === opt;
                  return (
                      <motion.button
                          key={index}
                          onClick={() => handleOptionClick(opt)}
                          className="relative w-24 h-24 md:w-32 md:h-32 bg-slate-600 rounded-3xl flex items-center justify-center shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.5),5px_10px_15px_rgba(0,0,0,0.3)] hover:brightness-110 active:scale-95 transition-all overflow-hidden"
                          animate={isWrongShake ? { x: [-15, 15, -15, 15, 0], y: [-10, 10, 0] } : { y: [0, -10, 0] }}
                          transition={isWrongShake ? { duration: 0.4 } : { duration: 3, repeat: Infinity, delay: index * 0.5 }}
                          disabled={isVictory}
                          style={{
                              backgroundImage: 'radial-gradient(circle at 30% 30%, #64748b, #334155)',
                              clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
                          }}
                      >
                          {/* Crater details */}
                          <div className="absolute top-2 left-2 w-4 h-4 bg-slate-800/50 rounded-full blur-[1px] shadow-inner"></div>
                          <div className="absolute bottom-4 right-3 w-6 h-6 bg-slate-800/40 rounded-full blur-[1px] shadow-inner"></div>
                          <div className="absolute top-6 right-2 w-3 h-3 bg-slate-800/30 rounded-full blur-[1px]"></div>
                          
                          <span className="text-4xl md:text-5xl font-black text-slate-200 drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] relative z-10">{opt}</span>
                      </motion.button>
                  );
              })}
          </div>
      </div>
      
    </div>
  );
};

export default CosmicBridgeRepairGame;
