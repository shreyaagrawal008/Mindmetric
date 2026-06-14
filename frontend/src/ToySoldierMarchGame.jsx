import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const playMarchSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playStep = (time) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 150;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(60, time);
      osc.frequency.exponentialRampToValueAtTime(10, time + 0.1);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(1, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      
      osc.start(time);
      osc.stop(time + 0.1);
    };

    const now = audioCtx.currentTime;
    playStep(now);
    playStep(now + 0.3);
    playStep(now + 0.6);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playFanfare = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playNote = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + duration - 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    const now = audioCtx.currentTime;
    playNote(523.25, now, 0.2); // C5
    playNote(659.25, now + 0.2, 0.2); // E5
    playNote(783.99, now + 0.4, 0.4); // G5
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const Soldier = ({ colorHex }) => (
  <div className="relative w-4 h-12 md:w-6 md:h-16 flex flex-col items-center drop-shadow-md">
    {/* Hat */}
    <div className="w-full h-4 md:h-6 bg-black rounded-t-sm border-b-2 border-yellow-400"></div>
    {/* Face */}
    <div className="w-3/4 h-3 md:h-4 bg-orange-200">
      {/* Eyes */}
      <div className="absolute top-5 md:top-7 w-full flex justify-center gap-1">
        <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-black rounded-full"></div>
        <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-black rounded-full"></div>
      </div>
    </div>
    {/* Body */}
    <div className="w-full flex-1 flex flex-col items-center relative" style={{ backgroundColor: colorHex }}>
      {/* Belt */}
      <div className="absolute top-1/2 w-full h-1 bg-white border-y border-gray-300">
        <div className="absolute left-1/2 -ml-1 w-2 h-2 bg-yellow-400 border border-yellow-600"></div>
      </div>
      {/* Arms */}
      <div className="absolute -left-1 top-0 w-1.5 h-6 md:w-2 md:h-8" style={{ backgroundColor: colorHex }}></div>
      <div className="absolute -right-1 top-0 w-1.5 h-6 md:w-2 md:h-8" style={{ backgroundColor: colorHex }}></div>
    </div>
    {/* Legs */}
    <div className="w-full h-3 md:h-4 flex justify-between bg-white">
      <div className="w-1/2 h-full border-r border-gray-300"></div>
      <div className="w-1/2 h-full"></div>
    </div>
    {/* Boots */}
    <div className="w-full h-2 bg-black rounded-t-xs"></div>
  </div>
);

const Squad = ({ colorHex }) => (
  <div className="relative grid grid-cols-5 gap-1 md:gap-2">
    {Array.from({ length: 10 }).map((_, i) => (
      <Soldier key={i} colorHex={colorHex} />
    ))}
  </div>
);

