import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const playClinkSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // High-pitched bell/stone clink
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(1500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(3000, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
    
    // Add a second harmonic for a "magical" feel
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2000, audioCtx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(4000, audioCtx.currentTime + 0.15);
    
    gain2.gain.setValueAtTime(0, audioCtx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc2.start();
    osc2.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playJumpSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const ForestPathRescueGame = ({ dataStr, question, onVictory }) => {
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
        // Options from backend are usually comma separated in question.options or an array
        // In Number Comet, question.options is a list of strings
        let opts = question.options;
        // Make sure correct answer is included and shuffle
        // The backend `buildT` already shuffles them into question.options array
        setOptions(opts.map(o => parseInt(o, 10)));
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
        utterance.pitch = 1.3; // slightly high pitched/cute
        window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionClick = (val) => {
    if (isVictory) return;
    
    if (val === data.target) {
        // Correct!
        setIsVictory(true);
        setWarningMessage(null);
        playClinkSound();
        
        setTimeout(() => {
            playJumpSound();
        }, 800); // Jump after the stone materializes
        
        speak(String(val) + "! Safe jump!");
        
        setTimeout(() => {
            if (onVictory) onVictory();
        }, 3500);
    } else {
        // Wrong!
        setWrongShakeId(val);
        setTimeout(() => setWrongShakeId(null), 500);
        
        if (val === data.squirrelPos - 1) {
            // Anti-regression safeguard
            setWarningMessage("That's the neighbor behind him! Can you find the neighbor right in front?");
            speak("That's the neighbor behind him! Can you find the neighbor right in front?");
        } else {
            setWarningMessage("Oops! That stone doesn't fit here. Try again!");
            speak("Oops! That stone doesn't fit here. Try again!");
        }
    }
  };

  if (!data || options.length === 0) return null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden touch-none select-none bg-green-950 font-sans" style={{ background: 'radial-gradient(circle at top, #14532d 0%, #022c22 100%)' }}>
      
      {/* Dynamic Forest Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Sunbeams */}
         <div className="absolute top-0 left-1/4 w-32 h-[200%] bg-white/10 origin-top transform rotate-12 blur-2xl"></div>
         <div className="absolute top-0 left-1/2 w-48 h-[200%] bg-yellow-100/5 origin-top transform -rotate-12 blur-3xl"></div>
         
         {/* Fireflies */}
         {Array.from({ length: 15 }).map((_, i) => (
             <motion.div 
               key={i}
               className="absolute w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_10px_#fde047]"
               initial={{ 
                   x: Math.random() * windowDimension.width, 
                   y: Math.random() * windowDimension.height,
                   opacity: Math.random() * 0.5 + 0.5
               }}
               animate={{ 
                   x: Math.random() * windowDimension.width, 
                   y: Math.random() * windowDimension.height,
                   opacity: [0.2, 1, 0.2]
               }}
               transition={{ 
                   duration: Math.random() * 5 + 5, 
                   repeat: Infinity,
                   ease: "easeInOut"
               }}
             />
         ))}
      </div>

      {isVictory && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          {/* Green leaves & acorns confetti */}
          <Confetti 
             width={windowDimension.width} 
             height={windowDimension.height} 
             recycle={false} 
             numberOfPieces={150} 
             gravity={0.3} 
             colors={['#22c55e', '#16a34a', '#15803d', '#a16207', '#ca8a04']}
             drawShape={ctx => {
                 // Randomly draw a leaf or an acorn
                 const isAcorn = Math.random() > 0.7;
                 if (isAcorn) {
                     ctx.beginPath();
                     ctx.ellipse(0, 0, 8, 12, 0, 0, 2 * Math.PI);
                     ctx.fill();
                     // Cap
                     ctx.fillStyle = '#713f12';
                     ctx.beginPath();
                     ctx.ellipse(0, -8, 9, 6, 0, Math.PI, 0);
                     ctx.fill();
                 } else {
                     ctx.beginPath();
                     ctx.moveTo(0, -10);
                     ctx.bezierCurveTo(10, -10, 10, 10, 0, 10);
                     ctx.bezierCurveTo(-10, 10, -10, -10, 0, -10);
                     ctx.fill();
                 }
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
              className="absolute top-4 z-50 bg-amber-100/95 border-4 border-amber-500 rounded-2xl px-6 py-4 shadow-[0_0_20px_rgba(245,158,11,0.5)] text-center max-w-lg backdrop-blur-sm"
            >
                <div className="text-amber-900 text-lg md:text-xl font-bold">
                    {warningMessage}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Play Area - The Path */}
      <div className="flex-1 w-full relative z-10 flex flex-col items-center justify-center pt-20">
          
          <div className="flex items-center justify-center gap-4 md:gap-8 transform -rotate-6 md:-rotate-3">
              
              {/* Stone 1: Squirrel Position */}
              <div className="relative">
                  {/* The Squirrel */}
                  <motion.div 
                     className="absolute -top-16 md:-top-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center"
                     animate={isVictory ? {
                         x: [0, 80, 160], // Hop to the middle stone, then the next
                         y: [0, -50, 0, -50, 0]
                     } : {
                         y: [0, -5, 0] // idle breathing
                     }}
                     transition={isVictory ? { duration: 1.2, delay: 0.8, ease: "easeInOut" } : { duration: 2, repeat: Infinity }}
                  >
                      {/* Squirrel Tail */}
                      <div className="absolute -left-6 md:-left-8 top-4 md:top-6 w-8 h-12 md:w-12 md:h-16 bg-orange-600 rounded-full transform -rotate-12 border-2 border-orange-800 shadow-md"></div>
                      {/* Squirrel Body */}
                      <div className="w-12 h-14 md:w-16 md:h-20 bg-orange-500 rounded-t-full rounded-b-3xl border-2 border-orange-700 flex flex-col items-center relative shadow-lg">
                          {/* Belly */}
                          <div className="w-8 h-10 md:w-10 md:h-14 bg-orange-200 rounded-full mt-auto mb-1"></div>
                          {/* Head */}
                          <div className="absolute -top-6 md:-top-8 w-14 h-12 md:w-18 md:h-16 bg-orange-500 rounded-full border-2 border-orange-700 flex justify-center shadow-sm">
                              {/* Ears */}
                              <div className="absolute -left-1 -top-2 w-4 h-6 bg-orange-600 rounded-t-full border-2 border-orange-800 transform -rotate-12"></div>
                              <div className="absolute -right-1 -top-2 w-4 h-6 bg-orange-600 rounded-t-full border-2 border-orange-800 transform rotate-12"></div>
                              {/* Eyes */}
                              <div className="absolute top-4 left-3 w-2 h-2 md:w-3 md:h-3 bg-black rounded-full"></div>
                              <div className="absolute top-4 right-3 w-2 h-2 md:w-3 md:h-3 bg-black rounded-full"></div>
                              {/* Nose */}
                              <div className="absolute top-7 w-2 h-2 bg-pink-500 rounded-full"></div>
                          </div>
                          {/* Arms */}
                          <div className="absolute top-4 -left-1 w-3 h-6 bg-orange-500 rounded-full border border-orange-700 transform rotate-45"></div>
                          <div className="absolute top-4 -right-1 w-3 h-6 bg-orange-500 rounded-full border border-orange-700 transform -rotate-45"></div>
                      </div>
                  </motion.div>

                  {/* Stone */}
                  <div className="w-24 h-16 md:w-36 md:h-24 bg-slate-400 rounded-full border-b-8 border-slate-600 flex items-center justify-center shadow-2xl relative">
                      {/* Moss */}
                      <div className="absolute top-0 left-2 w-8 h-4 bg-green-600/60 rounded-full blur-[1px]"></div>
                      <span className="text-3xl md:text-5xl font-black text-slate-800 drop-shadow-md">{data.squirrelPos}</span>
                  </div>
              </div>

              {/* Stone 2: The Missing Gap (Target) */}
              <div className="relative">
                  <AnimatePresence>
                      {!isVictory && (
                          <motion.div 
                              className="w-24 h-16 md:w-36 md:h-24 rounded-full border-4 border-dashed border-white/30 flex items-center justify-center"
                              exit={{ opacity: 0, scale: 0 }}
                          >
                              <span className="text-4xl text-white/50 font-black animate-pulse">?</span>
                          </motion.div>
                      )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                      {isVictory && (
                          <motion.div 
                              className="absolute inset-0 w-24 h-16 md:w-36 md:h-24 bg-yellow-100 rounded-full border-b-8 border-yellow-300 flex items-center justify-center shadow-[0_0_40px_#fef08a]"
                              initial={{ opacity: 0, y: -100, scale: 1.5 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ type: "spring", bounce: 0.5 }}
                          >
                              {/* Magic Sparkles on the stone */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-full h-full bg-white/40 rounded-full animate-ping"></div>
                              </div>
                              <span className="text-3xl md:text-5xl font-black text-yellow-800 drop-shadow-md z-10">{data.target}</span>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>

              {/* Stone 3: The Next Stone */}
              <div className="w-24 h-16 md:w-36 md:h-24 bg-slate-400 rounded-full border-b-8 border-slate-600 flex items-center justify-center shadow-2xl relative">
                   <div className="absolute bottom-2 right-2 w-6 h-3 bg-green-700/50 rounded-full blur-[1px]"></div>
                   <span className="text-3xl md:text-5xl font-black text-slate-800 drop-shadow-md">{data.nextPos}</span>
              </div>

          </div>
      </div>

      {/* Bottom Panel - Options */}
      <div className="w-full p-6 md:p-12 bg-green-900/80 border-t-8 border-green-800 backdrop-blur-md z-40 rounded-t-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
          <div className="text-center text-green-200 font-bold mb-6 text-lg md:text-2xl uppercase tracking-widest">
              Select the Missing Stone
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {options.map((opt, index) => {
                  const isWrongShake = wrongShakeId === opt;
                  return (
                      <motion.button
                          key={index}
                          onClick={() => handleOptionClick(opt)}
                          className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-2xl border-b-8 border-emerald-800 flex items-center justify-center shadow-xl hover:from-emerald-300 hover:to-emerald-500 active:border-b-0 active:translate-y-2 transition-all group"
                          animate={isWrongShake ? { x: [-10, 10, -10, 10, 0], backgroundColor: ['#ef4444', '#10b981'] } : {}}
                          transition={{ duration: 0.4 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isVictory}
                      >
                          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">{opt}</span>
                      </motion.button>
                  );
              })}
          </div>
      </div>
      
    </div>
  );
};

export default ForestPathRescueGame;
