import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

export default function FindingLeftoversGame({ dataStr, onVictory, onCorrectSound, onErrorSound }) {
  const [data, setData] = useState(null);
  
  // Game states: 'drawing', 'answering', 'correct', 'incorrect'
  const [gameState, setGameState] = useState('drawing'); 
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  const [lines, setLines] = useState([]); // { fromIdx, toIdx }
  const [drawingLine, setDrawingLine] = useState(null); // { fromIdx, currentX, currentY }
  
  const leftDotsRef = useRef([]);
  const rightDotsRef = useRef([]);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!dataStr) return;
    try {
      setData(JSON.parse(dataStr));
    } catch (e) {
      console.error("Failed to parse FindingLeftoversGame data", e);
    }
  }, [dataStr]);

  if (!data) return null;

  const { leftCount, rightCount, leftEmoji, rightEmoji } = data;
  const maxLines = Math.min(leftCount, rightCount);

  // --- SVG Drawing Logic ---
  
  const handlePointerDown = (e, side, idx) => {
    if (gameState !== 'drawing') return;
    if (side !== 'left') return; // Only allow drawing from left to right for simplicity
    
    // Check if this left dot is already connected
    if (lines.some(l => l.fromIdx === idx)) return;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDrawingLine({
        fromIdx: idx,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top
      });
    }
  };

  const handlePointerMove = (e) => {
    if (gameState !== 'drawing' || !drawingLine) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDrawingLine(prev => ({
        ...prev,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top
      }));
    }
  };

  const handlePointerUp = (e) => {
    if (gameState !== 'drawing' || !drawingLine) return;
    
    // Check if released over a right dot
    let snappedToIdx = -1;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      rightDotsRef.current.forEach((dotEl, idx) => {
        if (!dotEl) return;
        const dotRect = dotEl.getBoundingClientRect();
        // generous hit box
        if (
          mouseX >= dotRect.left - 30 && mouseX <= dotRect.right + 30 &&
          mouseY >= dotRect.top - 30 && mouseY <= dotRect.bottom + 30
        ) {
          snappedToIdx = idx;
        }
      });
    }

    if (snappedToIdx !== -1 && !lines.some(l => l.toIdx === snappedToIdx)) {
      // Valid connection
      if (onCorrectSound) onCorrectSound();
      const newLines = [...lines, { fromIdx: drawingLine.fromIdx, toIdx: snappedToIdx }];
      setLines(newLines);
      
      if (newLines.length === maxLines) {
        setGameState('answering');
      }
    } else {
      // Invalid connection
      if (onErrorSound) onErrorSound();
    }
    
    setDrawingLine(null);
  };

  // --- Phase 2: Answering Logic ---
  
  const handleAnswerClick = (chosenSide) => {
    if (gameState !== 'answering') return;
    
    const correctSide = leftCount > rightCount ? 'left' : 'right';
    
    if (chosenSide === correctSide) {
      setGameState('correct');
      if (onCorrectSound) onCorrectSound();
      setShowConfetti(true);
      setTimeout(() => {
        if (onVictory) onVictory();
      }, 3500);
    } else {
      setGameState('incorrect');
      if (onErrorSound) onErrorSound();
      setTimeout(() => {
        setGameState('answering');
      }, 800);
    }
  };

  // --- Render Helpers ---

  const getDotCenter = (el) => {
    if (!el || !containerRef.current) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-900 rounded-2xl touch-none"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {showConfetti && <Confetti width={windowDimension.width} height={windowDimension.height} recycle={false} numberOfPieces={400} gravity={0.15} />}
      
      {/* Title */}
      <div className="text-white text-2xl md:text-4xl font-bold mb-4 drop-shadow-lg text-center z-20">
        {gameState === 'drawing' ? "Draw lines to feed them!" : "Look! Which group has leftovers?"}
      </div>

      {/* Main Play Area */}
      <div className="flex-1 w-full flex flex-row items-center justify-center gap-10 md:gap-32 relative z-10">
        
        {/* Left Column */}
        <motion.div 
          className={`flex flex-col gap-4 p-4 rounded-3xl transition-all duration-300 ${gameState === 'answering' ? 'cursor-pointer hover:bg-white/10 border-4 border-dashed border-white/30' : ''} ${gameState === 'correct' && leftCount > rightCount ? 'bg-green-500/30 border-green-400' : ''} ${gameState === 'incorrect' ? 'animate-shake' : ''}`}
          onClick={() => gameState === 'answering' ? handleAnswerClick('left') : null}
          whileHover={gameState === 'answering' ? { scale: 1.05 } : {}}
        >
          {Array.from({ length: leftCount }).map((_, i) => {
            const isLeftover = gameState === 'correct' && leftCount > rightCount && !lines.some(l => l.fromIdx === i);
            return (
              <div key={i} className="flex flex-row items-center gap-4">
                <motion.div 
                  animate={isLeftover ? { y: [0, -20, 0], scale: [1, 1.2, 1] } : {}} 
                  transition={isLeftover ? { repeat: Infinity, duration: 0.6 } : {}}
                  className="text-5xl md:text-6xl drop-shadow-lg select-none"
                >
                  {leftEmoji}
                </motion.div>
                <div 
                  ref={el => leftDotsRef.current[i] = el}
                  onPointerDown={(e) => handlePointerDown(e, 'left', i)}
                  className={`w-8 h-8 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] border-4 border-white transition-all ${lines.some(l => l.fromIdx === i) ? 'bg-green-400' : 'bg-yellow-400 cursor-pointer hover:scale-125'}`}
                />
              </div>
            );
          })}
        </motion.div>

        {/* Right Column */}
        <motion.div 
          className={`flex flex-col gap-4 p-4 rounded-3xl transition-all duration-300 ${gameState === 'answering' ? 'cursor-pointer hover:bg-white/10 border-4 border-dashed border-white/30' : ''} ${gameState === 'correct' && rightCount > leftCount ? 'bg-green-500/30 border-green-400' : ''} ${gameState === 'incorrect' ? 'animate-shake' : ''}`}
          onClick={() => gameState === 'answering' ? handleAnswerClick('right') : null}
          whileHover={gameState === 'answering' ? { scale: 1.05 } : {}}
        >
          {Array.from({ length: rightCount }).map((_, i) => {
            const isLeftover = gameState === 'correct' && rightCount > leftCount && !lines.some(l => l.toIdx === i);
            return (
              <div key={i} className="flex flex-row items-center gap-4">
                <div 
                  ref={el => rightDotsRef.current[i] = el}
                  className={`w-8 h-8 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] border-4 border-white transition-all ${lines.some(l => l.toIdx === i) ? 'bg-green-400' : 'bg-blue-400'}`}
                />
                <motion.div 
                  animate={isLeftover ? { y: [0, -20, 0], scale: [1, 1.2, 1] } : {}} 
                  transition={isLeftover ? { repeat: Infinity, duration: 0.6 } : {}}
                  className="text-5xl md:text-6xl drop-shadow-lg select-none"
                >
                  {rightEmoji}
                </motion.div>
              </div>
            );
          })}
        </motion.div>

      </div>

      {/* SVG Canvas for Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Drawn Lines */}
        {lines.map((l, i) => {
          const start = getDotCenter(leftDotsRef.current[l.fromIdx]);
          const end = getDotCenter(rightDotsRef.current[l.toIdx]);
          return (
            <motion.line 
              key={i}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
              x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke="#4ade80" strokeWidth="8" strokeLinecap="round"
              filter="url(#glow)"
            />
          );
        })}

        {/* Active Drawing Line */}
        {drawingLine && (
          <line 
            x1={getDotCenter(leftDotsRef.current[drawingLine.fromIdx]).x} 
            y1={getDotCenter(leftDotsRef.current[drawingLine.fromIdx]).y} 
            x2={drawingLine.currentX} 
            y2={drawingLine.currentY}
            stroke="#facc15" strokeWidth="8" strokeLinecap="round" strokeDasharray="10, 10"
            filter="url(#glow)"
          />
        )}
      </svg>
      
    </div>
  );
}
