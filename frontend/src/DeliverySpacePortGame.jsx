import React, { useState, useRef, useEffect } from 'react';

export default function DeliverySpacePortGame({ dataStr, onVictory, volume = 0.5 }) {
  const data = JSON.parse(dataStr);
  const items = data.items; // 3 items
  
  const [correctItemId, setCorrectItemId] = useState(null);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [errorItemId, setErrorItemId] = useState(null);

  // Sounds
  const buzzSoundRef = useRef(null);

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

  const handleItemClick = (item) => {
    if (correctItemId || errorItemId) return; // ignore clicks during animation

    if (item.isRect) {
      setCorrectItemId(item.id);
      setTimeout(() => {
        setAnimatingOut(true);
        setTimeout(() => {
          onVictory();
        }, 500); // Wait for slide out
      }, 1000); // Wait for glow
    } else {
      if (buzzSoundRef.current) buzzSoundRef.current();
      setErrorItemId(item.id);

      setTimeout(() => {
        setErrorItemId(null);
      }, 1500); // 1.5s to show the error glow
    }
  };

  return (
    <div className="spaceport-container w-full h-full relative" style={{background: 'transparent', overflow: 'hidden'}}>
      <div className="spaceport-background absolute inset-0 flex flex-col justify-between">
        <div className="truck-area absolute right-0 top-1/4 w-48 h-48">
          <span className="truck-emoji text-8xl">🚚</span>
          <div className="luna-character text-white text-xl font-bold mt-2">👩‍🚀 Luna</div>
        </div>
        
        <div className="conveyor-belt-wrapper absolute bottom-10 left-0 right-0 h-64 flex items-center justify-center overflow-hidden">
          <div className="conveyor-belt absolute inset-0 bg-gray-700" style={{borderTop: '4px solid #4A5568', borderBottom: '4px solid #4A5568'}}>
            <div className="belt-texture animate-belt-move h-full w-full opacity-30" style={{background: 'repeating-linear-gradient(90deg, transparent, transparent 40px, #000 40px, #000 80px)'}}></div>
          </div>
          
          <div className="items-on-belt flex gap-16 z-10 w-full justify-center">
            {items.map((item, idx) => {
              const isCorrect = correctItemId === item.id;
              const isError = errorItemId === item.id;
              
              let classes = "belt-item relative cursor-pointer transform transition-transform duration-200 hover:scale-110 ";
              if (isCorrect && !animatingOut) classes += " item-correct-flash";
              if (isCorrect && animatingOut) classes += " item-slide-out";
              if (isError) classes += " item-shake";

              return (
                <div key={idx} className={classes} onClick={() => handleItemClick(item)} style={{width: '120px'}}>
                  <div className="item-visual text-[8rem] flex items-center justify-center h-32 relative drop-shadow-2xl">
                    <span className="item-emoji" style={{
                       filter: isCorrect ? 'drop-shadow(0 0 30px #00FF00)' : isError ? 'drop-shadow(0 0 30px #FF0000)' : 'none',
                       transition: 'filter 0.3s ease-in-out'
                    }}>{item.emoji}</span>
                  </div>
                  <div className="item-name text-white text-center mt-4 font-bold">{item.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Removed error message overlay as per request */}
    </div>
  );
}
