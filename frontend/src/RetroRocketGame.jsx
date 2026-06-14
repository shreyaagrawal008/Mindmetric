import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const playPneumaticSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Low mechanical clank
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
    
    // Hiss (white noise)
    const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0, audioCtx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    noise.start();
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const RetroRocketGame = ({ dataStr, question, onVictory }) => {
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
        // Ensure exactly 3 unique options
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
        utterance.pitch = 0.9; // slightly deeper for commander
        window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionClick = (val) => {
    if (isVictory) return;
    
    const correctAns = data.target - 1;
    
    if (val === correctAns) {
        // Correct!
        setIsVictory(true);
        setWarningMessage(null);
        playPneumaticSound();
        
        speak("Code accepted! Ignition sequence started!");
        
        setTimeout(() => {
            if (onVictory) onVictory();
        }, 4000); // 4 seconds for the rocket launch animation
    } else {
        // Wrong!
        setWrongShakeId(val);
        setTimeout(() => setWrongShakeId(null), 500);
        
        if (val === data.target + 1) {
            // Anti-forward safeguard
            setWarningMessage("That's the forward neighbor! We need to step backward to clear the ignition sequence!");
            speak("That's the forward neighbor! We need to step backward to clear the ignition sequence!");
        } else {
            setWarningMessage("Invalid code sequence. Check the target number!");
            speak("Invalid code sequence. Check the target number!");
        }
    }
  };

  if (!data || options.length === 0) return null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between touch-none select-none bg-slate-900 font-mono" style={{ background: 'linear-gradient(to bottom, #0f172a 0%, #1e1b4b 100%)' }}>
      
      {/* Dynamic Starfield Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         {Array.from({ length: 40 }).map((_, i) => (
             <motion.div 
               key={i}
               className="absolute w-1 h-1 bg-white rounded-full"
               initial={{ 
                   x: Math.random() * windowDimension.width, 
                   y: Math.random() * windowDimension.height,
                   opacity: Math.random() * 0.5 + 0.1
               }}
               animate={{ 
                   opacity: [0.1, 0.8, 0.1]
               }}
               transition={{ 
                   duration: Math.random() * 3 + 2, 
                   repeat: Infinity,
                   ease: "easeInOut"
               }}
             />
         ))}
      </div>

      {isVictory && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
          {/* Cosmic smoke and fire trails */}
          <Confetti 
             width={windowDimension.width} 
             height={windowDimension.height} 
             recycle={true} 
             numberOfPieces={100} 
             gravity={0.8}
             initialVelocityY={20}
             colors={['#f97316', '#ef4444', '#fbbf24', '#9ca3af', '#d1d5db', '#4b5563']}
             drawShape={ctx => {
                 const isSmoke = Math.random() > 0.4;
                 if (isSmoke) {
                     // Draw cloud shape
                     ctx.beginPath();
                     ctx.arc(0, 0, 10, 0, Math.PI * 2);
                     ctx.arc(5, -5, 12, 0, Math.PI * 2);
                     ctx.arc(12, 0, 8, 0, Math.PI * 2);
                     ctx.fill();
                 } else {
                     // Draw fire streak
                     ctx.beginPath();
                     ctx.moveTo(0, -10);
                     ctx.lineTo(5, 10);
                     ctx.lineTo(-5, 10);
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
              className="absolute top-4 z-50 bg-red-900/95 border-2 border-red-500 rounded-xl px-6 py-4 shadow-[0_0_20px_rgba(239,68,68,0.5)] text-center max-w-lg backdrop-blur-sm"
            >
                <div className="text-red-200 text-sm md:text-lg font-bold tracking-widest uppercase">
                    ⚠ {warningMessage}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Play Area - Rocket Launchpad */}
      <div className="flex-1 w-full relative z-10 flex flex-col items-center justify-end pb-2 md:pb-8">
          
          {/* Rocket Ship */}
          <motion.div 
             className="relative flex flex-col items-center z-20 scale-[0.65] md:scale-100 origin-bottom"
             animate={isVictory ? { y: -windowDimension.height - 200 } : { y: [0, -5, 0] }}
             transition={isVictory ? { duration: 2.5, ease: "easeIn", delay: 1 } : { duration: 3, repeat: Infinity }}
          >
              {/* Rocket Nose */}
              <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-red-500"></div>
              {/* Rocket Body */}
              <div className="w-[60px] h-[120px] bg-slate-300 relative border-x-4 border-slate-400 rounded-sm overflow-hidden flex flex-col items-center justify-start pt-4">
                  {/* Window */}
                  <div className="w-8 h-8 rounded-full bg-cyan-200 border-4 border-slate-500 shadow-inner"></div>
                  {/* Stripe */}
                  <div className="w-full h-2 bg-red-500 mt-8"></div>
              </div>
              {/* Fins */}
              <div className="absolute bottom-4 -left-6 w-0 h-0 border-r-[24px] border-r-red-600 border-b-[40px] border-b-transparent transform -rotate-12"></div>
              <div className="absolute bottom-4 -right-6 w-0 h-0 border-l-[24px] border-l-red-600 border-b-[40px] border-b-transparent transform rotate-12"></div>
              {/* Thruster */}
              <div className="w-10 h-6 bg-slate-700 rounded-b-md border-b-4 border-slate-900 mt-[-2px] relative z-[-1]"></div>
              
              {/* Idle Engine Vapor / Launch Fire */}
              <AnimatePresence>
                  {!isVictory && (
                      <motion.div 
                          className="absolute -bottom-10 w-8 h-8 bg-blue-100 rounded-full opacity-50 blur-md"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                          transition={{ duration: 1, repeat: Infinity }}
                      />
                  )}
              </AnimatePresence>
              {isVictory && (
                  <motion.div 
                      className="absolute -bottom-24 w-12 h-24 bg-gradient-to-t from-orange-400 via-red-500 to-yellow-300 rounded-full blur-sm"
                      animate={{ scale: [1, 1.2, 0.9, 1.1], opacity: [0.8, 1, 0.9, 1] }}
                      transition={{ duration: 0.2, repeat: Infinity }}
                  />
              )}
          </motion.div>

          {/* Launchpad Clamps */}
          <div className="w-48 h-8 flex justify-between absolute bottom-4 md:bottom-8 z-30 scale-75 md:scale-100 origin-bottom">
              <motion.div 
                 className="w-12 h-16 bg-slate-600 border-2 border-slate-800 rounded-t-lg origin-bottom-left"
                 animate={isVictory ? { rotate: -45 } : { rotate: 0 }}
                 transition={{ duration: 0.5 }}
              />
              <motion.div 
                 className="w-12 h-16 bg-slate-600 border-2 border-slate-800 rounded-t-lg origin-bottom-right"
                 animate={isVictory ? { rotate: 45 } : { rotate: 0 }}
                 transition={{ duration: 0.5 }}
              />
          </div>

          {/* Launchpad Base Platform */}
          <div className="w-64 md:w-96 h-4 md:h-8 bg-slate-800 border-t-4 border-slate-500 rounded-t-xl absolute bottom-0 z-10 flex justify-center items-center">
             <div className="w-full h-1 bg-yellow-500/50 mt-1" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.5) 10px, rgba(0,0,0,0.5) 20px)' }}></div>
          </div>
      </div>

      {/* Dashboard UI */}
      <div className="w-full p-2 md:p-4 bg-slate-800 border-t-4 border-slate-600 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center">
          
          {/* Dashboard Screen */}
          <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-700 rounded-xl p-2 md:p-3 mb-2 md:mb-4 shadow-inner relative flex flex-col items-center">
              {/* Status Bar */}
              <div className="w-full flex justify-between items-center mb-2">
                  <div className="flex gap-2 items-center">
                      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${isVictory ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse'}`}></div>
                      <span className="text-[10px] md:text-xs text-slate-400 tracking-widest">{isVictory ? 'SYSTEM ALIGNED' : 'IGNITION LOCKED'}</span>
                  </div>
                  <div className="text-[10px] md:text-xs text-cyan-400 tracking-widest font-bold">SEQ-ALPHA</div>
              </div>

              {/* The Lock Sequence Display */}
              <div className="flex items-center justify-center gap-2 md:gap-4 bg-black/50 p-2 md:p-3 rounded-lg border border-slate-800 w-full">
                  
                  {/* The Missing Key Slot */}
                  <div className="relative w-12 h-16 md:w-16 md:h-20 bg-slate-800/80 rounded border-2 border-dashed border-cyan-500/50 flex flex-col items-center justify-center overflow-hidden">
                      <span className="text-cyan-500/30 text-[10px] absolute top-1 uppercase tracking-widest">Prior</span>
                      <AnimatePresence>
                          {!isVictory && (
                              <motion.div 
                                  className="text-3xl text-cyan-400 font-bold animate-pulse"
                                  exit={{ opacity: 0, scale: 0 }}
                              >_</motion.div>
                          )}
                      </AnimatePresence>
                      <AnimatePresence>
                          {isVictory && (
                              <motion.div 
                                  className="absolute inset-0 bg-cyan-900/40 border border-cyan-400 flex items-center justify-center shadow-[inset_0_0_20px_rgba(34,211,238,0.3)]"
                                  initial={{ opacity: 0, scale: 1.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                              >
                                  <span className="text-3xl md:text-4xl font-black text-cyan-300 drop-shadow-[0_0_8px_#22d3ee]">{data.target - 1}</span>
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>

                  {/* Connector */}
                  <div className="flex flex-col gap-1 items-center justify-center opacity-50">
                      <div className="w-3 h-1 bg-cyan-500"></div>
                  </div>

                  {/* The Target Number */}
                  <div className="relative w-12 h-16 md:w-16 md:h-20 bg-slate-800 rounded border-2 border-slate-600 flex flex-col items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
                      <span className="text-slate-400 text-[10px] absolute top-1 uppercase tracking-widest">Target</span>
                      <span className="text-3xl md:text-4xl font-black text-white drop-shadow-md">{data.target}</span>
                      {/* Flashing target indicator */}
                      {!isVictory && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full animate-ping"></div>
                      )}
                  </div>
              </div>
          </div>

          {/* Keypad Options */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6">
              {options.map((opt, index) => {
                  const isWrongShake = wrongShakeId === opt;
                  return (
                      <motion.button
                          key={index}
                          onClick={() => handleOptionClick(opt)}
                          className="relative w-16 h-12 md:w-20 md:h-16 bg-slate-700 rounded-lg border-b-6 md:border-b-8 border-slate-900 flex items-center justify-center shadow-lg hover:bg-slate-600 active:border-b-0 active:translate-y-1 md:active:translate-y-2 transition-all group overflow-hidden"
                          animate={isWrongShake ? { x: [-10, 10, -10, 10, 0], backgroundColor: ['#7f1d1d', '#334155'] } : {}}
                          transition={{ duration: 0.4 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isVictory}
                      >
                          {/* Neon glow effect on hover */}
                          <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/20 transition-all"></div>
                          {/* Button text */}
                          <span className="text-2xl md:text-3xl font-black text-slate-200 group-hover:text-cyan-300 drop-shadow-[0_0_5px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_8px_#22d3ee] transition-all">{opt}</span>
                      </motion.button>
                  );
              })}
          </div>
      </div>
      
    </div>
  );
};

export default RetroRocketGame;
