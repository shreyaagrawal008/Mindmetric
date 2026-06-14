import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const playThrusterSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Noise-like sound using square wave
    osc.type = 'square';
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(50, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playPowerDownSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 1.0);
    
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.0);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.0);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const GridRunnerGame = ({ dataStr, onVictory }) => {
  const [data, setData] = useState(null);
  const [currentPos, setCurrentPos] = useState(1);
  const [power, setPower] = useState(100);
  const [warningMessage, setWarningMessage] = useState(null);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isVictory, setIsVictory] = useState(false);

  useEffect(() => {
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        setData(parsed);
        setCurrentPos(parsed.start || 1);
        setPower(100);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  const speak = (text) => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
    }
  };

  const move = useCallback((direction) => {
    if (isVictory || !data) return;
    
    let nextPos = currentPos;
    let isVertical = false;

    if (direction === 'UP' && currentPos > 10) {
        nextPos = currentPos - 10;
        isVertical = true;
    } else if (direction === 'DOWN' && currentPos <= 90) {
        nextPos = currentPos + 10;
        isVertical = true;
    } else if (direction === 'LEFT' && currentPos % 10 !== 1) {
        nextPos = currentPos - 1;
    } else if (direction === 'RIGHT' && currentPos % 10 !== 0) {
        nextPos = currentPos + 1;
    }

    if (nextPos === currentPos) return; // Invalid move (e.g., hitting the wall)

    if (isVertical) {
        playThrusterSound();
        setCurrentPos(nextPos);
        speak(String(nextPos));
    } else {
        // Horizontal move drains power
        const newPower = power - 6; // Drains slightly, so crossing a row takes ~54%. Trying to walk down rows unit-by-unit will fail.
        if (newPower <= 0) {
            playPowerDownSound();
            setPower(0);
            setWarningMessage("That takes too many steps! Can you jump down a full row to leap by 10s?");
            speak("That takes too many steps! Can you jump down a full row to leap by 10s?");
            
            // Reset after a delay
            setTimeout(() => {
                setCurrentPos(data.start);
                setPower(100);
                setWarningMessage(null);
            }, 4000);
            return;
        } else {
            setCurrentPos(nextPos);
            setPower(newPower);
        }
    }

    if (nextPos === data.target) {
        setIsVictory(true);
        speak(String(nextPos) + "! Mission complete!");
        setTimeout(() => {
            if (onVictory) onVictory();
        }, 3000);
    }
  }, [currentPos, isVictory, data, power, onVictory]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') move('UP');
      else if (e.key === 'ArrowDown') move('DOWN');
      else if (e.key === 'ArrowLeft') move('LEFT');
      else if (e.key === 'ArrowRight') move('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  if (!data) return null;

  // Create grid cells
  const cells = [];
  for (let i = 1; i <= 100; i++) {
    cells.push(i);
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden touch-none select-none bg-black font-sans">
      
      {/* Deep Space Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(to right, #00ffff 1px, transparent 1px),
            linear-gradient(to bottom, #00ffff 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          perspective: '1000px',
          transform: 'rotateX(60deg) scale(2)',
          transformOrigin: 'top center'
      }}></div>

      {isVictory && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <Confetti width={windowDimension.width} height={windowDimension.height} recycle={true} numberOfPieces={300} gravity={0.2} colors={['#FFD700', '#00FFFF', '#FF00FF']} />
        </div>
      )}

      {/* Warning Message */}
      <AnimatePresence>
        {warningMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -50, scale: 0.5 }}
              animate={{ opacity: 1, y: 20, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.5 }}
              className="absolute top-4 z-50 bg-red-900/90 border-4 border-red-500 rounded-xl px-6 py-4 shadow-[0_0_30px_rgba(239,68,68,0.8)] text-center max-w-lg"
            >
                <div className="text-white font-black text-xl mb-2 flex justify-center items-center gap-2">
                    <span className="text-3xl">⚠️</span> LOW POWER
                </div>
                <div className="text-red-200 text-lg font-bold">
                    {warningMessage}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Play Area Container */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 px-4">
          
          {/* Main Grid */}
          <div className="relative bg-slate-900 border-4 border-cyan-500 rounded-xl p-2 shadow-[0_0_50px_rgba(6,182,212,0.5)]">
              <div className="grid grid-cols-10 grid-rows-10 gap-1 md:gap-1.5 w-[280px] h-[280px] md:w-[450px] md:h-[450px]">
                  {cells.map((num) => {
                      const isCurrent = currentPos === num;
                      const isTarget = data.target === num;
                      // Highlight target row on victory
                      const isTargetRow = isVictory && Math.ceil(num / 10) === Math.ceil(data.target / 10);
                      
                      let bgClass = "bg-slate-800 border border-slate-700";
                      let textClass = "text-slate-500";
                      let shadowStyle = {};

                      if (isTargetRow) {
                          bgClass = "bg-yellow-400 border border-yellow-200";
                          textClass = "text-yellow-950";
                          shadowStyle = { boxShadow: '0 0 15px #facc15' };
                      } else if (isTarget) {
                          bgClass = "bg-fuchsia-900 border-2 border-fuchsia-500";
                          textClass = "text-fuchsia-300";
                          shadowStyle = { boxShadow: '0 0 20px #d946ef, inset 0 0 10px #d946ef' };
                      } else if (isCurrent) {
                          bgClass = "bg-cyan-500 border-2 border-white";
                          textClass = "text-white";
                          shadowStyle = { boxShadow: '0 0 20px #06b6d4, inset 0 0 10px #fff' };
                      }

                      return (
                          <div 
                              key={num} 
                              className={`flex items-center justify-center rounded-sm text-[10px] md:text-sm font-bold transition-all duration-300 ${bgClass} ${textClass}`}
                              style={shadowStyle}
                          >
                              {!isCurrent && !isTarget && num}
                              
                              {/* The Portal (Target) */}
                              {isTarget && !isCurrent && (
                                  <motion.div 
                                    className="w-full h-full rounded-sm bg-fuchsia-500 flex items-center justify-center"
                                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                    transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
                                  >
                                      <div className="w-1/2 h-1/2 bg-white rounded-full blur-[2px]"></div>
                                  </motion.div>
                              )}

                              {/* The Runner (Player) */}
                              {isCurrent && (
                                  <motion.div 
                                    className="absolute z-20 flex flex-col items-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring' }}
                                  >
                                      {/* Spacesuit Helmet */}
                                      <div className="w-4 h-4 md:w-6 md:h-6 bg-white rounded-full border-2 border-slate-300 flex items-center justify-center shadow-[0_0_10px_white]">
                                          <div className="w-3 h-2 md:w-4 md:h-3 bg-cyan-900 rounded-full"></div>
                                      </div>
                                      {/* Thruster Flame (when moving or hovering) */}
                                      <motion.div 
                                        className="w-2 h-4 md:w-3 md:h-6 bg-gradient-to-t from-transparent via-cyan-300 to-white rounded-full -mt-1 blur-[1px]"
                                        animate={{ scaleY: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 0.2, repeat: Infinity }}
                                      />
                                  </motion.div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* Side Panel: Power Meter & D-Pad */}
          <div className="flex flex-row md:flex-col items-center gap-6 p-4 bg-slate-900 border-4 border-slate-700 rounded-2xl shadow-2xl">
              
              {/* Power Meter */}
              <div className="flex flex-col items-center gap-2">
                  <div className="text-cyan-400 font-black text-xs md:text-sm tracking-widest uppercase text-center">
                      Boots Power
                  </div>
                  {/* Vertical bar on desktop, horizontal on mobile */}
                  <div className="w-32 h-6 md:w-8 md:h-48 bg-black rounded-full border-2 border-slate-600 relative overflow-hidden flex flex-row md:flex-col justify-end">
                      <motion.div 
                          className="h-full md:h-auto md:w-full bg-gradient-to-r md:bg-gradient-to-t from-red-600 via-yellow-400 to-green-500"
                          animate={{ 
                              width: windowDimension.width < 768 ? `${power}%` : '100%', 
                              height: windowDimension.width >= 768 ? `${power}%` : '100%' 
                          }}
                          transition={{ type: 'spring' }}
                      />
                  </div>
              </div>

              {/* D-Pad */}
              <div className="grid grid-cols-3 grid-rows-3 gap-2 w-32 h-32 md:w-40 md:h-40">
                  <div></div>
                  <button onClick={() => move('UP')} className="bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border-b-4 border-slate-950 rounded-xl flex items-center justify-center text-cyan-400 shadow-lg"><ArrowUp size={32} /></button>
                  <div></div>
                  <button onClick={() => move('LEFT')} className="bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border-b-4 border-slate-950 rounded-xl flex items-center justify-center text-cyan-400 shadow-lg"><ArrowLeft size={32} /></button>
                  <div className="bg-slate-950 rounded-full shadow-inner flex items-center justify-center">
                     <div className="w-4 h-4 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
                  </div>
                  <button onClick={() => move('RIGHT')} className="bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border-b-4 border-slate-950 rounded-xl flex items-center justify-center text-cyan-400 shadow-lg"><ArrowRight size={32} /></button>
                  <div></div>
                  <button onClick={() => move('DOWN')} className="bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border-b-4 border-slate-950 rounded-xl flex items-center justify-center text-cyan-400 shadow-lg"><ArrowDown size={32} /></button>
                  <div></div>
              </div>

          </div>

      </div>

    </div>
  );
};

export default GridRunnerGame;
