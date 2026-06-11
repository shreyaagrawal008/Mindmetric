import React, { useState, useEffect, useRef } from 'react';
const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:8081/api";
import { Play, Pause, Volume2, X } from 'lucide-react';
import './numberComet.css';
import DeliverySpacePortGame from './DeliverySpacePortGame';
import CosmicPlayroomGame from './CosmicPlayroomGame';
import AboveBelowGame from './AboveBelowGame';
import FrontBehindGame from './FrontBehindGame';
import InsideOutsideGame from './InsideOutsideGame';
import GreedyGatorGame from './GreedyGatorGame';
import TinyTeamGame from './TinyTeamGame';

const LEVEL_NAMES = ["Luna", "Bolt", "Orbito", "Glow", "Vega", "Zuno", "Plutox", "Spark", "Twix", "Rocketo", "Vortex"];

function storageKey(userId) {
  const userPart = String(userId || "guest").replace(/[^a-z0-9-]/gi, "_");
  return userPart;
}

function savedProgress(userId) {
  const stored = localStorage.getItem(`mindmetric_numbercomet_progress_${storageKey(userId)}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return { activeLevel: 1, activeTopic: 1 };
}

const playFeedbackTone = (type, volume) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.06); // Extremely fast upward sweep
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01); // Instant attack
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06); // Super fast decay (60ms)
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } else if (type === 'crunch') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
      
      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(150, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
      
      osc2.connect(gain);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 1.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
      osc2.start(); osc2.stop(ctx.currentTime + 0.2);
    } else if (type === 'laugh') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.error("Audio playback error", e);
  }
};

const TRACE_PATHS = {
  0: "M50,10 C20,10 20,140 50,140 C80,140 80,10 50,10",
  1: "M30,30 L50,10 L50,140",
  2: "M20,40 C20,10 80,10 80,40 C80,80 20,110 20,140 L80,140",
  3: "M20,30 C20,10 80,10 80,40 C80,65 50,75 50,75 C50,75 80,85 80,110 C80,140 20,140 20,120",
  4: "M70,140 L70,10 L20,90 L90,90",
  5: "M80,20 L30,20 L30,70 C60,60 80,80 80,105 C80,140 20,140 20,110",
  6: "M80,30 C60,10 20,30 20,80 C20,140 80,140 80,90 C80,50 20,50 20,80",
  7: "M20,20 L80,20 L40,140",
  8: "M50,75 C20,75 20,10 50,10 C80,10 80,75 50,75 C20,75 20,140 50,140 C80,140 80,75 50,75",
  9: "M80,50 C80,10 20,10 20,50 C20,90 80,90 80,50 L80,140",
  10: "M20,30 L40,10 L40,140 M70,10 C50,10 50,140 70,140 C90,140 90,10 70,10"
};

const TraceGame = ({ targetDigit, onVictory }) => {
  const pathRef = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  const [totalLength, setTotalLength] = React.useState(0);
  const [pathPoints, setPathPoints] = React.useState([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  React.useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setTotalLength(len);
      setProgress(0);
      
      // Pre-calculate points to prevent lag during dragging
      const pts = [];
      for (let i = 0; i <= len; i += 5) {
        pts.push(pathRef.current.getPointAtLength(i));
      }
      setPathPoints(pts);
    }
  }, [targetDigit]);

  const handlePointerDown = (e) => {
    e.target.setPointerCapture?.(e.pointerId);
    setIsDragging(true);
  };
  const handlePointerUp = (e) => {
    e.target.releasePointerCapture?.(e.pointerId);
    setIsDragging(false);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || totalLength === 0 || pathPoints.length === 0) return;
    
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX || (e.touches && e.touches[0].clientX);
    pt.y = e.clientY || (e.touches && e.touches[0].clientY);
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    // Snap to win if we are near the end
    if (totalLength - progress < 40) {
       const endP = pathPoints[pathPoints.length - 1];
       if (Math.hypot(endP.x - svgP.x, endP.y - svgP.y) < 80) {
          setProgress(totalLength);
          setIsDragging(false);
          onVictory();
          return;
       }
    }

    let nextProg = progress;
    let minD = Infinity;
    
    // Search precalculated points ahead of current progress to allow fast swipes
    const startIndex = Math.floor(progress / 5);
    const endIndex = Math.min(pathPoints.length - 1, startIndex + 30); // Search up to 150 units ahead

    for (let i = startIndex; i <= endIndex; i++) {
       const p = pathPoints[i];
       const d = Math.hypot(p.x - svgP.x, p.y - svgP.y);
       if (d < minD) {
          minD = d;
          nextProg = i * 5;
       }
    }

    if (minD < 80) {
       setProgress(nextProg);
       if (nextProg >= totalLength - 10) {
          setIsDragging(false);
          onVictory();
       }
    } else if (minD > 120) {
       setShake(true);
       setTimeout(() => setShake(false), 500);
    }
  };

  const rocketPos = pathPoints.length > 0 ? pathPoints[Math.min(pathPoints.length - 1, Math.floor(progress / 5))] : { x: 50, y: 10 };
  const isFinished = totalLength > 0 && progress >= totalLength - 10;

  return (
    <svg 
       viewBox="0 0 100 150"
       onPointerDown={!isFinished ? handlePointerDown : null}
       onPointerMove={!isFinished ? handlePointerMove : null}
       onPointerUp={!isFinished ? handlePointerUp : null}
       onPointerLeave={!isFinished ? handlePointerUp : null}
       style={{ touchAction: 'none', overflow: 'visible', zIndex: 10, cursor: isFinished ? 'default' : 'pointer', height: '25vh', maxHeight: '180px' }}
       className={shake ? "shake" : ""}
    >
       <path d={TRACE_PATHS[targetDigit] || TRACE_PATHS[0]} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="15" strokeLinecap="round" strokeDasharray="1 25" />
       <path ref={pathRef} d={TRACE_PATHS[targetDigit] || TRACE_PATHS[0]} fill="none" stroke="var(--neon-blue)" strokeWidth="15" strokeLinecap="round" strokeDasharray={`${progress} ${totalLength + 100}`} />
       {!isFinished && <text x={rocketPos.x} y={rocketPos.y} fontSize="35" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 10px #00F0FF)' }}>🚀</text>}
    </svg>
  );
};

const ComparisonRenderer = ({ type, asset }) => {
  let data;
  try { data = JSON.parse(asset); } catch(e) { return null; }
  
  if (type === 'comparison_bigSmall') {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <span style={{ fontSize: data.leftBig ? '80px' : '30px' }}>👹</span>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>A</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <span style={{ fontSize: !data.leftBig ? '80px' : '30px' }}>🐁</span>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>B</span>
        </div>
      </div>
    );
  }

  if (type === 'comparison_tallShort') {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <span style={{ fontSize: '70px', display: 'inline-block', transformOrigin: 'bottom', transform: data.leftTall ? 'scaleY(1.6)' : 'scaleY(0.8)' }}>
             {data.emoji || '🗼'}
           </span>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>A</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <span style={{ fontSize: '70px', display: 'inline-block', transformOrigin: 'bottom', transform: !data.leftTall ? 'scaleY(1.6)' : 'scaleY(0.8)' }}>
             {data.emoji || '🗼'}
           </span>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>B</span>
        </div>
      </div>
    );
  }

  if (type === 'comparison_longShort') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginRight: '10px', width: '30px' }}>A</span>
           <div style={{ height: '20px', width: data.leftLong ? '80%' : '40%', backgroundColor: '#FF0055', border: '2px solid white', borderRadius: '10px' }}></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginRight: '10px', width: '30px' }}>B</span>
           <div style={{ height: '20px', width: !data.leftLong ? '80%' : '40%', backgroundColor: '#00F0FF', border: '2px solid white', borderRadius: '10px' }}></div>
        </div>
      </div>
    );
  }

  if (type === 'comparison_heavyLight') {
    const rot = data.leftHeavy ? -15 : 15;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '80%', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <div style={{ width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '40px solid white', position: 'absolute', bottom: 0 }}></div>
          <div style={{ width: '100%', height: '10px', backgroundColor: '#00F0FF', position: 'absolute', bottom: '40px', transform: `rotate(${rot}deg)`, transformOrigin: 'center', transition: 'transform 1s ease' }}>
             <div style={{ position: 'absolute', left: '10%', bottom: '10px', fontSize: '40px', transform: `rotate(${-rot}deg)` }}>{data.leftHeavy ? '🐘' : '🪶'}</div>
             <div style={{ position: 'absolute', right: '10%', bottom: '10px', fontSize: '40px', transform: `rotate(${-rot}deg)` }}>{!data.leftHeavy ? '🐘' : '🪶'}</div>
             <div style={{ position: 'absolute', left: '10%', top: '20px', fontSize: '20px', color: 'white', fontWeight: 'bold' }}>A</div>
             <div style={{ position: 'absolute', right: '10%', top: '20px', fontSize: '20px', color: 'white', fontWeight: 'bold' }}>B</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'comparison_moreLess') {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div style={{ width: '60px', height: '100px', border: '3px solid rgba(255,255,255,0.8)', borderTop: 'none', borderRadius: '0 0 10px 10px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, width: '100%', height: data.leftMore ? '80%' : '20%', backgroundColor: 'rgba(0, 240, 255, 0.6)', transition: 'height 1s ease' }}></div>
           </div>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>A</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div style={{ width: '60px', height: '100px', border: '3px solid rgba(255,255,255,0.8)', borderTop: 'none', borderRadius: '0 0 10px 10px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, width: '100%', height: !data.leftMore ? '80%' : '20%', backgroundColor: 'rgba(0, 240, 255, 0.6)', transition: 'height 1s ease' }}></div>
           </div>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>B</span>
        </div>
      </div>
    );
  }

  if (type === 'comparison_thickThin') {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div style={{ width: data.leftThick ? '60px' : '15px', height: '100px', backgroundColor: '#8B4513', border: '2px solid #5C2E0B' }}></div>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>A</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <div style={{ width: !data.leftThick ? '60px' : '15px', height: '100px', backgroundColor: '#8B4513', border: '2px solid #5C2E0B' }}></div>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>B</span>
        </div>
      </div>
    );
  }

  if (type === 'comparison_matches') {
    const sizeA = (data.matchPair === 1 || data.matchPair === 3) ? 70 : 40;
    const sizeB = (data.matchPair === 1 || data.matchPair === 2) ? 70 : 50;
    const sizeC = (data.matchPair === 2 || data.matchPair === 3) ? 70 : 30;
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <span style={{ fontSize: `${sizeA}px` }}>🍎</span>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>A</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <span style={{ fontSize: `${sizeB}px` }}>🍎</span>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>B</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <span style={{ fontSize: `${sizeC}px` }}>🍎</span>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>C</span>
        </div>
      </div>
    );
  }

  if (type === 'comparison_ordering') {
    const getSize = (s) => s === 1 ? 30 : s === 2 ? 55 : 80;
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'flex-end', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <span style={{ fontSize: `${getSize(data.s1)}px` }}>🌟</span>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>A</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <span style={{ fontSize: `${getSize(data.s2)}px` }}>🌟</span>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>B</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <span style={{ fontSize: `${getSize(data.s3)}px` }}>🌟</span>
           <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginTop: '10px' }}>C</span>
        </div>
      </div>
    );
  }
  
  return null;
};

const TowerTallyGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [shakingItem, setShakingItem] = useState(null);
  const [showParticles, setShowParticles] = useState(false);
  const [clickedItem, setClickedItem] = useState(null);

  const handleClick = (itemNum) => {
    if (showParticles) return;
    const isTall = (itemNum === 1 && data.leftTall) || (itemNum === 2 && !data.leftTall);
    const isCorrect = (data.askTall && isTall) || (!data.askTall && !isTall);

    if (isCorrect) {
      setClickedItem(itemNum);
      setShowParticles(true);
      setTimeout(() => {
        onVictory();
      }, 50); // playFeedbackTone will handle the sound
    } else {
      setShakingItem(itemNum);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const hint = data.askTall ? "Oops! That tower is shorter. Find the taller one!" : "Oops! That tower is taller. Find the shorter one!";
        const utterance = new SpeechSynthesisUtterance(hint);
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
      setTimeout(() => setShakingItem(null), 500);
    }
  };

  const renderTower = (itemNum, isTall) => {
    const isSuccess = showParticles && clickedItem === itemNum;
    const shake = shakingItem === itemNum;

    return (
      <div 
        onClick={() => handleClick(itemNum)}
        className={shake ? "shake-error" : ""}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: '140px',
          height: '280px',
          cursor: 'pointer',
          position: 'relative',
          paddingBottom: '20px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
           <span style={{ 
             fontSize: '80px', 
             display: 'inline-block', 
             transformOrigin: 'bottom', 
             transform: isTall ? 'scaleY(1.8)' : 'scaleY(0.8)',
             filter: isSuccess ? 'drop-shadow(0 0 30px #00ff00)' : (shake ? 'drop-shadow(0 0 30px #ff0000)' : 'drop-shadow(0px 10px 5px rgba(0,0,0,0.5))'),
             transition: 'filter 0.3s ease'
           }}>
             {data.emoji || '🗼'}
           </span>
        </div>
      </div>
    );
  };

  if (data.leftTall === undefined) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', width: '100%', height: '100%', padding: '0 10%', paddingBottom: '20px' }}>
       {renderTower(1, data.leftTall)}
       {renderTower(2, !data.leftTall)}
    </div>
  );
};

const TallShortRealWorldGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [shakingItem, setShakingItem] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleClick = (itemNum) => {
    if (isSuccess) return;
    const isTall = (itemNum === 1 && data.leftTall) || (itemNum === 2 && !data.leftTall);
    const isCorrect = (data.askTall && isTall) || (!data.askTall && !isTall);

    if (isCorrect) {
      setClickedItem(itemNum);
      setIsSuccess(true);
      setShowHint(false);
      setTimeout(() => {
        onVictory();
      }, 800);
    } else {
      setShakingItem(itemNum);
      setShowHint(true);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const hint = data.askTall ? "Oops! That one is shorter. Find the taller one!" : "Oops! That one is taller. Find the shorter one!";
        const utterance = new SpeechSynthesisUtterance(hint);
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
      setTimeout(() => setShakingItem(null), 500);
    }
  };

  const renderBubble = (itemNum, emoji, isTall) => {
    const successBounce = isSuccess && clickedItem === itemNum;
    const shake = shakingItem === itemNum;
    const isError = showHint && clickedItem !== itemNum; // if hint is showing, this might be the target
    
    const height = '220px';
    const width = '150px';
    const fontSize = isTall ? '120px' : '60px';
    const glowColor = successBounce ? '0, 255, 0' : (shake ? '255, 0, 0' : '0, 240, 255');

    return (
      <div 
        onClick={() => handleClick(itemNum)}
        className={`${shake ? "shake-error" : ""} ${successBounce ? "victory-bounce" : ""}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          width: width,
          height: height,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: isTall ? '75px' : '50%',
          boxShadow: `0 0 15px rgba(${glowColor}, 0.5), inset 0 0 20px rgba(255,255,255,0.2)`,
          border: `3px solid rgba(${glowColor}, 0.8)`,
          cursor: 'pointer',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          position: 'relative',
          paddingBottom: '20px',
          zIndex: 5
        }}
      >
        <span style={{ fontSize: fontSize, filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))', lineHeight: 1 }}>
          {emoji}
        </span>
      </div>
    );
  };

  if (!data.item1) return null;

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', width: '100%', height: '100%', paddingBottom: '40px' }}>
       {/* Ground Level Baseline */}
       <div style={{ position: 'absolute', bottom: '20px', width: '80%', height: '20px', background: 'linear-gradient(90deg, transparent, #2E8B57, transparent)', borderRadius: '50%', filter: 'blur(2px)', zIndex: 1 }}></div>
       
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '50%', zIndex: 2 }}>
         {renderBubble(1, data.item1, data.leftTall)}
         {renderBubble(2, data.item2, !data.leftTall)}
       </div>

       {/* Laser Hint Line */}
       {showHint && (
         <div style={{
           position: 'absolute',
           bottom: '160px', // just above the short item
           left: '25%',
           width: '50%',
           height: '2px',
           borderBottom: '4px dashed #FF3366',
           animation: 'drawLaser 1s forwards',
           zIndex: 10,
           pointerEvents: 'none'
         }}>
           {/* We can add a dot at the end to make it look like a laser measuring stick */}
           <div style={{ position: 'absolute', right: data.leftTall ? 'auto' : 0, left: data.leftTall ? 0 : 'auto', top: '-6px', width: '12px', height: '12px', background: '#FF3366', borderRadius: '50%', boxShadow: '0 0 10px #FF3366' }}></div>
           <div style={{ position: 'absolute', right: !data.leftTall ? 'auto' : 0, left: !data.leftTall ? 0 : 'auto', top: '-6px', width: '12px', height: '12px', background: '#FF3366', borderRadius: '50%', boxShadow: '0 0 10px #FF3366' }}></div>
         </div>
       )}
       
       <style>
         {`
           @keyframes victoryBounce {
             0%, 100% { transform: translateY(0); }
             50% { transform: translateY(-40px); }
           }
           .victory-bounce {
             animation: victoryBounce 0.6s ease;
           }
           @keyframes drawLaser {
             from { width: 0; opacity: 0; }
             to { width: 50%; opacity: 1; }
           }
         `}
       </style>
    </div>
  );
};

const LongShortBridgeGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [shakingItem, setShakingItem] = useState(null);
  const [clickedItem, setClickedItem] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [animalCrossed, setAnimalCrossed] = useState(false);

  const handleClick = (itemNum) => {
    if (isSuccess) return;
    const isLong = (itemNum === 1 && data.leftLong) || (itemNum === 2 && !data.leftLong);
    const isCorrect = (data.askLong && isLong) || (!data.askLong && !isLong);

    if (isCorrect) {
      setClickedItem(itemNum);
      setIsSuccess(true);
      setShowHint(false);
      // Play joy sound
      playFeedbackTone('correct', volume);
      
      setTimeout(() => {
        onVictory();
      }, 800); 
    } else {
      setShakingItem(itemNum);
      setShowHint(true);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const hint = data.askLong ? "Oops! That one is shorter. Find the longer one to build the bridge!" : "Oops! That one is longer. Find the shorter one!";
        const utterance = new SpeechSynthesisUtterance(hint);
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
      setTimeout(() => setShakingItem(null), 500);
    }
  };

  const renderBubble = (itemNum, emoji, isLong) => {
    const successBridge = isSuccess && clickedItem === itemNum;
    const shake = shakingItem === itemNum;
    const isError = showHint && clickedItem !== itemNum;
    
    const width = '200px';
    const height = '80px';
    const fontSize = isLong ? '80px' : '40px'; 
    const glowColor = successBridge ? '0, 255, 0' : (shake ? '255, 0, 0' : '0, 240, 255');

    return (
      <div 
        onClick={() => handleClick(itemNum)}
        className={`${shake ? "shake-error" : ""}`}
        style={{
          display: 'flex',
          justifyContent: 'flex-start', // Align to left side explicitly
          alignItems: 'center',
          width: successBridge ? '320px' : width, // Stretches out when successful
          height: height,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '40px',
          boxShadow: `0 0 15px rgba(${glowColor}, 0.5), inset 0 0 20px rgba(255,255,255,0.2)`,
          border: `3px solid rgba(${glowColor}, 0.8)`,
          cursor: 'pointer',
          transition: 'all 0.5s ease',
          position: 'relative',
          paddingLeft: '10px',
          marginBottom: '10px',
          zIndex: successBridge ? 100 : 5
        }}
      >
        <span style={{ 
            fontSize: fontSize, 
            filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))', 
            lineHeight: 1, 
            transform: 'scaleX(1.2)', // horizontally stretch emojis slightly to look like bridge parts
            transformOrigin: 'left center' 
        }}>
          {emoji}
        </span>

        {/* Dotted laser hint line dropping from short tip to long tip */}
        {showHint && clickedItem !== itemNum && !isLong && (
           <div style={{
             position: 'absolute',
             top: itemNum === 1 ? '100%' : '-80px', // Drop down or up depending on position
             left: '120px', // Tip of the short item
             width: '2px',
             height: '80px', // Reaches the other item
             borderLeft: '4px dashed #FF3366',
             animation: itemNum === 1 ? 'dropLaser 1s forwards' : 'riseLaser 1s forwards',
             zIndex: 20
           }}>
             <div style={{ position: 'absolute', bottom: itemNum === 1 ? '-6px' : 'auto', top: itemNum === 2 ? '-6px' : 'auto', left: '-6px', width: '12px', height: '12px', background: '#FF3366', borderRadius: '50%', boxShadow: '0 0 10px #FF3366' }}></div>
           </div>
        )}
      </div>
    );
  };

  if (!data.item1) return null;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: '100%', height: '100%', paddingTop: '10px' }}>
       {/* Canyon Scene */}
       <div style={{ position: 'relative', width: '80%', height: '160px', marginBottom: '20px', borderBottom: '10px solid #2a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
         {/* Left Cliff */}
         <div style={{ width: '120px', height: '120px', background: 'linear-gradient(to right, #4a2f1d, #6b442a)', borderRadius: '10px 0 0 0', position: 'relative' }}>
           {/* Luna & Animal */}
           <span style={{ position: 'absolute', top: '-50px', right: '30px', fontSize: '40px', transform: 'scaleX(-1)' }}>👩‍🚀</span>
           <span 
              style={{ 
                position: 'absolute', 
                top: '-35px', 
                right: '5px', 
                fontSize: '25px', 
                zIndex: 110
              }}>
                🐶
           </span>
         </div>
         {/* Right Cliff */}
         <div style={{ width: '120px', height: '120px', background: 'linear-gradient(to left, #4a2f1d, #6b442a)', borderRadius: '0 10px 0 0' }}>
         </div>
       </div>

       {/* Selection Area (Left Aligned explicitly) */}
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '260px' }}>
         {renderBubble(1, data.item1, data.leftLong)}
         {renderBubble(2, data.item2, !data.leftLong)}
       </div>

       <style>
         {`
           @keyframes dropLaser {
             from { height: 0; opacity: 0; }
             to { height: 80px; opacity: 1; }
           }
           @keyframes riseLaser {
             from { height: 0; opacity: 0; top: 0; }
             to { height: 80px; opacity: 1; top: -80px; }
           }
         `}
       </style>
    </div>
  );
};

const RealWorldSizeGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [shakingItem, setShakingItem] = useState(null);
  const [showParticles, setShowParticles] = useState(false);
  const [clickedItem, setClickedItem] = useState(null);

  const handleClick = (itemNum) => {
    if (showParticles) return; // ignore clicks during success animation
    const isBig = (itemNum === 1 && data.leftBig) || (itemNum === 2 && !data.leftBig);
    const isCorrect = (data.askBig && isBig) || (!data.askBig && !isBig);

    if (isCorrect) {
      setClickedItem(itemNum);
      setShowParticles(true);
      setTimeout(() => {
        onVictory();
      }, 1500);
    } else {
      setShakingItem(itemNum);
      setTimeout(() => setShakingItem(null), 500);

      const bigName = data.leftBig ? data.name1 : data.name2;
      const smallName = data.leftBig ? data.name2 : data.name1;
      const hintText = `A ${smallName} is much smaller than a ${bigName}! Look closely, which one is ${data.askBig ? 'bigger' : 'smaller'}?`;
      
      const utterance = new SpeechSynthesisUtterance(hintText);
      utterance.volume = volume;
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderBubble = (itemNum, emoji, isBig) => {
    const isShaking = shakingItem === itemNum;
    const isSuccess = showParticles && clickedItem === itemNum;
    
    return (
      <div 
        className={`bubble-card ${isShaking ? 'shake' : ''}`}
        onClick={() => handleClick(itemNum)}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '180px',
          height: '180px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          boxShadow: isSuccess ? '0 0 40px #00F0FF' : '0 0 15px rgba(0, 240, 255, 0.3)',
          border: '3px solid rgba(0, 240, 255, 0.5)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
      >
        <span style={{ fontSize: isBig ? '120px' : '60px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))' }}>
          {emoji}
        </span>
        {isSuccess && (
          <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
            {[...Array(12)].map((_, i) => (
              <span key={i} className="star-particle" style={{
                position: 'absolute',
                top: '50%', left: '50%',
                marginTop: '-10px', marginLeft: '-10px',
                fontSize: '20px',
                animation: `particleBurst 1s forwards`,
                transform: `rotate(${i * 30}deg) translateY(-90px)`
              }}>✨</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!data.item1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', height: '100%', padding: '0 10%' }}>
       {renderBubble(1, data.item1, data.leftBig)}
       {renderBubble(2, data.item2, !data.leftBig)}
    </div>
  );
};

const BongoPipGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [pos1, setPos1] = useState({ x: -100, y: 0 });
  const [pos2, setPos2] = useState({ x: 100, y: 0 });
  const [bongoShake, setBongoShake] = useState(false);
  const [pipHighlight, setPipHighlight] = useState(false);
  const [bongoChewing, setBongoChewing] = useState(false);

  const getEmoji = (name) => {
    switch (name) {
      case 'star': return '⭐';
      case 'asteroid': return '🪨';
      case 'planet': return '🪐';
      case 'ufo': return '🛸';
      case 'pumpkin': return '🎃';
      case 'apple': return '🍎';
      default: return name || '?';
    }
  };

  const handlePointerDown = (e, itemNum) => {
    e.target.setPointerCapture(e.pointerId);
    setDraggedItem(itemNum);
  };
  
  const handlePointerMove = (e, itemNum) => {
    if (draggedItem !== itemNum) return;
    const movementX = e.movementX || 0;
    const movementY = e.movementY || 0;
    if (itemNum === 1) {
       setPos1(p => ({ x: p.x + movementX, y: p.y + movementY }));
    } else {
       setPos2(p => ({ x: p.x + movementX, y: p.y + movementY }));
    }
  };

  const handlePointerUp = (e, itemNum) => {
    if (draggedItem !== itemNum) return;
    setDraggedItem(null);
    e.target.releasePointerCapture(e.pointerId);

    const bongoEl = document.getElementById('bongo-monster');
    const bongoRect = bongoEl?.getBoundingClientRect();
    const itemRect = e.target.getBoundingClientRect();
    
    let droppedOnBongo = false;
    if (bongoRect && itemRect) {
       if (itemRect.left < bongoRect.right && itemRect.right > bongoRect.left && 
           itemRect.top < bongoRect.bottom && itemRect.bottom > bongoRect.top) {
           droppedOnBongo = true;
       }
    }

    if (droppedOnBongo) {
       const isBig = (itemNum === 1 && data.leftBig) || (itemNum === 2 && !data.leftBig);
       if (isBig) {
          playFeedbackTone('laugh', volume);
          setBongoChewing(true);
          if (itemNum === 1) setPos1({ x: -9999, y: -9999 });
          if (itemNum === 2) setPos2({ x: -9999, y: -9999 });
          
          setTimeout(() => {
             onVictory();
          }, 1000);
       } else {
          playFeedbackTone('wrong', volume);
          setBongoShake(true);
          setPipHighlight(true);
          setTimeout(() => { setBongoShake(false); setPipHighlight(false); }, 1000);
          if (itemNum === 1) setPos1({ x: -100, y: 0 });
          if (itemNum === 2) setPos2({ x: 100, y: 0 });
       }
    } else {
       if (itemNum === 1) setPos1({ x: -100, y: 0 });
       if (itemNum === 2) setPos2({ x: 100, y: 0 });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
       <div id="bongo-monster" className={`bongo-monster ${bongoShake ? 'shake' : ''} ${bongoChewing ? 'chewing' : ''}`} style={{ fontSize: '120px', marginLeft: '5%', zIndex: 1, filter: 'drop-shadow(0 0 20px #FF0055)' }}>
          👹
       </div>
       
       <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', zIndex: 10 }}>
          <div 
             onPointerDown={(e) => handlePointerDown(e, 1)}
             onPointerMove={(e) => handlePointerMove(e, 1)}
             onPointerUp={(e) => handlePointerUp(e, 1)}
             onPointerCancel={(e) => handlePointerUp(e, 1)}
             style={{
                position: 'absolute', left: pos1.x, top: pos1.y,
                fontSize: `${data.size1}px`, cursor: 'grab', userSelect: 'none',
                transform: `translate(-50%, -50%) scale(${draggedItem === 1 ? 1.2 : 1})`,
                transition: draggedItem === 1 ? 'none' : 'all 0.3s ease',
                touchAction: 'none'
             }}
          >{getEmoji(data.item1)}</div>
          
          <div 
             onPointerDown={(e) => handlePointerDown(e, 2)}
             onPointerMove={(e) => handlePointerMove(e, 2)}
             onPointerUp={(e) => handlePointerUp(e, 2)}
             onPointerCancel={(e) => handlePointerUp(e, 2)}
             style={{
                position: 'absolute', left: pos2.x, top: pos2.y,
                fontSize: `${data.size2}px`, cursor: 'grab', userSelect: 'none',
                transform: `translate(-50%, -50%) scale(${draggedItem === 2 ? 1.2 : 1})`,
                transition: draggedItem === 2 ? 'none' : 'all 0.3s ease',
                touchAction: 'none'
             }}
          >{getEmoji(data.item2)}</div>
       </div>

       <div id="pip-mouse" className={`pip-mouse ${pipHighlight ? 'glowing' : ''}`} style={{ fontSize: '50px', marginRight: '5%', zIndex: 1, filter: 'drop-shadow(0 0 10px #00F0FF)' }}>
          🐁
       </div>
    </div>
  );
};

const HeavyLightScaleGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [shakingItem, setShakingItem] = React.useState(null);
  const [clickedItem, setClickedItem] = React.useState(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);
  const [dropped, setDropped] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDropped(true);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (itemNum) => {
    if (isSuccess || !dropped) return;
    const isHeavy = (itemNum === 1 && data.leftHeavy) || (itemNum === 2 && !data.leftHeavy);
    const isCorrect = (data.askHeavy && isHeavy) || (!data.askHeavy && !isHeavy);

    if (isCorrect) {
      setClickedItem(itemNum);
      setIsSuccess(true);
      setShowHint(false);
      setTimeout(() => {
        onVictory();
      }, 1500); 
    } else {
      setShakingItem(itemNum);
      setShowHint(true);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const hint = data.askHeavy ? "Oops! That one is lighter. Find the heavier one!" : "Oops! That one is heavier. Find the lighter one!";
        const utterance = new SpeechSynthesisUtterance(hint);
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
      setTimeout(() => setShakingItem(null), 500);
    }
  };

  let rotation = 0;
  if (dropped && !isSuccess) {
    rotation = data.leftHeavy ? -15 : 15;
  }
  const translateY = 180 * Math.sin(Math.abs(rotation) * Math.PI / 180); 
  const leftTranslateY = rotation < 0 ? translateY : -translateY;
  const rightTranslateY = rotation > 0 ? translateY : -translateY;

  const renderPan = (itemNum, emoji, isHeavy, side) => {
    const isShaking = shakingItem === itemNum;
    const isCorrectItem = isSuccess && clickedItem === itemNum;
    const glowColor = isCorrectItem ? '0, 255, 0' : (isShaking ? '255, 0, 0' : '0, 240, 255');
    
    const transY = side === 'left' ? leftTranslateY : rightTranslateY;

    return (
      <div style={{
         position: 'absolute',
         top: '50px', 
         [side]: '-30px', 
         width: '140px',
         height: '220px',
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
         transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
         transform: `translateY(${transY}px)`
      }}>
         <div style={{
            width: '4px',
            height: '100px',
            background: 'linear-gradient(to bottom, silver, #666)'
         }}></div>
         
         <div 
           onClick={() => handleClick(itemNum)}
           className={isShaking ? "shake-error" : ""}
           style={{
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             width: '120px',
             height: '120px',
             background: 'rgba(255, 255, 255, 0.1)',
             borderRadius: '50%',
             boxShadow: isCorrectItem ? '0 0 40px #00FF00' : `0 0 15px rgba(${glowColor}, 0.5), inset 0 0 20px rgba(255,255,255,0.2)`,
             border: `3px solid rgba(${glowColor}, 0.8)`,
             cursor: 'pointer',
             transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s',
             transform: dropped ? 'translateY(0)' : 'translateY(-300px)',
             position: 'absolute',
             bottom: '15px', 
             zIndex: 10
           }}
         >
           <span style={{ fontSize: '70px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))' }}>
             {emoji}
           </span>
           {isCorrectItem && (
            <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
              {[...Array(12)].map((_, i) => (
                <span key={i} className="star-particle" style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  marginTop: '-10px', marginLeft: '-10px',
                  fontSize: '20px',
                  animation: `particleBurst 1s forwards`,
                  transform: `rotate(${i * 30}deg) translateY(-80px)`
                }}>✨</span>
              ))}
            </div>
           )}
         </div>

         <div style={{
            position: 'absolute',
            bottom: '0',
            width: '140px',
            height: '20px',
            background: 'linear-gradient(to bottom, #CD853F, #8B4513)',
            borderRadius: '50%',
            boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
            zIndex: 5
         }}></div>
      </div>
    );
  };

  if (!data.item1) return null;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', paddingTop: '50px' }}>
       <div style={{ position: 'relative', width: '440px', height: '350px', transform: 'scale(0.9)', transformOrigin: 'top center' }}>
          
          <div style={{
             position: 'absolute',
             top: '50px',
             left: '40px',
             width: '360px',
             height: '12px',
             background: 'linear-gradient(to bottom, #D2691E, #8B4513)',
             borderRadius: '6px',
             transformOrigin: 'center center',
             transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
             transform: `rotate(${rotation}deg)`,
             zIndex: 4,
             boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
          }}></div>
          
          {renderPan(1, data.item1, data.leftHeavy, 'left')}
          {renderPan(2, data.item2, !data.leftHeavy, 'right')}

          <div style={{
             position: 'absolute',
             top: '50px',
             left: '220px',
             transform: 'translateX(-50%)',
             width: '0', 
             height: '0', 
             borderLeft: '40px solid transparent',
             borderRight: '40px solid transparent',
             borderBottom: '160px solid #A0522D',
             zIndex: 3,
             filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))'
          }}></div>

          <div style={{
             position: 'absolute',
             top: '210px',
             left: '220px',
             transform: 'translateX(-50%)',
             width: '140px',
             height: '20px',
             background: '#8B4513',
             borderRadius: '10px',
             zIndex: 3,
             boxShadow: '0 5px 15px rgba(0,0,0,0.8)'
          }}></div>
          
          <div style={{
             position: 'absolute',
             top: '50px',
             left: '220px',
             transform: 'translate(-50%, -50%)',
             width: '20px',
             height: '20px',
             background: '#00F0FF',
             borderRadius: '50%',
             boxShadow: '0 0 15px #00F0FF',
             zIndex: 15
          }}></div>
       </div>
    </div>
  );
};

const MoreLessCapacityGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [shakingItem, setShakingItem] = React.useState(null);
  const [clickedItem, setClickedItem] = React.useState(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);

  const handleClick = (itemNum) => {
    if (isSuccess) return;
    const isMore = (itemNum === 1 && data.leftMore) || (itemNum === 2 && !data.leftMore);
    const isCorrect = (data.askMore && isMore) || (!data.askMore && !isMore);

    if (isCorrect) {
      setClickedItem(itemNum);
      setIsSuccess(true);
      setShowHint(false);
      setTimeout(() => {
        onVictory();
      }, 800); 
    } else {
      setShakingItem(itemNum);
      setShowHint(true);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const hint = data.askMore ? "Oops! That one holds less. Find the one that holds MORE!" : "Oops! That one holds more. Find the one that holds LESS!";
        const utterance = new SpeechSynthesisUtterance(hint);
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
      setTimeout(() => setShakingItem(null), 800);
    }
  };

  const renderItem = (itemNum, emoji, isMoreItem, side) => {
    const isShaking = shakingItem === itemNum;
    const isCorrectItem = isSuccess && clickedItem === itemNum;
    const glowColor = isCorrectItem ? '0, 255, 0' : (isShaking ? '255, 0, 0' : '255, 0, 255');
    
    // For identical mode: liquid level is simulated by overlaying a clipped emoji
    const isIdentical = data.isIdentical;
    // For non-identical mode: we just render the emojis but size them slightly to hint capacity
    const fontSize = isIdentical ? '80px' : (isMoreItem ? '90px' : '60px');
    
    const fillPercent = isMoreItem ? '10%' : '80%'; // inset from top. 10% = full, 80% = almost empty

    return (
      <div style={{
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
         zIndex: isCorrectItem ? 20 : 10,
         animation: isCorrectItem ? 'bounceCorrect 0.5s ease-in-out' : 'none'
      }}>
         <div 
           onClick={() => handleClick(itemNum)}
           className={isShaking ? "shake-error" : ""}
           style={{
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             width: '140px',
             height: '140px',
             background: 'rgba(25, 5, 30, 0.6)',
             borderRadius: '20px',
             boxShadow: isCorrectItem ? '0 0 50px #00FF00' : `0 0 20px rgba(${glowColor}, 0.5), inset 0 0 20px rgba(255,0,255,0.2)`,
             border: `3px solid rgba(${glowColor}, 0.8)`,
             cursor: 'pointer',
             position: 'relative',
             transition: 'all 0.3s'
           }}
         >
           {isIdentical ? (
             <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize, opacity: 0.2, filter: 'grayscale(100%)' }}>{emoji}</span>
                <span style={{ 
                   fontSize, 
                   position: 'absolute', 
                   clipPath: `inset(${fillPercent} 0 0 0)`,
                   filter: 'drop-shadow(0 0 10px #FF00FF)'
                }}>{emoji}</span>
             </div>
           ) : (
             <span style={{ fontSize, filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))' }}>
               {emoji}
             </span>
           )}
         </div>
         
         <div style={{
            marginTop: '10px',
            width: '80px',
            height: '10px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            filter: 'blur(2px)'
         }}></div>
      </div>
    );
  };

  if (!data.item1) return null;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', minHeight: '300px' }}>
       
       <style>
         {`
           @keyframes bounceCorrect {
             0%, 100% { transform: translateY(0); }
             50% { transform: translateY(-40px); }
           }
           @keyframes magicTransfer {
             0% { left: var(--start-x); top: var(--start-y); opacity: 0; transform: scale(0.5); }
             20% { opacity: 1; transform: scale(1); }
             80% { left: var(--end-x); top: var(--end-y); opacity: 1; transform: scale(1); }
             100% { opacity: 0; transform: scale(0.5); }
           }
         `}
       </style>

       <div style={{ 
          position: 'relative', 
          width: '500px', 
          height: '250px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end',
          padding: '0 50px',
          borderBottom: '15px solid #2A0845',
          boxShadow: '0 10px 20px rgba(0,0,0,0.8), inset 0 -10px 20px rgba(255,0,255,0.4)',
          borderRadius: '10px',
          background: 'linear-gradient(to top, rgba(255,0,255,0.1), transparent)'
       }}>
          {renderItem(1, data.item1, data.leftMore, 'left')}

          {/* Incorrect Hint Transfer Beam */}
          {showHint && (
            <div style={{
               position: 'absolute',
               width: '20px', height: '20px',
               background: '#00F0FF',
               borderRadius: '50%',
               boxShadow: '0 0 15px #00F0FF, 0 0 30px #FF00FF',
               zIndex: 30,
               pointerEvents: 'none',
               '--start-x': (!data.leftMore) ? '100px' : '400px',
               '--start-y': '50px',
               '--end-x': (data.leftMore) ? '100px' : '400px',
               '--end-y': '50px',
               animation: 'magicTransfer 0.8s cubic-bezier(0.45, 0, 0.55, 1) forwards'
            }}></div>
          )}

          {renderItem(2, data.item2, !data.leftMore, 'right')}
       </div>
    </div>
  );
};

const ThickThinGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [shakingItem, setShakingItem] = React.useState(null);
  const [clickedItem, setClickedItem] = React.useState(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);

  const handleClick = (itemNum) => {
    if (isSuccess) return;
    const isThick = (itemNum === 1 && data.leftThick) || (itemNum === 2 && !data.leftThick);
    const isCorrect = (data.askThick && isThick) || (!data.askThick && !isThick);

    if (isCorrect) {
      setClickedItem(itemNum);
      setIsSuccess(true);
      setShowHint(false);
      setTimeout(() => {
        onVictory();
      }, 1500); 
    } else {
      setShakingItem(itemNum);
      setShowHint(true);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const hintText = data.askThick 
           ? `Oops! The ${itemNum === 1 ? data.name1 : data.name2} is thinner. Find the THICKER one!` 
           : `Oops! The ${itemNum === 1 ? data.name1 : data.name2} is thicker. Find the THINNER one!`;
        const utterance = new SpeechSynthesisUtterance(hintText);
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
      setTimeout(() => setShakingItem(null), 800);
    }
  };

  const renderItem = (itemNum, emoji, isThickItem, side) => {
    const isShaking = shakingItem === itemNum;
    const isCorrectItem = isSuccess && clickedItem === itemNum;
    const glowColor = isCorrectItem ? '0, 255, 0' : (isShaking ? '255, 0, 0' : '0, 240, 255');
    
    // Scale X to make thick wider and thin narrower
    const scaleX = isThickItem ? 1.5 : 0.6;
    
    let transform = `scaleX(${scaleX})`;
    if (isCorrectItem) {
       transform += ' translateY(-20px) scale(1.1)';
    }

    // For the sliding visual hint: If wrong answer and showHint is true, slide the thin item onto the thick item.
    let containerTransform = 'translateX(0)';
    let isHintSlide = false;
    if (showHint && !isThickItem) {
        isHintSlide = true;
        containerTransform = side === 'left' ? 'translateX(200px)' : 'translateX(-200px)';
    }

    return (
      <div style={{
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
         zIndex: (isCorrectItem || isHintSlide) ? 20 : 10,
         animation: isCorrectItem ? 'bounceCorrect 0.5s ease-in-out' : 'none',
         transform: containerTransform,
         transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
         <div 
           onClick={() => handleClick(itemNum)}
           className={isShaking ? "shake-error" : ""}
           style={{
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             width: '140px',
             height: '140px',
             background: 'radial-gradient(circle at top left, #FFE4E1, #FFB6C1)',
             borderRadius: '50%',
             boxShadow: isCorrectItem ? '0 0 50px #00FF00' : `0 0 20px rgba(${glowColor}, 0.5), inset 0 0 20px rgba(0,240,255,0.2)`,
             border: `3px solid rgba(${glowColor}, 0.8)`,
             cursor: 'pointer',
             position: 'relative',
             transition: 'all 0.3s'
           }}
         >
           <span style={{ 
              fontSize: '80px', 
              position: 'relative', 
              zIndex: 2, 
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.8))',
              transform: transform,
              transition: 'all 0.5s',
              display: 'inline-block'
           }}>
             {emoji}
           </span>
         </div>
      </div>
    );
  };

  if (!data.item1) return null;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', minHeight: '300px' }}>
       
       <style>
         {`
           @keyframes bounceCorrect {
             0%, 100% { transform: translateY(0); }
             50% { transform: translateY(-30px); }
           }
           @keyframes beamSweep {
             0% { left: -100%; opacity: 0; }
             20% { opacity: 1; }
             80% { opacity: 1; }
             100% { left: 100%; opacity: 0; }
           }
         `}
       </style>

       <div style={{ 
          position: 'relative', 
          width: '400px', 
          height: '200px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.1) 0%, transparent 70%)'
       }}>
          {renderItem(1, data.item1, data.leftThick, 'left')}

          {renderItem(2, data.item2, !data.leftThick, 'right')}
       </div>
    </div>
  );
};


const PerfectMatchGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [shakingItem, setShakingItem] = React.useState(null);
  const [clickedItem, setClickedItem] = React.useState(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleClick = (itemNum) => {
    if (isSuccess) return;
    const isCorrect = (itemNum - 1) === data.correctIndex;

    if (isCorrect) {
      setClickedItem(itemNum);
      setIsSuccess(true);
      playFeedbackTone('correct', volume);
      setTimeout(() => {
        onVictory();
      }, 2000); 
    } else {
      setClickedItem(itemNum);
      setShakingItem(itemNum);
      playFeedbackTone('wrong', volume);
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Oops! Look closely at the size. Can you find the perfect match?");
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
      setTimeout(() => {
         setShakingItem(null);
         setClickedItem(null);
      }, 1500);
    }
  };

  const renderOption = (idx, opt) => {
    const itemNum = idx + 1;
    const isClicked = clickedItem === itemNum;
    const isShaking = shakingItem === itemNum;
    const isCorrectChoice = isSuccess && isClicked;
    
    let containerStyle = {
      transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: 'translate(0px, 0px) scale(1)',
      zIndex: isClicked ? 20 : 10,
      animation: 'slideUpFadeIn 0.8s ease-out forwards'
    };
    
    if (isCorrectChoice) {
      const xOffset = idx === 0 ? 165 : (idx === 1 ? 0 : -165);
      containerStyle.transform = `translate(${xOffset}px, -230px) scale(1)`;
    } else if (isShaking) {
      containerStyle.animation = `incorrectCompare_${idx} 1.5s ease-in-out`;
    }

    return (
      <div style={containerStyle} key={idx}>
        <div 
          onClick={() => handleClick(itemNum)}
          style={{
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             width: '120px',
             height: '120px',
             background: 'rgba(25, 5, 30, 0.6)',
             borderRadius: '50%',
             boxShadow: isCorrectChoice ? '0 0 50px #00FF00' : '0 0 20px rgba(0,240,255,0.3)',
             border: `3px solid rgba(${isCorrectChoice ? '0,255,0' : '0,240,255'}, 0.8)`,
             cursor: 'pointer',
             position: 'relative',
             transition: 'all 0.3s'
          }}
        >
          <span style={{ 
             fontSize: '80px', 
             transform: `scale(${opt.size})`,
             filter: `drop-shadow(2px 4px 6px rgba(0,0,0,0.8)) hue-rotate(${opt.hue}deg)`
          }}>
            {opt.emoji}
          </span>
        </div>
      </div>
    );
  };

  if (!data.target) return null;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%', minHeight: '400px', paddingTop: '20px', paddingBottom: '20px' }}>
       
       <style>
         {`
           @keyframes slideUpFadeIn {
             0% { transform: translateY(100px); opacity: 0; }
             100% { transform: translateY(0); opacity: 1; }
           }
           @keyframes incorrectCompare_0 {
             0%, 100% { transform: translate(0px, 0px) scale(1); }
             25%, 75% { transform: translate(100px, -230px) scale(1); }
             50% { transform: translate(100px, -230px) scale(1.1); }
           }
           @keyframes incorrectCompare_1 {
             0%, 100% { transform: translate(0px, 0px) scale(1); }
             25%, 75% { transform: translate(-100px, -230px) scale(1); }
             50% { transform: translate(-100px, -230px) scale(1.1); }
           }
           @keyframes incorrectCompare_2 {
             0%, 100% { transform: translate(0px, 0px) scale(1); }
             25%, 75% { transform: translate(-100px, -230px) scale(1); }
             50% { transform: translate(-100px, -230px) scale(1.1); }
           }
           @keyframes overlapPulse {
             0% { transform: scale(1); box-shadow: inset 0 0 20px rgba(255,0,255,0.5), 0 0 10px rgba(0,255,0,0); }
             50% { transform: scale(1.1); box-shadow: inset 0 0 50px rgba(0,255,0,0.8), 0 0 50px rgba(0,255,0,1); border-color: #00FF00; }
             100% { transform: scale(1); box-shadow: inset 0 0 20px rgba(0,255,0,0.5), 0 0 20px rgba(0,255,0,0.8); border-color: #00FF00; }
           }
         `}
       </style>

       {/* Target Anchor Area */}
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 15 }}>
          <div style={{ fontSize: '60px', marginBottom: '-10px', zIndex: 2 }}>👾</div>
          <div style={{
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             width: '140px',
             height: '140px',
             background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
             borderRadius: '30px',
             border: isSuccess ? '5px solid #00FF00' : '5px solid #FFF',
             boxShadow: '0 10px 20px rgba(255,105,180,0.6), inset 0 0 20px rgba(255,255,255,0.8)',
             animation: isSuccess ? 'overlapPulse 1s ease-in-out infinite' : 'none',
             transition: 'all 0.5s'
          }}>
             <span style={{ 
                fontSize: '80px', 
                transform: `scale(${data.target.size})`,
                filter: `drop-shadow(2px 4px 6px rgba(0,0,0,0.8)) hue-rotate(${data.target.hue}deg)`
             }}>
               {data.target.emoji}
             </span>
          </div>
       </div>

       {/* Selection Area */}
       <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          width: '500px', 
          marginTop: '60px'
       }}>
          {data.options.map((opt, idx) => renderOption(idx, opt))}
       </div>
    </div>
  );
};


const SizeOrderingGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const PODIUM_Y = 280;
  const PODIUM_X = [100, 250, 400]; // Smallest, Medium, Largest

  // Initial random positions for items in the scatter zone
  const initialPos = React.useMemo(() => {
    if (!data.items) return {};
    const pos = {};
    const startX = [80, 250, 420];
    // Shuffle startX
    for (let i = startX.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [startX[i], startX[j]] = [startX[j], startX[i]];
    }
    data.items.forEach((item, idx) => {
      pos[item.id] = { x: startX[idx], y: 80 };
    });
    return pos;
  }, [data]);

  const [positions, setPositions] = React.useState(initialPos);
  const [locked, setLocked] = React.useState({});
  const [dragging, setDragging] = React.useState(null);
  const [hint, setHint] = React.useState(null); // { podiumIndex: number, emoji: string, scale: number }
  const [isSuccess, setIsSuccess] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    setPositions(initialPos);
    setLocked({});
    setIsSuccess(false);
    setHint(null);
  }, [initialPos]);

  const handlePointerDown = (e, id) => {
    if (locked[id] || isSuccess) return;
    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);
    setDragging(id);
  };

  const handlePointerMove = (e, id) => {
    if (dragging !== id) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPositions(prev => ({ ...prev, [id]: { x, y } }));
  };

  const handlePointerUp = (e, id) => {
    if (dragging !== id) return;
    e.target.releasePointerCapture(e.pointerId);
    setDragging(null);

    const pos = positions[id];
    const item = data.items.find(i => i.id === id);
    if (!item) return;

    // Check if dropped near a podium
    let droppedPodium = -1;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(pos.x - PODIUM_X[i]) < 100 && Math.abs(pos.y - PODIUM_Y) < 120) {
        droppedPodium = i;
        break;
      }
    }

    if (droppedPodium !== -1) {
      if (droppedPodium === item.podiumIndex) {
        // Correct drop!
        playFeedbackTone('correct', volume);
        setPositions(prev => ({ ...prev, [id]: { x: PODIUM_X[droppedPodium], y: PODIUM_Y - 40 } }));
        
        const newLocked = { ...locked, [id]: true };
        setLocked(newLocked);
        
        // Check victory
        if (Object.keys(newLocked).length === 3) {
          setIsSuccess(true);
          doVictorySequence();
        }
      } else {
        // Incorrect drop!
        playFeedbackTone('wrong', volume);
        // Find what SHOULD be here to show the hint
        const correctItemForPodium = data.items.find(i => i.podiumIndex === droppedPodium);
        setHint({ podiumIndex: droppedPodium, emoji: correctItemForPodium.emoji, scale: correctItemForPodium.scale });
        
        // Slide back
        setPositions(prev => ({ ...prev, [id]: initialPos[id] }));
        
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance("Oops! Look closely at the sizes. That belongs on a different podium!");
          utterance.rate = 0.9;
          utterance.pitch = 1.2;
          window.speechSynthesis.speak(utterance);
        }
        
        setTimeout(() => setHint(null), 1500);
      }
    } else {
      // Dropped nowhere, slide back
      setPositions(prev => ({ ...prev, [id]: initialPos[id] }));
    }
  };

  const doVictorySequence = async () => {
    // Play Do-Re-Mi
    const tones = ['do', 're', 'mi']; // Just use pop sequentially
    for(let i=0; i<3; i++) {
      setTimeout(() => {
        playFeedbackTone('pop', volume);
      }, i * 300);
    }
    
    setTimeout(() => {
      onVictory();
    }, 2500);
  };

  if (!data.items) return null;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '500px', height: '400px', margin: '0 auto', userSelect: 'none' }}>
      
      <style>
        {`
          @keyframes victoryJump {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-40px) scale(1.1); }
          }
          @keyframes floatItem {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes neonGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.5); }
            50% { box-shadow: 0 0 50px rgba(0, 255, 128, 1); border-color: rgba(0, 255, 128, 1); }
          }
        `}
      </style>

      {/* Theme Text */}
      <div style={{ position: 'absolute', top: 0, width: '100%', textAlign: 'center', color: '#FFF', fontSize: '1.2rem', opacity: 0.8 }}>
        {data.theme}
      </div>

      {/* Podiums */}
      {[0, 1, 2].map(idx => {
        const isHintHere = hint && hint.podiumIndex === idx;
        const podiumLocked = Object.values(data.items).find(i => i.podiumIndex === idx && locked[i.id]);
        return (
          <div key={`podium-${idx}`} style={{
            position: 'absolute',
            left: PODIUM_X[idx] - 50,
            top: PODIUM_Y,
            width: '100px',
            height: '40px',
            background: podiumLocked ? 'rgba(0, 255, 128, 0.4)' : 'rgba(0, 100, 200, 0.3)',
            border: `3px solid ${podiumLocked ? 'rgba(0, 255, 128, 0.8)' : 'rgba(0, 240, 255, 0.5)'}`,
            borderRadius: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            animation: isSuccess ? 'neonGlow 1s infinite' : 'none',
            textShadow: '0 2px 5px rgba(0,0,0,0.5)',
            transition: 'all 0.3s'
          }}>
            {idx === 0 ? '1' : idx === 1 ? '2' : '3'}

            {/* Silhouette Hint */}
            {isHintHere && (
              <span style={{
                position: 'absolute',
                top: '-60px',
                fontSize: '60px',
                transform: `scale(${hint.scale})`,
                opacity: 0.3,
                filter: 'brightness(0) invert(1) drop-shadow(0 0 10px #FF00FF)',
                pointerEvents: 'none'
              }}>
                {hint.emoji}
              </span>
            )}
          </div>
        );
      })}

      {/* Labels */}
      <div style={{ position: 'absolute', left: PODIUM_X[0] - 50, top: PODIUM_Y + 50, width: '100px', textAlign: 'center', color: '#00F0FF', fontSize: '1rem', textShadow: '0 0 5px #00F0FF' }}>Smallest</div>
      <div style={{ position: 'absolute', left: PODIUM_X[1] - 50, top: PODIUM_Y + 50, width: '100px', textAlign: 'center', color: '#00F0FF', fontSize: '1rem', textShadow: '0 0 5px #00F0FF' }}>Medium</div>
      <div style={{ position: 'absolute', left: PODIUM_X[2] - 50, top: PODIUM_Y + 50, width: '100px', textAlign: 'center', color: '#00F0FF', fontSize: '1rem', textShadow: '0 0 5px #00F0FF' }}>Largest</div>

      {/* Draggable Items */}
      {data.items.map(item => {
        const pos = positions[item.id] || { x: 0, y: 0 };
        const isLocked = locked[item.id];
        const isDragging = dragging === item.id;
        
        let containerStyle = {
          position: 'absolute',
          left: pos.x - 40,
          top: pos.y - 40,
          width: '80px',
          height: '80px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: isLocked ? 'default' : 'grab',
          animation: (!isLocked && !isDragging) ? `floatItem 2s ease-in-out ${item.id === 'obj1' ? '0.5s' : '0s'} infinite` : 'none',
          zIndex: isDragging ? 100 : (isLocked ? 10 : 50),
          transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        };

        let spanStyle = {
          fontSize: '60px',
          transform: `scale(${item.scale})`,
          filter: isLocked ? 'drop-shadow(0 0 15px #00FF00)' : 'drop-shadow(2px 4px 6px rgba(0,0,0,0.8))',
          transition: 'all 0.3s'
        };

        if (isSuccess && isLocked) {
           // Add a staggered jump animation
           spanStyle.animation = `victoryJump 1s ease-in-out ${item.podiumIndex * 0.3}s infinite`;
        }

        return (
          <div 
            key={item.id}
            style={containerStyle}
            onPointerDown={(e) => handlePointerDown(e, item.id)}
            onPointerMove={(e) => handlePointerMove(e, item.id)}
            onPointerUp={(e) => handlePointerUp(e, item.id)}
            onPointerCancel={(e) => handlePointerUp(e, item.id)}
          >
            <span style={spanStyle}>
              {item.emoji}
            </span>
          </div>
        );
      })}

    </div>
  );
};


const ShapeScannerGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [positions, setPositions] = React.useState({});
  const [collected, setCollected] = React.useState({}); // { id: boolean }
  const [animating, setAnimating] = React.useState({}); // { id: boolean }
  const [wrongFlash, setWrongFlash] = React.useState(null); // id
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!data.items) return;
    const pos = {};
    
    // We want 5 scattered positions in a 500x300 area
    // Let's predefined some varied coordinates to avoid overlap
    const spots = [
      {x: 50, y: 50}, {x: 200, y: 30}, {x: 350, y: 60},
      {x: 100, y: 180}, {x: 300, y: 160}
    ];
    // Shuffle spots
    for (let i = spots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [spots[i], spots[j]] = [spots[j], spots[i]];
    }
    
    data.items.forEach((item, idx) => {
      pos[item.id] = spots[idx];
    });
    setPositions(pos);
    setCollected({});
    setAnimating({});
    setWrongFlash(null);
    setIsSuccess(false);
  }, [data]);

  const handleTap = (item) => {
    if (collected[item.id] || animating[item.id] || isSuccess) return;

    if (item.isCircle) {
      // Correct!
      playFeedbackTone('correct', volume);
      setAnimating(prev => ({ ...prev, [item.id]: true }));
      
      setTimeout(() => {
        setCollected(prev => {
          const newCol = { ...prev, [item.id]: true };
          if (Object.keys(newCol).length === 3) {
            setIsSuccess(true);
            setTimeout(() => {
              playFeedbackTone('pop', volume);
              setTimeout(() => playFeedbackTone('pop', volume), 150);
              setTimeout(() => playFeedbackTone('pop', volume), 300);
              setTimeout(() => onVictory(), 2000);
            }, 1000);
          }
          return newCol;
        });
        setAnimating(prev => ({ ...prev, [item.id]: false }));
      }, 1000);
      
    } else {
      // Incorrect!
      playFeedbackTone('wrong', volume);
      setWrongFlash(item.id);
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Look closely! That has sharp corners. We need something perfectly round!");
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }
      
      setTimeout(() => {
        setWrongFlash(null);
      }, 2500);
    }
  };

  const renderDots = (corners) => {
    const dots = [];
    if (corners === 4) {
      dots.push({ top: '10px', left: '10px' });
      dots.push({ top: '10px', right: '10px' });
      dots.push({ bottom: '10px', left: '10px' });
      dots.push({ bottom: '10px', right: '10px' });
    } else if (corners === 3) {
      dots.push({ top: '10px', left: '50%', transform: 'translateX(-50%)' });
      dots.push({ bottom: '10px', left: '10px' });
      dots.push({ bottom: '10px', right: '10px' });
    }
    return dots.map((st, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: '15px', height: '15px',
        backgroundColor: '#FF00FF',
        borderRadius: '50%',
        boxShadow: '0 0 10px #FF00FF, 0 0 20px #FF00FF',
        animation: 'flashDot 0.5s infinite alternate',
        ...st
      }} />
    ));
  };

  if (!data.items) return null;

  return (
    <div style={{ position: 'relative', width: '500px', height: '450px', margin: '0 auto', userSelect: 'none', background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)', borderRadius: '30px', border: '6px solid #FFF', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
      
      <style>
        {`
          @keyframes drawCircle {
            0% { stroke-dasharray: 0 300; }
            100% { stroke-dasharray: 300 300; }
          }
          @keyframes slideToInventory {
            0% { transform: scale(1); }
            100% { transform: scale(0.5) translate(0, 400px); opacity: 0; }
          }
          @keyframes wrongShake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
          }
          @keyframes flashDot {
            from { opacity: 0.5; transform: scale(1); }
            to { opacity: 1; transform: scale(1.5); }
          }
          @keyframes glowBg {
            0%, 100% { background: rgba(255, 255, 0, 0.2); }
            50% { background: rgba(255, 255, 0, 0.5); }
          }
          @keyframes victorySpin {
            0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
            100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
          }
        `}
      </style>

      {/* Scattered Items Area */}
      <div style={{ position: 'relative', width: '100%', height: '300px' }}>
        {data.items.map(item => {
          if (collected[item.id]) return null;
          
          const pos = positions[item.id] || { x: 0, y: 0 };
          const isAnim = animating[item.id];
          const isWrong = wrongFlash === item.id;
          
          return (
            <div 
              key={item.id}
              onClick={() => handleTap(item)}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: '100px',
                height: '100px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                animation: isWrong ? 'wrongShake 0.5s ease-in-out' : (isAnim ? 'slideToInventory 1s forwards' : 'none'),
                zIndex: isAnim ? 20 : 10
              }}
            >
              {isWrong && (
                 <div style={{ position: 'absolute', width: '120%', height: '120%', borderRadius: '10px', animation: 'glowBg 0.5s infinite', border: '2px dashed yellow' }}>
                   {renderDots(item.corners)}
                 </div>
              )}
              
              <span style={{ fontSize: '70px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.8))' }}>
                {item.emoji}
              </span>
              
              {isAnim && (
                <svg width="120" height="120" style={{ position: 'absolute', left: '-10px', top: '-10px', pointerEvents: 'none' }}>
                  <circle cx="60" cy="60" r="50" stroke="#00FF00" strokeWidth="6" fill="none" style={{ animation: 'drawCircle 0.5s ease-out forwards' }} strokeLinecap="round" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Inventory Dock */}
      <div style={{ 
        position: 'absolute', bottom: 0, width: '100%', height: '120px', 
        background: 'linear-gradient(to bottom, #FFD700, #FFA500)', borderTop: '4px solid #FFF', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px'
      }}>
        <div style={{ color: '#FFF', fontSize: '1.4rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)', marginBottom: '10px' }}>Rover Parts Inventory</div>
        <div style={{ display: 'flex', gap: '20px' }}>
           {[0, 1, 2].map((slot, idx) => {
              const collectedItems = data.items.filter(i => collected[i.id]);
              const itemInSlot = collectedItems[idx];
              
              return (
                <div key={slot} style={{
                  width: '60px', height: '60px',
                  borderRadius: '50%',
                  background: itemInSlot ? '#FFF' : 'rgba(255, 255, 255, 0.4)',
                  border: itemInSlot ? '4px solid #32CD32' : '4px dashed #FFF',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  boxShadow: itemInSlot ? '0 0 20px #00FF00' : 'none',
                  animation: (isSuccess && itemInSlot) ? 'victorySpin 2s linear infinite' : 'none'
                }}>
                  {itemInSlot && (
                     <span style={{ fontSize: '40px' }}>{itemInSlot.emoji}</span>
                  )}
                </div>
              );
           })}
        </div>
      </div>

      {isSuccess && (
         <div style={{ position: 'absolute', top: '100px', width: '100%', textAlign: 'center', color: '#00FF00', fontSize: '2rem', textShadow: '0 0 20px #00FF00', animation: 'slideUpFadeIn 0.5s', zIndex: 30 }}>
            ROVER REPAIRED!
         </div>
      )}
    </div>
  );
};



const SharpTrianglesGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [positions, setPositions] = React.useState({});
  const [collected, setCollected] = React.useState({});
  const [activeItem, setActiveItem] = React.useState(null);
  const [cornerIndex, setCornerIndex] = React.useState(0);
  const [wrongFlash, setWrongFlash] = React.useState(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!data.items) return;
    const pos = {};
    const spots = [
      {x: 15, y: 15}, {x: 50, y: 10}, {x: 85, y: 20},
      {x: 30, y: 45}, {x: 70, y: 40}
    ];
    for (let i = spots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [spots[i], spots[j]] = [spots[j], spots[i]];
    }
    data.items.forEach((item, idx) => {
      pos[item.id] = spots[idx];
    });
    setPositions(pos);
    setCollected({});
    setActiveItem(null);
    setCornerIndex(0);
    setWrongFlash(null);
    setIsSuccess(false);
  }, [data]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleTap = (item) => {
    if (collected[item.id] || activeItem || wrongFlash || isSuccess) return;

    setActiveItem(item);
    setCornerIndex(0);
    
    // Animate Firefly
    let currentCorner = 0;
    
    if (item.corners === 0) {
      // Circular orbit logic
      const timer = setInterval(() => {
        currentCorner++;
        setCornerIndex(currentCorner);
        if (currentCorner >= 10) { // Orbit finishes
          clearInterval(timer);
          setWrongFlash(item.id);
          speak("Wait! That has no corners! A triangle has exactly 3 sharp corners!");
          
          setTimeout(() => {
            setWrongFlash(null);
            setActiveItem(null);
          }, 3000);
        }
      }, 150);
      return;
    }

    // Flight logic for corners
    const interval = setInterval(() => {
      currentCorner++;
      
      if (currentCorner <= item.corners) {
        setCornerIndex(currentCorner);
        // Chime for corner
        playFeedbackTone('pop', volume); 
      }
      
      if (currentCorner >= item.corners) {
        clearInterval(interval);
        
        setTimeout(() => {
          if (item.corners === 3) {
            playFeedbackTone('correct', volume);
            setTimeout(() => {
              setCollected(prev => {
                const newCol = { ...prev, [item.id]: true };
                if (Object.keys(newCol).length === 3) {
                  setIsSuccess(true);
                  setTimeout(() => {
                    playFeedbackTone('pop', volume);
                    setTimeout(() => playFeedbackTone('pop', volume), 150);
                    setTimeout(() => playFeedbackTone('pop', volume), 300);
                    setTimeout(() => onVictory(), 2500);
                  }, 1000);
                }
                return newCol;
              });
              setActiveItem(null);
            }, 1000);
          } else {
            setWrongFlash(item.id);
            speak("Wait! That has 4 corners. A triangle only has 3 sharp corners!");
            setTimeout(() => {
              setWrongFlash(null);
              setActiveItem(null);
            }, 3000);
          }
        }, 800);
      }
    }, 400); // 0.4s per corner
  };

  const getFireflyPos = (item, cIdx) => {
    if (item.corners === 0) {
      // Orbit around the center
      const angle = (cIdx / 10) * Math.PI * 2;
      return { x: 50 + Math.cos(angle)*40 + '%', y: 50 + Math.sin(angle)*40 + '%' };
    }
    
    if (item.corners === 3) {
      if (cIdx === 1) return { x: '50%', y: '10%' };
      if (cIdx === 2) return { x: '90%', y: '90%' };
      if (cIdx === 3) return { x: '10%', y: '90%' };
    }
    if (item.corners === 4) {
      if (cIdx === 1) return { x: '10%', y: '10%' };
      if (cIdx === 2) return { x: '90%', y: '10%' };
      if (cIdx === 3) return { x: '90%', y: '90%' };
      if (cIdx === 4) return { x: '10%', y: '90%' };
    }
    return { x: '50%', y: '50%' }; // Center default
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '700px', margin: '0 auto', height: '350px', background: 'linear-gradient(to bottom, #0A192F, #203A43)', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
      {/* Mountain Silhouettes */}
      <svg width="100%" height="150" viewBox="0 0 500 150" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 60, left: 0, opacity: 0.6 }}>
        <polygon points="0,150 100,50 200,120 350,20 500,130 500,150" fill="#112240" />
        <polygon points="0,150 50,90 150,140 250,60 400,150" fill="#233554" />
      </svg>
      {/* Moon */}
      <div style={{ position: 'absolute', top: 20, right: 30, width: 40, height: 40, borderRadius: '50%', background: '#FFF7D6', boxShadow: '0 0 20px #FFF7D6' }}></div>

      {data.items && data.items.map((item) => {
        const isCollected = collected[item.id];
        const isActive = activeItem?.id === item.id;
        const isWrong = wrongFlash === item.id;
        
        // Final position inside the inventory bag (percentages)
        const finalX = 50;
        const finalY = 85;
        
        const currentX = isCollected ? finalX : (positions[item.id]?.x || 50);
        const currentY = isCollected ? finalY : (positions[item.id]?.y || 50);
        const currentScale = isCollected ? 0.3 : 1;

        return (
          <div 
            key={item.id}
            onClick={() => handleTap(item)}
            style={{
              position: 'absolute',
              top: `${currentY}%`, left: `${currentX}%`,
              transform: `translate(-50%, -50%) scale(${currentScale})`,
              transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
              width: '80px', height: '80px',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              cursor: (isCollected || activeItem || wrongFlash || isSuccess) ? 'default' : 'pointer',
              zIndex: isActive ? 10 : 2
            }}
          >
            {/* The Item */}
            <div style={{
              fontSize: '4rem',
              filter: isWrong ? 'drop-shadow(0 0 10px #FFD700)' : 'none',
              animation: isWrong ? 'shake 0.4s ease-in-out' : (isActive ? 'pulse 1s infinite' : 'floatBob 3s infinite ease-in-out')
            }}>
              {item.emoji}
            </div>

            {/* Neon Border (only for triangle success) */}
            {isActive && cornerIndex >= 3 && item.corners === 3 && (
              <svg width="100" height="100" style={{ position: 'absolute', top: -10, left: -10, pointerEvents: 'none' }}>
                <polygon points="50,10 90,90 10,90" fill="none" stroke="#00FF00" strokeWidth="4" filter="drop-shadow(0 0 8px #00FF00)" />
              </svg>
            )}

            {/* Firefly & Counting Numbers */}
            {isActive && (
              <>
                <div style={{
                  position: 'absolute',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: '#FFFF00',
                  boxShadow: '0 0 15px 5px #FFFF00',
                  left: getFireflyPos(item, cornerIndex).x,
                  top: getFireflyPos(item, cornerIndex).y,
                  transition: 'all 0.4s ease-in-out',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 11
                }}></div>
                
                {/* Pop up numbers */}
                {Array.from({ length: cornerIndex }).map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: getFireflyPos(item, i+1).x,
                    top: getFireflyPos(item, i+1).y,
                    transform: 'translate(-50%, -50%)',
                    color: '#FFF', fontWeight: 'bold', fontSize: '1.5rem',
                    textShadow: '0 0 5px #000, 0 0 10px #FF00FF',
                    animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    zIndex: 12
                  }}>
                    {i + 1}
                  </div>
                ))}
              </>
            )}

            {/* Wrong Flash overlay icon */}
            {isWrong && (
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '2rem', zIndex: 10 }}>⚠️</div>
            )}
          </div>
        );
      })}

      {/* Inventory Bag Dock */}
      <div style={{
        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
        width: '120px', height: '60px',
        background: 'rgba(139, 69, 19, 0.8)',
        border: '3px solid #D2691E',
        borderRadius: '10px 10px 30px 30px',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        boxShadow: '0 0 15px rgba(210, 105, 30, 0.5)',
        zIndex: 1
      }}>
        <span style={{ fontSize: '2rem' }}>🎒</span>
      </div>

      {isSuccess && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 255, 0, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20 }}>
          <div style={{ fontSize: '6rem', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>🌟</div>
        </div>
      )}
    </div>
  );
};
const StrictSquareGame = ({ dataStr, onVictory, volume }) => {
  const data = React.useMemo(() => { 
    try { 
      let cleanStr = dataStr;
      if (typeof cleanStr === 'string' && cleanStr.includes('\"')) {
        cleanStr = cleanStr.replace(/\\"/g, '"');
      }
      return JSON.parse(cleanStr); 
    } catch(e) { 
      return {}; 
    } 
  }, [dataStr]);

  const [positions, setPositions] = React.useState({});
  const [collected, setCollected] = React.useState({}); // { id: boolean }
  const [measuring, setMeasuring] = React.useState(null); // id of item currently being measured
  const [wrongFlash, setWrongFlash] = React.useState(null); // id
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!data.items) return;
    const pos = {};
    const spots = [
      {x: 60, y: 60}, {x: 220, y: 30}, {x: 370, y: 70},
      {x: 120, y: 190}, {x: 320, y: 170}
    ];
    for (let i = spots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [spots[i], spots[j]] = [spots[j], spots[i]];
    }
    data.items.forEach((item, idx) => {
      pos[item.id] = spots[idx];
    });
    setPositions(pos);
    setCollected({});
    setMeasuring(null);
    setWrongFlash(null);
    setIsSuccess(false);
  }, [data]);

  const handleTap = (item) => {
    if (collected[item.id] || measuring || wrongFlash || isSuccess) return;

    setMeasuring(item.id);

    setTimeout(() => {
      if (item.shape === 'square') {
        playFeedbackTone('correct', volume);
        setTimeout(() => {
          setCollected(prev => {
            const newCol = { ...prev, [item.id]: true };
            if (Object.keys(newCol).length === 3) {
              setIsSuccess(true);
              setTimeout(() => {
                playFeedbackTone('pop', volume);
                setTimeout(() => playFeedbackTone('pop', volume), 150);
                setTimeout(() => playFeedbackTone('pop', volume), 300);
                setTimeout(() => onVictory(), 2500);
              }, 1000);
            }
            return newCol;
          });
          setMeasuring(null);
        }, 1500);
      } else {
        playFeedbackTone('wrong', volume);
        setWrongFlash(item.id);
        
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          let text = "";
          if (item.shape === 'rectangle') {
            text = "Uh oh! That's a rectangle! The sides aren't all equal. A square is strict!";
          } else {
            text = "That has equal sides, but the corners aren't strict right angles! That's a kite!";
          }
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.2;
          window.speechSynthesis.speak(utterance);
        }
        
        setTimeout(() => {
          setMeasuring(null);
          setWrongFlash(null);
        }, 3500);
      }
    }, 1500); // Wait for measuring animation to finish
  };

  const renderMeasurement = (item) => {
    if (measuring !== item.id) return null;

    const w = 120;
    const h = item.shape === 'rectangle' ? 80 : 120;
    
    // For kites, it's 120x120 but rotated by CSS later. We don't rotate the SVG but we rotate the container.
    // Wait, simpler: if kite, draw a diamond shape.
    let path = "";
    if (item.shape === 'kite') {
      path = "M 60 5 L 115 60 L 60 115 L 5 60 Z";
    } else {
      path = `M 5 5 L ${w-5} 5 L ${w-5} ${h-5} L 5 ${h-5} Z`;
    }

    let topText = "5cm";
    let bottomText = "5cm";
    let leftText = "5cm";
    let rightText = "5cm";

    if (item.shape === 'rectangle') {
      topText = "10cm";
      bottomText = "10cm";
    }

    return (
      <div style={{ position: 'absolute', top: -10, left: -10, width: w, height: h, pointerEvents: 'none' }}>
        <svg width={w} height={h} style={{ position: 'absolute' }}>
          <path d={path} stroke="#FFD700" strokeWidth="6" strokeDasharray="10 10" fill="none" style={{ animation: 'drawBox 1.5s linear forwards' }} />
          
          {item.shape === 'kite' && wrongFlash === item.id && (
            <>
              {/* Draw red arcs for angles to show they are not 90 deg */}
              <path d="M 60 20 A 15 15 0 0 1 70 15" stroke="red" strokeWidth="4" fill="none" />
              <path d="M 60 100 A 15 15 0 0 0 70 105" stroke="red" strokeWidth="4" fill="none" />
            </>
          )}
        </svg>

        <div style={{ position: 'absolute', top: item.shape === 'kite' ? 10 : -25, left: '50%', transform: 'translateX(-50%)', background: '#FFF', color: '#000', padding: '2px 6px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', border: '2px solid #FFD700', animation: 'popIn 0.3s 0.5s both' }}>{topText}</div>
        <div style={{ position: 'absolute', bottom: item.shape === 'kite' ? 10 : -25, left: '50%', transform: 'translateX(-50%)', background: '#FFF', color: '#000', padding: '2px 6px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', border: '2px solid #FFD700', animation: 'popIn 0.3s 1.1s both' }}>{bottomText}</div>
        <div style={{ position: 'absolute', top: '50%', left: item.shape === 'kite' ? 10 : -35, transform: 'translateY(-50%)', background: '#FFF', color: '#000', padding: '2px 6px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', border: '2px solid #FFD700', animation: 'popIn 0.3s 1.4s both' }}>{leftText}</div>
        <div style={{ position: 'absolute', top: '50%', right: item.shape === 'kite' ? 10 : -35, transform: 'translateY(-50%)', background: '#FFF', color: '#000', padding: '2px 6px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', border: '2px solid #FFD700', animation: 'popIn 0.3s 0.8s both' }}>{rightText}</div>
      </div>
    );
  };

  if (!data.items) return null;

  return (
    <div style={{ position: 'relative', width: '500px', height: '450px', margin: '0 auto', userSelect: 'none', background: '#87CEEB', backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.4) 2px, transparent 2px)', backgroundSize: '40px 40px', borderRadius: '30px', border: '6px solid #FFF', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
      
      <style>
        {`
          @keyframes drawBox {
            0% { stroke-dashoffset: 400; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes popIn {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            80% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
          @keyframes dropToCargo {
            0% { transform: scale(1); }
            100% { transform: scale(0.5) translate(0, 400px); opacity: 0; }
          }
          @keyframes wrongShakeSquare {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-15px) rotate(-5deg); }
            40%, 80% { transform: translateX(15px) rotate(5deg); }
          }
          @keyframes bubbleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes bayGlow {
            0%, 100% { boxShadow: inset 0 0 20px #00FF00; }
            50% { boxShadow: inset 0 0 50px #00FF00; }
          }
        `}
      </style>

      {/* Floating Space Bubbles Area */}
      <div style={{ position: 'relative', width: '100%', height: '300px' }}>
        {data.items.map(item => {
          if (collected[item.id]) return null;
          
          const pos = positions[item.id] || { x: 0, y: 0 };
          const isMeas = measuring === item.id;
          const isWrong = wrongFlash === item.id;
          
          return (
            <div 
              key={item.id}
              onClick={() => handleTap(item)}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: '100px',
                height: item.shape === 'rectangle' ? '60px' : '100px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                animation: isWrong ? 'wrongShakeSquare 0.5s ease-in-out' : (isMeas && item.shape === 'square' && !isWrong ? 'dropToCargo 1s 1.5s forwards' : 'bubbleFloat 3s infinite ease-in-out'),
                animationDelay: isWrong ? '0s' : `${(item.id === 's0' || item.id === 'd0' ? 0 : item.id === 's1' || item.id === 'd1' ? 0.8 : 1.5)}s`,
                zIndex: isMeas ? 20 : 10
              }}
            >
              <span style={{ fontSize: '60px', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.4))' }}>
                {item.emoji}
              </span>
              
              {renderMeasurement(item)}
            </div>
          );
        })}
      </div>

      {/* Cargo Bay Dock */}
      <div style={{ 
        position: 'absolute', bottom: 0, width: '100%', height: '120px', 
        background: 'linear-gradient(to bottom, #A9A9A9, #696969)', borderTop: '6px solid #FFF',
        display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px',
        animation: isSuccess ? 'bayGlow 1s infinite' : 'none'
      }}>
        <div style={{ color: '#FFF', fontSize: '1.4rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '10px' }}>Spaceship Cargo Bay</div>
        <div style={{ display: 'flex', gap: '25px' }}>
           {[0, 1, 2].map((slot, idx) => {
              const collectedItems = data.items.filter(i => collected[i.id]);
              const itemInSlot = collectedItems[idx];
              
              return (
                <div key={slot} style={{
                  width: '60px', height: '60px',
                  borderRadius: '15px',
                  background: itemInSlot ? '#FFF' : 'rgba(0, 0, 0, 0.2)',
                  border: itemInSlot ? '4px solid #32CD32' : '4px dashed #FFF',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  boxShadow: itemInSlot ? '0 0 20px #32CD32' : 'inset 0 5px 10px rgba(0,0,0,0.3)'
                }}>
                  {itemInSlot && (
                     <span style={{ fontSize: '40px' }}>{itemInSlot.emoji}</span>
                  )}
                </div>
              );
           })}
        </div>
      </div>

      {isSuccess && (
         <div style={{ position: 'absolute', top: '100px', width: '100%', textAlign: 'center', color: '#FFF', fontSize: '2.5rem', fontWeight: '900', textShadow: '0 4px 10px rgba(0,0,0,0.5), 0 0 20px #00FF00', animation: 'slideUpFadeIn 0.5s', zIndex: 30 }}>
            CARGO LOADED!
         </div>
      )}
    </div>
  );
};

