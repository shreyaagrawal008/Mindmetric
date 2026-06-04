import React, { useState, useRef, useEffect } from 'react';
import ReactConfetti from 'react-confetti';

export default function FrontBehindGame({ dataStr, onVictory, volume = 0.5 }) {
  const data = JSON.parse(dataStr);
  const { scene, landmark, targetBehind, targetFront, distractor, askBehind } = data;
  
  const [windowDimension, setWindowDimension] = useState({width: window.innerWidth, height: window.innerHeight});
  const [correctItemId, setCorrectItemId] = useState(null);
  const [errorItemId, setErrorItemId] = useState(null);
  
  const buzzSoundRef = useRef(null);

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
    } catch(e) {
      console.log("AudioContext not supported");
    }
  }, [volume]);

  const handleItemClick = (id) => {
    if (correctItemId || errorItemId) return;
    
    const isCorrect = (askBehind && id === 'tb') || (!askBehind && id === 'tf');
    
    if (isCorrect) {
      setCorrectItemId(id);
      setTimeout(() => {
        onVictory();
      }, 1500);
    } else {
      if (buzzSoundRef.current) buzzSoundRef.current();
      setErrorItemId(id);
      setTimeout(() => {
        setErrorItemId(null);
      }, 1000);
    }
  };
  
  // Scene backgrounds
  const sceneBackgrounds = {
    jungle: 'linear-gradient(to bottom, #115e59, #064e3b)',
    bedroom: 'linear-gradient(to bottom, #e0e7ff, #c7d2fe)',
    ocean: 'linear-gradient(to bottom, #0284c7, #0c4a6e)',
    space: 'linear-gradient(to bottom, #000000, #1e1b4b)',
    farm: 'linear-gradient(to bottom, #7dd3fc, #84cc16)',
    arctic: 'linear-gradient(to bottom, #e0f2fe, #bae6fd)',
    desert: 'linear-gradient(to bottom, #fde047, #d97706)',
    garden: 'linear-gradient(to bottom, #bbf7d0, #22c55e)',
    forest: 'linear-gradient(to bottom, #065f46, #022c22)',
    city: 'linear-gradient(to bottom, #9ca3af, #374151)',
    park: 'linear-gradient(to bottom, #86efac, #166534)',
    castle: 'linear-gradient(to bottom, #6b7280, #111827)',
    pond: 'linear-gradient(to bottom, #38bdf8, #0369a1)',
    beach: 'linear-gradient(to bottom, #fef08a, #f59e0b)',
    mountain: 'linear-gradient(to bottom, #d1d5db, #4b5563)',
    sky: 'linear-gradient(to bottom, #7dd3fc, #38bdf8)',
    cave: 'linear-gradient(to bottom, #4b5563, #111827)',
    kitchen: 'linear-gradient(to bottom, #fef3c7, #fde68a)',
    school: 'linear-gradient(to bottom, #fca5a5, #ef4444)',
    circus: 'linear-gradient(to right, #ef4444, #fcd34d)',
    restaurant: 'linear-gradient(to bottom, #f87171, #991b1b)',
    hospital: 'linear-gradient(to bottom, #f1f5f9, #cbd5e1)',
    pirate: 'linear-gradient(to bottom, #0ea5e9, #0284c7)',
    construction: 'linear-gradient(to bottom, #fef08a, #ca8a04)',
    snow: 'linear-gradient(to bottom, #f0fdfa, #ccfbf1)',
    halloween: 'linear-gradient(to bottom, #f97316, #7c2d12)',
    dino: 'linear-gradient(to bottom, #f87171, #450a0a)',
    magic: 'linear-gradient(to bottom, #a78bfa, #4c1d95)',
    music: 'linear-gradient(to bottom, #fbcfe8, #be185d)',
    sports: 'linear-gradient(to bottom, #86efac, #15803d)'
  };
  
  const bg = sceneBackgrounds[scene] || sceneBackgrounds.jungle;

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-xl" style={{ background: bg }}>
      {correctItemId && <ReactConfetti width={windowDimension.width} height={windowDimension.height} style={{pointerEvents: 'none', zIndex: 100}} />}
      
      <div className="relative w-full max-w-2xl h-[400px] flex items-center justify-center">
        
        {/* Distractor (placed randomly on far left or right) */}
        <div 
          onClick={() => handleItemClick('d')}
          className={`absolute cursor-pointer transform transition-transform duration-200 hover:scale-110 
            ${correctItemId === 'd' ? 'item-correct-flash' : ''} 
            ${errorItemId === 'd' ? 'item-shake' : ''}`}
          style={{ 
            left: Math.random() > 0.5 ? '5%' : '75%', 
            bottom: '20%',
            filter: correctItemId === 'd' ? 'drop-shadow(0 0 30px #00FF00)' : errorItemId === 'd' ? 'drop-shadow(0 0 30px #FF0000)' : 'none',
            zIndex: 15
          }}>
          <div className="text-[6rem] drop-shadow-xl">{distractor.emoji}</div>
          <div className="text-white text-center mt-2 font-bold bg-black bg-opacity-40 rounded-full px-2">{distractor.name}</div>
        </div>

        {/* Central Scene Group */}
        <div className="relative flex items-center justify-center w-64 h-64">
          
          {/* Target Behind */}
          <div 
            onClick={() => handleItemClick('tb')}
            className={`absolute cursor-pointer transform transition-transform duration-200 hover:scale-110
              ${correctItemId === 'tb' ? 'item-correct-flash' : ''} 
              ${errorItemId === 'tb' ? 'item-shake' : ''}`}
            style={{ 
              top: '15%', 
              right: '-8%',
              zIndex: 0, /* BEHIND LANDMARK */
              filter: correctItemId === 'tb' ? 'drop-shadow(0 0 30px #00FF00)' : errorItemId === 'tb' ? 'drop-shadow(0 0 30px #FF0000)' : 'none',
            }}>
            <div className="text-[5rem] drop-shadow-md">{targetBehind.emoji}</div>
            <div className="text-white text-center mt-1 font-bold bg-black bg-opacity-40 rounded-full px-2 text-sm">{targetBehind.name}</div>
          </div>

          {/* Landmark */}
          <div className="absolute text-[12rem] drop-shadow-2xl pointer-events-none" style={{ zIndex: 10 }}>
            {landmark.emoji}
          </div>

          {/* Target Front */}
          <div 
            onClick={() => handleItemClick('tf')}
            className={`absolute cursor-pointer transform transition-transform duration-200 hover:scale-110
              ${correctItemId === 'tf' ? 'item-correct-flash' : ''} 
              ${errorItemId === 'tf' ? 'item-shake' : ''}`}
            style={{ 
              bottom: '0%', 
              left: '-6%',
              zIndex: 20, /* IN FRONT OF LANDMARK */
              filter: correctItemId === 'tf' ? 'drop-shadow(0 0 30px #00FF00)' : errorItemId === 'tf' ? 'drop-shadow(0 0 30px #FF0000)' : 'none',
            }}>
            <div className="text-[6rem] drop-shadow-2xl">{targetFront.emoji}</div>
            <div className="text-white text-center mt-1 font-bold bg-black bg-opacity-40 rounded-full px-2 text-sm">{targetFront.name}</div>
          </div>

        </div>
      </div>
    </div>
  );
}
