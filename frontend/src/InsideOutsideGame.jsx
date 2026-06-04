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
        // Center area: 30% to 70% horizontally, 30% to 70% vertically
        left: 35 + Math.random() * 30,
        top: 35 + Math.random() * 30
      });
    }

    // Outside items
    for(let i = 0; i < numOutside; i++) {
      // Pick a random edge sector
      const sector = Math.floor(Math.random() * 4);
      let left = 0, top = 0;
      if (sector === 0) { // Top edge
        left = 10 + Math.random() * 80; top = 5 + Math.random() * 15;
      } else if (sector === 1) { // Bottom edge
        left = 10 + Math.random() * 80; top = 80 + Math.random() * 15;
      } else if (sector === 2) { // Left edge
        left = 5 + Math.random() * 15; top = 10 + Math.random() * 80;
      } else { // Right edge
        left = 80 + Math.random() * 15; top = 10 + Math.random() * 80;
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

  // Determine boundary visual style
  const boundaryStyles = {
    pond: { bg: '#0ea5e9', border: '8px dashed #38bdf8', borderRadius: '50%' },
    fence: { bg: 'transparent', border: '10px solid #8b5a2b', borderRadius: '15px' },
    box: { bg: '#cd853f', border: '12px solid #8b4513', borderRadius: '5px' },
    cage: { bg: 'transparent', border: '8px double #696969', borderRadius: '20px' },
    pool: { bg: '#38bdf8', border: '12px solid #e2e8f0', borderRadius: '10px' },
    nest: { bg: '#d2b48c', border: '15px dashed #8b4513', borderRadius: '50%' },
    cave: { bg: '#2f4f4f', border: '12px solid #1a1a1a', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' },
  };

  const bStyle = boundaryStyles[boundaryType] || { bg: 'rgba(255,255,255,0.2)', border: '8px solid white', borderRadius: '20px' };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-green-300 to-green-600">
      {isWon && <ReactConfetti width={windowDimension.width} height={windowDimension.height} style={{pointerEvents: 'none', zIndex: 100}} />}
      
      {/* Boundary Element */}
      <div 
        className="absolute flex items-center justify-center opacity-80"
        style={{
          width: '50%',
          height: '50%',
          backgroundColor: bStyle.bg,
          border: bStyle.border,
          borderRadius: bStyle.borderRadius,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.4)',
          zIndex: 10
        }}
      >
        <div className="text-[10rem] opacity-30 select-none pointer-events-none">
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
            className={`absolute cursor-pointer transform transition-all duration-300
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
