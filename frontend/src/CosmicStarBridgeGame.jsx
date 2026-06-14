import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const playSonicBoom = (pitchMultiplier = 1) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Noise burst
    const bufferSize = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000 * pitchMultiplier, audioCtx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(1, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    // Synth Bass drop
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sawtooth';
    
    osc.frequency.setValueAtTime(150 * pitchMultiplier, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
    
    oscGain.gain.setValueAtTime(1, audioCtx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    
    noiseSource.start();
    osc.start();
    noiseSource.stop(audioCtx.currentTime + 0.5);
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const playWarpSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 1.5);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
  } catch (e) {
    console.error("Audio API not supported", e);
  }
};

const CosmicStarBridgeGame = ({ dataStr, onVictory }) => {
  const [data, setData] = useState(null);
  const [cellsLoaded, setCellsLoaded] = useState(0);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (dataStr) {
      try {
        const parsed = JSON.parse(dataStr);
        setData(parsed);
        setCellsLoaded(0);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  if (!data) return null;

  const handleTapDispenser = () => {
    if (cellsLoaded >= 10) return;
    
    const newCount = cellsLoaded + 1;
    setCellsLoaded(newCount);
    
    // Speed up pitch slightly after 50
    const pitchMultiplier = newCount > 5 ? 1 + ((newCount - 5) * 0.1) : 1;
    playSonicBoom(pitchMultiplier);
    
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(String(newCount * 10));
        utterance.rate = newCount > 5 ? 1.0 + ((newCount - 5) * 0.1) : 1.0;
        utterance.pitch = newCount > 5 ? 1.2 + ((newCount - 5) * 0.05) : 1.2;
        window.speechSynthesis.speak(utterance);
    }
    
    if (newCount === 10) {
      setTimeout(() => {
        playWarpSound();
        if (onVictory) onVictory();
      }, 1500);
    }
  };

  const isVictory = cellsLoaded === 10;
  const progressPercent = (cellsLoaded / 10) * 100;

  // Path coordinates (curved winding path)
  const stones = Array.from({ length: 10 }).map((_, i) => {
    const progress = i / 9; // 0 to 1
    // A sine wave path
    const x = 10 + (progress * 70) + (Math.sin(progress * Math.PI * 2) * 10);
    const y = 80 - (progress * 60);
    return { x, y, val: (i + 1) * 10 };
  });

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden touch-none select-none bg-slate-950 font-sans" style={{ background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)' }}>
      
      {/* Dynamic Starfield Background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${Math.random() * 4 + 2}s infinite alternate`
            }}
          />
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 10px rgba(255,255,255,0.8); }
        }
        @keyframes flyPack {
          0% { transform: scale(0.5) translate(0, 0); opacity: 1; }
          50% { transform: scale(1.2) translate(100px, -50px); }
          100% { transform: scale(0.2) translate(0, 0); opacity: 0; }
        }
      `}} />

      {/* Confetti & Trails on Victory */}
      {isVictory && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <Confetti 
            width={windowDimension.width} 
            height={windowDimension.height} 
            recycle={true} 
            numberOfPieces={200} 
            gravity={0.5}
            drawShape={ctx => {
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(20, 0);
              ctx.lineTo(10, 20);
              ctx.fill();
            }}
            colors={['#ffffff', '#00ffff', '#ff00ff', '#ffff00']}
          />
          {/* Hyperspeed lines */}
          {Array.from({ length: 20 }).map((_, i) => (
             <motion.div 
               key={`line-${i}`}
               initial={{ left: '50%', top: '50%', width: 0, opacity: 1 }}
               animate={{ 
                 left: `${Math.random() * 200 - 50}%`, 
                 top: `${Math.random() * 200 - 50}%`,
                 width: '200px',
                 opacity: 0
               }}
               transition={{ duration: 0.5, repeat: Infinity, delay: Math.random() * 0.5 }}
               className="absolute h-1 bg-white"
               style={{ transformOrigin: 'left center', rotate: `${Math.random() * 360}deg`, boxShadow: '0 0 10px #fff' }}
             />
          ))}
        </div>
      )}

      {/* Top Header - Progress Meter */}
      <div className="w-full h-16 md:h-24 bg-slate-900/80 border-b-4 border-slate-800 flex flex-col items-center justify-center px-4 relative z-40 shadow-2xl">
        <div className="text-cyan-400 font-black text-sm md:text-xl tracking-widest uppercase mb-1 drop-shadow-md">
          Warp Drive Energy
        </div>
        <div className="w-full max-w-4xl h-6 md:h-8 bg-black rounded-full border-2 border-slate-700 overflow-hidden relative shadow-inner">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 40 }}
          />
          {/* Grid lines in progress bar */}
          <div className="absolute inset-0 flex justify-between px-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-full w-[1px] bg-white/20"></div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center font-black text-white text-xs md:text-sm drop-shadow-md">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 w-full relative z-10 overflow-hidden">
        
        {/* The Cosmic Star Bridge (Stepping Stones) */}
        {stones.map((stone, index) => {
          const isActive = index < cellsLoaded;
          const isLastAndActive = isVictory && index === 9;
          
          return (
            <motion.div
              key={index}
              className="absolute flex items-center justify-center rounded-full"
              style={{
                left: `${stone.x}%`,
                top: `${stone.y}%`,
                width: '60px',
                height: '40px',
                transform: 'translate(-50%, -50%)',
                background: isLastAndActive 
                  ? '#ffffff' 
                  : isActive 
                    ? 'radial-gradient(ellipse, #fbbf24, #b45309)' 
                    : 'radial-gradient(ellipse, #334155, #0f172a)',
                border: isActive ? '3px solid #fef3c7' : '2px solid #475569',
                boxShadow: isLastAndActive 
                  ? '0 0 50px 20px rgba(255,255,255,0.8), 0 0 100px 40px rgba(0,255,255,0.6)' 
                  : isActive 
                    ? '0 0 20px rgba(251, 191, 36, 0.6)' 
                    : 'none',
                transition: 'all 0.5s ease-out',
                zIndex: 20 + index
              }}
              initial={false}
              animate={isActive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <span className={`font-black text-sm md:text-base ${isActive ? (isLastAndActive ? 'text-black' : 'text-amber-950') : 'text-slate-500'}`}>
                {stone.val}
              </span>
            </motion.div>
          );
        })}

        {/* The Path Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 15 }}>
          <path 
            d={`M ${stones.map(s => `${s.x}% ${s.y}%`).join(' L ')}`} 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="4" 
            strokeDasharray="10 10"
          />
        </svg>

        {/* Spaceship */}
        <motion.div
          className="absolute z-30 flex flex-col items-center"
          animate={{
            left: `${isVictory ? 150 : stones[0].x}%`,
            top: `${isVictory ? 20 : stones[0].y}%`,
            scale: isVictory ? 0.5 : 1,
            opacity: isVictory ? 0 : 1
          }}
          transition={isVictory ? { duration: 1.5, ease: "easeIn" } : { type: 'spring' }}
          style={{ transform: 'translate(-50%, -100%)', marginTop: '-20px' }}
        >
          {/* Flame */}
          <motion.div 
            className="w-4 h-12 bg-gradient-to-t from-transparent via-red-500 to-yellow-300 rounded-full absolute -bottom-8 blur-sm"
            animate={{ scaleY: isVictory ? 3 : [1, 1.2, 1] }}
            transition={{ repeat: isVictory ? 0 : Infinity, duration: 0.2 }}
          />
          {/* Hull */}
          <div className="w-16 h-20 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-full rounded-b-lg border-2 border-gray-400 flex flex-col items-center shadow-lg relative">
            <div className="w-8 h-8 bg-cyan-300 rounded-full mt-4 border-4 border-gray-600 shadow-inner overflow-hidden">
               {/* Reflection */}
               <div className="w-full h-1/2 bg-white/30 rounded-full transform -translate-y-2 -rotate-12"></div>
            </div>
            {/* Wings */}
            <div className="absolute -left-6 bottom-2 w-8 h-10 bg-red-600 rounded-l-full transform -skew-y-12"></div>
            <div className="absolute -right-6 bottom-2 w-8 h-10 bg-red-600 rounded-r-full transform skew-y-12"></div>
          </div>
        </motion.div>

        {/* Battery Dispenser (Clickable) */}
        <motion.div
          className={`absolute bottom-8 right-8 md:bottom-16 md:right-16 w-32 h-40 md:w-48 md:h-56 z-40 flex flex-col items-center justify-end ${cellsLoaded < 10 ? 'cursor-pointer' : 'opacity-50'}`}
          onClick={handleTapDispenser}
          whileHover={cellsLoaded < 10 ? { scale: 1.05 } : {}}
          whileTap={cellsLoaded < 10 ? { scale: 0.95 } : {}}
        >
          {/* Hologram / Projection above dispenser */}
          <div className="absolute -top-12 md:-top-16 text-cyan-300 font-black animate-pulse text-sm md:text-xl text-center bg-cyan-900/50 px-4 py-2 rounded-xl border border-cyan-500 backdrop-blur-sm">
            {cellsLoaded < 10 ? "TAP TO LOAD 10 CELLS" : "READY FOR WARP!"}
          </div>
          
          {/* Dispenser Body */}
          <div className="w-full h-full bg-slate-800 rounded-t-3xl border-4 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)] relative flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute top-0 w-full h-4 bg-cyan-400/20"></div>
            
            {/* The Pack of 10 Cells (Visual inside dispenser) */}
            <div className="grid grid-cols-5 gap-1 md:gap-2 p-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-3 h-4 md:w-5 md:h-6 bg-cyan-400 border border-cyan-200 rounded-sm shadow-[0_0_5px_#22d3ee]"></div>
              ))}
            </div>

            <div className="w-full h-1/3 bg-slate-900 absolute bottom-0 flex justify-center items-center border-t-2 border-slate-700">
               <div className="w-16 h-4 bg-slate-950 rounded-full shadow-inner"></div>
            </div>
          </div>
        </motion.div>

        {/* Animated Flying Pack */}
        <AnimatePresence>
          {cellsLoaded > 0 && cellsLoaded <= 10 && (
            <motion.div
              key={`pack-${cellsLoaded}`}
              initial={{ 
                left: 'calc(100% - 100px)', 
                top: 'calc(100% - 100px)', 
                scale: 1, 
                opacity: 1 
              }}
              animate={{ 
                left: `${stones[cellsLoaded - 1].x}%`, 
                top: `${stones[cellsLoaded - 1].y}%`, 
                scale: 0, 
                opacity: 0 
              }}
              transition={{ duration: 0.4, ease: "easeIn" }}
              className="absolute z-50 pointer-events-none drop-shadow-[0_0_15px_rgba(34,211,238,1)]"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div className="bg-cyan-100 p-2 rounded-lg grid grid-cols-5 gap-1 border-2 border-cyan-400 bg-opacity-90">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="w-2 h-3 bg-cyan-500 rounded-sm"></div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default CosmicStarBridgeGame;
