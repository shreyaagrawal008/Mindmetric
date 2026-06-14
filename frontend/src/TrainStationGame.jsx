import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const playTrainWhistle = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create two oscillators for a dissonant train whistle chord
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    
    osc1.type = 'square';
    osc2.type = 'square';
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    const gainNode = audioCtx.createGain();
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Train whistle frequencies
    osc1.frequency.setValueAtTime(349.23, audioCtx.currentTime); // F4
    osc2.frequency.setValueAtTime(415.30, audioCtx.currentTime); // Ab4
    
    // Envelope (two short blasts)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    
    // Blast 1
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.3);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
    
    // Blast 2
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 1.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
    
    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 1.5);
    osc2.stop(audioCtx.currentTime + 1.5);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playSlamSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.2);
    const gainNode = audioCtx.createGain();
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const getTrainColor = (colorName) => {
  switch (colorName) {
    case 'Crimson': return '#991b1b'; // red-800
    case 'Midnight': return '#1e1b4b'; // indigo-950
    case 'Forest': return '#064e3b'; // emerald-900
    case 'Iron': return '#334155'; // slate-700
    case 'Brass': return '#b45309'; // amber-700
    default: return '#991b1b';
  }
};

const Log = () => (
  <div className="w-8 h-4 md:w-12 md:h-6 bg-amber-600 border-2 border-amber-800 rounded-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5)] relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_20%,rgba(0,0,0,0.1)_50%,transparent_80%)]"></div>
  </div>
);

const EmptySlot = () => (
  <div className="w-8 h-4 md:w-12 md:h-6 bg-slate-900/50 rounded-full border border-dashed border-slate-600"></div>
);

