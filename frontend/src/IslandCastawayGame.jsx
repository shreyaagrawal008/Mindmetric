import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import useSound from 'use-sound';

// Placeholder sound effect URLs
const scritchSfxUrl = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'; 
const whiplashSfxUrl = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';

const TallyCluster = ({ tally, isVictory }) => (
    <div className={`relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 transition-all duration-700 ${isVictory ? 'drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-110' : ''}`}>
        {/* Tally Mark 1 */}
        <AnimatePresence>
            {tally >= 1 && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '80%', opacity: 1 }}
                    className="absolute left-[20%] w-1.5 md:w-2 bg-[#2a2a2a] rounded-sm transform rotate-2 shadow-sm"
                    style={{ top: '10%' }}
                />
            )}
        </AnimatePresence>

        {/* Tally Mark 2 */}
        <AnimatePresence>
            {tally >= 2 && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '80%', opacity: 1 }}
                    className="absolute left-[40%] w-1.5 md:w-2 bg-[#252525] rounded-sm transform -rotate-1 shadow-sm"
                    style={{ top: '10%' }}
                />
            )}
        </AnimatePresence>

        {/* Tally Mark 3 */}
        <AnimatePresence>
            {tally >= 3 && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '80%', opacity: 1 }}
                    className="absolute left-[60%] w-1.5 md:w-2 bg-[#2f2f2f] rounded-sm transform rotate-1 shadow-sm"
                    style={{ top: '10%' }}
                />
            )}
        </AnimatePresence>

        {/* Tally Mark 4 */}
        <AnimatePresence>
            {tally >= 4 && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '80%', opacity: 1 }}
                    className="absolute left-[80%] w-1.5 md:w-2 bg-[#222222] rounded-sm transform -rotate-2 shadow-sm"
                    style={{ top: '10%' }}
                />
            )}
        </AnimatePresence>

        {/* Tally Mark 5 (Diagonal Slash) */}
        <AnimatePresence>
            {tally >= 5 && (
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '120%', opacity: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute left-[-10%] top-[48%] h-1.5 md:h-2 bg-[#1a1a1a] rounded-sm transform -rotate-12 shadow-sm"
                />
            )}
        </AnimatePresence>
    </div>
);

const IslandCastawayGame = ({ question, dataStr, onVictory }) => {
    const [currentTally, setCurrentTally] = useState(0);
    const [isVictory, setIsVictory] = useState(false);
    const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

    const target = React.useMemo(() => {
        try {
            return JSON.parse(dataStr).target || 5;
        } catch (e) {
            return 5;
        }
    }, [dataStr]);

    // Sound effects
    const [playScritch] = useSound(scritchSfxUrl, { volume: 0.8 });
    const [playWhiplash] = useSound(whiplashSfxUrl, { volume: 1.0 });

    useEffect(() => {
        const handleResize = () => {
            setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const speak = (text) => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleTap = () => {
        if (isVictory || currentTally >= target) return;

        const newTally = currentTally + 1;
        setCurrentTally(newTally);

        if (newTally < target) {
            if (newTally % 5 === 0) playWhiplash();
            else playScritch();
        } else if (newTally === target) {
            if (newTally % 5 === 0) playWhiplash();
            else playScritch();
            
            setIsVictory(true);
            speak(`${target}! Pack secured!`);
            
            setTimeout(() => {
                if (onVictory) onVictory();
            }, 5000);
        }
    };

    const totalGroups = Math.ceil(target / 5);
    const groups = Array.from({ length: totalGroups }, (_, i) => {
        return Math.min(5, Math.max(0, currentTally - i * 5));
    });

    return (
        <div 
            className="absolute inset-0 flex flex-col items-center justify-center touch-none select-none overflow-hidden"
            onClick={handleTap}
        >
            {/* Island Environment / Beach floor */}
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-yellow-700/60 to-transparent z-0 pointer-events-none"></div>

            {/* Confetti Reward */}
            {isVictory && (
                <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                    <Confetti 
                        width={windowDimension.width} 
                        height={windowDimension.height} 
                        recycle={false} 
                        numberOfPieces={400} 
                        gravity={0.3}
                        initialVelocityY={20}
                        colors={['#22c55e', '#16a34a', '#15803d', '#4ade80']} // Tropical leaves
                        drawShape={ctx => {
                            ctx.beginPath();
                            ctx.ellipse(0, 0, 10, 20, Math.PI / 4, 0, 2 * Math.PI);
                            ctx.fill();
                            ctx.closePath();
                        }}
                    />
                </div>
            )}

            {/* Stage Content */}
            <div className="relative z-10 flex flex-col items-center mt-[-5vh]">
                
                {/* Tally Marks Container: Multiple clusters wrapping smoothly */}
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 max-w-4xl px-4">
                    {groups.map((groupTally, index) => (
                        <TallyCluster key={index} tally={groupTally} isVictory={isVictory} />
                    ))}
                </div>

                {/* Victory Elements */}
                <AnimatePresence>
                    {isVictory && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', damping: 10, delay: 0.5 }}
                            className="absolute bottom-[-80px] flex items-center justify-center space-x-6"
                        >
                            <span className="text-7xl md:text-8xl font-black text-yellow-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">{target}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Instruction Banner at Bottom */}
            {!isVictory && (
                <div className="absolute bottom-8 z-20 pointer-events-none">
                    <p className="text-white text-xl md:text-2xl font-bold bg-black/50 px-6 py-3 rounded-full animate-pulse border border-yellow-500/50">
                        Tap anywhere to draw a tally! ({currentTally}/{target})
                    </p>
                </div>
            )}
            
            {/* Little Dancing Monkey */}
            <motion.div 
                className="absolute bottom-4 right-8 md:right-24 text-6xl md:text-8xl z-10"
                animate={isVictory ? { y: [0, -30, 0], rotate: [0, 15, -15, 0] } : { y: [0, -5, 0] }}
                transition={isVictory ? { duration: 0.5, repeat: Infinity } : { duration: 2, repeat: Infinity }}
            >
                🐒
            </motion.div>

        </div>
    );
};

export default IslandCastawayGame;