const ToySoldierMarchGame = ({ dataStr, onVictory }) => {
  const [data, setData] = useState(null);
  const [squadsDeployed, setSquadsDeployed] = useState(0);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        setData(parsed);
        setSquadsDeployed(0);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  const getColorHex = (c) => {
    switch (c) {
      case 'Blue': return '#1d4ed8';
      case 'Red': return '#b91c1c';
      case 'Green': return '#15803d';
      case 'Purple': return '#7e22ce';
      case 'Gold': return '#d97706';
      default: return '#1d4ed8';
    }
  };

  if (!data) return null;
  const { color, target = 50 } = data;
  const colorHex = getColorHex(color);
  const totalSquads = target / 10;
  
  const handleTapBarracks = () => {
    if (squadsDeployed >= totalSquads) return;
    
    playMarchSound();
    
    const newCount = squadsDeployed + 1;
    setSquadsDeployed(newCount);
    
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(String(newCount * 10));
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
    }
    
    if (newCount === totalSquads) {
      setTimeout(() => {
        playFanfare();
        if (onVictory) onVictory();
      }, 1500);
    } else {
        setTimeout(() => {
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance("Send another squad! Add 10 more!");
                utterance.rate = 1.1;
                utterance.pitch = 1.2;
                window.speechSynthesis.speak(utterance);
            }
        }, 1000);
    }
  };

  const isVictory = squadsDeployed === totalSquads;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden touch-none select-none bg-slate-900 font-sans">
      
      {/* Castle Night Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-black pointer-events-none"></div>
      
      {/* Stars */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full opacity-50 blur-[1px]"></div>
      <div className="absolute top-24 right-32 w-3 h-3 bg-white rounded-full opacity-70 blur-[1px]"></div>
      
      {/* Confetti */}
      {isVictory && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={400} gravity={0.3} colors={['#fbbf24', '#f59e0b', '#d97706', '#ef4444', '#3b82f6']} />}

      <div className="flex-1 w-full flex flex-col items-center justify-start pt-4 md:pt-8 relative z-10 px-2">
        
        {/* Banner */}
        <div className="h-20 flex items-center justify-center z-50">
          <AnimatePresence mode="wait">
            {!isVictory ? (
              <motion.div 
                key="banner1"
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-800/80 border-2 border-slate-500 px-6 py-3 rounded-lg shadow-xl text-center max-w-md"
              >
                <p className="text-white font-bold text-sm md:text-lg">
                  {squadsDeployed === 0 ? "Company, march! Send a squad of 10 to the first bridge gate!" : "Send another squad! Add 10 more!"}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="banner2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-white px-8 py-4 rounded-xl shadow-[0_0_40px_rgba(251,191,36,0.8)] text-center max-w-lg"
              >
                <h1 className="text-amber-950 font-black text-2xl md:text-4xl tracking-widest uppercase">Parade Complete!</h1>
                <h2 className="text-white font-black text-xl md:text-3xl drop-shadow-md">{target} Soldiers!</h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The Digital Dashboard Scoreboard */}
        <div className="mt-4 md:mt-8 bg-slate-950 border-4 border-slate-700 p-6 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col items-center min-w-[250px]">
          <div className="text-slate-400 text-xs md:text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            SOLDIER COUNT
          </div>
          <div className="bg-black border-2 border-slate-800 px-8 py-3 rounded-lg shadow-inner flex">
            <motion.span 
              key={squadsDeployed}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-red-500 font-mono font-black text-6xl md:text-8xl tracking-widest leading-none" 
              style={{ textShadow: '0 0 20px rgba(239,68,68,0.8)' }}
            >
              {squadsDeployed * 10}
            </motion.span>
          </div>
        </div>

      </div>

      {/* Castle Bridge and Landing Zones */}
      <div className="absolute bottom-0 w-full h-64 md:h-80 flex justify-center items-end pb-8 z-20">
        
        {/* Castle Gate */}
        <div className="absolute right-0 bottom-0 w-32 md:w-48 h-full bg-slate-800 border-l-8 border-slate-700 shadow-2xl flex flex-col justify-end p-2 z-0">
          <div className="w-full h-3/4 bg-black rounded-t-full border-4 border-slate-600 relative overflow-hidden">
            <AnimatePresence>
              {!isVictory && (
                <motion.div exit={{ y: '100%' }} transition={{ duration: 1 }} className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#475569_10px,#475569_20px)] border-t-8 border-slate-500"></motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="absolute top-0 right-4 w-16 h-24 bg-slate-700 border-4 border-slate-600 rounded-t-xl -mt-16">
             <div className="w-full flex justify-between px-1 -mt-4">
                 <div className="w-3 h-4 bg-slate-700"></div>
                 <div className="w-3 h-4 bg-slate-700"></div>
                 <div className="w-3 h-4 bg-slate-700"></div>
             </div>
          </div>
        </div>

        {/* Barracks (Clickable) */}
        <motion.div 
          onClick={handleTapBarracks}
          whileHover={squadsDeployed < totalSquads ? { scale: 1.05 } : {}}
          whileTap={squadsDeployed < totalSquads ? { scale: 0.95 } : {}}
          className={`absolute left-0 bottom-8 w-32 md:w-48 h-40 bg-slate-800 border-r-8 border-slate-700 shadow-2xl z-30 flex flex-col items-center justify-end p-4 ${squadsDeployed < totalSquads ? 'cursor-pointer' : 'opacity-50'}`}
        >
          <div className="absolute -top-12 bg-slate-700 px-4 py-2 rounded-t-lg border-2 border-b-0 border-slate-600 text-white font-black">BARRACKS</div>
          <div className="w-full h-full bg-black rounded-t-full border-4 border-slate-600 relative overflow-hidden flex items-end justify-center pb-2">
            {squadsDeployed < totalSquads && (
              <div className="scale-50 origin-bottom transform">
                <Squad colorHex={colorHex} />
              </div>
            )}
          </div>
          {squadsDeployed < totalSquads && (
             <div className="absolute -top-24 bg-white text-black px-3 py-1 rounded shadow-lg text-sm font-black animate-bounce flex flex-col items-center">
                 TAP TO MARCH
                 <div className="w-3 h-3 bg-white transform rotate-45 -mb-2 mt-1"></div>
             </div>
          )}
        </motion.div>

        {/* Bridge Surface */}
        <div className="w-[80%] max-w-5xl h-24 bg-slate-600 border-y-8 border-slate-500 shadow-2xl relative flex z-10 px-8 ml-32 mr-32 items-end pb-4">
          
          {/* Landing Zones */}
          <div className="w-full h-full flex justify-between gap-2">
            {Array.from({ length: totalSquads }).map((_, i) => {
              const isOccupied = i < squadsDeployed;
              
              return (
                <div key={i} className={`flex-1 relative border-4 flex flex-col items-center justify-end ${isOccupied ? 'border-cyan-400 bg-cyan-900/40 shadow-[inset_0_0_20px_rgba(34,211,238,0.5)]' : 'border-slate-500 bg-slate-700 border-dashed'}`}>
                  
                  {/* Flag */}
                  <div className={`absolute -top-16 md:-top-24 w-8 md:w-12 h-12 md:h-16 ${isOccupied ? 'bg-amber-400' : 'bg-slate-700'} border-2 border-slate-800 flex items-center justify-center`}>
                    <span className={`font-black ${isOccupied ? 'text-black' : 'text-slate-500'} text-xs md:text-sm`}>{(i + 1) * 10}</span>
                  </div>
                  <div className="absolute -top-16 md:-top-24 left-0 w-1 h-16 md:h-24 bg-slate-800"></div>

                  {/* Squad */}
                  <AnimatePresence>
                    {isOccupied && (
                      <motion.div 
                        initial={{ x: -200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 50 }}
                        className="scale-75 md:scale-100 origin-bottom"
                      >
                        <Squad colorHex={colorHex} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ToySoldierMarchGame;