export default function NumberCometGame({ userId, onExit }) {
  const [activeLevel, setActiveLevel] = useState(() => savedProgress(userId).activeLevel);
  const [activeTopic, setActiveTopic] = useState(() => savedProgress(userId).activeTopic);
  
  useEffect(() => {
    const progress = savedProgress(userId);
    setActiveLevel(progress.activeLevel);
    setActiveTopic(progress.activeTopic);
  }, [userId]);
  
  // Audio State
  const bgmRef = useRef(null);
  const playPromiseRef = useRef(null);
  const sfxRef = useRef(null);
  const sfxPromiseRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15); // Range 0 to 1
  
  // Data State
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Interaction State
  const [isCorrectFlash, setIsCorrectFlash] = useState(false);
  const [traceCompleted, setTraceCompleted] = useState(false);
  const [shakingOption, setShakingOption] = useState(null);
  const [score, setScore] = useState(0);
  const prevScoreRef = useRef(0);

  useEffect(() => {
    if (score > prevScoreRef.current && userId) {
      const delta = score - prevScoreRef.current;
      const key = `mindmetric_global_score_${userId}`;
      const currentGlobal = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, String(currentGlobal + delta));
    }
    prevScoreRef.current = score;
  }, [score, userId]);

  // 1. Audio Effect
  useEffect(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio('/audio/bgm-cosmic.mp3');
      bgmRef.current.loop = true;
      bgmRef.current.volume = volume * 0.15; // Dim BGM significantly
    }
    
    // Attempt autoplay
    if (bgmRef.current) {
      playPromiseRef.current = bgmRef.current.play();
      if (playPromiseRef.current !== undefined) {
        playPromiseRef.current.then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.warn("Caught browser audio promise rejection safely:", err.message);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      if (bgmRef.current) {
        if (playPromiseRef.current !== undefined) {
          playPromiseRef.current.then(() => bgmRef.current.pause()).catch(() => {});
        } else {
          bgmRef.current.pause();
        }
      }
    };
  }, []);

  // Handle Volume change
  const handleVolumeChange = (e) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (bgmRef.current) {
      bgmRef.current.volume = newVol * 0.15; // Dim BGM significantly
      if (!isPlaying) {
        playPromiseRef.current = bgmRef.current.play();
        if (playPromiseRef.current !== undefined) {
          playPromiseRef.current.then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    }
    if (sfxRef.current) {
      sfxRef.current.volume = newVol;
    }
  };

  // 2. Dynamic Backend Data Loader
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/questions/level/${activeLevel}/topic/${activeTopic}`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
          setCurrentQuestionIndex(0); // Reset index only after fetching succeeds
          setTraceCompleted(false);
        } else {
          // Mocking empty state if backend fails or isn't built yet
          setQuestions([]); 
        }
      } catch (err) {
        console.error("Failed to load questions", err);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  }, [activeLevel, activeTopic]);

  const currentQuestion = questions[currentQuestionIndex] || {};
  const isPlaceholder = questions.length === 0;

  const handleOptionClick = async (optionIndex, optionValue) => {
    if (isPlaceholder) return; 

    const isCorrect = 
      String(optionValue) === String(currentQuestion.answer) || 
      String(optionValue) === String(currentQuestion.correctAnswer) || 
      String(optionValue) === String(currentQuestion.correct_answer);

    // Auto-resume BGM on user interaction if blocked
    if (!isPlaying && bgmRef.current) {
      playPromiseRef.current = bgmRef.current.play();
      if (playPromiseRef.current !== undefined) {
        playPromiseRef.current.then(() => setIsPlaying(true)).catch(() => {});
      }
    }

    if (isCorrect) {
      playFeedbackTone('correct', volume);
      setIsCorrectFlash(true);
      setTimeout(() => {
        setIsCorrectFlash(false);
        progressToNext();
      }, 600);
    } else {
      playFeedbackTone('wrong', volume);
      setShakingOption(optionIndex);
      setTimeout(() => setShakingOption(null), 400);
    }
  };

  const progressToNext = async () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length && questions.length > 0) {
      setScore(s => s + 100);
      // Advance curriculum
      let nextLevel = activeLevel;
      let nextTopic = activeTopic;
      if (activeTopic >= 8) {
        nextLevel = activeLevel + 1;
        nextTopic = 1;
      } else {
        nextTopic = activeTopic + 1;
      }
      setActiveLevel(nextLevel);
      setActiveTopic(nextTopic);

      // Reached the end of the 30-question bundle, save progress
      try {
        localStorage.setItem(`mindmetric_numbercomet_progress_${storageKey(userId)}`, JSON.stringify({
          activeLevel: nextLevel,
          activeTopic: nextTopic
        }));
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    } else {
      setCurrentQuestionIndex(nextIndex);
    }
    setTraceCompleted(false);
  };

  // Ensure Continuous Audio Readiness
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      const currentAnswerNum = questions[currentQuestionIndex].answer || questions[currentQuestionIndex].correctAnswer || questions[currentQuestionIndex].correct_answer;
      if (currentAnswerNum !== undefined) {
        if (!sfxRef.current) {
          sfxRef.current = new Audio(`/audio/answers/${currentAnswerNum}.mp3`);
          sfxRef.current.volume = volume;
        } else {
          sfxRef.current.src = `/audio/answers/${currentAnswerNum}.mp3`;
        }
      }
    }
  }, [currentQuestionIndex, questions]);

  const isPlayingSequence = useRef(false);

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) return resolve();
      window.speechSynthesis.cancel();
      
      let cleanText = String(text || "").replace(/<[^>]+>/g, '');
      // Inject a dramatic pause before the number to force stress on it (e.g. "Find the number... 1!")
      cleanText = cleanText.replace(/ (\d+)!/g, '... $1!');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9; 
      utterance.pitch = 1.3; // More enthusiastic pitch
      
      // Attempt to grab a higher quality or more expressive voice if available
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Samantha'));
      if (bestVoice) {
         utterance.voice = bestVoice;
      }

      utterance.volume = volume;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  };

  const playQuestionSequence = async () => {
    if (isPlayingSequence.current) return;
    isPlayingSequence.current = true;
    try {
      await speakText(currentQuestion.question || "Find the matching number");
      await new Promise(r => setTimeout(r, 600));

      const qText = (currentQuestion.question || "").toLowerCase();
      if (qText.includes('sounds')) {
         const numBeats = Number(currentQuestion.answer || currentQuestion.correctAnswer);
         if (!isNaN(numBeats) && numBeats > 0) {
            for(let i=0; i<numBeats; i++) {
               playFeedbackTone('pop', volume);
               await new Promise(r => setTimeout(r, 600)); // slightly faster pace for counting bloops
            }
         }
      } else if (sfxRef.current) {
        const ans = String(currentQuestion.answer || currentQuestion.correctAnswer).toLowerCase();
        // Skip playing the standalone mp3 if the spoken question text already contains the number!
        if (!qText.includes(ans)) {
          await new Promise((resolve) => {
            sfxRef.current.onended = resolve;
            sfxRef.current.onerror = resolve;
            sfxRef.current.play().catch(resolve);
          });
        }
      }
    } finally {
      isPlayingSequence.current = false;
    }
  };

  const playOptionsSequence = async (e) => {
    e.stopPropagation();
    if (isPlayingSequence.current) return;
    isPlayingSequence.current = true;
    try {
      if (currentQuestion.options) {
        for (const opt of currentQuestion.options) {
           const optAudio = new Audio(`/audio/answers/${opt}.mp3`);
           optAudio.volume = volume;
           await new Promise((resolve) => {
             optAudio.onended = resolve;
             optAudio.onerror = resolve;
             optAudio.play().catch(resolve);
           });
           await new Promise(r => setTimeout(r, 400));
        }
      }
    } finally {
      isPlayingSequence.current = false;
    }
  };

  const renderAsset = () => {
    if (isLoading) {
      return <div className="asset-item">📡 Loading Mission Data...</div>;
    }
    if (isPlaceholder) {
      return <div className="asset-item">🚀 Coming Soon!</div>;
    }

    if (currentQuestion.type === 'audioCheck' || currentQuestion.asset === '🔊') {
      return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
          <button 
            style={{
              background: '#FF007F', border: '2px solid white',
              color: 'white', padding: '12px', borderRadius: '50%', 
              cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 0 15px #FF007F'
            }}
            onClick={playQuestionSequence} title="Play Question & Number"
          >
            <Play fill="white" size={28} />
          </button>
          <button 
            style={{
              background: 'rgba(0, 240, 255, 0.2)', border: '2px solid var(--neon-blue)',
              color: 'white', padding: '10px 20px', borderRadius: '25px', 
              cursor: 'pointer', fontFamily: 'var(--font-family)', fontSize: '1rem',
              boxShadow: '0 0 10px var(--neon-blue)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
            }}
            onClick={playOptionsSequence}
            title="Listen to Options"
          >
            <Volume2 size={20} /> Options
          </button>
        </div>
      );
    }

    if (currentQuestion.type === 'highlightCount' && typeof currentQuestion.asset === 'string') {
      const [totalStr, targetStr] = currentQuestion.asset.split(',');
      const total = Number(totalStr);
      const target = Number(targetStr);
      const arr = new Array(total).fill('star');
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', padding: '5px', width: '100%' }}>
          {arr.map((item, idx) => (
            <span 
              key={idx} 
              style={{ 
                fontSize: arr.length > 6 ? '2.3rem' : '3rem',
                display: 'inline-block',
                filter: idx >= target ? 'grayscale(100%) opacity(0.3)' : 'drop-shadow(0 0 10px #FF0055)',
                transition: 'filter 0.5s ease'
              }}
            >
              ⭐
            </span>
          ))}
        </div>
      );
    }
    
    if (currentQuestion.type === 'tenFrame') {
      const filled = Number(currentQuestion.asset);
      const cells = new Array(10).fill(false).map((_, i) => i < filled);
      return (
        <div className="ten-frame-grid">
          {cells.map((isFilled, idx) => (
            <div key={idx} className={isFilled ? "fuel-block-filled" : "fuel-block-empty"}></div>
          ))}
        </div>
      );
    }
    
    if (currentQuestion.type === 'traceShape') {
      return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <TraceGame targetDigit={currentQuestion.asset} onVictory={() => setTraceCompleted(true)} />
        </div>
      );
    }
    
    if (currentQuestion.type === 'comparison_longShortRealWorld') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <LongShortBridgeGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    if (currentQuestion.type === 'comparison_tallShortRealWorld') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <TallShortRealWorldGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    if (currentQuestion.type === 'comparison_tallShort') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <TowerTallyGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    if (currentQuestion.type === 'comparison_heavyLight') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <HeavyLightScaleGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    if (currentQuestion.type === 'comparison_moreLess') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <MoreLessCapacityGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    if (currentQuestion.type === 'comparison_thickThin') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <ThickThinGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    if (currentQuestion.type === 'comparison_realWorldSize') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <RealWorldSizeGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    
    if (currentQuestion.type === 'shape_sharp_triangle') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <SharpTrianglesGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }
    if (currentQuestion.type === 'deliverySpacePort') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <DeliverySpacePortGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume / 100} 
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setTraceCompleted(true);
                 setTimeout(progressToNext, 1500);
              }} 
           />
        </div>
      );
    }
    if (currentQuestion.type === 'cosmic_playroom') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <CosmicPlayroomGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume / 100} 
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setTraceCompleted(true);
                 setTimeout(progressToNext, 1500);
              }} 
           />
        </div>
      );
    }
    if (currentQuestion.type === 'above_below_game') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <AboveBelowGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume / 100} 
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setTraceCompleted(true);
                 setTimeout(progressToNext, 1500);
              }} 
           />
        </div>
      );
    }
    if (currentQuestion.type === 'inside_outside_game') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <InsideOutsideGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume} 
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setTraceCompleted(true);
                 setTimeout(progressToNext, 1500);
              }} 
           />
        </div>
      );
    }
    if (currentQuestion.type === 'front_behind_game') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <FrontBehindGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume / 100} 
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setTraceCompleted(true);
                 setTimeout(progressToNext, 1500);
              }} 
           />
        </div>
      );
    }
    if (currentQuestion.type === 'greedy_gator_game') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <GreedyGatorGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              onCorrect={() => {
                 playFeedbackTone('correct', volume);
                 setTraceCompleted(true);
                 setTimeout(progressToNext, 1500);
              }} 
           />
        </div>
      );
    }
    if (currentQuestion.type === 'tiny_team_game') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <TinyTeamGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setTraceCompleted(true);
                 setTimeout(progressToNext, 1500);
              }} 
           />
        </div>
      );
    }
    if (currentQuestion.type === 'shape_strict_square') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <StrictSquareGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    if (currentQuestion.type === 'shape_scanner_circle') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <ShapeScannerGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    if (currentQuestion.type === 'ordering_size') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <SizeOrderingGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    if (currentQuestion.type === 'comparison_matches') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <PerfectMatchGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }

    if (currentQuestion.type && currentQuestion.type.startsWith('comparison_')) {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: 0 }}>
           <ComparisonRenderer type={currentQuestion.type} asset={currentQuestion.asset} />
        </div>
      );
    }

    if (currentQuestion.type === 'dragAndDrop_bigSmall') {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px' }}>
           <BongoPipGame 
              key={currentQuestionIndex}
              dataStr={currentQuestion.asset} 
              volume={volume}
              onVictory={() => {
                 playFeedbackTone('correct', volume);
                 setIsCorrectFlash(true);
                 setTimeout(() => {
                   setIsCorrectFlash(false);
                   progressToNext();
                 }, 600);
              }} 
           />
        </div>
      );
    }
    
    if (currentQuestion.type === 'zeroConcept') {
      return <div className="asset-item" style={{ fontSize: '5rem', animation: 'floatBob 2s infinite ease-in-out' }}>{currentQuestion.asset}</div>;
    }
    
    if (Array.isArray(currentQuestion.asset)) {
      const isScattered = currentQuestion.question && currentQuestion.question.toLowerCase().includes('scatter');
      if (isScattered) {
        return (
          <div style={{ position: 'relative', width: '100%', minHeight: '150px', flex: 1, margin: '0 auto' }}>
            {currentQuestion.asset.map((item, idx) => {
              const top = [10, 60, 20, 70, 40][idx % 5] + '%';
              const left = [10, 70, 40, 20, 60][idx % 5] + '%';
              const rot = (idx * 47) % 360;
              return (
                <span 
                  key={idx} 
                  style={{ 
                    position: 'absolute', top, left,
                    fontSize: '3rem',
                    transform: `rotate(${rot}deg)`
                  }}
                >
                  {['star', 'asteroid', 'planet', 'rocket'].includes(item) ? (item === 'star' ? '⭐' : item === 'asteroid' ? '🪨' : item === 'planet' ? '🪐' : '🚀') : item}
                </span>
              );
            })}
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', padding: '5px', width: '100%' }}>
          {currentQuestion.asset.map((item, idx) => (
            <span 
              key={idx} 
              style={{ 
                fontSize: currentQuestion.asset.length > 6 ? '2.3rem' : '3rem',
                display: 'inline-block'
              }}
            >
              {['star', 'asteroid', 'planet', 'rocket'].includes(item) ? (item === 'star' ? '⭐' : item === 'asteroid' ? '🪨' : item === 'planet' ? '🪐' : '🚀') : item}
            </span>
          ))}
        </div>
      );
    }
    if (currentQuestion.type === 'text') {
      return <div className="asset-item" style={{ fontSize: '3rem', color: '#00F0FF', fontWeight: 'bold', textShadow: '0 0 10px #00F0FF', maxWidth: '90%', textAlign: 'center' }}>{currentQuestion.asset}</div>;
    }
    if (currentQuestion.type === 'fingerMap') {
      return <div className="asset-item" style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.5))' }}>{currentQuestion.asset}</div>;
    }
    if (currentQuestion.asset) {
      return <div className="asset-item" style={{ fontSize: '3rem' }}>{currentQuestion.asset}</div>;
    }
    return <div className="asset-item" style={{ fontSize: '5rem', color: 'var(--neon-green)' }}>{currentQuestion.answer}</div>;
  };

  // Determine question text display
  const displayQuestionText = () => {
    if (isLoading) return "Fetching Coordinates...";
    if (isPlaceholder) return "Level Under Construction";
    if (currentQuestion.type === 'audioCheck') {
      return "Listen to the audio!";
    }
    return currentQuestion.question || "LISTEN CLOSELY AND FIND THE MATCHING NUMBER!";
  };

  const floatingItems = [
    { id: 1, icon: '🚀', top: '15%', left: '10%', size: '3rem', delay: '0s', duration: '15s' },
    { id: 2, icon: '7', top: '45%', left: '20%', size: '2rem', delay: '2s', duration: '18s' },
    { id: 3, icon: '🪐', top: '75%', left: '15%', size: '4rem', delay: '5s', duration: '20s' },
    { id: 4, icon: '2', top: '25%', left: '85%', size: '2.5rem', delay: '1s', duration: '12s' },
    { id: 5, icon: '🛸', top: '65%', left: '80%', size: '3.5rem', delay: '4s', duration: '16s' },
    { id: 6, icon: '9', top: '85%', left: '90%', size: '2rem', delay: '7s', duration: '14s' },
    { id: 7, icon: '✨', top: '10%', left: '50%', size: '1.5rem', delay: '3s', duration: '10s' },
    { id: 8, icon: '4', top: '55%', left: '45%', size: '2.2rem', delay: '6s', duration: '19s' },
    { id: 9, icon: '☄️', top: '35%', left: '65%', size: '3rem', delay: '0.5s', duration: '17s' },
    { id: 10, icon: '8', top: '80%', left: '55%', size: '2.8rem', delay: '8s', duration: '22s' },
  ];

  return (
    <div className="number-comet-wrapper">
      <div className="floating-background" style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100dvh', pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
        {floatingItems.map((item) => (
          <div 
            key={item.id} 
            className="floating-item"
            style={{
              position: 'absolute',
              top: item.top,
              left: item.left,
              fontSize: item.size,
              opacity: 0.4,
              fontWeight: 900,
              textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
              animation: `floatBob ${item.duration} ease-in-out infinite ${item.delay}`
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>
      <div className="engine-container">
        <header className="header-area">
          <div className="badges">
            <button className="control-btn" onClick={onExit} title="Exit Game">
              <X size={24} />
            </button>
            <div className="badge">LVL {activeLevel}: {LEVEL_NAMES[activeLevel - 1].toUpperCase()}</div>
            <div className="badge" style={{ background: 'rgba(255, 215, 0, 0.2)', border: '1px solid #FFD700', color: '#FFD700' }}>SCORE: {score}</div>
            <select 
              className="badge" 
              style={{ background: 'rgba(255, 0, 127, 0.2)', border: '1px solid #FF007F', cursor: 'pointer', outline: 'none', color: 'white' }}
              value={activeTopic}
              onChange={(e) => {
                setActiveTopic(Number(e.target.value));
                setCurrentQuestionIndex(0);
              }}
            >
              {[1,2,3,4,5,6,7,8].map(top => (
                <option key={top} value={top} style={{ background: '#000' }}>
                  TOPIC {top}/8
                </option>
              ))}
            </select>
            <div className="badge">Q {currentQuestionIndex + 1}/{Math.max(questions.length, 1)}</div>
            <select 
              className="badge" 
              style={{ background: 'rgba(0, 240, 255, 0.2)', cursor: 'pointer', outline: 'none', color: 'white' }}
              value={`${activeLevel}-${activeTopic}`}
              onChange={(e) => {
                const [l, t] = e.target.value.split('-');
                setActiveLevel(Number(l));
                setActiveTopic(Number(t));
                setCurrentQuestionIndex(0);
              }}
            >
              <option value={`${activeLevel}-${activeTopic}`} disabled>Jump to Level...</option>
              {[1,2,3,4,5,6,7,8,9,10,11].map(lvl => (
                <option key={lvl} value={`${lvl}-1`} style={{ background: '#000' }}>
                  Lvl {lvl}: {LEVEL_NAMES[lvl - 1]}
                </option>
              ))}
            </select>
          </div>
          
          <div className="controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(5, 5, 20, 0.6)', padding: '5px 15px', borderRadius: '25px', border: '2px solid var(--neon-blue)' }}>
              <Volume2 size={24} color="var(--neon-blue)" />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={volume} 
                onChange={handleVolumeChange}
                className="volume-slider" 
                style={{ width: '100px' }}
              />
            </div>
          </div>
        </header>

        {currentQuestion.type === 'inside_outside_game' || currentQuestion.type === 'greedy_gator_game' || currentQuestion.type === 'tiny_team_game' || currentQuestion.type === 'above_below_game' || currentQuestion.type === 'front_behind_game' || currentQuestion.type === 'cosmic_playroom' || currentQuestion.type === 'deliverySpacePort' || currentQuestion.type === 'dragAndDrop_bigSmall' || currentQuestion.type === 'comparison_realWorldSize' || currentQuestion.type === 'comparison_tallShort' || currentQuestion.type === 'comparison_tallShortRealWorld' || currentQuestion.type === 'comparison_longShortRealWorld' ? (
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: currentQuestion.type === 'dragAndDrop_bigSmall' ? 'linear-gradient(to bottom, transparent 60%, #1a4a1a 60%, #0a2a0a 100%)' : 'transparent', position: 'relative' }}>
            {/* Split screen subtle effect */}
            {currentQuestion.type === 'dragAndDrop_bigSmall' && <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '100%', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>}
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', margin: '20px auto 0', maxWidth: '90%', zIndex: 20 }}>
              <h2 className="question-text" style={{ 
                fontSize: '1.8rem', 
                margin: '0',
                padding: '10px 20px',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '20px',
                border: '2px solid var(--neon-blue)',
              }} dangerouslySetInnerHTML={{ __html: displayQuestionText() }} />
              <button 
                onClick={() => {
                  if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(displayQuestionText().replace(/<[^>]+>/g, ''));
                    utterance.rate = 0.9;
                    utterance.pitch = 1.2;
                    
                    utterance.onstart = () => {
                      if (bgmRef.current) bgmRef.current.pause();
                    };
                    const resumeAudio = () => {
                      if (bgmRef.current && isPlaying) bgmRef.current.play().catch(()=>{});
                    };
                    utterance.onend = resumeAudio;
                    utterance.onerror = resumeAudio;

                    window.speechSynthesis.speak(utterance);
                  }
                }}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '10px', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.8)', flexShrink: 0
                }}
                title="Read Question Aloud"
              >
                <Volume2 fill="white" size={24} />
              </button>
            </div>
            <div style={{ flex: 1, position: 'relative', width: '100%' }}>
              {renderAsset()}
            </div>
          </main>
        ) : (
          <>
            <main className="upper-area" style={currentQuestion.type && (currentQuestion.type.startsWith('comparison_') || ['ordering_size', 'shape_scanner_circle', 'shape_strict_square', 'shape_sharp_triangle', 'comparison_matches', 'dragAndDrop_bigSmall'].includes(currentQuestion.type)) ? { height: '85%' } : {}}>
              <div className={`planet-bubble ${isCorrectFlash ? 'correct-flash' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '5px' }}>
                  <h2 className="question-text" style={{ 
                    fontSize: displayQuestionText().length > 25 ? '1.2rem' : '1.5rem', 
                    margin: '0',
                    padding: '0 10px',
                    lineHeight: '1.2'
                  }} dangerouslySetInnerHTML={{ __html: displayQuestionText() }} />
                  <button 
                    onClick={() => {
                      if (window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(displayQuestionText().replace(/<[^>]+>/g, ''));
                        utterance.rate = 0.9;
                        utterance.pitch = 1.2;
                        
                        utterance.onstart = () => {
                          if (bgmRef.current) bgmRef.current.pause();
                        };
                        const resumeAudio = () => {
                          if (bgmRef.current && isPlaying) bgmRef.current.play().catch(()=>{});
                        };
                        utterance.onend = resumeAudio;
                        utterance.onerror = resumeAudio;

                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    style={{
                      background: '#FFD700', border: '3px solid white',
                      color: 'white', width: '40px', height: '40px', borderRadius: '50%', 
                      cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
                      boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)', flexShrink: 0
                    }}
                    title="Read Question Aloud"
                  >
                    <Volume2 fill="white" size={20} />
                  </button>
                </div>
                <div className="asset-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  {renderAsset()}
                </div>
              </div>
            </main>

            <footer className="lower-area" style={currentQuestion.type && (currentQuestion.type.startsWith('comparison_') || ['ordering_size', 'shape_scanner_circle', 'shape_strict_square', 'shape_sharp_triangle', 'comparison_matches', 'dragAndDrop_bigSmall'].includes(currentQuestion.type)) ? { display: 'none' } : {}}>
              {!isPlaceholder && currentQuestion.options && (currentQuestion.type !== 'traceShape' || traceCompleted) && (!currentQuestion.type || (!currentQuestion.type.startsWith('comparison_') && !['ordering_size', 'shape_scanner_circle', 'shape_strict_square', 'shape_sharp_triangle', 'comparison_matches', 'dragAndDrop_bigSmall', 'greedy_gator_game'].includes(currentQuestion.type))) && (
                <div className="options-container" style={{ display: 'flex', width: '100%', gap: '5%', justifyContent: 'center' }}>
                  {currentQuestion.options.map((option, idx) => {
                    let displayContent = option;
                    if (currentQuestion.type === 'zeroConcept') {
                      const num = Number(option);
                      displayContent = (
                         <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                           <span style={{ fontSize: '4.5rem', zIndex: 1, filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.8))' }}>🧺</span>
                           {num > 0 && <span style={{ fontSize: '1.8rem', position: 'absolute', top: '25%', zIndex: 2, letterSpacing: '-8px' }}>{Array(num).fill("🍓").join("")}</span>}
                         </div>
                      );
                    }

                    return (
                      <div 
                        key={idx}
                        className={`choice-sphere ${shakingOption === idx ? 'shake' : ''}`}
                        onClick={() => handleOptionClick(idx, option)}
                        style={currentQuestion.type === 'zeroConcept' ? { border: '4px solid #00F0FF', background: 'radial-gradient(circle at 30% 30%, #004466, #001122)' } : {}}
                      >
                        {displayContent}
                      </div>
                    );
                  })}
                </div>
              )}
              {isPlaceholder && [1, 2, 3].map((idx) => (
                <div key={idx} className="choice-sphere" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                  ?
                </div>
              ))}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
// test deploy v3
