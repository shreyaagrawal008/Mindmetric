import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import './SodaCanFactoryGame.css';

const SodaCanFactoryGame = ({ currentQuestion, onComplete }) => {
  const [elevatorStack, setElevatorStack] = useState(0);
  const [cansRolled, setCansRolled] = useState(0);
  const [canOrientation, setCanOrientation] = useState('upright'); // 'upright' | 'sideways'
  const [draggedCan, setDraggedCan] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [supervisorMsg, setSupervisorMsg] = useState("Alchemist! We have a delivery of smooth storage cylinders. We need to stack them in the elevator and roll them down the ramp. Master both moves!");
  
  const containerRef = useRef(null);

  let label = "Cosmic Cola";
  let color = "#ef4444";
  let objType = "can";
  
  if (currentQuestion && currentQuestion.asset) {
    if (typeof currentQuestion.asset === 'string') {
      try {
        const parsed = JSON.parse(currentQuestion.asset);
        if (parsed.brand) label = parsed.brand;
        if (parsed.label) label = parsed.label;
        if (parsed.color) color = parsed.color;
        if (parsed.objType) objType = parsed.objType;
      } catch (e) {
        console.error("Failed to parse asset", e);
      }
    } else {
        if (currentQuestion.asset.brand) label = currentQuestion.asset.brand;
        if (currentQuestion.asset.label) label = currentQuestion.asset.label;
        if (currentQuestion.asset.color) color = currentQuestion.asset.color;
        if (currentQuestion.asset.objType) objType = currentQuestion.asset.objType;
    }
  }

  useEffect(() => {
    if (elevatorStack === 2 && cansRolled === 1) {
      // Both tasks complete!
      setShowConfetti(true);
      setSupervisorMsg("Level Complete! The cylinder is mastered!");
      setTimeout(() => {
        onComplete(true);
      }, 5000); // 5 seconds of confetti
    }
  }, [elevatorStack, cansRolled, onComplete]);

  const handleDragStart = (e, item) => {
    setDraggedCan(item);
    e.dataTransfer.setData('text/plain', item);
  };

  const handleToggleOrientation = () => {
    setCanOrientation(prev => prev === 'upright' ? 'sideways' : 'upright');
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const handleDropElevator = (e) => {
    e.preventDefault();
    if (canOrientation === 'upright') {
      if (elevatorStack < 2) {
        setElevatorStack(prev => prev + 1);
        setFeedbackMsg("Perfect! Standing upright on its flat faces, the cylinder behaves just like a stable cube!");
        setSupervisorMsg("Great! The flat face allows stacking.");
      }
    } else {
      setFeedbackMsg("Oops! It rolls away when sideways. Tip it upright on its flat face to stack!");
    }
    // Clear feedback after 3 seconds
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const handleDropRamp = (e) => {
    e.preventDefault();
    if (canOrientation === 'sideways') {
      if (cansRolled < 1 && !isRolling) {
        setIsRolling(true);
        setFeedbackMsg("Amazing! On its side, the smooth curved face lets the cylinder roll like a sphere!");
        setSupervisorMsg("Great rolling!");
        // Play clink-clank sound here if needed.
        const audio = new Audio('/audio/effects/clink-clank.mp3');
        audio.play().catch(e => console.log("Audio play blocked", e));
        
        setTimeout(() => {
          setIsRolling(false);
          setCansRolled(1);
        }, 1500); // Animation duration
      }
    } else {
      setFeedbackMsg("Oops! It just slides and stops. Tip it over to access its smooth side!");
    }
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // Helper component to render a 3D soda can
  const renderSodaCan = (style = {}) => (
    <div 
      className={`soda-can ${canOrientation} obj-${objType}`} 
      style={{ '--can-color': color, ...style }}
      onClick={handleToggleOrientation}
      draggable
      onDragStart={(e) => handleDragStart(e, 'can')}
      title="Click to toggle Upright / Sideways"
    >
      <div className="can-top"></div>
      <div className="can-body">
        {objType !== 'log' && <span className="can-label">{label}</span>}
      </div>
      <div className="can-bottom"></div>
    </div>
  );

  return (
    <div className="soda-can-factory" ref={containerRef}>
      {showConfetti && <Confetti width={containerRef.current?.offsetWidth || window.innerWidth} height={containerRef.current?.offsetHeight || window.innerHeight} />}
      


      <div className="game-layout-wrapper" style={{ display: 'flex', width: '100%', maxWidth: '850px', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
        <div className="factory-stage" style={{ margin: 0 }}>
          {/* Line A: Elevator */}
        <div className="elevator-shaft" onDragOver={allowDrop} onDrop={handleDropElevator}>
          <div className="elevator-header">Line A: Elevator</div>
          <div className="elevator-platform">
            {elevatorStack > 0 && (
              <div className={`stacked-can can-level-1 obj-${objType}`} style={{ '--can-color': color }}>
                {objType !== 'log' && <span className="stacked-label">{label}</span>}
              </div>
            )}
            {elevatorStack > 1 && (
              <div className={`stacked-can can-level-2 obj-${objType}`} style={{ '--can-color': color }}>
                {objType !== 'log' && <span className="stacked-label">{label}</span>}
              </div>
            )}
          </div>
          {elevatorStack === 2 && <div className="stamp-machine activated">STAMPED!</div>}
        </div>

        {/* Line B: Ramp */}
        <div className="ramp-system" onDragOver={allowDrop} onDrop={handleDropRamp}>
          <div className="ramp-header">Line B: Conveyor Ramp</div>
          <div className="ramp-surface">
            {isRolling && (
              <div className={`rolling-can obj-${objType}`} style={{ '--can-color': color }}>
                 <div className="can-body sideways-roll">
                    {objType !== 'log' && <span className="can-label">{label}</span>}
                 </div>
              </div>
            )}
          </div>
          <div className="delivery-crate">
            {cansRolled > 0 && <div className={`crate-can obj-${objType}`} style={{ '--can-color': color }}></div>}
            CRATE
          </div>
        </div>
        </div>

        {/* Instructions Panel */}
        <div className="instructions-panel" style={{ 
          flex: '0 0 220px', 
          background: 'rgba(0, 0, 0, 0.6)', 
          border: '2px solid rgba(0, 255, 255, 0.4)', 
          borderRadius: '12px', 
          padding: '1.2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          height: 'fit-content',
          boxShadow: '0 0 15px rgba(0,255,255,0.1)'
        }}>
          <h3 style={{ color: '#00ffff', margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', borderBottom: '1px solid rgba(0,255,255,0.3)', paddingBottom: '0.5rem' }}>How to Play</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4', color: '#e2e8f0' }}>
            We need to process the items on the loading dock below!
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#cbd5e1' }}>
            <li><strong>Line A:</strong> Create a stack of <strong>2 objects</strong> in the elevator. <em>(Must stand upright)</em></li>
            <li><strong>Line B:</strong> Put <strong>1 object</strong> on the ramp to roll it into the crate. <em>(Must be sideways)</em></li>
          </ul>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.8rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#93c5fd' }}>
              <strong>Tip:</strong> Click an object in the dock below to tip it sideways or stand it up!
            </p>
          </div>
        </div>
      </div>

      {/* Loading Dock */}
      <div className="loading-dock">
        <h3>Loading Dock - Drag objects to the lines!</h3>
        <p className="hint-text">(Click the can to tip it over!)</p>
        <div className="dock-items">
           {/* Only show source cans if tasks aren't fully complete */}
           {(elevatorStack < 2 || cansRolled < 1) && renderSodaCan()}
        </div>
      </div>

      {feedbackMsg && (
        <div className="feedback-toast">
          {feedbackMsg}
        </div>
      )}
      
    </div>
  );
};

export default SodaCanFactoryGame;
