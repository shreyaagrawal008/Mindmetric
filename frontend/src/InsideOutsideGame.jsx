import React, { useState, useEffect, useRef } from 'react';
import ReactConfetti from 'react-confetti';

export default function InsideOutsideGame({ dataStr, onVictory, volume = 0.5 }) {
  const data = JSON.parse(dataStr);
  const { boundaryType, boundaryEmoji, itemEmoji, askInside, numInside, numOutside } = data;
  
  const [windowDimension, setWindowDimension] = useState({width: window.innerWidth, height: window.innerHeight});
  
  // Track state
  const [items, setItems] = useState([]);
  const [clickedIds, setClickedIds] = useState(new Set());
  const [errorId, setErrorId] = useState(null);
  const [isWon, setIsWon] = useState(false);
  
  const buzzSoundRef = useRef(null);
  const popSoundRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowDimension({width: window.innerWidth, height: window.innerHeight});
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playBuzz = () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      };
      buzzSoundRef.current = playBuzz;

      const playPop = () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      };
      popSoundRef.current = playPop;

    } catch(e) {
      console.log("AudioContext not supported");
    }
  }, [volume]);

  // Generate random positions on mount
  useEffect(() => {
    const generatedItems = [];
    
    // Inside items
    for(let i = 0; i < numInside; i++) {
      generatedItems.push({
        id: `in_${i}`,
        isInside: true,
        // Tightly grouped strictly in the center (46% to 54%)
        left: 46 + Math.random() * 8,
        top: 46 + Math.random() * 8
      });
    }

    // Outside items
    for(let i = 0; i < numOutside; i++) {
      // Pick a random edge sector
      const sector = Math.floor(Math.random() * 4);
      let left = 0, top = 0;
      if (sector === 0) { // Top edge
        left = 15 + Math.random() * 60; top = 10 + Math.random() * 10;
      } else if (sector === 1) { // Bottom edge
        left = 15 + Math.random() * 60; top = 75 + Math.random() * 10;
      } else if (sector === 2) { // Left edge
        left = 10 + Math.random() * 10; top = 25 + Math.random() * 40;
      } else { // Right edge
        left = 75 + Math.random() * 10; top = 25 + Math.random() * 40;
      }
      
      generatedItems.push({
        id: `out_${i}`,
        isInside: false,
        left,
        top
      });
    }

    setItems(generatedItems);
  }, [numInside, numOutside]);

  const targetCount = askInside ? numInside : numOutside;

  const handleItemClick = (item) => {
    if (isWon || clickedIds.has(item.id)) return;
    
    const isCorrect = item.isInside === askInside;
    
    if (isCorrect) {
      if (popSoundRef.current) popSoundRef.current();
      
      const newClicked = new Set(clickedIds);
      newClicked.add(item.id);
      setClickedIds(newClicked);
      
      if (newClicked.size === targetCount) {
        setIsWon(true);
        setTimeout(() => {
          onVictory();
        }, 2000);
      }
    } else {
      if (buzzSoundRef.current) buzzSoundRef.current();
      setErrorId(item.id);
      setTimeout(() => setErrorId(null), 800);
    }
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-green-300 to-green-600">
      {isWon && <ReactConfetti width={windowDimension.width} height={windowDimension.height} style={{pointerEvents: 'none', zIndex: 100}} />}
      
      {/* Boundary Element */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <div className="text-[15rem] md:text-[20rem] filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]">
          {boundaryEmoji}
        </div>
      </div>

      {/* Items */}
      {items.map(item => {
        const isClicked = clickedIds.has(item.id);
        const isError = errorId === item.id;
        
        return (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`absolute cursor-pointer transition-all duration-300 -translate-x-1/2 -translate-y-1/2
              ${isClicked ? 'scale-0 opacity-0 pointer-events-none' : 'hover:scale-110'}
              ${isError ? 'item-shake' : ''}
            `}
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              zIndex: item.isInside ? 15 : 5,
              filter: isError ? 'drop-shadow(0 0 20px #FF0000)' : 'drop-shadow(0 5px 10px rgba(0,0,0,0.4))'
            }}
          >
            <div className="text-[4rem] md:text-[5rem]">
              {itemEmoji}
            </div>
          </div>
        );
      })}

    </div>
  );
}
