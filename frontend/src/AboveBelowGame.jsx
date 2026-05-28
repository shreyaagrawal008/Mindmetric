import React, { useState, useRef, useEffect } from 'react';

export default function AboveBelowGame({ dataStr, onVictory, volume = 0.5 }) {
  const data = JSON.parse(dataStr);
  const { landmark, target, instruction } = data;
  
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [solved, setSolved] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  const containerRef = useRef(null);
  const audioCtxRef = useRef(null);
  
  // Starting side (left or right)
  const [startX] = useState(Math.random() > 0.5 ? 50 : window.innerWidth - 150);
  // We no longer calculate startY in JS, we use CSS to perfectly center it on the Y-axis

  useEffect(() => {
    try {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      console.log("AudioContext not supported");
    }
  }, []);

  const playSwish = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  const playBlip = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playBuzz = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };

  const updateDragPos = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let localX = e.clientX - rect.left;
    let localY = e.clientY - rect.top;
    // Clamp to keep within visible bounds
    localX = Math.max(30, Math.min(localX, rect.width - 30));
    localY = Math.max(30, Math.min(localY, rect.height - 30));
    setDragPos({ x: localX, y: localY });
  };

  const handlePointerDown = (e) => {
    if (solved || bouncing) return;
    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);
    playBlip();
    setIsDragging(true);
    updateDragPos(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    updateDragPos(e);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    e.target.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const centerX = rect.left + rect.width / 2;
      
      // Must be horizontally centered to count as "exactly" above/below
      const isCenteredX = Math.abs(e.clientX - centerX) < 120;
      
      const droppedAbove = e.clientY < centerY - 20 && isCenteredX;
      const droppedBelow = e.clientY > centerY + 20 && isCenteredX;

      if ((instruction === 'ABOVE' && droppedAbove) || (instruction === 'BELOW' && droppedBelow)) {
        // Correct
        playSwish();
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const msg = new SpeechSynthesisUtterance("Yay! Good job!");
          msg.rate = 1.3;
          msg.pitch = 1.8;
          msg.volume = Math.min(1, volume * 1.5);
          window.speechSynthesis.speak(msg);
        }
        setSolved(true);
        setTimeout(onVictory, 2000);
      } else {
        // Incorrect
        playBuzz();
        setBouncing(true);
        setShowArrow(true);
        
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const dir = instruction === 'ABOVE' ? 'above' : 'below';
          const msg = new SpeechSynthesisUtterance(`Oops! Make sure to put it exactly ${dir} the ${landmark.name}!`);
          msg.rate = 1.1;
          msg.volume = Math.min(1, volume * 1.5);
          window.speechSynthesis.speak(msg);
        }

        setTimeout(() => {
          setBouncing(false);
          setShowArrow(false);
        }, 3000);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative flex flex-col justify-center items-center" 
      style={{ overflow: 'hidden', touchAction: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="absolute inset-0 bg-opacity-20 bg-black pointer-events-none"></div>

      {/* The Central Landmark */}
      <div className={`z-0 flex flex-col items-center justify-center transition-transform duration-500 ${solved ? 'animate-bounce scale-110' : ''}`}>
        <span style={{ fontSize: '10rem', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
          {landmark.emoji}
        </span>
      </div>

      {/* The Draggable Target */}
      <div 
        className={`absolute flex flex-col items-center justify-center z-50`}
        style={{
          cursor: solved ? 'default' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          fontSize: '6rem',
          transform: isDragging || solved || bouncing ? 'scale(1.2) rotate(-10deg)' : 'translateY(-50%) scale(1) rotate(0deg)',
          left: isDragging || solved || bouncing ? dragPos.x - 50 : startX,
          top: isDragging || solved || bouncing ? dragPos.y - 50 : '50%',
          transition: isDragging || solved ? 'none' : 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: (solved) ? 'drop-shadow(0 0 40px #FFFF00) brightness(1.2)' : 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))',
          opacity: bouncing && !isDragging ? 0.5 : 1
        }}
        onPointerDown={handlePointerDown}
      >
        <span>{target.emoji}</span>
        {solved && <div className="absolute inset-0 animate-ping rounded-full border-4 border-yellow-300"></div>}
      </div>

      {/* Hint Arrow */}
      {showArrow && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-40"
          style={{ 
            top: instruction === 'ABOVE' ? '15%' : '75%',
            transform: instruction === 'ABOVE' ? 'translateX(-50%) rotate(180deg)' : 'translateX(-50%)'
          }}
        >
          <span className="text-6xl text-white opacity-80" style={{ textShadow: '0 0 10px yellow' }}>⬇️</span>
        </div>
      )}
    </div>
  );
}
