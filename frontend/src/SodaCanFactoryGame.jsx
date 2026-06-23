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
      


      <div className="factory-stage">
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
