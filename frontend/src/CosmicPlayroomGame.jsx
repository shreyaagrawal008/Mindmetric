import React, { useState, useRef, useEffect } from 'react';

export default function CosmicPlayroomGame({ dataStr, onVictory, volume = 0.5 }) {
  const data = JSON.parse(dataStr);
  const { bins, items } = data;
  
  const [sortedItems, setSortedItems] = useState([]);
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [wrongBinId, setWrongBinId] = useState(null);
  const [correctBinId, setCorrectBinId] = useState(null);
  const [bouncingItem, setBouncingItem] = useState(null);

  const containerRef = useRef(null);
  const binRefs = useRef({});
  const audioCtxRef = useRef(null);

  // Initialize audio
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
    
    // Noise/Swish synth
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

  const handlePointerDown = (e, item) => {
    e.preventDefault();
    if (sortedItems.includes(item.id) || bouncingItem === item.id) return;
    
    // Capture pointer to track it outside the element
    e.target.setPointerCapture(e.pointerId);
    
    setDraggingItem(item);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e) => {
    if (!draggingItem) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    if (!draggingItem) return;
    e.target.releasePointerCapture(e.pointerId);

    // Find if dropped over a bin
    let droppedBin = null;
    for (const [color, ref] of Object.entries(binRefs.current)) {
      if (!ref) continue;
      const rect = ref.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        droppedBin = bins.find(b => b.color === color);
        break;
      }
    }

    if (droppedBin) {
      if (droppedBin.color === draggingItem.color) {
        // Correct drop!
        playSwish();
        
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const msg = new SpeechSynthesisUtterance("Yay!");
          msg.rate = 1.3;
          msg.pitch = 1.8;
          msg.volume = Math.min(1, volume * 1.5);
          window.speechSynthesis.speak(msg);
        }

        setCorrectBinId(droppedBin.color);
        setSortedItems(prev => {
          const next = [...prev, draggingItem.id];
          if (next.length === items.length) {
            setTimeout(onVictory, 1000);
          }
          return next;
        });
        setTimeout(() => setCorrectBinId(null), 500);
      } else {
        // Wrong drop
        playBuzz();
        setWrongBinId(droppedBin.color);
        setBouncingItem(draggingItem.id);
        
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const colorName = draggingItem.color.toLowerCase();
          const msg = new SpeechSynthesisUtterance(`That ${draggingItem.name} looks bright like the color ${colorName}! Can you find the ${colorName} bin?`);
          msg.rate = 1.1;
          msg.volume = Math.min(1, volume * 1.5);
          window.speechSynthesis.speak(msg);
        }

        setTimeout(() => {
          setWrongBinId(null);
          setBouncingItem(null);
        }, 1000);
      }
    }

    setDraggingItem(null);
  };

  return (
    <div 
      ref={containerRef}
      className="cosmic-playroom w-full h-full flex flex-col justify-between" 
      style={{ overflow: 'hidden', touchAction: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="absolute inset-0 bg-opacity-20 bg-black pointer-events-none"></div>

      {/* The Pile Area */}
      <div className="flex-1 flex flex-wrap justify-center items-center gap-8 p-4 z-10 mt-4">
        {items.map(item => {
          if (sortedItems.includes(item.id)) return null;
          
          const isDragging = draggingItem && draggingItem.id === item.id;
          const isBouncing = bouncingItem === item.id;
          
          let style = {
            fontSize: '5rem',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
            transform: isDragging ? `translate(${dragPos.x - window.innerWidth/2}px, ${dragPos.y - 150}px) scale(1.2)` : 'translate(0, 0) scale(1)',
            position: isDragging ? 'fixed' : 'relative',
            zIndex: isDragging ? 100 : 10,
            left: isDragging ? '50%' : 'auto',
            top: isDragging ? '150px' : 'auto',
            transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
          };

          return (
            <div 
              key={item.id}
              className={`pile-item flex flex-col items-center justify-center ${isBouncing ? 'animate-bounce' : ''}`}
              style={style}
              onPointerDown={(e) => handlePointerDown(e, item)}
            >
              <span>{item.emoji}</span>
              {!isDragging && <span className="text-white text-lg font-bold mt-2 bg-black bg-opacity-50 px-3 py-1 rounded-full">{item.name}</span>}
            </div>
          );
        })}
      </div>

      {/* The Target Bins Area */}
      <div className="flex-none h-64 flex justify-center items-end gap-16 z-0 mb-4">
        {bins.map((bin, idx) => {
          const isWrong = wrongBinId === bin.color;
          const isCorrect = correctBinId === bin.color;
          
          let binClasses = "energy-bin w-48 h-56 rounded-t-3xl border-8 border-b-0 flex flex-col justify-end items-center pb-6 relative transition-all duration-300 ";
          if (isWrong) binClasses += " animate-shake";
          
          return (
            <div 
              key={idx}
              ref={el => binRefs.current[bin.color] = el}
              className={binClasses}
              style={{
                borderColor: bin.hex,
                background: `linear-gradient(to top, ${bin.hex}88, transparent)`,
                boxShadow: isCorrect ? `0 0 50px ${bin.hex}` : `0 0 20px ${bin.hex}44`,
              }}
            >
              <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }}></div>
              
              {/* Correct Flash Aura */}
              {isCorrect && (
                <div className="absolute inset-0 rounded-t-2xl animate-ping opacity-75" style={{ border: `8px solid ${bin.hex}` }}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
