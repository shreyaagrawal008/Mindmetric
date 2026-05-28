import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { numberCometCurriculum } from './numberCometCurriculum';
import DeliverySpacePortGame from './DeliverySpacePortGame';

export default function NumberCometEngine() {
  const [activeLevel, setActiveLevel] = useState(1);
  const [activeTopic, setActiveTopic] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(50);
  
  const [isCorrectFlash, setIsCorrectFlash] = useState(false);
  const [shakingOption, setShakingOption] = useState(null);

  // Get current data
  const currentLevelData = numberCometCurriculum.find(l => l.levelId === activeLevel) || numberCometCurriculum[0];
  const currentTopicData = currentLevelData.topics.find(t => t.topicId === activeTopic) || currentLevelData.topics[0];

  // If topic data is just a placeholder (no question), render a fallback
  const isPlaceholder = !currentTopicData.question;

  const handleOptionClick = (optionIndex, optionValue) => {
    if (isPlaceholder) return; // Ignore clicks if placeholder

    if (optionValue === currentTopicData.answer) {
      // Correct!
      setIsCorrectFlash(true);
      setTimeout(() => {
        setIsCorrectFlash(false);
        progressToNext();
      }, 600);
    } else {
      // Incorrect!
      setShakingOption(optionIndex);
      setTimeout(() => setShakingOption(null), 400);
    }
  };

  const progressToNext = () => {
    if (activeTopic >= 8) {
      if (activeLevel >= 11) {
        // Game Completed!
        alert("Curriculum Mastered!");
      } else {
        setActiveLevel(prev => prev + 1);
        setActiveTopic(1);
      }
    } else {
      setActiveTopic(prev => prev + 1);
    }
  };

  const renderAsset = () => {
    if (isPlaceholder) {
      return <div className="asset-item">🚀 Coming Soon!</div>;
    }

    // Dynamic asset rendering based on type
    if (Array.isArray(currentTopicData.asset)) {
      return currentTopicData.asset.map((item, idx) => (
        <span key={idx} className="asset-item">
          {item === 'star' ? '⭐' : item === 'asteroid' ? '🪨' : item === 'planet' ? '🪐' : '✨'}
        </span>
      ));
    }
    
    if (currentTopicData.asset) {
      if (typeof currentTopicData.asset === 'string' && currentTopicData.asset.includes('.png')) {
        // Mock image rendering
        return <div className="asset-item">🖼️</div>;
      }
      return <div className="asset-item">{currentTopicData.asset}</div>;
    }
    
    // Default big number or text if no asset array
    if (currentTopicData.type === 'numberShape' || currentTopicData.type === 'missingGap') {
      return <div className="asset-item" style={{ fontSize: '5rem', color: 'var(--neon-green)' }}>{currentTopicData.answer}</div>;
    }

    return <div className="asset-item">✨</div>;
  };

  return (
    <div className="engine-container">
      {/* Navigation Header Area (15%) */}
      <header className="header-area">
        <div className="badges">
          <div className="badge">Lvl {activeLevel}: {currentLevelData.levelName}</div>
          <div className="badge">Topic {activeTopic}/8</div>
        </div>
        
        <div className="controls">
          <button className="control-btn" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <div style={{ position: 'relative' }}>
            <button className="control-btn" onClick={() => setShowVolume(!showVolume)}>
              <Volume2 size={24} />
            </button>
            
            {showVolume && (
              <div className="volume-dropdown">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume} 
                  onChange={(e) => setVolume(e.target.value)}
                  className="volume-slider" 
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {currentTopicData.type === 'deliverySpacePort' ? (
        <DeliverySpacePortGame topicData={currentTopicData} onComplete={progressToNext} />
      ) : (
        <>
          {/* Upper Layout Area (50%) */}
          <main className="upper-area">
            <div className={`planet-bubble ${isCorrectFlash ? 'correct-flash' : ''}`}>
              <h2 className="question-text">
                {isPlaceholder ? "Level Under Construction" : currentTopicData.question}
              </h2>
              <div className="asset-container">
                {renderAsset()}
              </div>
            </div>
          </main>

          {/* Lower Layout Area (35%) */}
          <footer className="lower-area">
            {!isPlaceholder && currentTopicData.options && currentTopicData.options.map((opt, idx) => (
              <div 
                key={idx} 
                className={`choice-sphere ${shakingOption === idx ? 'shake' : ''}`}
                onClick={() => handleOptionClick(idx, opt)}
              >
                {opt}
              </div>
            ))}
            {isPlaceholder && [1, 2, 3].map((idx) => (
              <div key={idx} className="choice-sphere" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                ?
              </div>
            ))}
          </footer>
        </>
      )}
    </div>
  );
}