const TrainCar = ({ children, isLocked }) => (
  <div className="relative">
    {/* Wheels */}
    <div className="absolute -bottom-2 left-2 w-6 h-6 md:w-8 md:h-8 bg-slate-800 rounded-full border-4 border-slate-400 flex items-center justify-center shadow-lg z-0">
      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
    </div>
    <div className="absolute -bottom-2 right-2 w-6 h-6 md:w-8 md:h-8 bg-slate-800 rounded-full border-4 border-slate-400 flex items-center justify-center shadow-lg z-0">
      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
    </div>
    
    {/* Car Body */}
    <div className="relative w-24 h-28 md:w-32 md:h-40 bg-[#3f2b1c] border-x-4 border-b-8 border-slate-800 rounded-b-lg p-2 md:p-3 flex flex-col justify-end shadow-2xl z-10 overflow-hidden">
      {/* Wood texture */}
      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_10px,#000_10px,#000_12px)]"></div>
      
      {/* Logs Container */}
      <div className="grid grid-cols-2 gap-1 md:gap-1.5 relative z-10 w-full h-full content-end">
        {children}
      </div>

      {/* Iron Gate (Locked State) */}
      <AnimatePresence>
        {isLocked && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute inset-0 border-8 border-slate-400 bg-slate-900/30 z-20"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 15px, #94a3b8 15px, #94a3b8 20px)' }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border-2 border-slate-400 px-2 py-1 shadow-xl">
              <span className="text-white font-black text-xs md:text-sm">10</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

const TrainStationGame = ({ dataStr, onVictory }) => {
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState(1); // 1: tapping, 2: rolling, 3: locked/whistle, 4: departure
  const [currentLogs, setCurrentLogs] = useState(19);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        setData(parsed);
        setCurrentLogs(parsed.startLogs || 19);
        setPhase(1);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  const handleTapLog = () => {
    if (phase !== 1) return;
    
    if (currentLogs < 19) {
      // Just normal increment
      setCurrentLogs(prev => prev + 1);
    } else if (currentLogs === 19) {
      // The final tap triggers the milestone
      setPhase(2);
      setCurrentLogs(20);
      
      setTimeout(() => {
        setPhase(3);
        playSlamSound();
        setTimeout(() => {
          playTrainWhistle();
          setTimeout(() => {
            setPhase(4);
            setTimeout(() => {
              if (onVictory) onVictory();
            }, 3500);
          }, 3000);
        }, 500);
      }, 800);
    }
  };

  if (!data) return null;
  const { color, destination } = data;
  const trainHex = getTrainColor(color);
  
  const platformLogsCount = 20 - currentLogs;
  const isFinalLog = platformLogsCount === 1;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden touch-none select-none bg-slate-900 font-sans">
      
      {/* Sunset Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500 via-rose-700 to-slate-900 pointer-events-none"></div>
      
      {/* Sun */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-yellow-400 rounded-full blur-[40px] opacity-50 pointer-events-none"></div>

      {/* Confetti (Phase 4) */}
      {phase === 4 && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={300} gravity={0.2} colors={['#fbbf24', '#f59e0b', '#d97706']} />}

      <div className="flex-1 w-full flex flex-col items-center justify-start pt-4 md:pt-8 relative z-10 px-2">
        
        {/* Banner Announcement */}
        <div className="h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase < 3 ? (
              <motion.div 
                key="banner1"
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-800/80 border-2 border-slate-500 px-4 py-2 rounded-lg shadow-xl text-center max-w-md"
              >
                <p className="text-white font-bold text-sm md:text-base">
                  {isFinalLog ? "Look! There is one lone log left on the platform." : "Tap the logs to load them into the station!"}
                </p>
                <p className="text-amber-400 text-xs md:text-sm">{color} Engine • Next Stop: {destination}</p>
              </motion.div>
            ) : (
              <motion.div 
                key="banner2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-b from-amber-400 to-amber-600 border-4 border-white px-6 py-3 rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.8)] text-center max-w-lg"
              >
                <h1 className="text-amber-950 font-black text-xl md:text-3xl tracking-widest uppercase">10 Loose Logs</h1>
                <div className="flex items-center justify-center my-1 text-white">
                  <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </div>
                <h2 className="text-white font-black text-lg md:text-2xl drop-shadow-md">1 Brand New Group of 10!</h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The Station Master Sign */}
        <div className="mt-4 md:mt-8 bg-slate-800 border-4 border-slate-600 p-4 rounded-xl shadow-2xl flex flex-col items-center min-w-[200px]">
          <div className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">TOTAL LOGS</div>
          <div className="bg-black border-2 border-slate-700 px-6 py-2 rounded shadow-inner mb-2 flex">
            <span className="text-white font-mono font-black text-5xl md:text-6xl tracking-widest leading-none" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
              {currentLogs}
            </span>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <span className="text-amber-400 font-black text-lg md:text-xl">{currentLogs >= 20 ? '2' : '1'}</span>
              <div className="text-amber-200/50 text-[9px] md:text-[10px] font-bold uppercase">Tens</div>
            </div>
            <div className="text-center">
              <span className="text-cyan-400 font-black text-lg md:text-xl">{currentLogs >= 20 ? '0' : currentLogs - 10}</span>
              <div className="text-cyan-200/50 text-[9px] md:text-[10px] font-bold uppercase">Ones</div>
            </div>
          </div>
        </div>

      </div>

      {/* Train Tracks Layer */}
      <div className="absolute bottom-16 md:bottom-24 w-full h-8 flex flex-col justify-end z-0">
        <div className="w-full h-1 bg-slate-400"></div>
        <div className="w-full h-2 flex justify-around">
          {Array.from({length: 20}).map((_, i) => <div key={i} className="w-2 h-full bg-slate-700 skew-x-12"></div>)}
        </div>
      </div>

      {/* Platform Layer */}
      <div className="absolute bottom-0 w-full h-16 md:h-24 bg-slate-700 border-t-8 border-slate-500 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] z-20 flex flex-wrap items-center justify-center gap-2 px-4 py-2">
        {/* The Loose Logs on the Platform */}
        {phase === 1 && platformLogsCount > 0 && Array.from({length: platformLogsCount}).map((_, i) => (
          <motion.div 
            key={i}
            layoutId={`moving-log-${currentLogs + i}`}
            onClick={i === 0 ? handleTapLog : undefined}
            whileHover={i === 0 ? { scale: 1.1 } : {}}
            whileTap={i === 0 ? { scale: 0.9 } : {}}
            className={`relative z-50 ${i === 0 ? 'cursor-pointer animate-pulse' : 'opacity-80'}`}
          >
            <Log />
            {i === 0 && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white text-slate-900 text-[10px] md:text-xs font-black px-2 py-0.5 rounded shadow whitespace-nowrap">
                TAP ME!
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* The Train */}
      <motion.div 
        animate={phase === 4 ? { x: '150%' } : { x: '0%' }}
        transition={{ duration: 3, ease: "easeIn" }}
        className="absolute bottom-16 md:bottom-24 w-full flex justify-center items-end gap-1 md:gap-2 z-10"
      >
        
        {/* Engine */}
        <div className="relative w-20 h-24 md:w-28 md:h-32 rounded-r-3xl rounded-tl-lg shadow-2xl flex flex-col justify-end border-b-8 border-slate-800" style={{ backgroundColor: trainHex }}>
          <div className="absolute top-2 right-2 w-8 h-8 bg-amber-400 rounded-full blur-[2px] opacity-80"></div>
          <div className="absolute -top-8 left-4 w-6 h-8 bg-slate-600 rounded-t-sm border-2 border-slate-800"></div>
          {phase >= 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], y: -100, scale: 2 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-16 left-2 w-10 h-10 bg-white/50 rounded-full blur-[10px]"
            ></motion.div>
          )}
          {/* Wheels */}
          <div className="absolute -bottom-2 left-2 w-6 h-6 md:w-8 md:h-8 bg-slate-800 rounded-full border-4 border-slate-400"></div>
          <div className="absolute -bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-slate-800 rounded-full border-4 border-slate-400"></div>
        </div>

        {/* Coupler */}
        <div className="w-2 h-2 bg-slate-500 mb-4"></div>

        {/* Car 1 (Fully Loaded & Locked) */}
        <TrainCar isLocked={true}>
          {Array.from({length: 10}).map((_, i) => <Log key={`c1-${i}`} />)}
        </TrainCar>

        {/* Coupler */}
        <div className="w-2 h-2 bg-slate-500 mb-4"></div>

        {/* Car 2 (Variable Logs Loaded, Some Empty) */}
        <TrainCar isLocked={phase >= 3}>
          {/* Slots 1 through 10 */}
          {Array.from({length: 10}).map((_, i) => {
            const logIndex = i + 10;
            if (logIndex < currentLogs) {
              return <Log key={`c2-${i}`} />;
            } else if (logIndex === currentLogs && phase === 2) {
              // The log currently flying in
              return (
                <motion.div key={`c2-${i}`} layoutId={`moving-log-${currentLogs}`} transition={{ type: 'spring', stiffness: 60, damping: 10 }}>
                  <Log />
                </motion.div>
              );
            } else {
              return <EmptySlot key={`c2-${i}`} />;
            }
          })}
        </TrainCar>

      </motion.div>

    </div>
  );
};

export default TrainStationGame;
