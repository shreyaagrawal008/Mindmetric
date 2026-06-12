import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const NumberCastleGame = ({ dataStr, onVictory, onCorrectSound, onErrorSound }) => {
  const [data, setData] = useState(null);
  
  // Game State
  const [revealed11, setRevealed11] = useState(false);
  const [revealed12, setRevealed12] = useState(false);
  const [matches, setMatches] = useState({
    agent11_word: false,
    agent11_eq: false,
    agent12_word: false,
    agent12_eq: false
  });
  
  const [isVictorious, setIsVictorious] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Drop zone refs
  const agent11Ref = useRef(null);
  const agent12Ref = useRef(null);

  useEffect(() => {
    if (dataStr) {
      try {
        setData(JSON.parse(dataStr));
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStr]);

  // Check victory condition
  useEffect(() => {
    if (matches.agent11_word && matches.agent11_eq && matches.agent12_word && matches.agent12_eq && !isVictorious) {
      setIsVictorious(true);
      if (onCorrectSound) onCorrectSound();
      setTimeout(() => {
        if (onVictory) onVictory();
      }, 3500);
    }
  }, [matches, isVictorious, onCorrectSound, onVictory]);

  const checkDrop = (e, info, cardId, targetAgent) => {
    const targetRef = targetAgent === 11 ? agent11Ref : agent12Ref;
    if (!targetRef.current) return false;

    // Use getBoundingClientRect for accurate hit detection
    const rect = targetRef.current.getBoundingClientRect();
    const x = info.point.x;
    const y = info.point.y;

    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      // Hit!
      setMatches(prev => ({ ...prev, [cardId]: true }));
      if (onCorrectSound) onCorrectSound();
      return true;
    } else {
      if (onErrorSound) onErrorSound();
      return false;
    }
  };

  const Base10Block = ({ ones }) => (
    <div className="flex gap-2 items-center justify-center bg-indigo-900/50 p-2 rounded-xl">
      {/* 10 Block */}
      <div className="grid grid-rows-5 grid-cols-2 gap-[2px] bg-yellow-500/20 p-1 rounded-md border-2 border-yellow-500">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-yellow-400 rounded-sm shadow-sm" />
        ))}
      </div>
      <span className="text-white font-bold mx-1">+</span>
      {/* Loose Ones */}
      <div className={`grid grid-rows-2 grid-cols-2 gap-[2px]`}>
        {Array.from({ length: ones }).map((_, i) => (
          <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-blue-400 rounded-sm shadow-sm" />
        ))}
      </div>
    </div>
  );

  const Agent = ({ id, revealed, onReveal, matchesWord, matchesEq, targetRef }) => {
    const isTwin11 = id === 11;
    const isFullyMatched = matchesWord && matchesEq;

    return (
      <div 
        ref={targetRef}
        className="relative flex flex-col items-center p-4 min-w-[200px]"
      >
        {/* Name Plate */}
        <div className={`text-xl md:text-2xl font-black mb-2 px-4 py-1 rounded-full ${isFullyMatched ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
           AGENT {id}
        </div>

        {/* The Agent Body */}
        <div 
          onClick={() => { if (!revealed) onReveal(); }}
          className={`relative cursor-pointer transition-transform ${!revealed ? 'hover:scale-105 hover:-translate-y-2' : ''}`}
        >
          {/* Base Character Emoji */}
          <div className="text-7xl md:text-8xl relative z-10 drop-shadow-xl flex items-center justify-center">
            {isVictorious ? '🤴' : '🕵️'}
            
            {/* The Trench Coat (Hides the inner value) */}
            <AnimatePresence>
              {!revealed && !isVictorious && (
                <motion.div 
                  initial={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0, y: 50 }}
                  className="absolute inset-0 top-[20%] w-full h-[80%] bg-amber-700 rounded-t-xl rounded-b-sm border-x-4 border-b-4 border-amber-900 shadow-inner z-20 flex items-center justify-center overflow-hidden"
                >
                  {/* Coat Details */}
                  <div className="w-1 h-full bg-amber-900 absolute left-1/2 -ml-[2px]" />
                  <div className="w-4 h-4 rounded-full bg-amber-950 absolute left-1/2 -ml-2 top-1/4" />
                  <div className="w-4 h-4 rounded-full bg-amber-950 absolute left-1/2 -ml-2 top-2/4" />
                  <span className="text-amber-300/50 text-xs font-black rotate-90 absolute left-2 uppercase">TOP SECRET</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Royal Cape (Victory State) */}
            <AnimatePresence>
              {isVictorious && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 -z-10 bg-gradient-to-b from-red-500 to-red-800 rounded-t-3xl rounded-b-md transform scale-125 translate-y-4 shadow-2xl"
                />
              )}
            </AnimatePresence>
          </div>
          
          {/* The Revealed Base-10 Value */}
          <AnimatePresence>
            {revealed && !isVictorious && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-30"
              >
                <Base10Block ones={id - 10} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drop Zone Slots */}
        <div className="mt-4 w-full flex flex-col gap-2 relative z-0">
           <div className={`h-10 md:h-12 w-full rounded-xl border-4 border-dashed flex items-center justify-center text-xs md:text-sm font-bold transition-colors ${matchesWord ? 'border-green-500 bg-green-500/20 text-green-300' : 'border-slate-500/50 text-slate-500'}`}>
              {matchesWord ? (id === 11 ? 'ELEVEN' : 'TWELVE') : 'Drop Word Here'}
           </div>
           <div className={`h-10 md:h-12 w-full rounded-xl border-4 border-dashed flex items-center justify-center text-xs md:text-sm font-bold transition-colors ${matchesEq ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-slate-500/50 text-slate-500'}`}>
              {matchesEq ? `10 + ${id - 10}` : 'Drop Equation Here'}
           </div>
        </div>
      </div>
    );
  };

  const DraggableCard = ({ id, content, type, targetAgent }) => {
    // Determine if this specific card has been matched
    let isMatched = false;
    if (targetAgent === 11 && type === 'word') isMatched = matches.agent11_word;
    if (targetAgent === 11 && type === 'eq') isMatched = matches.agent11_eq;
    if (targetAgent === 12 && type === 'word') isMatched = matches.agent12_word;
    if (targetAgent === 12 && type === 'eq') isMatched = matches.agent12_eq;

    if (isMatched) return null; // Hide from bank if matched

    return (
      <motion.div
        drag
        dragSnapToOrigin={true}
        onDragEnd={(e, info) => checkDrop(e, info, id, targetAgent)}
        whileHover={{ scale: 1.1 }}
        whileDrag={{ scale: 1.2, zIndex: 50, rotate: -5 }}
        className={`cursor-grab active:cursor-grabbing px-4 py-2 md:px-6 md:py-3 rounded-xl font-black text-sm md:text-xl shadow-xl z-40 touch-none select-none ${
          type === 'word' 
            ? 'bg-gradient-to-b from-green-400 to-green-600 text-white border-b-4 border-green-800' 
            : 'bg-gradient-to-b from-blue-400 to-blue-600 text-white border-b-4 border-blue-800'
        }`}
      >
        {content}
      </motion.div>
    );
  };

  if (!data) return null;

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-between p-4 overflow-hidden touch-none select-none transition-colors duration-1000 ${isVictorious ? 'bg-indigo-950/80' : 'bg-transparent'}`}>
      
      {/* Background Castle Decor */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isVictorious ? 'opacity-100' : 'opacity-0'}`}>
         {/* Simple Castle Silhouette using CSS */}
         <div className="absolute bottom-0 w-full h-64 bg-slate-900 rounded-t-[100px] border-t-8 border-yellow-500 shadow-[0_-20px_50px_rgba(234,179,8,0.2)] flex items-end justify-center px-20">
            <div className="w-1/3 h-full border-x-8 border-t-8 border-yellow-500/50 bg-slate-950 flex justify-center">
               <div className="w-24 h-32 bg-amber-900 rounded-t-full mt-auto border-t-8 border-x-8 border-amber-950 flex items-center justify-center">
                 <span className="text-yellow-500 text-4xl">🏰</span>
               </div>
            </div>
         </div>
      </div>

      {isVictorious && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={500} gravity={0.2} />}

      {/* Header */}
      <div className="text-center z-10 bg-slate-900/80 px-6 py-2 rounded-2xl border-4 border-purple-500 shadow-xl mb-2">
        <h2 className="text-lg md:text-2xl font-black text-white drop-shadow-md">
          {!revealed11 || !revealed12 ? "Tap to reveal the Secret Agents!" : "Drag the true identities to their houses!"}
        </h2>
      </div>

      {/* Agents Area */}
      <div className="flex-1 w-full max-w-4xl flex flex-row justify-center gap-8 md:gap-24 z-10 items-center">
        <Agent 
          id={11} 
          revealed={revealed11} 
          onReveal={() => setRevealed11(true)} 
          matchesWord={matches.agent11_word}
          matchesEq={matches.agent11_eq}
          targetRef={agent11Ref}
        />
        
        <Agent 
          id={12} 
          revealed={revealed12} 
          onReveal={() => setRevealed12(true)} 
          matchesWord={matches.agent12_word}
          matchesEq={matches.agent12_eq}
          targetRef={agent12Ref}
        />
      </div>

      {/* Word/Equation Bank (Draggables) */}
      <AnimatePresence>
        {!isVictorious && (revealed11 || revealed12) && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-3xl bg-slate-800/80 p-4 rounded-3xl border-4 border-slate-600 shadow-2xl flex flex-wrap justify-center gap-4 z-40"
          >
            {/* Scramble order visually with flex-wrap but maintain logical binding */}
            <DraggableCard id="agent12_eq" content="10 + 2" type="eq" targetAgent={12} />
            <DraggableCard id="agent11_word" content="ELEVEN" type="word" targetAgent={11} />
            <DraggableCard id="agent12_word" content="TWELVE" type="word" targetAgent={12} />
            <DraggableCard id="agent11_eq" content="10 + 1" type="eq" targetAgent={11} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {isVictorious && (
         <div className="w-full max-w-3xl flex justify-center pb-8 z-40">
            <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="bg-yellow-400 text-yellow-900 font-black text-3xl px-8 py-4 rounded-full shadow-[0_0_50px_rgba(250,204,21,0.8)] border-4 border-yellow-200"
            >
               THE TEEN CASTLE IS SAFE!
            </motion.div>
         </div>
      )}
    </div>
  );
};

export default NumberCastleGame;
